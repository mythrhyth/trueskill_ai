"""
Authentication routes for user management.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from auth.models import User
from database import get_db
from models.candidate import CandidateSkill
from schema.response_schema import SkillResponse

router = APIRouter(prefix="/api/auth", tags=["authentication"])


class SkillResponse(BaseModel):
    skills: List[SkillResponse]


@router.get("/me/upload-status")
async def get_upload_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's upload status including resume and other documents.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        # Get candidate profile
        candidate = db.query(Candidate).filter(
            Candidate.user_id == str(current_user.id)
        ).first()
        
        if not candidate:
            return {
                "has_resume": False,
                "has_github": False,
                "has_kaggle": False,
                "has_research": False,
                "resume_uploaded_at": None,
                "github_connected_at": None,
                "last_updated": None
            }
        
        # Get candidate profile
        profile = db.query(CandidateProfile).filter(
            CandidateProfile.candidate_id == candidate.id
        ).first()
        
        upload_status = {
            "has_resume": bool(profile and profile.document_metadata and len(profile.document_metadata) > 0),
            "has_github": bool(profile and profile.github_url),
            "has_kaggle": bool(profile and profile.kaggle_url),
            "has_research": bool(profile and profile.research_urls and len(profile.research_urls) > 0),
            "resume_uploaded_at": None,
            "github_connected_at": None,
            "last_updated": profile.updated_at.isoformat() if profile and profile.updated_at else None
        }
        
        # Add GitHub skills extraction status
        from services.database_service import get_github_skills_status
        github_status = get_github_skills_status(db, str(current_user.id))
        upload_status.update({
            "github_skills_extracted": github_status.get("github_skills_extracted", False),
            "github_url": github_status.get("github_url"),
            "github_last_extracted": github_status.get("github_last_extracted")
        })
        
        # Get resume upload time if available
        if profile and profile.document_metadata:
            for doc in profile.document_metadata:
                if doc.get("type") == "resume":
                    upload_status["resume_uploaded_at"] = doc.get("uploaded_at")
                    break
        
        return upload_status
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get upload status: {str(e)}")


@router.get("/me/skills", response_model=SkillResponse)
async def get_user_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get skills for the currently authenticated user.
    
    Args:
        current_user: Authenticated user from JWT token
        db: Database session
    
    Returns:
        SkillResponse with list of user's skills
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        # Query CandidateSkill model for user's skills with proper join
        skills = db.query(CandidateSkill).join(Candidate).filter(
            Candidate.user_id == str(current_user.id)
        ).all()
        
        # Convert to SkillResponse format with all available data
        skill_responses = []
        for skill in skills:
            skill_responses.append(
                SkillResponse(
                    name=skill.skill.name if skill.skill else skill.name or "Unknown",
                    category=skill.skill.category if skill.skill else skill.category or "General",
                    confidence_score=skill.confidence_score,
                    authenticity_score=skill.authenticity_score,
                    status=skill.status,
                    evidence=skill.evidence or [],
                    level=skill.level,
                    # Additional fields that might be useful
                    signals=skill.signals or [],
                    source_count=skill.source_count or 1,
                    created_at=skill.created_at.isoformat() if skill.created_at else None
                )
            )
        
        return SkillResponse(skills=skill_responses)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch skills: {str(e)}")
