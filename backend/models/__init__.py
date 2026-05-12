"""
Database models for TrueSkill AI.

This package contains SQLAlchemy models for all database entities
including candidates, skills, jobs, and scoring results.
"""

from .candidate import Candidate, CandidateProfile, CandidateSkill
from .job import Job, JobSkill
from .scoring import MatchScore, InterestScore
from .skill import Skill

__all__ = [
    "Candidate",
    "CandidateProfile", 
    "CandidateSkill",
    "Job",
    "JobSkill",
    "Skill",
    "MatchScore",
    "InterestScore"
]
