from typing import Dict, Any, List
from .feature_engineering import extract_source_signals
from .signal_model import compute_final_score
from .fraud_detection import detect_skill_fraud

def interpret_score(score: float) -> str:
    """Interpretation layer for the final score."""
    if score >= 8.8:
        return "Elite"
    elif score >= 7.5:
        return "Good"
    elif score >= 6.5:
        return "Average"
    elif score > 0:
        return "Weak"
    return "Invalid/Fraud"

def validate_profile(extracted_skills_data: Dict[str, Any], raw_evidence_data: Dict[str, Any], debug: bool = False) -> Dict[str, Any]:
    """
    Main entry point for Validation Engine.
    Maps skills to evidence, computes mathematical signals using multi-source logic.
    """
    user_id = extracted_skills_data.get('user_id', 'unknown')
    raw_items = raw_evidence_data.get('items', [])
    if not raw_items and isinstance(raw_evidence_data, dict) and raw_evidence_data.get('id'):
        raw_items = [raw_evidence_data]
    skills = extracted_skills_data.get('skills', [])
    
    profile_summary = extracted_skills_data.get('profile_summary', {})
    domain = profile_summary.get('domain', 'tech')
    experience_level = profile_summary.get('experience_level', 'fresher')
    
    # Map raw items by ID for fast lookup
    item_map = {item.get('id'): item for item in raw_items if item.get('id')}
    
    validated_skills = []
    total_valid_score = 0.0
    valid_skill_count = 0
    is_suspicious = False
    fraud_count = 0
    
    for skill in skills:
        skill_name = skill.get('name')
        skill_conf = skill.get('confidence', 0.5)
        sources = skill.get('sources', [])
        
        # Resolve sources dynamically from raw items if not populated (e.g. in rule-based fallback)
        if not sources and skill_name:
            resolved_sources = []
            from backend.utils.llm_service import SKILL_KEYWORDS
            keywords = [skill_name.lower()]
            if skill_name in SKILL_KEYWORDS:
                keywords.extend([kw.lower() for kw in SKILL_KEYWORDS[skill_name]])
            
            for item in raw_items:
                raw_text = ""
                item_content = item.get("content")
                if isinstance(item_content, dict):
                    raw_text = (item_content.get("raw_text") or item_content.get("title") or item_content.get("description") or "").lower()
                elif isinstance(item_content, str):
                    raw_text = item_content.lower()
                
                tech_stack = item.get("attributes", {}).get("tech_stack", [])
                tech_stack_lower = [s.lower() for s in tech_stack] if tech_stack else []
                
                matched = False
                for kw in keywords:
                    if kw in raw_text or kw in tech_stack_lower:
                        matched = True
                        break
                
                if not matched and item.get("type") == "github_profile":
                    projects = item.get("attributes", {}).get("projects", [])
                    for proj in projects:
                        proj_text = (f"{proj.get('name') or ''} {proj.get('description') or ''} {proj.get('language') or ''}").lower()
                        for kw in keywords:
                            if kw in proj_text:
                                matched = True
                                break
                        if matched:
                            break
                
                if matched:
                    resolved_sources.append({
                        "item_id": item.get("id"),
                        "source": item.get("source"),
                        "type": item.get("type")
                    })
            sources = resolved_sources

        mapped_items = []
        source_types = set()
        
        for src in sources:
            item_id = src.get('item_id')
            if item_id in item_map:
                item = item_map[item_id]
                mapped_items.append(item)
                source_types.add(item.get('type', 'unknown'))
                
        # 1. Extract multi-source signals
        signals = extract_source_signals(mapped_items)
        
        # 2. Count distinct source types for boost
        num_source_types = len(source_types)
        
        # 3. Compute final score trace
        trace = compute_final_score(signals, skill_conf, experience_level, num_source_types, len(mapped_items))
        
        # 4. Fraud check
        is_fraud, fraud_reason = detect_skill_fraud(skill_conf, trace['experience_adjusted'], len(mapped_items), len(sources))
        
        if is_fraud:
            validated_score = 0.0
            interpretation = "Fraudulent Claim"
            fraud_count += 1
        else:
            validated_score = trace['final_score']
            interpretation = interpret_score(validated_score)
            
        if not is_fraud and validated_score > 0:
            total_valid_score += validated_score
            valid_skill_count += 1
            
        explanations = {
            'interpretation': interpretation,
            'reasoning': f"Score interpreted as {interpretation} based on {num_source_types} unique source type(s).",
            'contributing_sources': [src.get('item_id') for src in sources if src.get('item_id') in item_map]
        }
        
        if is_fraud:
            explanations['reasoning'] = f"FRAUD FLAGGED: {fraud_reason}"
            
        if debug:
            explanations['debug_trace'] = trace
            
        validated_skill = {
            'name': skill_name,
            'category': skill.get('category'),
            'original_confidence': skill_conf,
            'validated_score': validated_score,
            'is_fraud': is_fraud,
            'sources': sources,
            'explanations': explanations
        }
        validated_skills.append(validated_skill)
        
    overall_score = round(total_valid_score / valid_skill_count, 1) if valid_skill_count > 0 else 0.0
    
    if fraud_count >= 2:
        is_suspicious = True
        
    return {
        "user_id": user_id,
        "overall_score": overall_score,
        "profile_summary": {
            "domain": domain,
            "experience_level": experience_level
        },
        "is_suspicious": is_suspicious,
        "validated_skills": validated_skills
    }
