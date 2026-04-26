

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any


class Content(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    raw_text: Optional[str] = None



class Attributes(BaseModel):
    tech_stack: Optional[List[str]] = []
    tags: Optional[List[str]] = []

    # optional fields depending on source
    skills: Optional[List[str]] = []
    projects: Optional[List[Dict[str, Any]]] = []
    skills_covered: Optional[List[str]] = []

    # catch-all for future extensibility
    extra: Optional[Dict[str, Any]] = {}


class Metrics(BaseModel):
    # GitHub
    stars: Optional[int] = None
    forks: Optional[int] = None
    watchers: Optional[int] = None
    commits: Optional[int] = None
    contributors: Optional[int] = None
    languages: Optional[Dict[str, float]] = None
    issues: Optional[int] = None
    pull_requests: Optional[int] = None
    repo_size_kb: Optional[int] = None

    # Open-source
    pull_requests_opened: Optional[int] = None
    pull_requests_merged: Optional[int] = None
    issues_opened: Optional[int] = None
    issues_closed: Optional[int] = None
    lines_added: Optional[int] = None
    lines_deleted: Optional[int] = None
    review_comments: Optional[int] = None
    acceptance_rate: Optional[float] = None

    # CP platforms
    total_solved: Optional[int] = None
    difficulty_breakdown: Optional[Dict[str, int]] = None
    contest_rating: Optional[int] = None
    ranking: Optional[int] = None
    streak_days: Optional[int] = None
    languages_used: Optional[List[str]] = None

    # Kaggle
    competitions: Optional[int] = None
    best_rank: Optional[int] = None
    medals: Optional[Dict[str, int]] = None
    notebooks: Optional[int] = None
    datasets: Optional[int] = None
    followers: Optional[int] = None

    # Certificates
    verified: Optional[bool] = None
    grade: Optional[str] = None
    duration_hours: Optional[int] = None

    # Research
    citations: Optional[int] = None
    authors_count: Optional[int] = None
    published: Optional[bool] = None

    # Image / OCR
    ocr_confidence: Optional[float] = None
    classification_confidence: Optional[float] = None

    # catch-all
    extra: Optional[Dict[str, Any]] = {}



class Links(BaseModel):
    repo_url: Optional[str] = None
    profile_url: Optional[str] = None
    paper_url: Optional[str] = None
    url: Optional[str] = None

    # fallback
    extra: Optional[Dict[str, Any]] = {}



class Timestamps(BaseModel):
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    uploaded_at: Optional[str] = None



class Extra(BaseModel):
    data: Optional[Dict[str, Any]] = {}



class Item(BaseModel):
    id: str
    source: str
    type: str

    content: Content
    attributes: Optional[Attributes] = Attributes()
    metrics: Optional[Metrics] = Metrics()
    links: Optional[Links] = Links()
    timestamps: Optional[Timestamps] = Timestamps()

    extra: Optional[Dict[str, Any]] = {}

    ingestion_confidence: Optional[float] = Field(default=1.0, ge=0.0, le=1.0)



class UserSchema(BaseModel):
    user_id: str
    timestamp: str
    items: List[Item]