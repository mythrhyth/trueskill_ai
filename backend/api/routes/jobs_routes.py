import re
import logging
from fastapi import APIRouter, HTTPException, Body
from typing import List, Optional, Dict, Any

from backend.schema.jobs_schema import (
    JobRecommendationItem, 
    JobsRecommendationsResponse, 
    CustomMatchRequest, 
    CustomMatchResponse, 
    RoleTemplate
)
from backend.services.persistence.candidate_repository import get_candidate_result
from backend.services.skill_extractor.agents.normalization_agent import NORMALIZATION_MAP

logger = logging.getLogger("trueskill_jobs")
router = APIRouter(prefix="/jobs", tags=["jobs"])

# Predefined role templates with associated configurations
PREDEFINED_ROLES = [
    {
        "role_name": "Backend Intern",
        "company": "Loop Systems",
        "location": "Remote · Worldwide",
        "required_skills": ["Python", "FastAPI", "SQL", "PostgreSQL", "API Development", "Database Design"],
        "difficulty_level": "Intermediate",
        "learn_prefix": "Complete the SQL and API development path. Deploy 1 production backend service.",
        "explain_prefix": "Your verified backend depth and high validation score align directly with backend role requirements."
    },
    {
        "role_name": "ML Intern",
        "company": "Helix AI",
        "location": "Hybrid · Berlin",
        "required_skills": ["Python", "Machine Learning", "PyTorch", "TensorFlow", "Scikit-Learn", "Data Science"],
        "difficulty_level": "Advanced",
        "learn_prefix": "Ship one end-to-end ML training pipeline. Add a PyTorch or TensorFlow project.",
        "explain_prefix": "Strong ML fundamentals with verified math/science skills."
    },
    {
        "role_name": "Frontend Intern",
        "company": "Northwind",
        "location": "Remote · EU",
        "required_skills": ["JavaScript", "React", "TypeScript", "HTML", "CSS", "UI Development"],
        "difficulty_level": "Intermediate",
        "learn_prefix": "Build one interactive project using modern web frameworks.",
        "explain_prefix": "Frontend and UI design capability matches well."
    },
    {
        "role_name": "Data Analyst",
        "company": "Vertex Labs",
        "location": "Onsite · Bangalore",
        "required_skills": ["SQL", "Python", "Tableau", "Power BI", "Statistics", "Data Visualization"],
        "difficulty_level": "Beginner",
        "learn_prefix": "Build data visualization dashboards and compile statistical reports.",
        "explain_prefix": "Strong quantitative and analysis background verified."
    }
]


def extract_skills_from_text(text: str) -> List[str]:
    """Helper to extract technical skills from text using NORMALIZATION_MAP and LLM fallback."""
    text_lower = text.lower()
    extracted = []
    
    # 1. Local keyword/regex matching
    for key, val in NORMALIZATION_MAP.items():
        if len(key) <= 3:
            pattern = rf"\b{re.escape(key)}\b"
            if re.search(pattern, text_lower):
                if val not in extracted:
                    extracted.append(val)
        else:
            if key in text_lower:
                if val not in extracted:
                    extracted.append(val)
                    
    # 2. LLM fallback if no skills found and system is configured
    if not extracted and text.strip():
        try:
            from backend.utils.llm_service import extract_skills_with_llm
            llm_extracted = extract_skills_with_llm(text)
            extracted_names = {s.get("name") for s in llm_extracted if s.get("name")}
            extracted = list(extracted_names)
        except Exception as e:
            logger.warning(f"Fallback LLM skill extraction failed: {e}")
            
    return extracted


def build_candidate_skill_set(candidate: dict) -> set:
    """
    Builds normalized candidate skills from validated_skills
    and extracted skills safely.
    """

    validated_skills = candidate.get("validated_skills") or []
    extracted_skills = candidate.get("extracted_skills") or []

    candidate_skills = set()

    # validated skills
    for skill in validated_skills:

        if isinstance(skill, dict):

            name = (
                skill.get("name")
                or skill.get("skill")
                or skill.get("title")
            )

            if name:
                candidate_skills.add(name.strip().lower())

        elif isinstance(skill, str):

            candidate_skills.add(skill.strip().lower())

    # extracted skills
    for skill in extracted_skills:

        if isinstance(skill, dict):

            name = (
                skill.get("name")
                or skill.get("skill")
                or skill.get("title")
            )

            if name:
                candidate_skills.add(name.strip().lower())

        elif isinstance(skill, str):

            candidate_skills.add(skill.strip().lower())

    return candidate_skills


