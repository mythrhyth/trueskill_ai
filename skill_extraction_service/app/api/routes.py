"""API Routes for the Multi-Agent Intelligence Layer."""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.schema.skill_schema import ProcessingInput, SkillResponse
from app.orchestrator.pipeline import run_pipeline, run_quick_pipeline
from app.agents import (
    preprocessing_agent,
    normalization_agent,
    metadata_agent,
    extractor_agent,
    fusion_agent,
    validator_agent,
    scoring_agent,
    xai_agent
)

router = APIRouter()




@router.post("/extract", response_model=dict)
async def extract_skills(data: ProcessingInput):
    """
    Full skill extraction pipeline.
    
    Executes all 8 agents:
    1. Preprocessing
    2. Normalization
    3. Metadata extraction
    4. LLM-based extraction
    5. Fusion
    6. Validation
    7. Scoring
    8. XAI Explanation
    
    Returns: Structured skill profile with confidence scores and explanations
    """
    try:
        result = run_pipeline(data.model_dump())
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract/quick", response_model=dict)
async def extract_skills_quick(data: ProcessingInput):
    """
    Quick extraction pipeline (no validation step).
    Faster but less thorough than full pipeline.
    """
    try:
        result = run_quick_pipeline(data.model_dump())
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# agent endpoints

@router.post("/preprocess", response_model=dict)
async def preprocess(data: ProcessingInput):
    """Stage 1: Clean raw data."""
    try:
        result = preprocessing_agent.run(data.model_dump())
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/normalize", response_model=dict)
async def normalize(data: dict):
    """Stage 2: Normalize terminology."""
    try:
        result = normalization_agent.run(data)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/metadata", response_model=dict)
async def extract_metadata(data: dict):
    """Stage 3a: Extract skills from metadata/metrics."""
    try:
        result = metadata_agent.run(data)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract-llm", response_model=dict)
async def extract_llm(data: dict):
    """Stage 3b: Extract skills using LLM reasoning."""
    try:
        result = extractor_agent.run(data)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fuse", response_model=dict)
async def fuse_skills(data: dict):
    """Stage 4: Fuse skills from multiple sources."""
    try:
        result = fusion_agent.run(data)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/validate", response_model=dict)
async def validate_skills(data: dict):
    """Stage 5: Validate skill authenticity."""
    try:
        result = validator_agent.run(data)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/score", response_model=dict)
async def score_skills(data: dict):
    """Stage 6: Assign credibility scores."""
    try:
        result = scoring_agent.run(data)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/explain", response_model=dict)
async def explain_skills(data: dict):
    """Stage 7: Generate XAI explanations."""
    try:
        result = xai_agent.run(data)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# health and info endpoints

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Multi-Agent Skill Extraction Core",
        "version": "1.0.0"
    }


@router.get("/agents")
async def list_agents():
    """List all available agents."""
    return {
        "agents": [
            {
                "name": "PreprocessingAgent",
                "role": "Clean and prepare raw data",
                "stage": 1
            },
            {
                "name": "NormalizationAgent",
                "role": "Standardize terminology and abbreviations",
                "stage": 2
            },
            {
                "name": "MetadataAgent",
                "role": "Extract skills from structured metrics",
                "stage": 3
            },
            {
                "name": "ExtractorAgent",
                "role": "Infer skills using LLM reasoning",
                "stage": 3
            },
            {
                "name": "FusionAgent",
                "role": "Combine signals from multiple sources",
                "stage": 4
            },
            {
                "name": "ValidatorAgent",
                "role": "Verify authenticity of extracted skills",
                "stage": 5
            },
            {
                "name": "ScoringAgent",
                "role": "Assign credibility scores",
                "stage": 6
            },
            {
                "name": "XAIAgent",
                "role": "Generate human-readable explanations",
                "stage": 7
            }
        ],
        "pipeline_stages": 7
    }
