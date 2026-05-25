"""Scoring Agent - Assigns credibility scores to skills."""

import json
import logging
from typing import Dict, Any
from .base_agent import BaseAgent
from backend.utils import llm_service

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
            skill["confidence"] = score
        
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
                            skill["confidence"] = round(min(1.0, max(0.0, float(update["score"]))), 2)
            except Exception as e:
                self.logger.warning(f"LLM scoring fallback failed: {e}")

        # Calculate overall statistics
        if skills:
            avg_score = sum(s.get("confidence", 0) for s in skills) / len(skills)
            max_score = max(s.get("confidence", 0) for s in skills)
            min_score = min(s.get("confidence", 0) for s in skills)
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
        Calculate credibility score based on multiple factors with source quality weighting.
        
        Factors:
        1. Base confidence (25%)
        2. Level inference (15%)
        3. Evidence diversity (20%)
        4. Signal count and source quality (25%)
        5. Source agreement (15%)
        """
        
        # Factor 1: Base confidence (25%)
        base_conf = skill.get("confidence", 0.5)
        factor_1 = base_conf * 0.25
        
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
        
        # Factor 4: Signal count and source quality (25%)
        signals = skill.get("signals", [])
        signal_score = self._calculate_enhanced_signal_score(signals)
        factor_4 = signal_score * 0.25
        
        # Factor 5: Source agreement (15%)
        source_count = skill.get("source_count", 1)
        source_agreement = min(1.0, source_count / 2)  # Multiple sources increase confidence
        factor_5 = source_agreement * 0.15
        
        # Apply source quality modifiers
        quality_modifier = self._get_source_quality_modifier(skill)
        
        # Combine factors
        total_score = factor_1 + factor_2 + factor_3 + factor_4 + factor_5
        total_score *= quality_modifier
        
        # Cap at 1.0 and round
        return round(min(1.0, total_score), 2)
    
    def _calculate_enhanced_signal_score(self, signals: list) -> float:
        """Calculate score based on signal quality, diversity, and source reliability."""
        if not signals:
            return 0.0
        
        # Source quality weights
        source_weights = {
            "llm": 1.0,           # Highest reliability
            "normalization": 0.9,   # High reliability
            "metadata": 0.8,        # Good reliability
            "keyword_matching": 0.6, # Medium reliability
            "rule_based": 0.5        # Lower reliability
        }
        
        total_weighted_confidence = 0.0
        total_weight = 0.0
        
        for signal in signals:
            source = signal.get("source", "unknown")
            confidence = signal.get("confidence", 0.5)
            weight = source_weights.get(source, 0.5)
            
            # Apply source-specific modifiers
            if source == "llm" and confidence > 0.8:
                weight *= 1.1  # Boost high-confidence LLM signals
            elif source == "keyword_matching" and len(signal.get("evidence", "")) > 20:
                weight *= 1.1  # Boost detailed keyword matches
            
            total_weighted_confidence += confidence * weight
            total_weight += weight
        
        if total_weight == 0:
            return 0.0
        
        avg_weighted_confidence = total_weighted_confidence / total_weight
        
        # Diversity boost (different sources are more valuable)
        unique_sources = len(set(signal.get("source", "unknown") for signal in signals))
        diversity_boost = min(0.2, unique_sources * 0.05)
        
        # Evidence quality boost
        evidence_quality = self._assess_evidence_quality(signals)
        
        final_score = avg_weighted_confidence + diversity_boost + evidence_quality
        return min(1.0, final_score)
    
    def _calculate_signal_score(self, signals: list) -> float:
        """Legacy method for backward compatibility."""
        return self._calculate_enhanced_signal_score(signals)
    
    def _get_source_quality_modifier(self, skill: Dict[str, Any]) -> float:
        """Apply source quality modifiers based on data sources."""
        modifier = 1.0
        
        # Check for high-quality sources
        signals = skill.get("signals", [])
        sources = [signal.get("source", "unknown") for signal in signals]
        
        # Boost for LLM-verified skills
        if "llm" in sources:
            modifier *= 1.1
        
        # Boost for multiple independent sources
        if len(set(sources)) >= 3:
            modifier *= 1.05
        
        return modifier


# Singleton instance
_scoring_agent = ScoringAgent()


def run(data):
    """Execute scoring agent."""
    return _scoring_agent.run(data)
