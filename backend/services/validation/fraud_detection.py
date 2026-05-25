from typing import Tuple

def detect_skill_fraud(confidence: float, final_signal: float, mapped_sources_count: int, claim_sources_count: int) -> Tuple[bool, str]:
    """
    Detects fraud at the individual skill level.
    Returns (is_fraud, reason).
    """
    # Rule 1: Missing Evidence
    if claim_sources_count > 0 and mapped_sources_count == 0:
        return True, "Skill claimed sources but none matched the raw ingested evidence."
        
    # Rule 2: High Confidence Claim but weak derived signal
    if confidence > 0.8 and final_signal < 0.2:
        return True, f"High confidence claim ({confidence:.2f}) but very weak data-driven signal ({final_signal:.2f})."
        
    return False, ""
