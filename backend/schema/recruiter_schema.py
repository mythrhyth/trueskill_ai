from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class RecruiterCandidateResponse(BaseModel):
    """Summary of an analyzed candidate for listing and search."""
    candidate_id: str
    name: str
    score: float
    top_skills: List[str]
    authenticity_metrics: Dict[str, Any]
    matched_roles: List[Dict[str, Any]]
    analysis_summary: Dict[str, Any]
    created_at: str

class RecruiterCandidateDetailResponse(BaseModel):
    """Detailed profile data of an analyzed candidate fetched from persistence."""
    candidate_id: str
    name: str
    extracted_skills: List[Any]
    validated_skills: List[Dict[str, Any]]
    score: float
    matched_roles: List[Dict[str, Any]]
    analysis_summary: Dict[str, Any]
    authenticity_metrics: Dict[str, Any]
    created_at: str
