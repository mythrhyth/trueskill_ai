"""Validator Agent - Verifies authenticity of extracted skills."""

import json
import logging
from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.services import llm_service

logger = logging.getLogger(__name__)


class ValidatorAgent(BaseAgent):
    """Validates and verifies authenticity of extracted skills."""
    
    def __init__(self):
        super().__init__("ValidatorAgent")
    
    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate extracted skills for authenticity.
        
        Expected input:
        {
            "user_id": str,
            "skills": [skill_dict, ...]
        }
        
        Returns:
        {
            "user_id": str,
            "skills": [skill_dict, ...],  # Validated and potentially filtered
            "validation_metadata": {
                "total_checked": int,
                "valid_skills": int,
                "filtered_out": int
            }
        }
        """
        if not self.validate_input(data, ["user_id", "skills"]):
            return {"error": "Invalid input"}
        
        user_id = data["user_id"]
        skills = data.get("skills", [])
        
        # Validate each skill
        validated_skills = []
        filtered_count = 0
        
        for skill in skills:
            if self._is_valid_skill(skill):
                # Adjust confidence based on validation
                skill = self._apply_validation_adjustments(skill)
                validated_skills.append(skill)
            else:
                filtered_count += 1
                self.logger.debug(f"Filtered out invalid skill: {skill.get('name')}")
        
        if not validated_skills and skills:
            try:
                prompt = (
                    "Review the following extracted skills and return only valid skill objects as a JSON list. "
                    "Each returned object should include at least name, category, level, confidence, evidence, reasoning, and signals. "
                    "Use the provided evidence and signals to determine validity. Return only valid skills as JSON.\n\n"
                    f"{json.dumps(skills, indent=2)}"
                )
                fallback_response = llm_service.run_agent_fallback(prompt)
                validated_skills = json.loads(fallback_response)
            except Exception as e:
                self.logger.warning(f"LLM validator fallback failed: {e}")

        self.logger.info(f"Validated {len(validated_skills)} skills, filtered {filtered_count}")
        
        return {
            "user_id": user_id,
            "skills": validated_skills,
            "validation_metadata": {
                "total_checked": len(skills),
                "valid_skills": len(validated_skills),
                "filtered_out": filtered_count
            }
        }
    
    def _is_valid_skill(self, skill: Dict[str, Any]) -> bool:
        """
        Determine if skill is valid.
        
        Validation rules:
        - Must have name
        - Must have reasonable confidence
        - Should have evidence or signals
        - Name should not be too generic
        """
        # Check required fields
        if not skill.get("name"):
            return False
        
        name = skill["name"].lower()
        
        # Filter generic/trivial skills
        trivial_skills = {
            "unknown", "other", "misc", "miscellaneous",
            "computer", "technology", "technical",
            "work", "job", "position", "role",
            "lorem", "ipsum", "test"
        }
        
        if name in trivial_skills:
            return False
        
        # Check confidence - too low is suspicious
        confidence = skill.get("confidence", 0.5)
        if confidence < 0.2:
            return False
        
        # Check evidence/signals - need at least one
        has_evidence = len(skill.get("evidence", [])) > 0
        has_signals = len(skill.get("signals", [])) > 0
        
        if not (has_evidence or has_signals):
            return False
        
        # Name should be reasonable length
        if len(name) < 2 or len(name) > 50:
            return False
        
        # Name shouldn't be mostly numbers
        digit_ratio = sum(1 for c in name if c.isdigit()) / len(name)
        if digit_ratio > 0.5:
            return False
        
        return True
    
    def _apply_validation_adjustments(self, skill: Dict[str, Any]) -> Dict[str, Any]:
        """Apply validation-based confidence adjustments."""
        
        # Boost for multiple evidence items
        evidence_count = len(skill.get("evidence", []))
        if evidence_count >= 3:
            skill["confidence"] = min(1.0, skill["confidence"] + 0.05)
        
        # Boost for multiple signals
        signal_count = len(skill.get("signals", []))
        if signal_count >= 2:
            skill["confidence"] = min(1.0, skill["confidence"] + 0.05)
        
        # Slight boost if has reasoning
        if skill.get("reasoning"):
            skill["confidence"] = min(1.0, skill["confidence"] + 0.02)
        
        skill["confidence"] = round(skill["confidence"], 2)
        skill["validated"] = True
        
        return skill


# Singleton instance
_validator_agent = ValidatorAgent()


def run(data):
    """Execute validator agent."""
    return _validator_agent.run(data)
