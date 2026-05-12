"""
Orchestrator endpoint that coordinates the full candidate processing pipeline:
resume upload → text extraction → skill extraction → validation → UI-ready response
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Optional
import os
import tempfile
from datetime import datetime

from schema.response_schema import (
    FullCandidateProcessResponse,
    SkillResponse,
    SkillsSummary,
    SkillStatusEnum,
)
from services.ingestion.resume_parser import parse_resume
from services.skill_extractor.orchestrator.pipeline import run_pipeline
from services.validation.validator import validate_profile
from auth.dependencies import get_current_user
from auth.models import User
from database import get_db
from sqlalchemy.orm import Session
from services.database_service import save_candidate_skills

router = APIRouter(prefix="/api/candidate", tags=["orchestration"])


def _compute_status(confidence: float, authenticity: float) -> SkillStatusEnum:
    """Determine UI status based on combined scores."""
    combined = (confidence + authenticity) / 2
    if combined > 75:
        return SkillStatusEnum.Strong
    elif combined >= 50:
        return SkillStatusEnum.Moderate
    else:
        return SkillStatusEnum.Weak


@router.post("/full-process", response_model=FullCandidateProcessResponse)
async def process_candidate_resume(
    file: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
Full orchestrated pipeline: resume → extraction → skill extraction → validation.
    
    Flow:
    1. Upload and extract resume text
    2. Run skill extraction pipeline
    3. Validate extracted skills against resume evidence
    4. Return UI-ready response with skills, scores, and status
    
    Args:
        file: Resume file (PDF, DOCX, TXT, MD) - optional for GitHub ingestion
        current_user: Authenticated user from JWT token
    
    Returns:
        FullCandidateProcessResponse with skills, scores, and summary
    """
    processing_errors = []
    tmp_path = None
    
    try:
        # Step 1: Save and extract resume
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
                content = await file.read()
                tmp.write(content)
                tmp_path = tmp.name
            
            resume_data = parse_resume(tmp_path)
            raw_text = resume_data.get("content", {}).get("raw_text", "")
            
            if not raw_text or len(raw_text.strip()) == 0:
                raise ValueError("Resume extraction returned empty text")
                
        except Exception as e:
            processing_errors.append(f"Resume extraction failed: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Resume parsing error: {str(e)}")
        
        # Step 2: Run skill extraction pipeline
        try:
            pipeline_input = {
                "user_id": str(current_user.id),
                "data": [resume_data]
            }
            extraction_result = run_pipeline(pipeline_input)
            
            if "error" in extraction_result:
                processing_errors.append(f"Skill extraction error: {extraction_result['error']}")
                raise ValueError(extraction_result["error"])
            
            extracted_skills = extraction_result.get("skills", [])
            
        except Exception as e:
            processing_errors.append(f"Skill extraction pipeline failed: {str(e)}")
            extracted_skills = []
        
        # Step 3: Validate skills
        try:
            validation_input = {
                "extracted_skills": {
                    "user_id": str(current_user.id),
                    "skills": extracted_skills,
                    "profile_summary": {
                        "domain": "tech",
                        "experience_level": "mid"
                    }
                },
                "raw_evidence": {
                    "items": [resume_data]
                }
            }
            validation_result = validate_profile(
                validation_input["extracted_skills"],
                validation_input["raw_evidence"],
                debug=False
            )
            
        except Exception as e:
            processing_errors.append(f"Validation failed: {str(e)}")
            validation_result = {
                "validated_skills": [],
                "is_suspicious": False,
                "overall_score": 0
            }
        
        # Step 4: Transform to UI-ready format
        validated_skills_map = {
            skill["name"]: skill
            for skill in validation_result.get("validated_skills", [])
        }
        
        ui_skills = []
        for extracted in extracted_skills:
            skill_name = extracted.get("name", "")
            validated = validated_skills_map.get(skill_name, {})
            
            confidence = float(extracted.get("confidence", 0.5)) * 100
            authenticity = float(validated.get("validated_score", 0.5)) * 100 if not validated.get("is_fraud", False) else 0
            
            status = _compute_status(confidence, authenticity)
            
            evidence = validated.get("explanations", {}).get("contributing_sources", [])
            
            ui_skills.append(
                SkillResponse(
                    name=skill_name,
                    category=extracted.get("category"),
                    confidence_score=round(confidence, 1),
                    authenticity_score=round(authenticity, 1),
                    status=status,
                    evidence=[str(e) for e in evidence] if evidence else [],
                    level=extracted.get("level", "intermediate")
                )
            )
        
        # Step 5: Compute summary
        strong_count = sum(1 for s in ui_skills if s.status == SkillStatusEnum.Strong)
        moderate_count = sum(1 for s in ui_skills if s.status == SkillStatusEnum.Moderate)
        weak_count = sum(1 for s in ui_skills if s.status == SkillStatusEnum.Weak)
        
        avg_confidence = (
            sum(s.confidence_score for s in ui_skills) / len(ui_skills)
            if ui_skills else 0
        )
        
        # Profile strength: combination of count and average score
        profile_strength = min(100, int(
            (len(ui_skills) / 20) * 50 +  # Up to 50 points for skill count
            (avg_confidence / 100) * 50    # Up to 50 points for avg confidence
        )) if ui_skills else 0
        
        summary = SkillsSummary(
            total_skills=len(ui_skills),
            strong=strong_count,
            moderate=moderate_count,
            weak=weak_count,
            average_confidence=round(avg_confidence, 1),
            profile_strength=profile_strength
        )
        
        # Step 6: Add validated skills to database
        try:
            skills_data = []
            for ui_skill in ui_skills:
                skills_data.append({
                    "name": ui_skill.name,
                    "category": ui_skill.category,
                    "confidence_score": ui_skill.confidence_score,
                    "authenticity_score": ui_skill.authenticity_score,
                    "status": ui_skill.status.value if hasattr(ui_skill.status, 'value') else ui_skill.status,
                    "evidence": ui_skill.evidence,
                    "level": ui_skill.level
                })
                
            save_candidate_skills(db, current_user.id, skills_data)
                
        except Exception as e:
            processing_errors.append(f"Database save failed: {str(e)}")
            
        # Return final response
        return FullCandidateProcessResponse(
            user_id=str(current_user.id) if current_user else "anonymous",
            skills=ui_skills,
            summary=summary,
            is_suspicious=validation_result.get("is_suspicious", False),
            fraud_count=sum(1 for s in validated_skills_map.values() if s.get("is_fraud", False)),
            timestamp=datetime.utcnow().isoformat() + "Z",
            processing_errors=processing_errors
        )
        
    finally:
        # Clean up temp file
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


