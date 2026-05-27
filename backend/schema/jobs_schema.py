from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class JobRecommendationItem(BaseModel):
    """Detailed recommendation details for a single job role, with frontend-friendly aliases."""
    role_name: str
    title: str  # Frontend compatibility alias
    company: str
    location: str
    match_percentage: float
    match: float  # Frontend compatibility alias
    required_skills: List[str]
    required: List[str]  # Frontend compatibility alias
    matching_skills: List[str]
    strengths: List[str]  # Frontend compatibility alias
    missing_skills: List[str]
    missing: List[str]  # Frontend compatibility alias
    learning_suggestions: List[str]
    learn: str  # Frontend compatibility alias (combined string)
    explanation: str
    explain: str  # Frontend compatibility alias

class JobsRecommendationsResponse(BaseModel):
    """Aggregated job recommendations response for a candidate, including overall and role-specific details."""
    recommended_roles: List[JobRecommendationItem]
    # Top-level summarized statistics matching the highest compatibility role
    match_percentage: float
    matching_skills: List[str]
    missing_skills: List[str]
    strengths: List[str]
    learning_suggestions: List[str]

class CustomMatchRequest(BaseModel):
    """Payload for custom matching of a candidate against a job description."""
    candidate_id: str
    job_description: str

class CustomMatchResponse(BaseModel):
    """Compatibility results of matching a candidate against a custom job description."""
    compatibility_score: float
    matching_skills: List[str]
    missing_skills: List[str]
    reasoning_summary: str
    learning_suggestions: List[str]

class RoleTemplate(BaseModel):
    """Predefined static role template config for frontend selectors."""
    role_name: str
    required_skills: List[str]
    description: str
    difficulty_level: str
