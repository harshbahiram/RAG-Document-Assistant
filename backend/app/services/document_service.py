
import uuid

from sqlalchemy.orm import Session

from app.db.models import Document
from app.services.storage_service import upload_pdf, delete_pdf
from app.core.config import SUPABASE_BUCKET_NAME


def create_document(
    db: Session,
    filename: str,
    file_content: bytes,
    user_id: uuid.UUID,
):
    document_id = uuid.uuid4()
    storage_path = f"{document_id}.pdf"

    upload_pdf(storage_path, file_content)

    try:
        document = Document(
            id=document_id,
            user_id=user_id,
            filename=filename,
            storage_bucket=SUPABASE_BUCKET_NAME,
            storage_path=storage_path,
            mime_type="application/pdf",
            file_size=len(file_content),
            status="processing",
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        return document

    except Exception:
        db.rollback()

        try:
            delete_pdf(storage_path)
        except Exception as cleanup_error:
            print("Storage cleanup failed:", cleanup_error)

        raise


def get_all_documents(
    db: Session,
    user_id: uuid.UUID,
):
    return (
        db.query(Document)
        .filter(Document.user_id == user_id)
        .order_by(Document.created_at.desc())
        .all()
    )


def remove_document(
    db: Session,
    document_id: uuid.UUID,
    user_id: uuid.UUID,
):
    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == user_id,
        )
        .first()
    )

    if not document:
        raise ValueError("Document not found")

    try:
        delete_pdf(document.storage_path)

        db.delete(document)
        db.commit()

        return {
            "message": "Document deleted successfully",
            "document_id": str(document_id),
        }

    except Exception:
        db.rollback()
        raise
