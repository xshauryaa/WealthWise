from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ml.api.routes import categorizer, anomaly, advisor
from ml.config.settings import get_settings

settings = get_settings()

app = FastAPI(
    title="WealthWise ML Service",
    description="Microservice for Financial Intelligence (RAG, Categorization, Anomalies)",
    version="1.0.0"
)

# Enable CORS for Frontend Access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(categorizer.router, prefix="/api/v1", tags=["Categorization"])
app.include_router(anomaly.router, prefix="/api/v1", tags=["Anomaly Detection"])
app.include_router(advisor.router, prefix="/api/v1", tags=["AI Advisor"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "wealthwise-ml"}
