from app.db.database import SessionLocal
from app.services.rag_service import answer_question

DOCUMENT_ID = "a020ea16-acc4-4c63-b707-0eef27f73e2e"

db = SessionLocal()

try:
    result = answer_question(
        db=db,
        question="What is the connection between Harsh's grandfather and the mysterious train?",
        match_count=5,
        document_id=DOCUMENT_ID
    )

    print("\n========== RAG ANSWER ==========")
    print(result["answer"])

    print("\n========== SOURCES ==========")

    for source in result["sources"]:
        print(
            f"{source['source']} | "
            f"Page: {source['page_number']} | "
            f"Similarity: {source['similarity']:.4f}"
        )

finally:
    db.close()