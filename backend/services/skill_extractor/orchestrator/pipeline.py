
import logging
from typing import Dict, Any
from datetime import datetime
from ..agents import (
    preprocessing_agent,
    normalization_agent,
    extractor_agent,
    metadata_agent,
    fusion_agent,
    scoring_agent
)

logger = logging.getLogger(__name__)


class SkillExtractionPipeline:
    """
   
    """
    
    def __init__(self):
        self.logger = logging.getLogger("Pipeline")
    
    def run_pipeline(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the full skill extraction pipeline.
        
        Args:
            data: Input data with user_id and data items
            
        Returns:
            Complete skill extraction result with normalized skills
        """
        try:
            self.logger.info(f"Starting pipeline for user: {data.get('user_id')}")
            
            # Stage 1: Preprocessing
            self.logger.info("Stage 1: Preprocessing")
            preprocess_result = preprocessing_agent.run(data)
            if "error" in preprocess_result:
                return preprocess_result
            
            # Stage 2: Normalization
            self.logger.info("Stage 2: Normalization")
            normalize_result = normalization_agent.run(preprocess_result)
            if "error" in normalize_result:
                return normalize_result
            
            # Stage 3: Parallel agent execution
            self.logger.info("Stage 3: Parallel extraction (Metadata + Extractor)")
            
            # Metadata Agent
            metadata_result = metadata_agent.run(normalize_result)
            if "error" in metadata_result:
                self.logger.warning("Metadata extraction failed, continuing...")
                metadata_result = {"user_id": data["user_id"], "metadata_skills": []}
            
            # Extractor Agent
            extractor_result = extractor_agent.run(normalize_result)
            if "error" in extractor_result:
                self.logger.warning("Extractor failed, continuing...")
                extractor_result = {"user_id": data["user_id"], "skills": []}
            
            # Stage 4: Fusion
            self.logger.info("Stage 4: Fusion")
            fusion_input = {
                "user_id": data["user_id"],
                "extractor_skills": extractor_result.get("skills", []),
                "metadata_skills": metadata_result.get("metadata_skills", [])
            }
            fusion_result = fusion_agent.run(fusion_input)
            if "error" in fusion_result:
                return fusion_result
            
            # Stage 5: Scoring
            self.logger.info("Stage 5: Scoring")
            scoring_input = {
                "user_id": data["user_id"],
                "skills": fusion_result.get("fused_skills", [])
            }
            scoring_result = scoring_agent.run(scoring_input)
            if "error" in scoring_result:
                return scoring_result
            
            # Normalize final skill shape to match schema
            normalized_skills = [self._normalize_skill_output(skill) for skill in scoring_result.get("skills", [])]
            
            # Compile final response
            final_response = {
                "user_id": data["user_id"],
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "skills": normalized_skills
            }
            
            self.logger.info(f"Pipeline completed successfully for user {data.get('user_id')}")
            return final_response
            
        except Exception as e:
            self.logger.error(f"Pipeline error: {str(e)}", exc_info=True)
            return {
                "error": str(e),
                "user_id": data.get("user_id")
            }

    def _normalize_skill_output(self, skill: Dict[str, Any]) -> Dict[str, Any]:
        normalized = dict(skill)
        normalized["sources"] = normalized.get("sources") or []
        normalized["discovered_from"] = normalized.get("discovered_from") or []
        evidence = normalized.get("evidence", {})
        if isinstance(evidence, list):
            evidence = {"raw": evidence}
        elif evidence is None:
            evidence = {}
        normalized["evidence"] = evidence
        normalized["confidence"] = round(min(1.0, max(0.0, float(normalized.get("confidence", 0.0)))), 2)
        normalized["level"] = normalized.get("level") or "intermediate"
        return normalized

    def run_quick_pipeline(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Quick pipeline - skip validation, go straight to scoring.
        Useful for real-time applications.
        """
        try:
            # Preprocessing + Normalization
            preprocess_result = preprocessing_agent.run(data)
            normalize_result = normalization_agent.run(preprocess_result)
            
            # Quick extraction
            metadata_result = metadata_agent.run(normalize_result)
            extractor_result = extractor_agent.run(normalize_result)
            
            # Fuse
            fusion_input = {
                "user_id": data["user_id"],
                "extractor_skills": extractor_result.get("skills", []),
                "metadata_skills": metadata_result.get("metadata_skills", [])
            }
            fusion_result = fusion_agent.run(fusion_input)
            
            # Score (skip validation)
            scoring_input = {
                "user_id": data["user_id"],
                "skills": fusion_result.get("fused_skills", [])
            }
            scoring_result = scoring_agent.run(scoring_input)
            normalized_skills = [self._normalize_skill_output(skill) for skill in scoring_result.get("skills", [])]
            
            return {
                "user_id": data["user_id"],
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "skills": normalized_skills
            }
            
        except Exception as e:
            self.logger.error(f"Quick pipeline error: {str(e)}")
            return {"error": str(e)}


# Singleton pipeline instance
_pipeline = SkillExtractionPipeline()


def run_pipeline(data):
    """Execute the full pipeline."""
    return _pipeline.run_pipeline(data)


def run_quick_pipeline(data):
    """Execute quick pipeline without validation."""
    return _pipeline.run_quick_pipeline(data)
