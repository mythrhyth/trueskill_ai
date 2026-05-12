"""
Candidate models for TrueSkill AI database.

These models store candidate information, profiles, and skill associations.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Candidate(Base):
    """
    Core candidate information.
    """
    __tablename__ = "candidates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    profile = relationship("CandidateProfile", back_populates="candidate", uselist=False)
    skills = relationship("CandidateSkill", back_populates="candidate")
    match_scores = relationship("MatchScore", back_populates="candidate")
    interest_scores = relationship("InterestScore", back_populates="candidate")
    
    def __repr__(self):
        return f"<Candidate(id={self.id}, name='{self.name}', email='{self.email}')>"


class CandidateProfile(Base):
    """
    Detailed candidate profile with ingested data.
    """
    __tablename__ = "candidate_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False, unique=True)
    resume_text = Column(Text, nullable=True)
    github_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    cp_profiles = Column(JSON, nullable=True)  # Competitive programming profiles
    kaggle_url = Column(String(500), nullable=True)
    research_urls = Column(JSON, nullable=True)  # Research profile URLs
    document_metadata = Column(JSON, nullable=True)  # Uploaded documents info
    additional_data = Column(JSON, nullable=True)  # Additional flexible data
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    candidate = relationship("Candidate", back_populates="profile")
    
    def __repr__(self):
        return f"<CandidateProfile(id={self.id}, candidate_id={self.candidate_id})>"


class CandidateSkill(Base):
    """
    Association between candidates and their validated skills.
    """
    __tablename__ = "candidate_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False, index=True)
    confidence_score = Column(Float, nullable=False, default=0.0)
    authenticity_score = Column(Float, nullable=False, default=0.0)
    status = Column(String(20), nullable=False, default="Moderate")  # Strong/Moderate/Weak
    level = Column(String(20), nullable=True)  # beginner/intermediate/advanced/expert
    evidence = Column(JSON, nullable=True)  # List of evidence strings
    signals = Column(JSON, nullable=True)  # Extraction signals
    source_count = Column(Integer, default=1)  # Number of sources for this skill
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    candidate = relationship("Candidate", back_populates="skills")
    skill = relationship("Skill", back_populates="candidates")
    
    def __repr__(self):
        return f"<CandidateSkill(id={self.id}, candidate_id={self.candidate_id}, skill_id={self.skill_id}, status='{self.status}')>"
