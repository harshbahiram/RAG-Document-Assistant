
from sqlalchemy import select

from app.db.database import SessionLocal
from app.db.models import Document


def test_document_model():
    db = SessionLocal()

    try:
        test_document = Document(
            filename="test_document.pdf",
            storage_path="test/verification-test.pdf",
            file_size=1024,
            mime_type="application/pdf",
            status="processing"
        )

        # Insert test record
        db.add(test_document)
        db.flush()

        # Retrieve the inserted record
        result = db.execute(
            select(Document).where(
                Document.id == test_document.id
            )
        ).scalar_one()

        print("Document model working!")
        print("Document ID:", result.id)
        print("Filename:", result.filename)
        print("Status:", result.status)

        # Undo test insertion
        db.rollback()

        print("Test record rolled back successfully.")

    except Exception as e:
        db.rollback()
        print("Database model test failed:", str(e))

    finally:
        db.close()


if __name__ == "__main__":
    test_document_model()
