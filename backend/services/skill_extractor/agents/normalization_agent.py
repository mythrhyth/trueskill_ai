"""Normalization Agent - Standardizes terminology."""

import json
import logging
from .base_agent import BaseAgent
from backend.utils import llm_service

logger = logging.getLogger(__name__)

# Expanded normalization mapping with 100+ modern technology terms
NORMALIZATION_MAP = {
    # AI/ML
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "ai": "Artificial Intelligence",
    "artificial intelligence": "Artificial Intelligence",
    "nlp": "Natural Language Processing",
    "natural language processing": "Natural Language Processing",
    "cv": "Computer Vision",
    "computer vision": "Computer Vision",
    "llm": "Large Language Model",
    "large language model": "Large Language Model",
    "gan": "Generative Adversarial Network",
    "transformer": "Transformer",
    "bert": "BERT",
    "gpt": "GPT",
    
    # Frontend
    "js": "JavaScript",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "reactjs": "React",
    "react.js": "React",
    "react": "React",
    "next": "Next.js",
    "nextjs": "Next.js",
    "vuejs": "Vue.js",
    "vue": "Vue.js",
    "nuxt": "Nuxt.js",
    "nuxtjs": "Nuxt.js",
    "angularjs": "Angular",
    "angular": "Angular",
    "svelte": "Svelte",
    "solid": "SolidJS",
    "preact": "Preact",
    
    # Backend
    "expressjs": "Express",
    "express": "Express",
    "nestjs": "NestJS",
    "fastify": "Fastify",
    "koajs": "Koa",
    "django": "Django",
    "flask": "Flask",
    "fastapi": "FastAPI",
    "spring": "Spring Boot",
    "springboot": "Spring Boot",
    "rails": "Ruby on Rails",
    "laravel": "Laravel",
    "symfony": "Symfony",
    
    # Languages
    "java": "Java",
    "kotlin": "Kotlin",
    "scala": "Scala",
    "golang": "Go",
    "go": "Go",
    "rust": "Rust",
    "cpp": "C++",
    "c++": "C++",
    "csharp": "C#",
    "c#": "C#",
    "python": "Python",
    "py": "Python",
    "ruby": "Ruby",
    "php": "PHP",
    "swift": "Swift",
    "objc": "Objective-C",
    "objective-c": "Objective-C",
    "dart": "Dart",
    "elixir": "Elixir",
    "haskell": "Haskell",
    "clojure": "Clojure",
    
    # Databases
    "sql": "SQL",
    "nosql": "NoSQL",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "mariadb": "MariaDB",
    "mongodb": "MongoDB",
    "cassandra": "Apache Cassandra",
    "redis": "Redis",
    "elasticsearch": "Elasticsearch",
    "neo4j": "Neo4j",
    "dynamodb": "DynamoDB",
    "firestore": "Firestore",
    "supabase": "Supabase",
    "prisma": "Prisma",
    "typeorm": "TypeORM",
    
    # Cloud/DevOps
    "aws": "AWS",
    "azure": "Azure",
    "gcp": "Google Cloud",
    "google cloud": "Google Cloud",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "docker": "Docker",
    "dockercompose": "Docker Compose",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "puppet": "Puppet",
    "chef": "Chef",
    "jenkins": "Jenkins",
    "gitlabci": "GitLab CI",
    "githubactions": "GitHub Actions",
    "circleci": "CircleCI",
    "travisci": "Travis CI",
    "vercel": "Vercel",
    "netlify": "Netlify",
    "heroku": "Heroku",
    "digitalocean": "DigitalOcean",
    "cloudflare": "Cloudflare",
    
    # Tools/Platforms
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "bitbucket": "Bitbucket",
    "jira": "Jira",
    "confluence": "Confluence",
    "slack": "Slack",
    "discord": "Discord",
    "webpack": "Webpack",
    "vite": "Vite",
    "parcel": "Parcel",
    "rollup": "Rollup",
    "babel": "Babel",
    "eslint": "ESLint",
    "prettier": "Prettier",
    "jest": "Jest",
    "mocha": "Mocha",
    "cypress": "Cypress",
    "playwright": "Playwright",
    "selenium": "Selenium",
    "postman": "Postman",
    "insomnia": "Insomnia",
    
    # Methodologies
    "devops": "DevOps",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "agile": "Agile",
    "scrum": "Scrum",
    "kanban": "Kanban",
    "tdd": "Test-Driven Development",
    "test driven development": "Test-Driven Development",
    "bdd": "Behavior-Driven Development",
    "behavior driven development": "Behavior-Driven Development",
    
    # Security
    "oauth": "OAuth",
    "jwt": "JWT",
    "ssl": "SSL",
    "tls": "TLS",
    "2fa": "Two-Factor Authentication",
    "sso": "Single Sign-On",
    
    # Data/Analytics
    "spark": "Apache Spark",
    "hadoop": "Hadoop",
    "kafka": "Apache Kafka",
    "airflow": "Apache Airflow",
    "tableau": "Tableau",
    "powerbi": "Power BI",
    "looker": "Looker",
    "grafana": "Grafana",
    "prometheus": "Prometheus",
    "datadog": "Datadog",
    "newrelic": "New Relic",
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
