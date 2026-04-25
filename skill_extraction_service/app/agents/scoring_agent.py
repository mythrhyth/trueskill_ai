"""Scoring Agent - Assigns credibility scores to skills."""

import json
import logging
from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.services import llm_service

logger = logging.getLogger(__name__)


class ScoringAgent(BaseAgent):
    """Assigns credibility scores based on multiple factors."""
    
    def __init__(self):
        super().__init__("ScoringAgent")
    
    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate credibility scores for skills.
        
        Expected input:
        {
            "user_id": str,
            "skills": [skill_dict, ...]
        }
        
        Returns:
        {
            "user_id": str,
            "skills": [skill_dict_with_score, ...],  # Added score field
            "scoring_metadata": {...}
        }
        """
        if not self.validate_input(data, ["user_id", "skills"]):
            return {"error": "Invalid input"}
        
        user_id = data["user_id"]
        skills = data.get("skills", [])
        
        # Score each skill
        for skill in skills:
            score = self._calculate_score(skill)
            skill["score"] = score
        
        # Attempt LLM fallback for low evidence/low signal skills
        low_quality_skills = [s for s in skills if len(s.get("evidence", [])) < 1 or len(s.get("signals", [])) < 1]
        if low_quality_skills:
            try:
                prompt = (
                    "Review these skills and provide a JSON list of updated skill scores. "
                    "Each object should include name and score only, where score is between 0.0 and 1.0.\n\n"
                    f"{json.dumps(low_quality_skills, indent=2)}"
                )
                fallback_response = llm_service.run_agent_fallback(prompt)
                score_updates = json.loads(fallback_response)
                for update in score_updates:
                    for skill in skills:
                        if skill.get("name") == update.get("name") and isinstance(update.get("score"), (int, float)):
                            skill["score"] = round(min(1.0, max(0.0, float(update["score"]))), 2)
            except Exception as e:
                self.logger.warning(f"LLM scoring fallback failed: {e}")

        # Calculate overall statistics
        if skills:
            avg_score = sum(s.get("score", 0) for s in skills) / len(skills)
            max_score = max(s.get("score", 0) for s in skills)
            min_score = min(s.get("score", 0) for s in skills)
        else:
            avg_score = max_score = min_score = 0.0
        
        self.logger.info(f"Scored {len(skills)} skills - avg: {avg_score:.2f}, range: {min_score:.2f}-{max_score:.2f}")
        
        return {
            "user_id": user_id,
            "skills": skills,
            "scoring_metadata": {
                "total_skills": len(skills),
                "average_score": round(avg_score, 2),
                "max_score": round(max_score, 2),
                "min_score": round(min_score, 2)
            }
        }
    
    def _calculate_score(self, skill: Dict[str, Any]) -> float:
        """
        Calculate credibility score based on multiple factors.
        
        Factors:
        1. Base confidence (40%)
        2. Level inference (15%)
        3. Evidence diversity (20%)
        4. Signal count (15%)
        5. Source agreement (10%)
        """
        
        # Factor 1: Base confidence (40%)
        base_conf = skill.get("confidence", 0.5)
        factor_1 = base_conf * 0.4
        
        # Factor 2: Level inference (15%)
        level = skill.get("level", "intermediate")
        level_scores = {
            "beginner": 0.4,
            "intermediate": 0.65,
            "advanced": 0.85,
            "expert": 1.0
        }
        factor_2 = level_scores.get(level, 0.65) * 0.15
        
        # Factor 3: Evidence diversity (20%)
        evidence = skill.get("evidence", [])
        evidence_score = min(1.0, len(evidence) / 3)  # Normalize to 0-1
        factor_3 = evidence_score * 0.2
        
        # Factor 4: Signal count and quality (15%)
        signals = skill.get("signals", [])
        signal_score = self._calculate_signal_score(signals)
        factor_4 = signal_score * 0.15
        
        # Factor 5: Source agreement (10%)
        source_count = skill.get("source_count", 1)
        source_agreement = min(1.0, source_count / 2)  # Multiple sources increase confidence
        factor_5 = source_agreement * 0.1
        
        # Combine factors
        total_score = factor_1 + factor_2 + factor_3 + factor_4 + factor_5
        
        # Cap at 1.0 and round
        return round(min(1.0, total_score), 2)
    
    def _calculate_signal_score(self, signals: list) -> float:
        """Calculate score based on signal quality and diversity."""
        if not signals:
            return 0.0
        
        # Average signal confidences
        confidences = [s.get("confidence", 0.5) for s in signals]
        avg_conf = sum(confidences) / len(confidences)
        
        # Diversity bonus: different sources
        sources = set(s.get("source", "unknown") for s in signals)
        diversity_bonus = min(0.2, len(sources) * 0.05)
        
        # Weight consideration
        total_weight = sum(s.get("weight", 1.0) for s in signals)
        weighted_avg = sum(
            s.get("confidence", 0.5) * s.get("weight", 1.0)
            for s in signals
        ) / max(total_weight, 1)
        
        # Combine
        signal_score = (avg_conf * 0.6 + weighted_avg * 0.4) + diversity_bonus
        
        return min(1.0, signal_score)


# Singleton instance
_scoring_agent = ScoringAgent()


def run(data):
    """Execute scoring agent."""
    return _scoring_agent.run(data)
