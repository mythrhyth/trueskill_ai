"""Data schemas for skill extraction and profiling."""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum


class SkillLevel(str, Enum):
    """Skill proficiency levels."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class SkillCategory(str, Enum):
    """Skill categories."""
    LANGUAGE = "language"
    FRAMEWORK = "framework"
    TOOL = "tool"
    PLATFORM = "platform"
    METHODOLOGY = "methodology"
    DOMAIN = "domain"
    SOFT_SKILL = "soft_skill"
    UNKNOWN = "unknown"


class Signal(BaseModel):
    """Individual evidence signal contributing to skill detection."""
    source: str = Field(..., description="Source of signal (e.g., 'github', 'leetcode')")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score 0-1")
    evidence: str = Field(..., description="Specific evidence")
    weight: float = Field(default=1.0, ge=0, le=1, description="Weight in fusion")


class Skill(BaseModel):
    """Extracted skill with comprehensive metadata."""
    name: str = Field(..., description="Skill name")
    category: SkillCategory = Field(default=SkillCategory.UNKNOWN)
    level: SkillLevel = Field(default=SkillLevel.INTERMEDIATE)
    confidence: float = Field(default=0.5, ge=0, le=1)
    evidence: List[str] = Field(default_factory=list)
    reasoning: str = Field(default="", description="Explanation of detection logic")
    signals: List[Signal] = Field(default_factory=list, description="Underlying signals")
    score: Optional[float] = Field(default=None, ge=0, le=1, description="Final credibility score")


class SkillProfile(BaseModel):
    """Complete skill profile for a user."""
    user_id: str
    skills: List[Skill] = Field(default_factory=list)
    total_skills: int = Field(default=0)
    average_confidence: float = Field(default=0.0)
    processing_metadata: Dict[str, Any] = Field(default_factory=dict)


class ExplanationItem(BaseModel):
    """Human-readable explanation item."""
    skill: str
    score: float
    explanation: List[str]
    level: str
    category: str


class SkillResponse(BaseModel):
    """Final API response with skill profile and explanations."""
    user_id: str
    skills: List[Skill]
    explanations: List[ExplanationItem] = Field(default_factory=list)
    summary: Dict[str, Any] = Field(default_factory=dict)


class ProcessingInput(BaseModel):
    """Input data format for processing."""
    user_id: str
    data: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of data items with 'content', 'source', 'metrics' fields"
    )