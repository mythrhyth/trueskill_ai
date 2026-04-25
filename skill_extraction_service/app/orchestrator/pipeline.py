"""Orchestration Layer - Orchestrates all agents in the pipeline."""

import logging
from typing import Dict, Any
from app.agents import (
    preprocessing_agent,
    normalization_agent,
    extractor_agent,
    metadata_agent,
    fusion_agent,
    validator_agent,
    scoring_agent,
    xai_agent
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
            Complete skill extraction result with explanations
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
            
            # Stage 5: Validation
            self.logger.info("Stage 5: Validation")
            validator_input = {
                "user_id": data["user_id"],
                "skills": fusion_result.get("fused_skills", [])
            }
            validator_result = validator_agent.run(validator_input)
            if "error" in validator_result:
                return validator_result
            
            # Stage 6: Scoring
            self.logger.info("Stage 6: Scoring")
            scoring_input = {
                "user_id": data["user_id"],
                "skills": validator_result.get("skills", [])
            }
            scoring_result = scoring_agent.run(scoring_input)
            if "error" in scoring_result:
                return scoring_result
            
            # Stage 7: XAI (Explanation)
            self.logger.info("Stage 7: XAI Explanations")
            xai_input = {
                "user_id": data["user_id"],
                "skills": scoring_result.get("skills", [])
            }
            xai_result = xai_agent.run(xai_input)
            if "error" in xai_result:
                return xai_result
            
            # Compile final response
            final_response = {
                "user_id": data["user_id"],
                "skills": scoring_result.get("skills", []),
                "explanations": xai_result.get("explanations", []),
                "summary": xai_result.get("summary", {}),
                "pipeline_metadata": {
                    "preprocessing": preprocess_result.get("extraction_metadata", {}),
                    "normalization": {
                        "terms_found": len(normalize_result.get("normalized_hints", []))
                    },
                    "metadata": metadata_result.get("signals_analyzed", 0),
                    "extractor": extractor_result.get("extraction_metadata", {}),
                    "fusion": fusion_result.get("fusion_metadata", {}),
                    "validation": validator_result.get("validation_metadata", {}),
                    "scoring": scoring_result.get("scoring_metadata", {})
                }
            }
            
            self.logger.info(f"Pipeline completed successfully for user {data.get('user_id')}")
            return final_response
            
        except Exception as e:
            self.logger.error(f"Pipeline error: {str(e)}", exc_info=True)
            return {
                "error": str(e),
                "user_id": data.get("user_id")
            }
    
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
            
            return {
                "user_id": data["user_id"],
                "skills": scoring_result.get("skills", []),
                "mode": "quick"
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
