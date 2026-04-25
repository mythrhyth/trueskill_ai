"""Rule Agent - Legacy rule-based fallback for skill extraction."""

import logging
from typing import Dict, Any
from app.agents.base_agent import BaseAgent

logger = logging.getLogger(__name__)


class RuleAgent(BaseAgent):
    """
    Legacy rule-based agent for skill extraction.
    Used as fallback when LLM-based extraction is unavailable.
    """
    
    def __init__(self):
        super().__init__("RuleAgent")
    
    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute rule-based skill extraction."""
        if not self.validate_input(data, ["user_id"]):
            return {"error": "Invalid input"}
        
        return {
            "user_id": data["user_id"],
            "skills": [],
            "note": "Rule agent is deprecated. Use ExtractorAgent instead."
        }


# Singleton instance
_rule_agent = RuleAgent()


def run(data):
    """Execute rule agent (deprecated)."""
    return _rule_agent.run(data)
