from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ingestion.cp_parser import parse_cp_profile
from ingestion.doc_parser import parse_document
from ingestion.github_parser import parse_github
from ingestion.kaggle_parser import parse_kaggle
from ingestion.normalizer import normalize_item, normalize_user_schema
from ingestion.research_parser import parse_research
from ingestion.resume_parser import parse_resume

router = APIRouter(prefix="/ingestion", tags=["ingestion"])


class UrlRequest(BaseModel):
    url: str


class PathRequest(BaseModel):
    path: str


class NormalizeItemRequest(BaseModel):
    item: Dict[str, Any]


class NormalizeUserRequest(BaseModel):
    user_id: str
    items: List[Dict[str, Any]]
    timestamp: Optional[str] = None


@router.post("/cp", response_model=dict)
async def ingest_cp_profile(payload: UrlRequest):
    try:
        return parse_cp_profile(payload.url)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/github", response_model=dict)
async def ingest_github(payload: UrlRequest):
    try:
        return parse_github(payload.url)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/kaggle", response_model=dict)
async def ingest_kaggle(payload: UrlRequest):
    try:
        return parse_kaggle(payload.url)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/research", response_model=dict)
async def ingest_research(payload: UrlRequest):
    try:
        return parse_research(payload.url)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/resume", response_model=dict)
async def ingest_resume(payload: PathRequest):
    try:
        return parse_resume(payload.path)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/document", response_model=dict)
async def ingest_document(payload: PathRequest):
    try:
        return parse_document(payload.path)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/normalize/item", response_model=dict)
async def normalize_single_item(payload: NormalizeItemRequest):
    try:
        return normalize_item(payload.item).model_dump()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/normalize/user", response_model=dict)
async def normalize_user(payload: NormalizeUserRequest):
    try:
        return normalize_user_schema(payload.user_id, payload.items, payload.timestamp).model_dump()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/health")
async def ingestion_health():
    return {
        "status": "healthy",
        "service": "ingestion",
        "available_endpoints": [
            "/ingestion/cp",
            "/ingestion/github",
            "/ingestion/kaggle",
            "/ingestion/research",
            "/ingestion/resume",
            "/ingestion/document",
            "/ingestion/normalize/item",
            "/ingestion/normalize/user",
        ],
    }
