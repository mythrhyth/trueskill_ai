from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class CandidateScore(BaseModel):
    user_id: str
    final_score: float
    score_breakdown: Dict[str, Any]

class MatchedRole(BaseModel):
    role: str
    similarity: float

class MatchingResponse(BaseModel):
    user_id: str
    matched_roles: List[MatchedRole]

class JobRequirement(BaseModel):
    role: str
    required_skills: List[str]

class GraphNode(BaseModel):
    id: str
    label: str
    type: str

class GraphEdge(BaseModel):
    source: str
    target: str
    relation: str

class GraphStructure(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class ProfileExplanation(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]

class CombinedAnalysisResponse(BaseModel):
    user_id: str
    name: Optional[str] = "Unknown User"
    email: Optional[str] = "unknown@example.com"
    role: Optional[str] = "Software Engineer"
    score: CandidateScore
    matched_roles: List[MatchedRole]
    graph: GraphStructure
    explanations: ProfileExplanation
