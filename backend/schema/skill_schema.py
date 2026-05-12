from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


class ProcessingInput(BaseModel):
    user_id: str
    data: List[Dict[str, Any]]  # List of data items (resumes, github repos, etc.)


class SkillSource(BaseModel):
    source: str
    item_id: str
    weight: float = Field(ge=0.0, le=1.0)


class SkillDiscovery(BaseModel):
    source: str
    item_id: str


SkillEvidence = Dict[str, Any]


class Skill(BaseModel):
    name: str
    category: str

    confidence: float = Field(ge=0.0, le=1.0)
    level: Optional[str] = None

    sources: List[SkillSource]                # ONLY trusted sources
    discovered_from: Optional[List[SkillDiscovery]] = []  # resume/images only

    evidence: Optional[SkillEvidence] = Field(default_factory=dict)


class SkillExtractionOutput(BaseModel):
    user_id: str
    timestamp: str
    skills: List[Skill]


class SkillResponse(BaseModel):
    user_id: Optional[str] = None
    timestamp: Optional[str] = None
    skills: List["SkillDetail"]


class SkillDetail(BaseModel):
    name: str
    category: Optional[str] = None
    confidence_score: float = Field(ge=0.0, le=100.0)
    authenticity_score: float = Field(ge=0.0, le=100.0)
    status: str
    evidence: List[str] = []
    level: Optional[str] = None
    signals: List[Any] = []
    source_count: int = 1
    created_at: Optional[str] = None