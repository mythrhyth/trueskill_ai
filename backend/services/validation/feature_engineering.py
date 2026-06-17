from typing import Dict, Any, List

def calculate_github_signal(items: List[Dict[str, Any]]) -> float:
    """Calculate aggregate github signal from all mapped GitHub items."""
    total_commits = 0
    total_stars = 0
    total_prs = 0
    
    for item in items:
        item_type = item.get('type', '').lower()
        if 'github' in item_type:  # Matches github_repo, github_profile
            metrics = item.get('metrics', {})
            total_commits += (metrics.get('commits', 0) or 0)
            total_stars += (metrics.get('stars', 0) or 0)
            total_prs += (metrics.get('pull_requests', 0) or 0)
            
    # Assuming standard strong profile has 200 commits, 100 stars, 20 PRs for full score
    c_score = min(1.0, total_commits / 200.0)
    s_score = min(1.0, total_stars / 100.0)
    p_score = min(1.0, total_prs / 20.0)
    
    return (c_score * 0.5) + (s_score * 0.3) + (p_score * 0.2)

def calculate_coding_signal(items: List[Dict[str, Any]]) -> float:
    """Calculate aggregate coding signal from CP/Kaggle/resume items."""
    total_solved = 0
    max_rating = 0
    
    for item in items:
        item_type = item.get('type', '').lower()
        if 'coding' in item_type or 'cp_' in item_type or 'kaggle' in item_type:
            metrics = item.get('metrics', {})
            total_solved += (metrics.get('total_solved', 0) or metrics.get('competitions', 0) or 0)
            rating = (metrics.get('contest_rating', 0) or metrics.get('followers', 0) or 0)
            max_rating = max(max_rating, rating)
        elif 'resume' in item_type:
            # Resume claim baseline
            total_solved += 100
            max_rating = max(max_rating, 1200)
            
    # Strong profile: 300 problems solved, 2500 rating
    s_score = min(1.0, total_solved / 300.0)
    r_score = min(1.0, max_rating / 2500.0)
    
    return (s_score * 0.6) + (r_score * 0.4)

def calculate_course_signal(items: List[Dict[str, Any]]) -> float:
    """Calculate aggregate course signal from certificates/courses/resumes."""
    total_courses = 0
    total_duration = 0
    
    for item in items:
        item_type = item.get('type', '').lower()
        if 'course' in item_type or 'cert' in item_type:
            total_courses += 1
            metrics = item.get('metrics', {})
            total_duration += (metrics.get('duration_hours', 0) or 0)
        elif 'resume' in item_type:
            total_courses += 1
            total_duration += 40  # 40 hours baseline duration for resume proof
            
    # Strong profile: 5 courses, 100 hours
    c_score = min(1.0, total_courses / 5.0)
    d_score = min(1.0, total_duration / 100.0)
    
    # If duration is entirely missing but courses exist, rely on course count
    if total_courses > 0 and total_duration == 0:
        return min(1.0, total_courses / 5.0)
        
    return (c_score * 0.6) + (d_score * 0.4)

def extract_source_signals(mapped_items: List[Dict[str, Any]]) -> Dict[str, float]:
    """Extract the exact three signals defined by the architecture."""
    return {
        'github_signal': calculate_github_signal(mapped_items),
        'coding_signal': calculate_coding_signal(mapped_items),
        'course_signal': calculate_course_signal(mapped_items)
    }
