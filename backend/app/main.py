from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.database import get_db

app = FastAPI(
    title="RAG Document Assistant",
    version="1.0.0")

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