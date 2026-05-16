from typing import List, Dict, Any
from backend.schema.matching_schema import ProfileExplanation

def generate_profile_explanation(
    scoring_output: Dict[str, Any], 
    validated_skills: List[Dict[str, Any]], 
    matching_output: List[Dict[str, Any]]
) -> ProfileExplanation:
    """
    Generates human-readable strengths, weaknesses, and recommendations
    based on the candidate's profile metrics.
    """
    strengths = []
    weaknesses = []
    recommendations = []

    # 1. Analyze Scoring (Breakdown scores are 0-10)
    score_breakdown = scoring_output.get("score_breakdown", {})
    depth = score_breakdown.get("depth", 0)
    consistency = score_breakdown.get("consistency", 0)
    authenticity = score_breakdown.get("authenticity", 0)
    diversity = score_breakdown.get("diversity", 0)

    # Strengths from scores
    if authenticity >= 8:
        strengths.append("High skill authenticity and verification quality")
    if consistency >= 7:
        strengths.append("Consistent coding activity detected")
    if depth >= 7:
        strengths.append("Significant technical depth in core projects")
    if diversity >= 6:
        strengths.append("Diverse set of verification sources (GitHub, Resume, etc.)")

    # Weaknesses from scores
    if consistency < 4:
        weaknesses.append("Low coding activity consistency")
        recommendations.append("Increase frequency of GitHub commits and coding practice")
    if depth < 4:
        weaknesses.append("Limited technical depth in specialized areas")
        recommendations.append("Work on more complex, long-term technical projects")
    if diversity < 3:
        weaknesses.append("Limited cross-platform verification")
        recommendations.append("Link more profiles (LeetCode, Kaggle) to strengthen evidence")

    # 2. Analyze Validated Skills
    skill_names = [s.get("name", "").lower() for s in validated_skills]
    
    if len(validated_skills) > 10:
        strengths.append("Broad technical skillset across multiple domains")
    elif len(validated_skills) < 3 and len(validated_skills) > 0:
        weaknesses.append("Narrow skill profile with few verified technologies")
        recommendations.append("Broaden your tech stack by learning complementary tools")

    # 3. Analyze Matching
    if matching_output:
        top_match = matching_output[0]
        if top_match.get("similarity", 0) >= 80:
            strengths.append(f"Strong fit for {top_match.get('role')} positions")
        elif top_match.get("similarity", 0) < 40:
            weaknesses.append("Low similarity with standard intern role templates")
            recommendations.append("Align your project portfolio with specific industry roles (e.g., Backend, ML)")

    # Deduplicate and clean up
    strengths = list(dict.fromkeys(strengths))
    weaknesses = list(dict.fromkeys(weaknesses))
    recommendations = list(dict.fromkeys(recommendations))

    # Safe defaults
    if not strengths:
        strengths.append("Profile initiated and ready for further development")
    if not weaknesses:
        weaknesses.append("No major technical gaps detected for current level")
    if not recommendations:
        recommendations.append("Continue building projects and verifying new skills")

    return ProfileExplanation(
        strengths=strengths[:4], # Limit to top 4
        weaknesses=weaknesses[:3], # Limit to top 3
        recommendations=recommendations[:3] # Limit to top 3
    )
