"""
Scoring API Routes - Match and Interest score endpoints.

These endpoints handle score computation and retrieval for candidates and jobs.
"""

import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, Path
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

# Import services and models
from services.match_score import compute_match_score
from services.interest_score import compute_interest_score

from database import get_db
from services.database_service import (
    get_candidate_with_skills, 
    get_job_with_skills, 
    save_match_score, 
    get_candidate_scores_history, 
    get_top_candidates_for_job,
    get_top_jobs_for_candidate
)

router = APIRouter(prefix="/api", tags=["scoring"])
logger = logging.getLogger(__name__)


# Pydantic models for requests/responses
class MatchScoreRequest(BaseModel):
    candidate_id: int = Field(..., description="Candidate ID")
    job_id: int = Field(..., description="Job ID")


class MatchScoreResponse(BaseModel):
    score: float = Field(..., description="Match score (0.0 to 1.0)")
    explanation: List[str] = Field(..., description="Explanation of score breakdown")
    matched_skills: List[str] = Field(..., description="Skills that matched")
    missing_skills: List[str] = Field(..., description="Required skills that are missing")
    coverage_ratio: float = Field(..., description="Ratio of required skills covered")


class InterestScoreRequest(BaseModel):
    candidate_id: int = Field(..., description="Candidate ID")
    chat_history: List[Dict[str, Any]] = Field(..., description="Chat message history")


class InterestScoreResponse(BaseModel):
    score: float = Field(..., description="Interest score (0.0 to 1.0)")
    breakdown: Dict[str, float] = Field(..., description="Score breakdown by component")
    metrics: Dict[str, Any] = Field(..., description="Raw metrics used for calculation")


class CandidateScoresResponse(BaseModel):
    candidate_id: int = Field(..., description="Candidate ID")
    match_score: Optional[float] = Field(None, description="Latest match score")
    interest_score: Optional[float] = Field(None, description="Latest interest score")
    match_scores: List[Dict[str, Any]] = Field(default_factory=list, description="All match scores")
    interest_scores: List[Dict[str, Any]] = Field(default_factory=list, description="All interest scores")


# Mock data storage (replace with database operations)
MOCK_CANDIDATES = {
    1: {
        "skills": [
            {"name": "Python", "confidence_score": 0.9, "authenticity_score": 0.85},
            {"name": "React", "confidence_score": 0.8, "authenticity_score": 0.9},
            {"name": "AWS", "confidence_score": 0.7, "authenticity_score": 0.8},
            {"name": "PostgreSQL", "confidence_score": 0.85, "authenticity_score": 0.8},
        ]
    },
    2: {
        "skills": [
            {"name": "JavaScript", "confidence_score": 0.95, "authenticity_score": 0.9},
            {"name": "Node.js", "confidence_score": 0.8, "authenticity_score": 0.85},
            {"name": "MongoDB", "confidence_score": 0.75, "authenticity_score": 0.8},
        ]
    }
}

MOCK_JOBS = {
    1: {
        "skills": [
            {"name": "Python", "weight": 1.0, "is_required": True},
            {"name": "React", "weight": 0.8, "is_required": True},
            {"name": "AWS", "weight": 0.6, "is_required": False},
            {"name": "PostgreSQL", "weight": 0.7, "is_required": True},
        ]
    },
    2: {
        "skills": [
            {"name": "JavaScript", "weight": 1.0, "is_required": True},
            {"name": "Node.js", "weight": 0.9, "is_required": True},
            {"name": "React", "weight": 0.7, "is_required": False},
            {"name": "MongoDB", "weight": 0.8, "is_required": True},
        ]
    }
}


