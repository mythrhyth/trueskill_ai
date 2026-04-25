"""LLM Service for skill extraction using OpenAI or Gemini Flash."""

import json
import logging
from typing import List, Dict, Any
import os
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "auto").lower()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta2/models/{GEMINI_MODEL}:generateText"

# Fallback skill database for rule-based extraction
SKILL_KEYWORDS = {
    "Python": ["python", "py", "django", "flask", "fastapi"],
    "JavaScript": ["javascript", "js", "node", "nodejs", "react", "vue", "angular"],
    "Java": ["java", "spring", "maven", "gradle"],
    "Machine Learning": ["ml", "machine learning", "tensorflow", "pytorch", "sklearn"],
    "Data Science": ["data science", "pandas", "numpy", "r language"],
    "Kubernetes": ["kubernetes", "k8s", "docker", "container"],
    "AWS": ["aws", "amazon", "s3", "lambda", "ec2"],
    "SQL": ["sql", "postgres", "mysql", "database"],
    "React": ["react", "reactjs", "jsx"],
    "Node.js": ["node", "nodejs", "express", "npm"],
}


def extract_skills_with_llm(text: str, hints: List[str] = None) -> List[Dict[str, Any]]:
    """
    Extract skills from text using LLM reasoning.
    Falls back to rule-based extraction if LLM unavailable.
    
    Args:
        text: Input text to analyze
        hints: Pre-extracted skill hints
        
    Returns:
        List of extracted skills with reasoning
    """
    if hints is None:
        hints = []

    provider_order = []
    if LLM_PROVIDER in ["gemini", "gemini-flash", "gemini-2.5-flash", "google"]:
        provider_order = ["gemini", "openai"]
    elif LLM_PROVIDER in ["openai", "gpt", "gpt-3.5", "gpt-4"]:
        provider_order = ["openai", "gemini"]
    else:
        provider_order = ["gemini", "openai"]

    for provider in provider_order:
        if provider == "gemini" and GEMINI_API_KEY:
            try:
                skills = _extract_with_gemini(text, hints)
                logger.info(f"Successfully extracted {len(skills)} skills using Gemini")
                return skills
            except Exception as e:
                logger.warning(f"Gemini extraction failed: {e}")
        elif provider == "openai" and OPENAI_API_KEY:
            try:
                skills = _extract_with_openai(text, hints)
                logger.info(f"Successfully extracted {len(skills)} skills using OpenAI")
                return skills
            except Exception as e:
                logger.warning(f"OpenAI extraction failed: {e}")

    logger.warning("No LLM provider available or all LLM calls failed, falling back to rule-based extraction")
    return _extract_with_rules(text, hints)


def _extract_with_openai(text: str, hints: List[str]) -> List[Dict[str, Any]]:
    """Extract skills using OpenAI API."""
    try:
        from openai import OpenAI

        client = OpenAI(api_key=OPENAI_API_KEY)

        prompt = f"""
Analyze the following text and extract technical skills mentioned.
Return a JSON list with skills. Each skill should have:
- name: skill name
- category: one of (language, framework, tool, platform, methodology, domain)
- level: one of (beginner, intermediate, advanced, expert)
- reasoning: why this skill was detected

Pre-extracted hints: {hints}

Text to analyze:
{text}

Return only valid JSON, no markdown:
"""

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a skill extraction expert. Return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
        )

        result = response.choices[0].message.content
        skills = json.loads(result)

        for skill in skills:
            skill.setdefault("confidence", 0.85)
            skill.setdefault("evidence", ["Detected via LLM analysis"])
            skill.setdefault("signals", [])

        return skills

    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        raise


def _extract_with_gemini(text: str, hints: List[str]) -> List[Dict[str, Any]]:
    """Extract skills using Gemini Flash / Gemini 2.5 Flash."""
    prompt = f"""
You are a skill extraction expert. Analyze the following text and extract technical skills.
Return only valid JSON as a list of skills. Each skill should include:
- name
- category (language, framework, tool, platform, methodology, domain)
- level (beginner, intermediate, advanced, expert)
- reasoning

Pre-extracted hints: {hints}

Text to analyze:
{text}

Return only valid JSON, no markdown.
"""

    payload = {
        "prompt": {"text": prompt},
        "temperature": 0.3,
        "maxOutputTokens": 512,
        "topP": 0.95,
        "candidateCount": 1
    }

    response = requests.post(
        GEMINI_ENDPOINT,
        params={"key": GEMINI_API_KEY},
        json=payload,
        timeout=25
    )
    response.raise_for_status()

    data = response.json()
    output_text = _parse_gemini_output(data)
    skills = json.loads(output_text)

    for skill in skills:
        skill.setdefault("confidence", 0.85)
        skill.setdefault("evidence", ["Detected via Gemini LLM analysis"])
        skill.setdefault("signals", [])

    return skills


def _parse_gemini_output(response_data: Dict[str, Any]) -> str:
    """Parse Gemini response payload for the primary text output."""
    candidates = response_data.get("candidates", [])
    if not candidates:
        raise ValueError("Gemini response did not contain any candidates")

    candidate = candidates[0]
    output = candidate.get("output")
    if isinstance(output, str):
        return output

    if isinstance(output, dict):
        content = output.get("content")
        if isinstance(content, str):
            return content

        if isinstance(content, list):
            for block in content:
                if isinstance(block, dict) and block.get("type") == "output_text":
                    return block.get("text", "")

    raise ValueError("Unable to extract text from Gemini response")


