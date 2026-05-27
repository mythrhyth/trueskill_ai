"""LLM Service configured for Gemini Flash / Gemini 2.5 Flash only."""

import json
import logging
import re
from typing import List, Dict, Any
import os
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini").lower()

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

    provider_order = ["gemini"]

    for provider in provider_order:
        if provider == "gemini" and GEMINI_API_KEY:
            try:
                skills = _extract_with_gemini(text, hints)
                logger.info(f"Successfully extracted {len(skills)} skills using Gemini")
                return skills
            except Exception as e:
                logger.warning(f"Gemini extraction failed: {e}")

    logger.warning("No LLM provider available or all LLM calls failed, falling back to rule-based extraction")
    return _extract_with_rules(text, hints)




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
    provider_order = ["gemini"]

    for provider in provider_order:
        if provider == "gemini" and GEMINI_API_KEY:
            try:
                return _call_gemini_text(prompt)
            except Exception as e:
                logger.warning(f"Gemini fallback failed: {e}")

    raise RuntimeError("No valid LLM provider available for agent fallback")


def _extract_with_rules(text: str, hints: List[str]) -> List[Dict[str, Any]]:
    """Context-aware rule-based skill extraction fallback."""
    text_lower = text.lower()
    extracted_skills = {}
    
    # Process hints first (high confidence)
    for hint in hints:
        if hint not in extracted_skills and not _is_negated(hint, text_lower):
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
    
    # Context-aware keyword-based extraction
    for skill_name, keywords in SKILL_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower and skill_name not in extracted_skills:
                # Check for negation context
                if _is_negated(keyword, text_lower):
                    continue
                
                # Check for positive context indicators
                context_score = _analyze_context(keyword, text_lower)
                if context_score > 0.3:  # Threshold for positive context
                    extracted_skills[skill_name] = {
                        "name": skill_name,
                        "category": _categorize_skill(skill_name),
                        "level": _infer_level(text_lower, skill_name),
                        "confidence": min(0.9, 0.6 + context_score),  # Boost confidence based on context
                        "evidence": [f"Found keyword: {keyword} with positive context"],
                        "reasoning": f"Explicit mention of '{keyword}' indicates {skill_name} knowledge",
                        "signals": [
                            {
                                "source": "keyword_matching",
                                "confidence": min(0.9, 0.6 + context_score),
                                "evidence": f"Matched keyword: {keyword} with context score: {context_score:.2f}",
                                "weight": 1.0
                            }
                        ]
                    }
    
    return list(extracted_skills.values())


def _is_negated(term: str, text: str) -> bool:
    """Check if a term is negated in the text."""
    # Split text into sentences for better context analysis
    sentences = re.split(r'[.!?]+', text)
    
    for sentence in sentences:
        if term in sentence:
            # Check for negation patterns
            negation_patterns = [
                r'\bno\s+' + re.escape(term) + r'\b',
                r'\bnot\s+' + re.escape(term) + r'\b',
                r'\bdon\'t\s+.*' + re.escape(term) + r'\b',
                r'\bdoesn\'t\s+.*' + re.escape(term) + r'\b',
                r'\bdidn\'t\s+.*' + re.escape(term) + r'\b',
                r'\bwon\'t\s+.*' + re.escape(term) + r'\b',
                r'\bnever\s+.*' + re.escape(term) + r'\b',
                r'\bavoid\s+' + re.escape(term) + r'\b',
                r'\bhate\s+' + re.escape(term) + r'\b',
                r'\bdislike\s+' + re.escape(term) + r'\b',
                r'\bwithout\s+' + re.escape(term) + r'\b',
                r'\bnot\s+interested\s+in\s+' + re.escape(term) + r'\b',
                r'\bno\s+experience\s+with\s+' + re.escape(term) + r'\b',
                r'\bnot\s+familiar\s+with\s+' + re.escape(term) + r'\b',
            ]
            
            for pattern in negation_patterns:
                if re.search(pattern, sentence):
                    return True
            
            # Check for proximity to negation words (within 3 words)
            words = sentence.split()
            for i, word in enumerate(words):
                if term in word:
                    # Check words before and after
                    context_start = max(0, i - 3)
                    context_end = min(len(words), i + 4)
                    context_words = words[context_start:context_end]
                    
                    negation_words = ['no', 'not', 'never', 'don\'t', 'doesn\'t', 'didn\'t', 'won\'t', 
                                     'avoid', 'hate', 'dislike', 'without', 'against', 'opposed']
                    
                    if any(neg_word in context_words for neg_word in negation_words):
                        return True
    
    return False


