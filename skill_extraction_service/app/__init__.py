"""Application root module."""

from fastapi import FastAPI
from app.api import router

# Create FastAPI app
app = FastAPI(
    title="Multi-Agent Skill Extraction Core",
    description="A sophisticated Multi-Agent Intelligence Layer for skill extraction and profiling",
    version="1.0.0"
)

# Include all routes
app.include_router(router)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "service": "Multi-Agent Skill Extraction Core (CORE)",
        "version": "1.0.0",
        "description": "8-Agent Intelligence Layer for skill extraction",
        "endpoints": {
            "full_pipeline": "POST /extract",
            "quick_pipeline": "POST /extract/quick",
            "individual_agents": "See /agents endpoint",
            "health": "GET /health",
            "agents_info": "GET /agents"
        }
    }

__all__ = ["app"]
