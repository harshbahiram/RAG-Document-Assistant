
from sqlalchemy import select

from app.db.database import SessionLocal
from app.db.models import Document


def test_document_model():
    db = SessionLocal()

    try:
        user_id = db.execute(
            select(Document.user_id).limit(1)
        ).scalar_one_or_none()

        if user_id is None:
            raise ValueError(
                "No existing document found. "
                "Create a document first or provide a valid test user ID."
            )

        test_document = Document(
            user_id=user_id,
            filename="test_document.pdf",
            storage_path="test/verification-test.pdf",
            file_size=1024,
            mime_type="application/pdf",
            status="processing"
        )

        db.add(test_document)
        db.flush()

        result = db.execute(
            select(Document).where(
                Document.id == test_document.id
            )
        ).scalar_one()

        print("Document model working!")
        print("Document ID:", result.id)
        print("Filename:", result.filename)
        print("User ID:", result.user_id)
        print("Status:", result.status)

        db.rollback()
        print("Test record rolled back successfully.")

    except Exception as e:
        db.rollback()
        print("Database model test failed:", str(e))

    finally:
        db.close()


if __name__ == "__main__":
    test_document_model()