@router.post("/match-score", response_model=MatchScoreResponse)
async def compute_match_score_endpoint(
    request: MatchScoreRequest,
    db: Session = Depends(get_db)
):
    """
    Compute match score between candidate and job.
    
    This endpoint evaluates how well a candidate's skills match job requirements,
    taking into account skill confidence, authenticity, and job weights.
    """
    try:
        # Fetch candidate skills from DB
        candidate_data = get_candidate_with_skills(db, request.candidate_id)
        if not candidate_data:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Fetch job skills from DB
        job_data = get_job_with_skills(db, request.job_id)
        if not job_data:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Compute match score
        result = compute_match_score(
            candidate_data["skills"],
            job_data["skills"]
        )
        
        # Store result in database
        save_match_score(db, request.candidate_id, request.job_id, result)
        
        logger.info(f"Match score computed: candidate {request.candidate_id} vs job {request.job_id} = {result['score']}")
        
        return MatchScoreResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error computing match score: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/interest-score", response_model=InterestScoreResponse)
async def compute_interest_score_endpoint(
    request: InterestScoreRequest,
    db: Session = Depends(get_db)
):
    """
    Compute interest score from chat history.
    
    This endpoint analyzes candidate engagement patterns to determine
    their level of interest and engagement.
    """
    try:
        # Compute interest score
        result = compute_interest_score(request.chat_history)
        
        # Store result in database (placeholder)
        # interest_score = InterestScore(
        #     candidate_id=request.candidate_id,
        #     score=result["score"],
        #     breakdown=result["breakdown"],
        #     metrics=result["metrics"],
        #     session_count=1,
        #     total_messages=result["metrics"]["total_messages"]
        # )
        # db.add(interest_score)
        # db.commit()
        
        logger.info(f"Interest score computed: candidate {request.candidate_id} = {result['score']}")
        
        return InterestScoreResponse(**result)
        
    except Exception as e:
        logger.error(f"Error computing interest score: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/candidate/{candidate_id}/scores", response_model=CandidateScoresResponse)
async def get_candidate_scores(
    candidate_id: int = Path(..., description="Candidate ID"),
    db: Session = Depends(get_db)
):
    """
    Get all scores for a candidate.
    
    Returns the latest match and interest scores along with historical data.
    """
    try:
        history = get_candidate_scores_history(db, candidate_id)
        match_scores = history.get("match_scores", [])
        interest_scores = history.get("interest_scores", [])
        
        latest_match_score = match_scores[0]["score"] if match_scores else None
        latest_interest_score = interest_scores[0]["score"] if interest_scores else None
        
        return CandidateScoresResponse(
            candidate_id=candidate_id,
            match_score=latest_match_score,
            interest_score=latest_interest_score,
            match_scores=match_scores,
            interest_scores=interest_scores
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching candidate scores: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/job/{job_id}/candidates")
async def get_job_candidates(
    job_id: int = Path(..., description="Job ID"),
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Get ranked candidates for a job.
    
    Returns candidates sorted by combined score (70% match + 30% interest).
    """
    try:
        job_data = get_job_with_skills(db, job_id)
        if not job_data:
            raise HTTPException(status_code=404, detail="Job not found")
            
        candidates = get_top_candidates_for_job(db, job_id, limit=limit)
        
        paginated_candidates = candidates[offset:offset + limit]
        
        return {
            "job_id": job_id,
            "candidates": paginated_candidates,
            "total": len(candidates),
            "limit": limit,
            "offset": offset
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching job candidates: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/candidate/{candidate_id}/jobs")
async def get_candidate_jobs(
    candidate_id: int = Path(..., description="Candidate ID"),
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Get matched jobs for a candidate.
    
    Returns jobs sorted by match score.
    """
    try:
        jobs = get_top_jobs_for_candidate(db, candidate_id, limit=100) # Fetch more to allow pagination
        
        paginated_jobs = jobs[offset:offset + limit]
        
        return {
            "candidate_id": candidate_id,
            "jobs": paginated_jobs,
            "total": len(jobs),
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Error fetching candidate jobs: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/health")
async def health_check():
    """Health check endpoint for scoring service."""
    return {"status": "healthy", "service": "scoring"}
