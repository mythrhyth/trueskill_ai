"""API Routes for the Multi-Agent Intelligence Layer."""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from backend.schema.skill_schema import ProcessingInput
from backend.services.skill_extractor.orchestrator.pipeline import run_pipeline, run_quick_pipeline
from backend.services.skill_extractor.agents import (
    preprocessing_agent,
    normalization_agent,
    metadata_agent,
    extractor_agent,
    fusion_agent,
    scoring_agent
)

router = APIRouter(refix="/skill_extractor", tags=["skill_extractor"])




@router.post("/extract", response_model=dict)
async def extract_skills(data: ProcessingInput):
    """
    Full skill extraction pipeline.
    
    Executes agents:
    1. Preprocessing
    2. Normalization
    3. Metadata extraction
    4. LLM-based extraction
    5. Fusion
    6. Scoring
    
    Returns: Structured skill profile with confidence scores
    """
    try:
        result = run_pipeline(data.model_dump())
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




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


@router.post("/score", response_model=dict)
async def score_skills(data: dict):
    """Stage 5: Assign credibility scores."""
    try:
        result = scoring_agent.run(data)
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
        "service": "skill_extractor",
        "available_endpoints": [
            "/skill_extractor/preprocess",
            "/skill_extractor/normalize",
            "/skill_extractor/metadata",
            "/skill_extractor/extract-llm",
            "/skill_extractor/fuse",
            "/skill_extractor/score",
            "/skill_extractor/health",
            "/skill_extractor/agents",
        ],
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
                "name": "ScoringAgent",
                "role": "Assign credibility scores",
                "stage": 5
            }
        ],
        "pipeline_stages": 5
    }