@router.get("/recommendations/{candidate_id}", response_model=JobsRecommendationsResponse)
async def get_jobs_recommendations(candidate_id: str):
    """
    Computes job recommendations for a persisted candidate based on their stored skills.
    Fetches strictly from DB and does not rerun scoring.
    """
    candidate = get_candidate_result(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail=f"Candidate with ID '{candidate_id}' not found.")
        
    candidate_skills = build_candidate_skill_set(candidate)
    
    
    recommendations = []
    for role in PREDEFINED_ROLES:
        req_skills = role["required_skills"]
        
        # Calculate intersection and differences
        matching = [s for s in req_skills if s.lower() in candidate_skills]
        missing = [s for s in req_skills if s.lower() not in candidate_skills]
        
        # Overlap match score
        match_pct = round((len(matching) / len(req_skills)) * 100.0, 1) if req_skills else 0.0
        
        # Strengths & explanations
        strengths = [f"Verified proficiency in {s}" for s in matching]
        learning_suggestions = [f"Acquire competency in {s}" for s in missing]
        
        learn_str = role["learn_prefix"]
        if missing:
            learn_str += f" Focus on closing skills gaps in: {', '.join(missing)}."
        else:
            learn_str += " No skill gaps detected. You fully meet the requirements!"
            
        explain_str = role["explain_prefix"]
        if missing:
            explain_str += f" Minor gaps present in: {', '.join(missing)}."
        else:
            explain_str += " You have a 100% verified match for all required skills."
            
        recommendation_item = JobRecommendationItem(
            role_name=role["role_name"],
            title=role["role_name"],  # Frontend alias
            company=role["company"],
            location=role["location"],
            match_percentage=match_pct,
            match=match_pct,  # Frontend alias
            required_skills=req_skills,
            required=req_skills,  # Frontend alias
            matching_skills=matching,
            strengths=strengths,  # Both standard and alias
            missing_skills=missing,
            missing=missing,  # Frontend alias
            learning_suggestions=learning_suggestions,
            learn=learn_str,  # Frontend alias
            explanation=explain_str,
            explain=explain_str  # Frontend alias
        )
        recommendations.append(recommendation_item)
        
    # Sort recommendations by match percentage descending
    recommendations.sort(key=lambda r: r.match_percentage, reverse=True)
    
    # Return response. If there are recommendations, populate top-level fields matching the best recommendation.
    if recommendations:
        best_rec = recommendations[0]
        return JobsRecommendationsResponse(
            recommended_roles=recommendations,
            match_percentage=best_rec.match_percentage,
            matching_skills=best_rec.matching_skills,
            missing_skills=best_rec.missing_skills,
            strengths=best_rec.strengths,
            learning_suggestions=best_rec.learning_suggestions
        )
    else:
        return JobsRecommendationsResponse(
            recommended_roles=[],
            match_percentage=0.0,
            matching_skills=[],
            missing_skills=[],
            strengths=[],
            learning_suggestions=[]
        )


@router.post("/custom-match", response_model=CustomMatchResponse)
async def post_custom_match(payload: CustomMatchRequest):
    """
    Compares a persisted candidate's profile against a custom job description.
    Utilizes simple overlap scoring logic and does not re-run pipeline scoring.
    """
    candidate = get_candidate_result(payload.candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail=f"Candidate with ID '{payload.candidate_id}' not found.")
        
    # Extract required skills from the custom description
    required_skills = extract_skills_from_text(payload.job_description)
    
    candidate_skills = build_candidate_skill_set(candidate)
    
    if not required_skills:
        return CustomMatchResponse(
            compatibility_score=0.0,
            matching_skills=[],
            missing_skills=[],
            reasoning_summary="No standard technical skills could be identified in the job description to match against.",
            learning_suggestions=["Provide a more detailed job description specifying technical tools (e.g. Python, SQL, React)."]
        )
        
    matching = [s for s in required_skills if s.lower() in candidate_skills]
    missing = [s for s in required_skills if s.lower() not in candidate_skills]
    
    compatibility_score = round((len(matching) / len(required_skills)) * 100.0, 1)
    
    reasoning = f"Matched {len(matching)} out of {len(required_skills)} required technical skills found in the job description."
    if matching:
        reasoning += f" Your matching skills: {', '.join(matching)}."
    if missing:
        reasoning += f" Gaps: {', '.join(missing)}."
        
    suggestions = [f"Learn {s} to close the gap for this role." for s in missing]
    
    return CustomMatchResponse(
        compatibility_score=compatibility_score,
        matching_skills=matching,
        missing_skills=missing,
        reasoning_summary=reasoning,
        learning_suggestions=suggestions
    )


@router.get("/roles", response_model=List[RoleTemplate])
async def get_role_templates():
    """Returns static role templates configuration for frontend drop-downs and selection cards."""
    templates = []
    for r in PREDEFINED_ROLES:
        templates.append(
            RoleTemplate(
                role_name=r["role_name"],
                required_skills=r["required_skills"],
                description=r["explain_prefix"],
                difficulty_level=r["difficulty_level"]
            )
        )
    return templates
