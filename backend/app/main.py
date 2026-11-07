from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.documents import router as documents_router
from app.api.chat import router as chat_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="RAG Document Assistant",
    version="1.0.0")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents_router)
app.include_router(chat_router)

@app.get("/")
def home():
    return {
        "message": "RAG Document Assistant API is running"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

@app.get("/health/db")
def database_health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "database": "Supabase PostgreSQL"
        }
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed"
        )