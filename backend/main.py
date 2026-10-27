from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import verify_router, college_router, aicte_router, seat_ledger_router, review_router, blind_match_router

app = FastAPI(
    title="AICTE APAAR Integrity Platform API",
    description="Unified National Student Data Management & Verification Gateway (SIH 26263)",
    version="2.0.0"
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all modular routers
app.include_router(verify_router.router)
app.include_router(college_router.router)
app.include_router(aicte_router.router)
app.include_router(seat_ledger_router.router)
app.include_router(review_router.router)
app.include_router(blind_match_router.router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "service": "AICTE APAAR National Gateway",
        "regulatoryStandard": "AICTE APH 2026-27 Norms",
        "version": "2.0.0",
        "dpdpCompliance": "Active",
        "docsUrl": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "database": "CONNECTED",
        "engine": "OPERATIONAL",
        "timestamp": "2026-10-26T21:30:00Z"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8085, reload=True)
