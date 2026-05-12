from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, List
from services.validation import validate_profile

router = APIRouter(prefix="/validation", tags=["validation"])

class ValidationRequest(BaseModel):
    extracted_skills: Dict[str, Any]
    raw_evidence: Dict[str, Any]
    debug: bool = False

@router.post("/validate", response_model=dict)
async def run_validation(payload: ValidationRequest):
    """
    Validates extracted skills against raw ingested evidence.
    Returns a mathematically scored profile and detects potential fraud.
    """
    try:
        # Pass the extracted data and raw evidence to the validator engine
        result = validate_profile(
            payload.extracted_skills, 
            payload.raw_evidence, 
            debug=payload.debug
        )
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
