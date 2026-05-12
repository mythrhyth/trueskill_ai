"""
Database configuration and session management for TrueSkill AI.

This module provides database connection, session management,
and initialization utilities for PostgreSQL with SQLAlchemy.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///trueskill_ai.db"
)

# Create engine
engine = create_engine(
    DATABASE_URL,
    poolclass=StaticPool,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=os.getenv("DEBUG", "false").lower() == "true"
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db() -> Session:
    """
    Get database session.
    
    This function should be used as a dependency in FastAPI endpoints.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables.
    
    This function should be called on application startup.
    """
    # Import all models to ensure they are registered with Base
    from models import Candidate, CandidateProfile, CandidateSkill, Job, JobSkill, Skill, MatchScore, InterestScore
    from models.ingestion import IngestionData
    from auth.models import User, Role, UserRole
    
    # Create all tables
    Base.metadata.create_all(bind=engine)


def drop_db():
    """
    Drop all database tables.
    
    WARNING: This will delete all data. Use only for testing.
    """
    # Import all models to ensure they are registered with Base
    from models import Candidate, CandidateProfile, CandidateSkill, Job, JobSkill, Skill, MatchScore, InterestScore
    from models.ingestion import IngestionData
    from auth.models import User, Role, UserRole
    
    # Drop all tables
    Base.metadata.drop_all(bind=engine)


def get_session() -> Session:
    """
    Get a new database session.
    
    This is useful for background tasks or manual database operations.
    """
    return SessionLocal()
