"""
Job models for TrueSkill AI database.

These models store job postings and their skill requirements.
"""

from datetime import datetime
from typing import List
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Job(Base):
    """
    Job posting information.
    """
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    company = Column(String(255), nullable=True, index=True)
    location = Column(String(255), nullable=True)
    remote = Column(String(20), nullable=True)  # remote/hybrid/onsite
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    experience_level = Column(String(50), nullable=True)  # entry/mid/senior/executive
    employment_type = Column(String(50), nullable=True)  # full-time/part-time/contract
    requirements = Column(Text, nullable=True)
    benefits = Column(JSON, nullable=True)
    additional_data = Column(JSON, nullable=True)  # Additional job data
    is_active = Column(String(10), default="true")  # active/inactive
    posted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    skills = relationship("JobSkill", back_populates="job")
    match_scores = relationship("MatchScore", back_populates="job")
    
    def __repr__(self):
        return f"<Job(id={self.id}, title='{self.title}', company='{self.company}')>"


class JobSkill(Base):
    """
    Association between jobs and required skills.
    """
    __tablename__ = "job_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False, index=True)
    weight = Column(Float, nullable=False, default=1.0)  # Skill importance weight
    is_required = Column(String(10), default="false")  # required/optional
    experience_level = Column(String(20), nullable=True)  # beginner/intermediate/advanced
    description = Column(Text, nullable=True)  # How skill is used in this role
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    job = relationship("Job", back_populates="skills")
    skill = relationship("Skill", back_populates="job_requirements")
    
    def __repr__(self):
        return f"<JobSkill(id={self.id}, job_id={self.job_id}, skill_id={self.skill_id}, required={self.is_required})>"
