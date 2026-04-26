"""Metadata Agent - Extracts structured signals from metadata."""

import json
import logging
from typing import Dict, Any
from .base_agent import BaseAgent
from backend.utils import llm_service

logger = logging.getLogger(__name__)


class MetadataAgent(BaseAgent):
    """Extracts skills from structured metadata (metrics, activity)."""
    
    def __init__(self):
        super().__init__("MetadataAgent")
    
    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract skills from metadata signals.
        
        Expected input:
        {
            "user_id": str,
            "original_data": [
                {
                    "source": str,
                    "metrics": {...}
                }, ...
            ]
        }
        
        Returns:
        {
            "user_id": str,
            "metadata_skills": [skill_dict, ...],
            "signals_analyzed": int
        }
        """
        if not self.validate_input(data, ["user_id"]):
            return {"error": "Invalid input"}
        
        user_id = data["user_id"]
        original_data = data.get("original_data", [])
        
        skills = []
        signals_count = 0
        
        for item in original_data:
            source = item.get("source", "unknown")
            metrics = item.get("metrics", {})
            
            # LeetCode signals
            if source == "leetcode":
                leetcode_skills = self._extract_leetcode_skills(metrics)
                skills.extend(leetcode_skills)
                signals_count += len(leetcode_skills)
            
            # GitHub signals
            elif source == "github":
                github_skills = self._extract_github_skills(metrics)
                skills.extend(github_skills)
                signals_count += len(github_skills)
            
            # Kaggle signals
            elif source == "kaggle":
                kaggle_skills = self._extract_kaggle_skills(metrics)
                skills.extend(kaggle_skills)
                signals_count += len(kaggle_skills)
        
        if not skills and original_data:
            try:
                prompt = (
                    "Analyze the following metadata signals and infer any relevant skills. "
                    "Return a JSON list of skill objects with fields: name, category, level, confidence, evidence, reasoning, signals.\n\n"
                    f"{json.dumps(original_data, indent=2)}"
                )
                response = llm_service.run_agent_fallback(prompt)
                skills = json.loads(response)
            except Exception as e:
                self.logger.warning(f"LLM metadata fallback failed: {e}")

        self.logger.info(f"Extracted {len(skills)} metadata skills from {signals_count} signals")
        
        return {
            "user_id": user_id,
            "metadata_skills": skills,
            "signals_analyzed": signals_count
        }
    
    def _extract_leetcode_skills(self, metrics: Dict[str, Any]) -> list:
        """Extract skills from LeetCode metrics."""
        skills = []
        
        dp_count = metrics.get("dp_problems", 0)
        if dp_count > 50:
            skills.append({
                "name": "Dynamic Programming",
                "category": "methodology",
                "level": "advanced" if dp_count > 150 else "intermediate",
                "confidence": 0.85,
                "evidence": [f"Solved {dp_count} DP problems"],
                "reasoning": "High volume of DP problems indicates strong algorithmic understanding",
                "signals": [{
                    "source": "leetcode_dp_problems",
                    "confidence": 0.85,
                    "evidence": f"Solved {dp_count} problems",
                    "weight": 1.0
                }]
            })
        
        graph_count = metrics.get("graph_problems", 0)
        if graph_count > 30:
            skills.append({
                "name": "Graph Algorithms",
                "category": "methodology",
                "level": "intermediate" if graph_count > 50 else "beginner",
                "confidence": 0.80,
                "evidence": [f"Solved {graph_count} graph problems"],
                "reasoning": "Graph problem solving indicates algorithmic knowledge",
                "signals": [{
                    "source": "leetcode_graph_problems",
                    "confidence": 0.80,
                    "evidence": f"Solved {graph_count} problems",
                    "weight": 1.0
                }]
            })
        
        total_solved = metrics.get("total_problems", 0)
        if total_solved > 100:
            skills.append({
                "name": "Problem Solving",
                "category": "soft_skill",
                "level": "advanced" if total_solved > 500 else "intermediate",
                "confidence": 0.90,
                "evidence": [f"Solved {total_solved} total problems"],
                "reasoning": "Extensive problem-solving practice",
                "signals": [{
                    "source": "leetcode_total_problems",
                    "confidence": 0.90,
                    "evidence": f"Solved {total_solved} problems",
                    "weight": 1.0
                }]
            })
        
        return skills
    
    def _extract_github_skills(self, metrics: Dict[str, Any]) -> list:
        """Extract skills from GitHub metrics."""
        skills = []
        
        repo_count = metrics.get("repo_count", 0)
        if repo_count > 3:
            skills.append({
                "name": "Software Development",
                "category": "domain",
                "level": "intermediate",
                "confidence": 0.80,
                "evidence": [f"{repo_count} repositories"],
                "reasoning": "Multiple repositories indicate practical project experience",
                "signals": [{
                    "source": "github_repositories",
                    "confidence": 0.80,
                    "evidence": f"{repo_count} repositories",
                    "weight": 1.0
                }]
            })
        
        language_breakdown = metrics.get("languages", {})
        for lang, percentage in language_breakdown.items():
            if percentage > 20:
                skills.append({
                    "name": lang,
                    "category": "language",
                    "level": "intermediate",
                    "confidence": 0.75 + (percentage / 100) * 0.15,
                    "evidence": [f"{percentage}% of code in {lang}"],
                    "reasoning": f"Primary language in repositories",
                    "signals": [{
                        "source": "github_language_breakdown",
                        "confidence": 0.75 + (percentage / 100) * 0.15,
                        "evidence": f"{percentage}% code volume",
                        "weight": 1.0
                    }]
                })
        
        contribution_score = metrics.get("contribution_score", 0)
        if contribution_score > 0.7:
            skills.append({
                "name": "Open Source Contribution",
                "category": "soft_skill",
                "level": "intermediate",
                "confidence": 0.80,
                "evidence": [f"Contribution score: {contribution_score}"],
                "reasoning": "Active open source participation",
                "signals": [{
                    "source": "github_contributions",
                    "confidence": 0.80,
                    "evidence": f"Score {contribution_score}",
                    "weight": 1.0
                }]
            })
        
        return skills
    
    def _extract_kaggle_skills(self, metrics: Dict[str, Any]) -> list:
        """Extract skills from Kaggle metrics."""
        skills = []
        
        competition_count = metrics.get("competition_count", 0)
        if competition_count > 5:
            skills.append({
                "name": "Machine Learning",
                "category": "domain",
                "level": "advanced" if competition_count > 20 else "intermediate",
                "confidence": 0.85,
                "evidence": [f"Participated in {competition_count} competitions"],
                "reasoning": "Active Kaggle competition participation shows ML expertise",
                "signals": [{
                    "source": "kaggle_competitions",
                    "confidence": 0.85,
                    "evidence": f"{competition_count} competitions",
                    "weight": 1.0
                }]
            })
        
        ranking = metrics.get("ranking", None)
        if ranking and ranking < 1000:
            skills.append({
                "name": "Data Science",
                "category": "domain",
                "level": "expert" if ranking < 100 else "advanced",
                "confidence": 0.90,
                "evidence": [f"Kaggle ranking: {ranking}"],
                "reasoning": "Top-tier Kaggle ranking indicates expert data science skills",
                "signals": [{
                    "source": "kaggle_ranking",
                    "confidence": 0.90,
                    "evidence": f"Ranking {ranking}",
                    "weight": 1.0
                }]
            })
        
        return skills


# Singleton instance
_metadata_agent = MetadataAgent()


def run(data):
    """Execute metadata agent."""
    return _metadata_agent.run(data)
