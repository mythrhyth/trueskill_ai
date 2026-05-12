"""
Skill model for TrueSkill AI database.

Stores the master list of skills with normalization and categorization.
"""

from typing import List
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.orm import relationship

from database import Base


class Skill(Base):
    """
    Master skill entity.
    """
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=True, index=True)  # frontend/backend/language/etc.
    description = Column(Text, nullable=True)
    aliases = Column(JSON, nullable=True)  # Alternative names/abbreviations
    additional_data = Column(JSON, nullable=True)  # Additional skill metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    candidates = relationship("CandidateSkill", back_populates="skill")
    job_requirements = relationship("JobSkill", back_populates="skill")
    
    def __repr__(self):
        return f"<Skill(id={self.id}, name='{self.name}', category='{self.category}')>"
