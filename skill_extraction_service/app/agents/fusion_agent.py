"""Fusion Agent - Combines multiple signals into unified skills."""

import json
import logging
from typing import Dict, Any, List
from collections import defaultdict
from app.agents.base_agent import BaseAgent
from app.services import llm_service

logger = logging.getLogger(__name__)


class FusionAgent(BaseAgent):
    """Fuses skills from multiple sources (extractor, metadata) into unified profiles."""
    
    def __init__(self):
        super().__init__("FusionAgent")
    
    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Combine skills from multiple agents into fused profile.
        
        Expected input:
        {
            "user_id": str,
            "extractor_skills": [skill_dict, ...],
            "metadata_skills": [skill_dict, ...]
        }
        
        Returns:
        {
            "user_id": str,
            "fused_skills": [skill_dict, ...],
            "fusion_metadata": {...}
        }
        """
        if not self.validate_input(data, ["user_id"]):
            return {"error": "Invalid input"}
        
        user_id = data["user_id"]
        extractor_skills = data.get("extractor_skills", [])
        metadata_skills = data.get("metadata_skills", [])
        
        # Fuse all skills
        fused_skills = self._fuse_skills(extractor_skills, metadata_skills)

        if not fused_skills and (extractor_skills or metadata_skills):
            try:
                prompt = (
                    "Merge the following extractor and metadata skill lists into a unified JSON array of skills. "
                    "Each skill object should include name, category, level, confidence, evidence, reasoning, signals, and source_count. "
                    "Return only valid JSON.\n\n"
                    f"Extractor skills: {json.dumps(extractor_skills, indent=2)}\n\n"
                    f"Metadata skills: {json.dumps(metadata_skills, indent=2)}"
                )
                fallback_response = llm_service.run_agent_fallback(prompt)
                fused_skills = json.loads(fallback_response)
            except Exception as e:
                self.logger.warning(f"LLM fusion fallback failed: {e}")
        
        self.logger.info(f"Fused {len(extractor_skills)} + {len(metadata_skills)} into {len(fused_skills)} skills")
        
        return {
            "user_id": user_id,
            "fused_skills": fused_skills,
            "fusion_metadata": {
                "extractor_source_count": len(extractor_skills),
                "metadata_source_count": len(metadata_skills),
                "fused_total": len(fused_skills)
            }
        }
    
    def _fuse_skills(self, extractor_skills: List[Dict], metadata_skills: List[Dict]) -> List[Dict]:
        """
        Intelligently combine skills from multiple sources.
        
        Strategy:
        1. Group by skill name (case-insensitive)
        2. Merge evidence and signals
        3. Intelligently combine confidence scores
        4. Infer level from multiple evidence
        """
        skill_map = defaultdict(lambda: {
            "instances": [],
            "evidence": [],
            "signals": [],
            "reasoning": []
        })
        
        # Process all skills
        all_skills = extractor_skills + metadata_skills
        for skill in all_skills:
            name_key = skill["name"].lower()
            skill_map[name_key]["instances"].append(skill)
            skill_map[name_key]["evidence"].extend(skill.get("evidence", []))
            skill_map[name_key]["signals"].extend(skill.get("signals", []))
            skill_map[name_key]["reasoning"].append(skill.get("reasoning", ""))
        
        # Fuse grouped skills
        fused = []
        for name_key, aggregated in skill_map.items():
            instances = aggregated["instances"]
            
            if not instances:
                continue
            
            # Use original name from first instance
            original_skill = instances[0]
            skill_name = original_skill["name"]
            
            # Fuse properties
            fused_skill = {
                "name": skill_name,
                "category": self._fuse_category(instances),
                "level": self._fuse_level(instances),
                "confidence": self._fuse_confidence(instances),
                "evidence": list(set(aggregated["evidence"])),  # Remove duplicates
                "reasoning": " | ".join([r for r in aggregated["reasoning"] if r]),
                "signals": aggregated["signals"],
                "source_count": len(instances)
            }
            
            fused.append(fused_skill)
        
        # Sort by confidence descending
        fused.sort(key=lambda x: x["confidence"], reverse=True)
        
        return fused
    
    def _fuse_category(self, instances: List[Dict]) -> str:
        """Select most common category."""
        categories = [s.get("category", "unknown") for s in instances]
        if not categories:
            return "unknown"
        
        # Count frequencies
        from collections import Counter
        most_common = Counter(categories).most_common(1)[0][0]
        return most_common if most_common != "unknown" else categories[0]
    
    def _fuse_level(self, instances: List[Dict]) -> str:
        """Infer level from multiple sources."""
        levels = [s.get("level", "intermediate") for s in instances]
        
        level_order = ["beginner", "intermediate", "advanced", "expert"]
        max_level_idx = max([level_order.index(l) if l in level_order else 1 for l in levels])
        
        # Require at least 2 sources for advanced/expert
        if max_level_idx > 1 and len(instances) < 2:
            return "intermediate"
        
        return level_order[max_level_idx]
    
    def _fuse_confidence(self, instances: List[Dict]) -> float:
        """
        Intelligently combine confidence scores.
        
        Rules:
        - Average base confidences
        - Boost if multiple sources agree
        - Cap at 1.0
        """
        confidences = [s.get("confidence", 0.5) for s in instances]
        
        if not confidences:
            return 0.5
        
        # Base: average confidence
        base_score = sum(confidences) / len(confidences)
        
        # Boost for agreement from multiple sources
        if len(instances) > 1:
            # Extra boost if all sources similar confidence
            std_dev = sum((c - base_score) ** 2 for c in confidences) / len(confidences)
            if std_dev < 0.05:  # High agreement
                base_score = min(1.0, base_score + 0.10)
            else:
                base_score = min(1.0, base_score + 0.05)
        
        return round(base_score, 2)


# Singleton instance
_fusion_agent = FusionAgent()


def run(data):
    """Execute fusion agent."""
    return _fusion_agent.run(data)