def _call_openai_text(prompt: str) -> str:
    """Call OpenAI for a generic text response."""
    from openai import OpenAI

    client = OpenAI(api_key=OPENAI_API_KEY)
    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You are a helpful agent that returns only the requested JSON or plain text output."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
    )

    return response.choices[0].message.content


def _call_gemini_text(prompt: str) -> str:
    """Call Gemini for a generic text response."""
    payload = {
        "prompt": {"text": prompt},
        "temperature": 0.3,
        "maxOutputTokens": 512,
        "topP": 0.95,
        "candidateCount": 1
    }

    response = requests.post(
        GEMINI_ENDPOINT,
        params={"key": GEMINI_API_KEY},
        json=payload,
        timeout=25
    )
    response.raise_for_status()
    data = response.json()
    return _parse_gemini_output(data)


def run_agent_fallback(prompt: str) -> str:
    """Run a generic agent fallback request against the configured LLM provider."""
    provider_order = []
    if LLM_PROVIDER in ["gemini", "gemini-flash", "gemini-2.5-flash", "google"]:
        provider_order = ["gemini", "openai"]
    elif LLM_PROVIDER in ["openai", "gpt", "gpt-3.5", "gpt-4"]:
        provider_order = ["openai", "gemini"]
    else:
        provider_order = ["gemini", "openai"]

    for provider in provider_order:
        if provider == "gemini" and GEMINI_API_KEY:
            try:
                return _call_gemini_text(prompt)
            except Exception as e:
                logger.warning(f"Gemini fallback failed: {e}")
        elif provider == "openai" and OPENAI_API_KEY:
            try:
                return _call_openai_text(prompt)
            except Exception as e:
                logger.warning(f"OpenAI fallback failed: {e}")

    raise RuntimeError("No valid LLM provider available for agent fallback")


def _extract_with_rules(text: str, hints: List[str]) -> List[Dict[str, Any]]:
    """Rule-based skill extraction fallback."""
    text_lower = text.lower()
    extracted_skills = {}
    
    # Process hints first (high confidence)
    for hint in hints:
        if hint not in extracted_skills:
            extracted_skills[hint] = {
                "name": hint,
                "category": "unknown",
                "level": "intermediate",
                "confidence": 0.85,
                "evidence": ["Detected via normalization"],
                "reasoning": "Standardized term matched in input",
                "signals": [
                    {
                        "source": "normalization",
                        "confidence": 0.85,
                        "evidence": f"Matched normalized hint: {hint}",
                        "weight": 1.0
                    }
                ]
            }
    
    # Keyword-based extraction
    for skill_name, keywords in SKILL_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower and skill_name not in extracted_skills:
                extracted_skills[skill_name] = {
                    "name": skill_name,
                    "category": _categorize_skill(skill_name),
                    "level": _infer_level(text_lower, skill_name),
                    "confidence": 0.75,
                    "evidence": [f"Found keyword: {keyword}"],
                    "reasoning": f"Explicit mention of '{keyword}' indicates {skill_name} knowledge",
                    "signals": [
                        {
                            "source": "keyword_matching",
                            "confidence": 0.75,
                            "evidence": f"Matched keyword: {keyword}",
                            "weight": 1.0
                        }
                    ]
                }
    
    return list(extracted_skills.values())


def _categorize_skill(skill_name: str) -> str:
    """Categorize skill based on name."""
    skill_lower = skill_name.lower()
    
    if any(x in skill_lower for x in ["python", "javascript", "java", "c++", "rust", "go", "ruby"]):
        return "language"
    elif any(x in skill_lower for x in ["react", "vue", "angular", "django", "flask"]):
        return "framework"
    elif any(x in skill_lower for x in ["kubernetes", "docker", "jenkins", "git"]):
        return "tool"
    elif any(x in skill_lower for x in ["aws", "azure", "gcp", "heroku"]):
        return "platform"
    elif any(x in skill_lower for x in ["agile", "scrum", "waterfall"]):
        return "methodology"
    elif any(x in skill_lower for x in ["machine learning", "data science", "nlp"]):
        return "domain"
    
    return "unknown"


def _infer_level(text: str, skill_name: str) -> str:
    """Infer skill level based on context."""
    skill_lower = skill_name.lower()
    text_lower = text.lower()
    
    # Advanced indicators
    if any(x in text_lower for x in [f"advanced {skill_lower}", f"expert {skill_lower}", "architect", "lead"]):
        return "advanced"
    
    # Check for project indicators
    if any(x in text_lower for x in ["project", "built", "developed", "created"]):
        return "intermediate"
    
    return "intermediate"


def score_skill_credibility(skill: Dict[str, Any], num_evidence: int, num_sources: int) -> float:
    """
    Calculate credibility score based on signal diversity.
    
    Args:
        skill: Skill data
        num_evidence: Number of evidence items
        num_sources: Number of different sources
        
    Returns:
        Credibility score 0-1
    """
    base_score = skill.get("confidence", 0.5)
    
    # Boost for multiple evidence
    if num_evidence > 2:
        base_score = min(1.0, base_score + 0.1)
    elif num_evidence > 1:
        base_score = min(1.0, base_score + 0.05)
    
    # Boost for multiple sources
    if num_sources > 1:
        base_score = min(1.0, base_score + 0.15)
    
    return round(base_score, 2)
