
import logging
from typing import Dict, Any, List
from .base_agent import BaseAgent
from backend.utils import llm_service

logger = logging.getLogger(__name__)


class ExtractorAgent(BaseAgent):
    """Extracts skills from text using LLM-powered reasoning."""
    
    def __init__(self):
        super().__init__("ExtractorAgent")
    
    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract skills from cleaned and normalized text.
        
        Expected input:
        {
            "user_id": str,
            "clean_text": str,
            "normalized_hints": [str],
            "original_data": list
        }
        
        Returns:
        {
            "user_id": str,
            "skills": [skill_dict, ...],
            "extraction_metadata": {...}
        }
        """
        if not self.validate_input(data, ["user_id", "clean_text"]):
            return {"error": "Invalid input"}
        
        user_id = data["user_id"]
        clean_text = data["clean_text"]
        hints = data.get("normalized_hints", [])
        
        # Use LLM service for skill extraction
        skills = llm_service.extract_skills_with_llm(clean_text, hints)
        
        self.logger.info(f"Extracted {len(skills)} skills for user {user_id}")
        
        return {
            "user_id": user_id,
            "skills": skills,
            "extraction_metadata": {
                "method": "llm_with_fallback",
                "hints_used": len(hints),
                "text_length": len(clean_text)
            }
        }


# Singleton instance
_extractor_agent = ExtractorAgent()


def run(data):
    """Execute extractor agent."""
    return _extractor_agent.run(data)
