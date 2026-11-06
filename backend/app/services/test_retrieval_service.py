
from uuid import UUID

from app.db.database import SessionLocal
from app.services.retrieval_service import retrieve_relevant_chunks


DOCUMENT_ID = "a020ea16-acc4-4c63-b707-0eef27f73e2e"


def main():
    db = SessionLocal()

    try:
        question = input("Ask a question about your PDF: ")

        results = retrieve_relevant_chunks(
            db=db,
            question=question,
            match_count=5,
            document_id=UUID(DOCUMENT_ID)
        )

        print("\n========== SEARCH RESULTS ==========")
        print("Question:", question)
        print("Results found:", len(results))

        for index, result in enumerate(results, start=1):
            print(f"\n========== RESULT {index} ==========")
            print("Page:", result["page_number"])
            print("Similarity:", round(result["similarity"], 4))
            print("Content:", result["content"])

        assert len(results) > 0

        print("\nSUCCESS: Semantic retrieval test passed!")

    finally:
        db.close()


if __name__ == "__main__":
    main()
