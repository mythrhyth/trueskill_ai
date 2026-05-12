"""
Unified response schemas for all API endpoints.
Ensures consistent, UI-ready payloads across ingestion, extraction, and validation.
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from enum import Enum


class SkillStatusEnum(str, Enum):
    """Status categories for UI rendering."""
    Strong = "Strong"
    Moderate = "Moderate"
    Weak = "Weak"


class SkillResponse(BaseModel):
    """Single skill with scores and evidence for frontend display."""
    name: str = Field(..., description="Skill name")
    category: Optional[str] = Field(default=None, description="Skill category (e.g., 'backend', 'frontend')")
    confidence_score: float = Field(..., ge=0, le=100, description="Extraction confidence (0-100)")
    authenticity_score: float = Field(..., ge=0, le=100, description="Validation/authenticity score (0-100)")
    status: SkillStatusEnum = Field(..., description="UI status: Strong/Moderate/Weak")
    evidence: List[str] = Field(default_factory=list, description="List of evidence sources/descriptions")
    level: Optional[str] = Field(default="intermediate", description="Skill level (beginner/intermediate/advanced/expert)")


class SkillsSummary(BaseModel):
    """Summary statistics of extracted skills."""
    total_skills: int = Field(..., description="Total skills found")
    strong: int = Field(..., description="Count of Strong skills (>75)")
    moderate: int = Field(..., description="Count of Moderate skills (50-75)")
    weak: int = Field(..., description="Count of Weak skills (<50)")
    average_confidence: float = Field(..., ge=0, le=100, description="Average confidence across all skills")
    profile_strength: int = Field(..., ge=0, le=100, description="Overall profile strength %")


class ResumeExtractionResponse(BaseModel):
    """Response from resume upload and text extraction."""
    raw_text: str = Field(..., description="Extracted raw text from resume")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Parsed metadata (email, phone, etc.)")
    source_file: Optional[str] = Field(default=None, description="Name of uploaded file")


class FullCandidateProcessResponse(BaseModel):
    """
    Final orchestrated response after full processing pipeline:
    resume → extraction → skill extraction → validation.
    
    This is the primary response for the /api/candidate/full-process endpoint.
    """
    user_id: Optional[str] = Field(default=None, description="Candidate user ID")
    skills: List[SkillResponse] = Field(..., description="List of extracted and validated skills")
    summary: SkillsSummary = Field(..., description="Summary statistics")
    is_suspicious: bool = Field(default=False, description="Fraud detection flag")
    fraud_count: int = Field(default=0, description="Number of flagged fraudulent skills")
    timestamp: str = Field(..., description="Processing timestamp (ISO 8601)")
    processing_errors: List[str] = Field(default_factory=list, description="List of non-fatal errors during processing")


class ValidationResponseItem(BaseModel):
    """Individual item in validation response."""
    name: str
    confidence_score: float
    authenticity_score: float
    is_fraud: bool = False
    reason: Optional[str] = None


class ValidationResponse(BaseModel):
    """Response from validation endpoint."""
    user_id: Optional[str] = None
    validated_skills: List[ValidationResponseItem]
    overall_score: float = Field(..., ge=0, le=100)
    is_suspicious: bool = False
    timestamp: str = Field(...)


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = Field(default="healthy")
    service: str = Field(...)
    available_endpoints: List[str] = Field(default_factory=list)
