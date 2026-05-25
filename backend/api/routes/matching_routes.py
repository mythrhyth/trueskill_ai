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
        
        return CombinedAnalysisResponse(
            user_id=user_id,
            score=score_res,
            matched_roles=match_res.matched_roles,
            graph=graph_res,
            explanations=explanation_res
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