@router.post("/external-process", response_model=FullCandidateProcessResponse)
async def process_external_profiles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    External profile processing pipeline: GitHub/CP/Kaggle ingestion → skill extraction → validation → database storage.
    
    Flow:
    1. Get all external ingestion data from database for the user
    2. Run skill extraction pipeline on all data
    3. Validate extracted skills against evidence
    4. Store validated skills in database
    5. Return UI-ready response with skills, scores, and status
    
    Args:
        current_user: Authenticated user from JWT token
    
    Returns:
        FullCandidateProcessResponse with skills, scores, and summary
    """
    processing_errors = []
    
    try:
        # Step 1: Get ingestion data from database
        from models.ingestion import IngestionData
        
        ingestions = db.query(IngestionData).filter(
            IngestionData.user_id == str(current_user.id)
        ).all()
        
        if not ingestions:
            raise HTTPException(status_code=404, detail="No external profile data found for user. Please add profiles first.")
        
        input_data = []
        for ing in ingestions:
            input_data.append({
                "content": {"raw_text": ing.content},
                "source_file": f"{ing.source}_profile"
            })
        
        # Step 2: Run skill extraction pipeline on external data
        pipeline_input = {
            "user_id": str(current_user.id),
            "data": input_data
        }
        extraction_result = run_pipeline(pipeline_input)
        
        if "error" in extraction_result:
            processing_errors.append(f"Skill extraction error: {extraction_result['error']}")
            raise ValueError(extraction_result["error"])
        
        extracted_skills = extraction_result.get("skills", [])
        
        # Step 3: Validate skills
        validation_input = {
            "extracted_skills": {
                "user_id": str(current_user.id),
                "skills": extracted_skills,
                "profile_summary": {
                    "domain": "tech",
                    "experience_level": "mid"
                }
            },
            "raw_evidence": {
                "items": input_data
            }
        }
        validation_result = validate_profile(
            validation_input["extracted_skills"],
            validation_input["raw_evidence"],
            debug=False
        )
        
    except Exception as e:
        processing_errors.append(f"Validation failed: {str(e)}")
        validation_result = {
            "validated_skills": [],
            "is_suspicious": False,
            "overall_score": 0
        }
        extracted_skills = []
    
    # Step 4: Transform to UI-ready format
    validated_skills_map = {
        skill["name"]: skill
        for skill in validation_result.get("validated_skills", [])
    }
    
    ui_skills = []
    for extracted in extracted_skills:
        skill_name = extracted.get("name", "")
        validated = validated_skills_map.get(skill_name, {})
        
        confidence = float(extracted.get("confidence", 0.5)) * 100
        authenticity = float(validated.get("validated_score", 0.5)) * 100 if not validated.get("is_fraud", False) else 0
        
        status = _compute_status(confidence, authenticity)
        
        evidence = validated.get("explanations", {}).get("contributing_sources", [])
        
        ui_skills.append(
            SkillResponse(
                name=skill_name,
                category=extracted.get("category"),
                confidence_score=round(confidence, 1),
                authenticity_score=round(authenticity, 1),
                status=status,
                evidence=[str(e) for e in evidence] if evidence else [],
                level=extracted.get("level", "intermediate")
            )
        )
    
    # Step 5: Compute summary
    strong_count = sum(1 for s in ui_skills if s.status == SkillStatusEnum.Strong)
    moderate_count = sum(1 for s in ui_skills if s.status == SkillStatusEnum.Moderate)
    weak_count = sum(1 for s in ui_skills if s.status == SkillStatusEnum.Weak)
    
    avg_confidence = (
        sum(s.confidence_score for s in ui_skills) / len(ui_skills)
        if ui_skills else 0
    )
    
    # Profile strength: combination of count and average score
    profile_strength = min(100, int(
        (len(ui_skills) / 20) * 50 +  # Up to 50 points for skill count
        (avg_confidence / 100) * 50    # Up to 50 points for avg confidence
    )) if ui_skills else 0
    
    summary = SkillsSummary(
        total_skills=len(ui_skills),
        strong=strong_count,
        moderate=moderate_count,
        weak=weak_count,
        average_confidence=round(avg_confidence, 1),
        profile_strength=profile_strength
    )
    
    # Step 6: Add validated skills to database
    try:
        skills_data = []
        for ui_skill in ui_skills:
            skills_data.append({
                "name": ui_skill.name,
                "category": ui_skill.category,
                "confidence_score": ui_skill.confidence_score,
                "authenticity_score": ui_skill.authenticity_score,
                "status": ui_skill.status.value if hasattr(ui_skill.status, 'value') else ui_skill.status,
                "evidence": ui_skill.evidence,
                "level": ui_skill.level
            })
            
        save_candidate_skills(db, current_user.id, skills_data)
            
    except Exception as e:
        processing_errors.append(f"Database save failed: {str(e)}")
        
    # Return final response
    return FullCandidateProcessResponse(
        user_id=str(current_user.id) if current_user else "anonymous",
        skills=ui_skills,
        summary=summary,
        is_suspicious=validation_result.get("is_suspicious", False),
        fraud_count=sum(1 for s in validated_skills_map.values() if s.get("is_fraud", False)),
        timestamp=datetime.utcnow().isoformat() + "Z",
        processing_errors=processing_errors
    )

