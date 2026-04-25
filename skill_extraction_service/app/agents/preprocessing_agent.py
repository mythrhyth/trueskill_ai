"""Preprocessing Agent - Cleans raw data and text."""

import re
import logging
from app.agents.base_agent import BaseAgent
from app.services import llm_service

logger = logging.getLogger(__name__)


class PreprocessingAgent(BaseAgent):
    """Cleans and prepares raw data for skill extraction."""
    
    def __init__(self):
        super().__init__("PreprocessingAgent")
    
    def run(self, data):
        """
        Clean raw input data.
        
        Expected input:
        {
            "user_id": str,
            "data": [{"content": str, ...}, ...]
        }
        
        Returns:
        {
            "user_id": str,
            "clean_text": str,
            "original_data": list
        }
        """
        if not self.validate_input(data, ["user_id", "data"]):
            return {"error": "Invalid input"}
        
        user_id = data["user_id"]
        combined_text = ""
        
        # Combine all content from data items
        for item in data.get("data", []):
            content = item.get("content", "")
            if content:
                combined_text += " " + str(content)
        
        # Clean text
        cleaned_text = self._clean_text(combined_text)

        if not cleaned_text.strip() and combined_text.strip():
            try:
                prompt = (
                    "Clean and normalize the following raw text. Remove noise, fix spacing, "
                    "and return a readable single paragraph with only the cleaned text.\n\n"
                    f"{combined_text}"
                )
                cleaned_text = llm_service.run_agent_fallback(prompt).strip()
            except Exception as e:
                self.logger.warning(f"LLM preprocessing fallback failed: {e}")
        
        self.logger.info(f"Preprocessed {len(data.get('data', []))} items, {len(cleaned_text)} chars")
        
        return {
            "user_id": user_id,
            "clean_text": cleaned_text,
            "original_data": data.get("data", [])
        }
    
    def _clean_text(self, text: str) -> str:
        """Apply cleaning transformations."""
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep spaces and alphanumeric
        text = re.sub(r"[^a-z0-9\s\.\-_]", " ", text)
        
        # Replace multiple spaces with single space
        text = re.sub(r"\s+", " ", text).strip()
        
        return text


# Singleton instance
_preprocessing_agent = PreprocessingAgent()


def run(data):
    """Execute preprocessing agent."""
    return _preprocessing_agent.run(data)
