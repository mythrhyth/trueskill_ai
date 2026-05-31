from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.schema.recruiter_schema import RecruiterCandidateResponse, RecruiterCandidateDetailResponse
from backend.services.persistence.candidate_repository import get_candidate_result, list_candidate_results

router = APIRouter(prefix="/recruiter", tags=["recruiter"])


def map_to_recruiter_candidate(cand: dict) -> dict:
    """Helper to convert raw repository candidate dictionary to RecruiterCandidateResponse."""
    validated_skills = cand.get("validated_skills") or []
    
    # Sort skills by score descending to get actual top skills
    sorted_skills = sorted(validated_skills, key=lambda s: s.get("validated_score", 0.0), reverse=True)
    top_skills = [s.get("name") for s in sorted_skills if s.get("name")]
    
    # Cleanup name if null, empty, or starts with req_ (unless it matches a seeded ID)
    name = cand.get("name")
    if not name or name.strip() == "" or name.startswith("req_"):
        name = "Unknown User"
        
    return {
        "id": cand.get("candidate_id"),
        "candidate_id": cand.get("candidate_id"),
        "name": name,
        "email": cand.get("email") or "unknown@example.com",
        "role": cand.get("role") or "Software Engineer",
        "score": cand.get("score", 0.0),
        "top_skills": top_skills,
        "authenticity_metrics": cand.get("authenticity_metrics") or {},
        "matched_roles": cand.get("matched_roles") or [],
        "analysis_summary": cand.get("analysis_summary") or {},
        "created_at": cand.get("created_at")
    }


@router.get("/candidates", response_model=List[RecruiterCandidateResponse])
async def get_candidates():
    """Retrieve all analyzed candidates stored in the database."""
    try:
        candidates = list_candidate_results()
        return [map_to_recruiter_candidate(c) for c in candidates]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch candidates: {str(e)}")


@router.get("/candidate/{id}", response_model=RecruiterCandidateDetailResponse)
async def get_candidate(id: str):
    """Retrieve the full detailed analysis of a single candidate by ID from the database."""
    try:
        candidate = get_candidate_result(id)
        if not candidate:
            raise HTTPException(status_code=404, detail=f"Candidate with ID '{id}' not found.")
            
        # Enforce name cleanup/fallback
        name = candidate.get("name")
        if not name or name.strip() == "" or name.startswith("req_"):
            name = "Unknown User"
            
        candidate["id"] = candidate.get("candidate_id")
        candidate["name"] = name
        candidate["email"] = candidate.get("email") or "unknown@example.com"
        candidate["role"] = candidate.get("role") or "Software Engineer"
        return candidate
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch candidate details: {str(e)}")


@router.get("/top-ranked", response_model=List[RecruiterCandidateResponse])
async def get_top_ranked():
    """Retrieve candidates sorted by their overall score in descending order."""
    try:
        candidates = list_candidate_results()
        sorted_candidates = sorted(candidates, key=lambda c: c.get("score", 0.0), reverse=True)
        return [map_to_recruiter_candidate(c) for c in sorted_candidates]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to rank candidates: {str(e)}")


@router.get("/filter", response_model=List[RecruiterCandidateResponse])
async def filter_candidates(
    skill: Optional[str] = Query(None, description="Filter by skill name (case-insensitive)"),
    domain: Optional[str] = Query(None, description="Filter by job/candidate domain"),
    minimum_score: Optional[float] = Query(None, description="Minimum candidate score threshold")
):
    """
    Query and filter analyzed candidates based on skills, domain, and minimum score.
    Returns empty list if no matches are found.
    """
    try:
        candidates = list_candidate_results()
        filtered = []
        
        for c in candidates:
            # 1. Filter by minimum score
            if minimum_score is not None:
                if c.get("score", 0.0) < minimum_score:
                    continue
            
            # 2. Filter by domain (defaults dynamically to 'tech')
            if domain is not None:
                cand_domain = c.get("authenticity_metrics", {}).get("domain") or "tech"
                if domain.lower() != cand_domain.lower():
                    continue
            
            # 3. Filter by skill (case-insensitive substring match in validated or extracted skills)
            if skill is not None:
                skill_lower = skill.lower()
                
                # Retrieve validated skills
                val_skill_names = [s.get("name", "").lower() for s in c.get("validated_skills", []) if s.get("name")]
                
                # Retrieve extracted skills (which can be a list of strings or list of objects)
                ext_skill_names = []
                for s in c.get("extracted_skills", []):
                    if isinstance(s, dict):
                        ext_skill_names.append(s.get("name", "").lower())
                    else:
                        ext_skill_names.append(str(s).lower())
                
                # Check for match in either list
                has_skill = any(skill_lower in s for s in val_skill_names) or any(skill_lower in s for s in ext_skill_names)
                if not has_skill:
                    continue
            
            filtered.append(c)
            
        return [map_to_recruiter_candidate(c) for c in filtered]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to filter candidates: {str(e)}")
