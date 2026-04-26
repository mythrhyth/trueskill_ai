from fastapi import FastAPI
from backend.api.routes.ingestion_routes import router as ingestion_router
from backend.api.routes.skill_extractor_routes import router as skill_extractor_router

app = FastAPI(
    title="TrueSkill AI Ingestion API",
    description="Endpoints for profile and document ingestion into the TrueSkill AI pipeline.",
    version="1.0.0"
)

app.include_router(ingestion_router)
app.include_router(skill_extractor_router)


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
        ],
    }
