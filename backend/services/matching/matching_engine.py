from typing import List, Dict, Any
from backend.schema.matching_schema import MatchingResponse, MatchedRole

# STEP 1 — PREDEFINED JOB TEMPLATES
# Realistic intern-level templates for core technical domains
JOB_TEMPLATES = {
    "Backend Intern": [
        "Python", 
        "FastAPI", 
        "SQL", 
        "PostgreSQL", 
        "API Development", 
        "Database Design"
    ],
    "ML Intern": [
        "Python", 
        "Machine Learning", 
        "PyTorch", 
        "TensorFlow", 
        "Scikit-Learn", 
        "Data Science"
    ],
    "Frontend Intern": [
        "JavaScript", 
        "React", 
        "TypeScript", 
        "HTML", 
        "CSS", 
        "UI Development"
    ],
    "Data Analyst": [
        "SQL", 
        "Python", 
        "Tableau", 
        "Power BI", 
        "Statistics", 
        "Data Visualization"
    ]
}

def match_candidate_roles(user_id: str, skill_profile: Dict[str, Any]) -> MatchingResponse:
    """
    Matches a candidate's skill profile against predefined job roles using overlap-based similarity.
    
    Args:
        user_id (str): The unique identifier of the user.
        skill_profile (Dict[str, Any]): The validated skill profile containing 'validated_skills'.
        
    Returns:
        MatchingResponse: Ranked list of matched roles with similarity percentages.
    """
    # STEP 2 — EXTRACT AND NORMALIZE CANDIDATE SKILLS
    validated_skills = skill_profile.get("validated_skills", [])
    if not isinstance(validated_skills, list):
        validated_skills = []
        
    # Extract names, normalize to lowercase, and filter for minimal credibility
    candidate_skills = {
        skill.get("name", "").strip().lower() 
        for skill in validated_skills 
        if skill.get("name") and skill.get("validated_score", 0) > 0.1
    }
    
    matched_results = []
    
    # STEP 3 — IMPLEMENT SIMILARITY MATCHING
    for role_name, required_skills in JOB_TEMPLATES.items():
        if not required_skills:
            continue
            
        # Normalize template skills for comparison
        normalized_required = [s.strip().lower() for s in required_skills]
        
        # Calculate case-insensitive overlap
        matches = [s for s in normalized_required if s in candidate_skills]
        
        # Formula: Similarity = (Matched Skills / Required Skills) * 100
        # Prevent division by zero with guard above
        similarity = (len(matches) / len(normalized_required)) * 100
        
        # STEP 4 — FILTER MEANINGFUL MATCHES
        # We only include roles where the candidate has at least one matching skill or 10% similarity
        if similarity > 0:
            matched_results.append(
                MatchedRole(
                    role=role_name,
                    similarity=round(min(similarity, 100.0), 1)
                )
            )
            
    # STEP 5 — ROLE RANKING
    # Sort results from highest similarity to lowest
    matched_results.sort(key=lambda x: x.similarity, reverse=True)
    
    return MatchingResponse(
        user_id=user_id,
        matched_roles=matched_results
    )
