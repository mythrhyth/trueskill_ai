"""Normalization Agent - Standardizes terminology."""

import json
import logging
from app.agents.base_agent import BaseAgent
from app.services import llm_service

logger = logging.getLogger(__name__)

# Expanded normalization mapping
NORMALIZATION_MAP = {
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "ai": "Artificial Intelligence",
    "artificial intelligence": "Artificial Intelligence",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "reactjs": "React",
    "react.js": "React",
    "react": "React",
    "vuejs": "Vue.js",
    "vue": "Vue.js",
    "angularjs": "Angular",
    "angular": "Angular",
    "expressjs": "Express",
    "express": "Express",
    "django": "Django",
    "flask": "Flask",
    "fastapi": "FastAPI",
    "java": "Java",
    "kotlin": "Kotlin",
    "golang": "Go",
    "go": "Go",
    "rust": "Rust",
    "cpp": "C++",
    "c++": "C++",
    "csharp": "C#",
    "c#": "C#",
    "sql": "SQL",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "firebase": "Firebase",
    "aws": "AWS",
    "azure": "Azure",
    "gcp": "Google Cloud",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "docker": "Docker",
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "bitbucket": "Bitbucket",
    "devops": "DevOps",
    "ci/cd": "CI/CD",
    "agile": "Agile",
    "scrum": "Scrum",
}


class NormalizationAgent(BaseAgent):
    """Standardizes terminology and common abbreviations."""
    
    def __init__(self):
        super().__init__("NormalizationAgent")
    
    def run(self, data):
        """
        Normalize terminology in cleaned text.
        
        Expected input:
        {
            "user_id": str,
            "clean_text": str,
            "original_data": list
        }
        
        Returns:
        {
            "user_id": str,
            "clean_text": str,
            "normalized_hints": [str],
            "original_data": list
        }
        """
        if not self.validate_input(data, ["user_id", "clean_text"]):
            return {"error": "Invalid input"}
        
        user_id = data["user_id"]
        text = data["clean_text"]
        
        # Extract normalized terms
        normalized_hints = self._normalize_text(text)

        if not normalized_hints and text.strip():
            try:
                prompt = (
                    "Extract canonical technical skill names or skill hints from the text below. "
                    "Return a JSON list of strings only.\n\n"
                    f"{text}"
                )
                response = llm_service.run_agent_fallback(prompt)
                normalized_hints = json.loads(response)
                normalized_hints = [str(item).strip() for item in normalized_hints if item]
            except Exception as e:
                self.logger.warning(f"LLM normalization fallback failed: {e}")
        
        self.logger.info(f"Found {len(normalized_hints)} normalized terms")
        
        return {
            "user_id": user_id,
            "clean_text": text,
            "normalized_hints": list(set(normalized_hints)),  # Remove duplicates
            "original_data": data.get("original_data", [])
        }
    
    def _normalize_text(self, text: str) -> list:
        """Extract and normalize known terms from text."""
        normalized = []
        text_lower = text.lower()
        
        # Match against normalization map
        for key, normalized_value in NORMALIZATION_MAP.items():
            if key in text_lower:
                if normalized_value not in normalized:
                    normalized.append(normalized_value)
        
        return normalized


# Singleton instance
_normalization_agent = NormalizationAgent()


def run(data):
    """Execute normalization agent."""
    return _normalization_agent.run(data)
