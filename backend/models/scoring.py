"""
Scoring models for TrueSkill AI database.

These models store match scores and interest scores for candidates.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, Float, JSON, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from database import Base


class MatchScore(Base):
    """
    Match score between candidate and job.
    """
    __tablename__ = "match_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False, index=True)
    score = Column(Float, nullable=False, index=True)  # 0.0 to 1.0
    explanation = Column(JSON, nullable=True)  # Detailed explanation array
    matched_skills = Column(JSON, nullable=True)  # List of matched skill names
    missing_skills = Column(JSON, nullable=True)  # List of missing required skills
    coverage_ratio = Column(Float, nullable=False, default=0.0)  # Required skills coverage
    algorithm_version = Column(String(20), default="1.0")  # For tracking algorithm changes
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    candidate = relationship("Candidate", back_populates="match_scores")
    job = relationship("Job", back_populates="match_scores")
    
    def __repr__(self):
        return f"<MatchScore(id={self.id}, candidate_id={self.candidate_id}, job_id={self.job_id}, score={self.score})>"


class InterestScore(Base):
    """
    Interest score for candidate based on chat interactions.
    """
    __tablename__ = "interest_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False, index=True)
    score = Column(Float, nullable=False, index=True)  # 0.0 to 1.0
    breakdown = Column(JSON, nullable=True)  # Detailed breakdown object
    metrics = Column(JSON, nullable=True)  # Raw metrics used for calculation
    session_count = Column(Integer, default=1)  # Number of chat sessions analyzed
    total_messages = Column(Integer, default=0)  # Total messages analyzed
    algorithm_version = Column(String(20), default="1.0")  # For tracking algorithm changes
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    candidate = relationship("Candidate", back_populates="interest_scores")
    
    def __repr__(self):
        return f"<InterestScore(id={self.id}, candidate_id={self.candidate_id}, score={self.score})>"
