import math
from typing import Dict, Any

def compute_base_signal(signals: Dict[str, float]) -> float:
    """Compute base signal from the exact three multi-source signals."""
    github_signal = signals.get('github_signal', 0.0)
    coding_signal = signals.get('coding_signal', 0.0)
    course_signal = signals.get('course_signal', 0.0)
    
    # Exact weights from architecture
    return (0.45 * github_signal) + (0.45 * coding_signal) + (0.25 * course_signal)

def apply_confidence(base_signal: float, confidence: float) -> float:
    """Apply confidence using exact formula."""
    return base_signal * (0.8 + 0.2 * confidence)

def apply_experience_adjustment(signal_conf: float, experience_level: str) -> float:
    """Apply experience-aware adjustment."""
    if experience_level.lower() == 'fresher':
        return signal_conf * 1.15
    else:  # experienced
        if signal_conf < 0.4:
            return signal_conf * 0.9
        else:
            return signal_conf * 1.05

def apply_multi_source_boost(signal_exp: float, num_sources: int) -> float:
    """Boost signal if multiple source types contribute."""
    if num_sources >= 3:
        return signal_exp * 1.25
    elif num_sources >= 2:
        return signal_exp * 1.15
    return signal_exp

def normalize_score(signal_exp: float) -> float:
    """Normalize to final score between 4 and 10."""
    if signal_exp <= 0.01:
        return 0.0
        
    # Exact formula from instructions
    score = 4.0 + 6.0 / (1.0 + math.exp(-5.0 * (signal_exp - 0.45)))
    return round(min(10.0, score), 1)

def compute_final_score(signals: Dict[str, float], confidence: float, experience_level: str, num_sources: int, num_items: int) -> Dict[str, float]:
    """Orchestrates the entire scoring math and returns intermediate values for tracing."""
    base_signal = compute_base_signal(signals)
    signal_conf = apply_confidence(base_signal, confidence)
    signal_exp = apply_experience_adjustment(signal_conf, experience_level)
    signal_boosted = apply_multi_source_boost(signal_exp, num_sources)
    
    # Consistency bonus
    if num_items > num_sources and base_signal > 0:
        signal_boosted += 0.05
    
    # Cap before normalization to prevent massive exponentiation offsets if boosted past 1.5, though sigmoid handles it
    final_score = normalize_score(signal_boosted)
    
    return {
        'github_signal': signals.get('github_signal', 0.0),
        'coding_signal': signals.get('coding_signal', 0.0),
        'course_signal': signals.get('course_signal', 0.0),
        'BaseSignal': base_signal,
        'confidence_adjusted': signal_conf,
        'experience_adjusted': signal_exp,
        'boosted_signal': signal_boosted,
        'final_score': final_score
    }
