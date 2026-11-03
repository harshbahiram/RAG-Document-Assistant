from fastapi import FastAPI

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