def _analyze_context(term: str, text: str) -> float:
    """Analyze context around a term to determine positive/negative sentiment."""
    sentences = re.split(r'[.!?]+', text)
    
    max_score = 0.0
    
    for sentence in sentences:
        if term in sentence:
            score = 0.0
            words = sentence.split()
            
            # Find term position
            term_indices = [i for i, word in enumerate(words) if term in word]
            
            for term_idx in term_indices:
                # Get context window (5 words before and after)
                context_start = max(0, term_idx - 5)
                context_end = min(len(words), term_idx + 6)
                context_words = words[context_start:context_end]
                
                # Positive indicators
                positive_words = [
                    'experienced', 'skilled', 'proficient', 'expert', 'advanced', 'master',
                    'developed', 'built', 'created', 'implemented', 'designed', 'architected',
                    'led', 'managed', 'specialized', 'focused', 'worked', 'used',
                    'knowledge', 'background', 'familiar', 'comfortable', 'confident',
                    'years', 'experience', 'project', 'projects', 'successfully'
                ]
                
                # Negative indicators (excluding negations which are handled separately)
                negative_words = [
                    'learning', 'beginner', 'novice', 'basic', 'limited', 'little',
                    'some', 'minimal', 'entry', 'junior', 'starting', 'new'
                ]
                
                # Count positive and negative words in context
                pos_count = sum(1 for word in context_words if word in positive_words)
                neg_count = sum(1 for word in context_words if word in negative_words)
                
                # Calculate score
                sentence_score = (pos_count * 0.2) - (neg_count * 0.1)
                
                # Boost for experience indicators
                experience_words = ['years', 'experience', 'senior', 'lead', 'principal', 'staff']
                if any(exp_word in context_words for exp_word in experience_words):
                    sentence_score += 0.3
                
                # Boost for project words
                project_words = ['project', 'projects', 'built', 'developed', 'created', 'implemented']
                if any(proj_word in context_words for proj_word in project_words):
                    sentence_score += 0.2
                
                max_score = max(max_score, sentence_score)
    
    return max(0.0, min(1.0, max_score))  # Clamp between 0 and 1


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
    """Infer skill level based on context and experience indicators."""
    skill_lower = skill_name.lower()
    text_lower = text.lower()
    
    # Expert level indicators (highest confidence)
    expert_patterns = [
        f"expert {skill_lower}",
        f"{skill_lower} expert",
        f"master {skill_lower}",
        f"{skill_lower} master",
        f"principal {skill_lower}",
        f"{skill_lower} principal",
        f"staff {skill_lower}",
        f"{skill_lower} staff",
        f"senior {skill_lower} architect",
        f"{skill_lower} architect",
        f"guru {skill_lower}",
        f"{skill_lower} guru"
    ]
    
    if any(pattern in text_lower for pattern in expert_patterns):
        return "expert"
    
    # Advanced level indicators
    advanced_patterns = [
        f"advanced {skill_lower}",
        f"{skill_lower} advanced",
        f"senior {skill_lower}",
        f"{skill_lower} senior",
        f"lead {skill_lower}",
        f"{skill_lower} lead",
        f"{skill_lower} specialist",
        f"{skill_lower} architect"
    ]
    
    if any(pattern in text_lower for pattern in advanced_patterns):
        return "advanced"
    
    # Experience-based level inference
    years_experience = _extract_years_experience(text_lower, skill_lower)
    if years_experience >= 7:
        return "expert"
    elif years_experience >= 4:
        return "advanced"
    elif years_experience >= 2:
        return "intermediate"
    
    # Project complexity indicators
    project_indicators = [
        "architected", "designed", "led", "mentored", "optimized", "scaled",
        "deployed", "production", "enterprise", "distributed", "microservices"
    ]
    
    if any(indicator in text_lower for indicator in project_indicators):
        return "advanced"
    
    # Intermediate level indicators
    intermediate_patterns = [
        f"intermediate {skill_lower}",
        f"{skill_lower} intermediate",
        f"experienced {skill_lower}",
        f"{skill_lower} experienced",
        "proficient", "comfortable", "familiar"
    ]
    
    if any(pattern in text_lower for pattern in intermediate_patterns):
        return "intermediate"
    
    # Project-based indicators
    project_words = ["project", "projects", "built", "developed", "created", "implemented", "used"]
    if any(word in text_lower for word in project_words):
        return "intermediate"
    
    # Beginner level indicators
    beginner_patterns = [
        f"beginner {skill_lower}",
        f"{skill_lower} beginner",
        f"junior {skill_lower}",
        f"{skill_lower} junior",
        f"entry {skill_lower}",
        f"{skill_lower} entry",
        f"learning {skill_lower}",
        f"{skill_lower} learning",
        f"basic {skill_lower}",
        f"{skill_lower} basic"
    ]
    
    if any(pattern in text_lower for pattern in beginner_patterns):
        return "beginner"
    
    # Default to intermediate if no clear indicators
    return "intermediate"


def _extract_years_experience(text: str, skill: str) -> int:
    """Extract years of experience for a specific skill."""
    import re
    
    # Patterns for years of experience
    patterns = [
        rf"(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience\s*)?(?:with\s*)?{skill}",
        rf"{skill}\s*(?:for\s*)?(\d+)\+?\s*years?",
        rf"(\d+)\+?\s*years?\s*(?:of\s*)?{skill}",
        rf"since\s*(\d{{4}}).*{skill}",  # Since year
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text)
        if matches:
            try:
                years = int(matches[0])
                # Handle "since year" pattern
                if "since" in pattern and years > 1900:
                    from datetime import datetime
                    years = datetime.now().year - years
                return years
            except (ValueError, IndexError):
                continue
    
    return 0


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
