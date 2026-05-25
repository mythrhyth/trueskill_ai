from fastapi import FastAPI
from backend.api.routes.ingestion_routes import router as ingestion_router
from backend.api.routes.skill_extractor_routes import router as skill_extractor_router
from backend.api.routes.validation_routes import router as validation_router
from backend.api.routes.matching_routes import router as matching_router
from backend.api.routes.recruiter_routes import router as recruiter_router

app = FastAPI(
    title="TrueSkill AI Ingestion API",
    description="Endpoints for profile and document ingestion into the TrueSkill AI pipeline.",
    version="1.0.0"
)

app.include_router(ingestion_router)
app.include_router(skill_extractor_router)
app.include_router(validation_router)
app.include_router(matching_router)
app.include_router(recruiter_router)


@app.get("/")
async def root():
    return {
        "service": "TrueSkill AI Ingestion API",
        "version": "1.0.0",
        "endpoints": [
            "/ingestion/cp",
            "/ingestion/github",
            "/ingestion/kaggle",
            "/ingestion/research",
            "/ingestion/resume",
            "/ingestion/document",
            "/ingestion/normalize/item",
            "/ingestion/normalize/user",
            "/extract",
            "/extract/quick",
            "/preprocess",
            "/normalize",
            "/metadata",
            "/extract-llm",
            "/fuse",
            "/score",
            "/health",
            "/agents",
            "/matching/calculate-score",
            "/matching/match-jobs",
            "/matching/graph/profile",
            "/matching/profile-analysis",
        ],
    }
