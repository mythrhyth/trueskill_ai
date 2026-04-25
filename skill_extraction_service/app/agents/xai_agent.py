"""XAI Agent - Generates human-readable explanations."""

import json
import logging
from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.services import llm_service

logger = logging.getLogger(__name__)


class XAIAgent(BaseAgent):
    """Explainable AI agent that generates human-readable explanations."""
    
    def __init__(self):
        super().__init__("XAIAgent")
    
    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate human-readable explanations for skills.
        
        Expected input:
        {
            "user_id": str,
            "skills": [skill_dict, ...]
        }
        
        Returns:
        {
            "user_id": str,
            "explanations": [explanation_item, ...],
            "summary": {...}
        }
        """
        if not self.validate_input(data, ["user_id", "skills"]):
            return {"error": "Invalid input"}
        
        user_id = data["user_id"]
        skills = data.get("skills", [])
        
        # Generate explanations
        explanations = []
        for skill in skills:
            explanation = self._generate_explanation(skill)
            explanations.append(explanation)

        if skills and any(not skill.get("reasoning") or len(skill.get("evidence", [])) < 1 for skill in skills):
            try:
                prompt = (
                    "Generate a JSON list of explanation objects for the following skills. "
                    "Each object should include skill, score, explanation (as an array of strings), level, category, evidence_count, and signal_count. "
                    "Respond with only valid JSON.\n\n"
                    f"{json.dumps(skills, indent=2)}"
                )
                fallback_response = llm_service.run_agent_fallback(prompt)
                explanations = json.loads(fallback_response)
            except Exception as e:
                self.logger.warning(f"LLM XAI fallback failed: {e}")
        
        # Sort by score descending
        explanations.sort(key=lambda x: x["score"], reverse=True)
        
        # Generate summary
        summary = self._generate_summary(explanations)
        
        self.logger.info(f"Generated {len(explanations)} explanations")
        
        return {
            "user_id": user_id,
            "explanations": explanations,
            "summary": summary
        }
    
    def _generate_explanation(self, skill: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate human-readable explanation for a skill.
        
        Includes:
        - Skill name
        - Score
        - Level and category
        - Evidence summary
        - Reasoning
        - Source breakdown
        """
        name = skill.get("name", "Unknown")
        score = skill.get("score", 0.5)
        level = skill.get("level", "intermediate")
        category = skill.get("category", "unknown")
        evidence = skill.get("evidence", [])
        reasoning = skill.get("reasoning", "")
        signals = skill.get("signals", [])
        
        # Build explanation narrative
        explanation_lines = []
        
        # Main statement
        score_label = self._score_to_label(score)
        explanation_lines.append(
            f"{name} detected with {score_label} credibility ({score:.0%})"
        )
        
        # Level context
        level_descriptions = {
            "beginner": "limited experience",
            "intermediate": "practical proficiency",
            "advanced": "extensive expertise",
            "expert": "mastery-level knowledge"
        }
        explanation_lines.append(
            f"Proficiency level: {level_descriptions.get(level, level)}"
        )
        
        # Category context
        if category != "unknown":
            explanation_lines.append(f"Category: {category}")
        
        # Evidence summary
        if evidence:
            explanation_lines.append(f"Evidence ({len(evidence)} items):")
            for i, ev in enumerate(evidence[:3], 1):  # Top 3 evidence
                explanation_lines.append(f"  • {ev}")
            if len(evidence) > 3:
                explanation_lines.append(f"  ... and {len(evidence) - 3} more")
        
        # Reasoning
        if reasoning:
            explanation_lines.append(f"Reasoning: {reasoning}")
        
        # Source breakdown
        if signals:
            sources = {}
            for signal in signals:
                source = signal.get("source", "unknown")
                sources[source] = sources.get(source, 0) + 1
            
            if len(sources) > 0:
                explanation_lines.append(f"Sources detected: {', '.join(sources.keys())}")
        
        return {
            "skill": name,
            "score": score,
            "explanation": explanation_lines,
            "level": level,
            "category": category,
            "evidence_count": len(evidence),
            "signal_count": len(signals)
        }
    
    def _generate_summary(self, explanations: List[Dict]) -> Dict[str, Any]:
        """Generate overall summary."""
        if not explanations:
            return {
                "total_skills": 0,
                "average_score": 0.0,
                "top_skills": [],
                "skill_distribution": {},
                "narrative": "No skills detected."
            }
        
        scores = [e["score"] for e in explanations]
        categories = {}
        levels = {}
        
        top_skills = explanations[:5]
        
        for exp in explanations:
            cat = exp.get("category", "unknown")
            categories[cat] = categories.get(cat, 0) + 1
            
            lvl = exp.get("level", "intermediate")
            levels[lvl] = levels.get(lvl, 0) + 1
        
        avg_score = sum(scores) / len(scores) if scores else 0.0
        
        # Build narrative
        narrative = self._build_narrative(explanations, avg_score, categories, levels)
        
        return {
            "total_skills": len(explanations),
            "average_score": round(avg_score, 2),
            "score_range": {
                "min": round(min(scores), 2),
                "max": round(max(scores), 2)
            },
            "top_skills": [e["skill"] for e in top_skills],
            "category_distribution": categories,
            "level_distribution": levels,
            "narrative": narrative
        }
    
    def _build_narrative(self, explanations: List, avg_score: float, 
                        categories: Dict, levels: Dict) -> str:
        """Build natural language summary narrative."""
        if not explanations:
            return "No skills were detected from the provided data."
        
        top_3 = [e["skill"] for e in explanations[:3]]
        
        # Count high-confidence skills
        high_conf = sum(1 for e in explanations if e["score"] >= 0.75)
        
        # Dominant category
        dominant_category = max(categories, key=categories.get) if categories else "unknown"
        
        # Dominant level
        dominant_level = max(levels, key=levels.get) if levels else "unknown"
        
        narrative = (
            f"Analysis detected {len(explanations)} skills with an average credibility score of {avg_score:.0%}. "
            f"{high_conf} skills have high confidence (≥75%). "
            f"Top skills: {', '.join(top_3)}. "
            f"Most skills are in the '{dominant_category}' category with predominant '{dominant_level}' proficiency level."
        )
        
        return narrative
    
    def _score_to_label(self, score: float) -> str:
        """Convert score to confidence label."""
        if score >= 0.9:
            return "very high"
        elif score >= 0.75:
            return "high"
        elif score >= 0.6:
            return "moderate"
        elif score >= 0.4:
            return "fair"
        else:
            return "low"


# Singleton instance
_xai_agent = XAIAgent()


def run(data):
    """Execute XAI agent."""
    return _xai_agent.run(data)
