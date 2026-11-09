from app.db.database import SessionLocal
from app.services.retrieval_service import retrieve_relevant_chunks

QUESTION = "Who gave the watch to Harsh?"

DOCUMENT_ID = "a020ea16-acc4-4c63-b707-0eef27f73e2e"

db = SessionLocal()

try:
    chunks = retrieve_relevant_chunks(
        db=db,
        question=QUESTION,
        match_count=15,
        document_id=DOCUMENT_ID
    )

    for index, chunk in enumerate(chunks, start=1):
        print("\n" + "=" * 70)
        print(f"RANK: {index}")
        print(f"PAGE: {chunk['page_number']}")
        print(f"CHUNK ID: {chunk['chunk_id']}")

        similarity = chunk["similarity"]
        if similarity is not None:
            print(f"SIMILARITY: {similarity:.4f}")
        else:
            print("SIMILARITY: Neighbouring chunk")
            
        print("-" * 70)
        print(chunk["content"])

finally:
    db.close()