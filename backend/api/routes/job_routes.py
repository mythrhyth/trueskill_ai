"""
Job API Routes - Handles job creation, extraction, and management.
"""

import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from auth.dependencies import get_current_user
from auth.models import User
from services.database_service import create_job, save_job_skills
from utils.llm_service import extract_job_skills_with_llm

router = APIRouter(prefix="/api/jobs", tags=["jobs"])
logger = logging.getLogger(__name__)


class JobExtractionRequest(BaseModel):
    description: str = Field(..., description="Job description text")


class JobExtractionResponse(BaseModel):
    required_skills: List[Dict[str, Any]] = Field(..., description="Required skills extracted")
    preferred_skills: List[Dict[str, Any]] = Field(..., description="Preferred skills extracted")


class JobCreateRequest(BaseModel):
    title: str = Field(..., description="Job title")
    company: str = Field(..., description="Company name")
    location: str = Field(..., description="Location")
    type: str = Field(..., description="Job type")
    salary: str = Field(None, description="Salary range")
    description: str = Field(..., description="Job description text")
    required_skills: List[Dict[str, Any]] = Field(..., description="Required skills")
    preferred_skills: List[Dict[str, Any]] = Field(default_factory=list, description="Preferred skills")


@router.post("/extract", response_model=JobExtractionResponse)
async def extract_job_skills(
    request: JobExtractionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Extract required and preferred skills from a job description text using LLM.
    """
    try:
        if not request.description or len(request.description.strip()) < 50:
            raise HTTPException(status_code=400, detail="Job description is too short or empty")

        result = extract_job_skills_with_llm(request.description)
        
        return JobExtractionResponse(
            required_skills=result.get("required_skills", []),
            preferred_skills=result.get("preferred_skills", [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error extracting job skills: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("")
async def create_new_job(
    request: JobCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new job and save its skills.
    """
    try:
        # Create Job
        job_data = {
            "title": request.title,
            "company": request.company,
            "location": request.location,
            "description": request.description,
            "recruiter_id": current_user.id
        }
        
        job = create_job(db, job_data)
        
        # Merge skills
        all_skills = []
        for s in request.required_skills:
            all_skills.append({**s, "is_required": True})
        for s in request.preferred_skills:
            all_skills.append({**s, "is_required": False})
            
        if all_skills:
            save_job_skills(db, job.id, all_skills)
            
        return {"success": True, "job_id": job.id, "message": "Job created successfully"}
        
    except Exception as e:
        logger.error(f"Error creating job: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

