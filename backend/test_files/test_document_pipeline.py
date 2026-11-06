from uuid import UUID

from app.db.database import SessionLocal
from app.services.document_processing_service import process_document


DOCUMENT_ID = "a020ea16-acc4-4c63-b707-0eef27f73e2e"


def main():
    db = SessionLocal()

    try:
        result = process_document(
            db,
            UUID(DOCUMENT_ID)
        )

        print("\n========== PROCESSING RESULT ==========")
        print("Document ID:", result["document_id"])
        print("Filename:", result["filename"])
        print("Pages:", result["page_count"])
        print("Characters:", result["total_characters"])
        print("Chunks:", result["total_chunks"])
        print("Status:", result["status"])

        assert result["total_chunks"] > 0
        assert result["status"] == "completed"

        print("\nSUCCESS: Complete document pipeline passed!")

    except Exception as error:
        print("\nPIPELINE FAILED:", error)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()