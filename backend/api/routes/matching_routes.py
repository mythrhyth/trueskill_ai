from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from backend.schema.matching_schema import (
    CandidateScore, 
    MatchingResponse, 
    JobRequirement, 
    CombinedAnalysisResponse
)
from backend.services.scoring.scoring_engine import calculate_candidate_score
from backend.services.matching.matching_engine import match_candidate_roles
from backend.services.graph.graph_engine import build_skill_graph
from backend.services.explainability.explainability_engine import generate_profile_explanation
from backend.services.persistence.candidate_repository import save_candidate_result

router = APIRouter(prefix="/matching", tags=["matching"])

@router.post("/calculate-score", response_model=CandidateScore)
async def calculate_score(payload: Dict[str, Any]):
    """
    Calculates the candidate's ranking score based on Phase 3 output.
    """
    try:
        user_id = payload.get("user_id", "unknown")
        return calculate_candidate_score(user_id, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match-jobs", response_model=MatchingResponse)
async def match_jobs(payload: Dict[str, Any]):
    """
    Matches the candidate's profile against available roles.
    """
    try:
        user_id = payload.get("user_id", "unknown")
        return match_candidate_roles(user_id, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/graph/profile", response_model=Dict[str, Any])
async def get_profile_graph(payload: Dict[str, Any]):
    """
    Returns the graph representation of a candidate's skill network.
    """
    try:
        user_id = payload.get("user_id", "unknown")
        validated_skills = payload.get("validated_skills", [])
        return build_skill_graph(user_id, validated_skills)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/profile-analysis", response_model=CombinedAnalysisResponse)
async def analyze_profile(payload: Dict[str, Any]):
    """
    Comprehensive candidate analysis.
    Calculates score, matches roles, and generates human-readable explanations.
    """
    try:
        user_id = payload.get("user_id", "unknown")
        validated_skills = payload.get("validated_skills", [])
        
        # 1. Calculate Score
        score_res = calculate_candidate_score(user_id, payload)
        
        # 2. Match Roles
        match_res = match_candidate_roles(user_id, payload)
        
        # 3. Build Graph
        graph_res = build_skill_graph(user_id, validated_skills)
        
        # 4. Generate Explanations
        explanation_res = generate_profile_explanation(
            score_res.model_dump(),
            validated_skills,
            [m.model_dump() for m in match_res.matched_roles]
        )
        
        # Safely persist candidate result in the database
        try:
            name = (
                payload.get("name") or 
                payload.get("profile_summary", {}).get("name") or 
                payload.get("profile_summary", {}).get("username") or
                user_id
            )
            if not name or name.strip() == "" or name.startswith("req_"):
                name = "Unknown User"
                
            email = payload.get("email") or payload.get("profile_summary", {}).get("email") or "unknown@example.com"
            role = payload.get("role") or (match_res.matched_roles[0].role if match_res.matched_roles else "Software Engineer")
            
            extracted_skills = payload.get("extracted_skills") or payload.get("skills") or []
            
            candidate_data = {
                "candidate_id": user_id,
                "name": name,
                "email": email,
                "role": role,
                "extracted_skills": extracted_skills,
                "validated_skills": validated_skills,
                "score": score_res.final_score,
                "matched_roles": [m.model_dump() for m in match_res.matched_roles],
                "analysis_summary": explanation_res.model_dump(),
                "authenticity_metrics": {
                    "score_breakdown": score_res.score_breakdown,
                    "is_suspicious": payload.get("is_suspicious", False)
                }
            }
            save_candidate_result(candidate_data)
        except Exception as persist_err:
            import logging
            logging.getLogger("trueskill_persistence").error(
                f"Failed to persist candidate results: {persist_err}", exc_info=True
            )
        
        return CombinedAnalysisResponse(
            user_id=user_id,
            name=name,
            email=email,
            role=role,
            score=score_res,
            matched_roles=match_res.matched_roles,
            graph=graph_res,
            explanations=explanation_res
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
