from typing import Any, Dict, List, Optional
import os
import tempfile

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from services.ingestion.cp_parser import parse_cp_profile
from services.ingestion.doc_parser import parse_document
from services.ingestion.github_parser import parse_github, get_github_parser
from services.ingestion.kaggle_parser import parse_kaggle
from services.ingestion.normalizer import normalize_item, normalize_user_schema
from services.ingestion.research_parser import parse_research
from services.ingestion.resume_parser import parse_resume
from services.skill_extractor.orchestrator.pipeline import run_github_pipeline
from services.database_service import upsert_github_skills, update_github_profile_status, get_github_skills_status
from schema.response_schema import ResumeExtractionResponse
from schema.skill_schema import SkillResponse
from auth.dependencies import get_current_user
from auth.models import User
from database import get_db
from sqlalchemy.orm import Session
from models.ingestion import IngestionData
from dotenv import load_dotenv
from fastapi import Depends
import json

router = APIRouter(prefix="/ingestion", tags=["ingestion"])


class UrlRequest(BaseModel):
    url: str

class UrlsRequest(BaseModel):
    urls: List[str]


class PathRequest(BaseModel):
    path: str


class NormalizeItemRequest(BaseModel):
    item: Dict[str, Any]


class NormalizeUserRequest(BaseModel):
    user_id: str
    items: List[Dict[str, Any]]
    timestamp: Optional[str] = None


@router.post("/cp", response_model=dict)
async def ingest_cp_profile(
    payload: UrlsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        results = []
        for url in payload.urls:
            results.append(parse_cp_profile(url))
            
        content_str = json.dumps(results)
        
        # Check if already exists
        ingestion = db.query(IngestionData).filter(
            IngestionData.user_id == str(current_user.id),
            IngestionData.source == "cp"
        ).first()
        
        if ingestion:
            ingestion.content = content_str
            ingestion.url = ",".join(payload.urls)
        else:
            ingestion = IngestionData(
                user_id=str(current_user.id),
                source="cp",
                content=content_str,
                url=",".join(payload.urls)
            )
            db.add(ingestion)
        db.commit()
        return {"message": "Competitive programming profiles ingested successfully", "success": True}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/github", response_model=dict)
async def ingest_github(
    payload: UrlRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        result = parse_github(payload.url)
        content_str = json.dumps(result)
        
        ingestion = db.query(IngestionData).filter(
            IngestionData.user_id == str(current_user.id),
            IngestionData.source == "github"
        ).first()
        
        if ingestion:
            ingestion.content = content_str
            ingestion.url = payload.url
        else:
            ingestion = IngestionData(
                user_id=str(current_user.id),
                source="github",
                content=content_str,
                url=payload.url
            )
            db.add(ingestion)
        db.commit()
        return {"message": "GitHub profile ingested successfully", "success": True}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/kaggle", response_model=dict)
async def ingest_kaggle(
    payload: UrlRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        result = parse_kaggle(payload.url)
        content_str = json.dumps(result)
        
        ingestion = db.query(IngestionData).filter(
            IngestionData.user_id == str(current_user.id),
            IngestionData.source == "kaggle"
        ).first()
        
        if ingestion:
            ingestion.content = content_str
            ingestion.url = payload.url
        else:
            ingestion = IngestionData(
                user_id=str(current_user.id),
                source="kaggle",
                content=content_str,
                url=payload.url
            )
            db.add(ingestion)
        db.commit()
        return {"message": "Kaggle profile ingested successfully", "success": True}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/research", response_model=dict)
async def ingest_research(
    payload: UrlRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        result = parse_research(payload.url)
        content_str = json.dumps(result)
        
        ingestion = db.query(IngestionData).filter(
            IngestionData.user_id == str(current_user.id),
            IngestionData.source == "research"
        ).first()
        
        if ingestion:
            ingestion.content = content_str
            ingestion.url = payload.url
        else:
            ingestion = IngestionData(
                user_id=str(current_user.id),
                source="research",
                content=content_str,
                url=payload.url
            )
            db.add(ingestion)
        db.commit()
        return {"message": "Research profile ingested successfully", "success": True}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))



@router.post("/resume/upload", response_model=ResumeExtractionResponse)
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload and parse a resume file (PDF, DOCX, TXT, MD).
    Returns extracted text and metadata.
    """
    try:
        # Save uploaded file to temp location
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        try:
            result = parse_resume(tmp_path)
            return ResumeExtractionResponse(
                raw_text=result.get("content", {}).get("raw_text", ""),
                metadata=result.get("attributes", {}),
                source_file=file.filename
            )
        finally:
            os.unlink(tmp_path)
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


@router.post("/github/extract-skills", response_model=SkillResponse)
async def extract_github_skills(
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Extract skills from GitHub repositories and update user's skill profile."""
    try:
        # Get GitHub username and token from request
        github_username = request.get("github_username")
        github_token = request.get("github_token") or os.getenv("GITHUB_TOKEN")
        
        if not github_username:
            raise HTTPException(status_code=400, detail="GitHub username is required")
        
        # Run GitHub pipeline
        pipeline_data = {
            "user_id": current_user.id,
            "github_username": github_username,
            "github_token": github_token,
            "db": db
        }
        
        result = run_github_pipeline(pipeline_data)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        # Update GitHub profile status
        update_github_profile_status(
            db=db,
            user_id=current_user.id,
            github_username=github_username,
            github_url=f"https://github.com/{github_username}",
            skills_extracted=True
        )
        
        return {
            "status": "success",
            "message": "GitHub skills extracted successfully",
            "skills": result.get("skills", []),
            "skills_count": result.get("skills_count", 0),
            "languages_found": result.get("languages_found", 0),
            "github_username": github_username,
            "github_url": f"https://github.com/{github_username}"
        }
        
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/github/skills-status", response_model=dict)
async def get_github_skills_status_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get GitHub skills extraction status for current user."""
    try:
        status = get_github_skills_status(db, current_user.id)
        return {
            "status": "success",
            "github_status": status
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/health")
async def ingestion_health():
    return {
        "status": "healthy",
        "service": "ingestion",
        "available_endpoints": [
            "/ingestion/cp",
            "/ingestion/github",
            "/ingestion/github/extract-skills",
            "/ingestion/github/skills-status",
            "/ingestion/kaggle",
            "/ingestion/research",
            "/ingestion/resume",
            "/ingestion/document",
            "/ingestion/normalize/item",
            "/ingestion/normalize/user"
        ]
    }
