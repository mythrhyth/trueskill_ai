from typing import Dict, Any, List
from backend.schema.matching_schema import CandidateScore

def calculate_depth(validated_skills: List[Dict[str, Any]], github_metrics: Dict[str, Any]) -> float:
    """
    Measures technical and project depth based on validated skills and repository count.
    
    Returns: float between 0-10
    """
    num_skills = len(validated_skills)
    skill_quality_avg = sum(s.get("validated_score", 0) for s in validated_skills) / max(num_skills, 1)
    repos = github_metrics.get("repos", 0)
    
    # Depth logic: 20% skill count (10 skills = max), 50% skill quality, 30% project count (20 repos = max)
    depth = (min(num_skills / 10, 1) * 2.0) + (skill_quality_avg * 10 * 0.5) + (min(repos / 20, 1) * 3.0)
    return round(min(depth, 10.0), 2)

def calculate_consistency(github_metrics: Dict[str, Any], coding_metrics: Dict[str, Any]) -> float:
    """
    Measures activity consistency using GitHub commits and LeetCode activity.
    
    Returns: float between 0-10
    """
    commits = github_metrics.get("commits", 0)
    leetcode = coding_metrics.get("leetcode_solved", 0)
    
    # Normalizing: 200 commits = 5.0 points, 300 LeetCode problems = 5.0 points
    commit_score = min(commits / 200, 1) * 5.0
    leetcode_score = min(leetcode / 300, 1) * 5.0
    
    return round(min(commit_score + leetcode_score, 10.0), 2)

def calculate_authenticity(validated_skills: List[Dict[str, Any]]) -> float:
    """
    Measures credibility of skills by averaging validation scores.
    
    Returns: float between 0-10
    """
    if not validated_skills:
        return 0.0
    # Average validated score (0-1) scaled to 0-10
    avg_validated = sum(s.get("validated_score", 0) for s in validated_skills) / len(validated_skills)
    return round(min(avg_validated * 10, 10.0), 2)

def calculate_diversity(validated_skills: List[Dict[str, Any]]) -> float:
    """
    Measures variety of verification sources across all skills.
    
    Returns: float between 0-10
    """
    unique_sources = set()
    for skill in validated_skills:
        sources = skill.get("explanations", {}).get("contributing_sources", [])
        for src in sources:
            if src:
                unique_sources.add(src)
    
    # Diversity logic: 5+ unique sources = 10.0 points
    diversity = min(len(unique_sources) / 5, 1) * 10.0
    return round(min(diversity, 10.0), 2)

def calculate_candidate_score(user_id: str, data: Dict[str, Any]) -> CandidateScore:
    """
    Combines all scoring components into a final weighted score (0-10).
    Formula: 0.35(Depth) + 0.25(Consistency) + 0.25(Authenticity) + 0.15(Diversity)
    """
    validated_skills = data.get("validated_skills", [])
    github_metrics = data.get("github_metrics", {}) or {}
    coding_metrics = data.get("coding_metrics", {}) or {}
    
    depth = calculate_depth(validated_skills, github_metrics)
    consistency = calculate_consistency(github_metrics, coding_metrics)
    authenticity = calculate_authenticity(validated_skills)
    diversity = calculate_diversity(validated_skills)
    
    # Weighted calculation
    final_score = (0.35 * depth) + (0.25 * consistency) + (0.25 * authenticity) + (0.15 * diversity)
    
    return CandidateScore(
        user_id=user_id,
        final_score=round(min(final_score, 10.0), 2),
        score_breakdown={
            "depth": depth,
            "consistency": consistency,
            "authenticity": authenticity,
            "diversity": diversity
        }
    )
