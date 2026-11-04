
import uuid
from sqlalchemy.orm import Session

from app.db.models import Document
from app.services.storage_service import upload_pdf, delete_pdf
from app.core.config import SUPABASE_BUCKET_NAME


def create_document(
    db: Session,
    filename: str,
    file_content: bytes
):
    document_id = uuid.uuid4()

    # Generate a unique storage path
    storage_path = f"{document_id}.pdf"

    # Upload PDF to Supabase Storage
    upload_pdf(storage_path, file_content)

    try:
        # Create document metadata
        document = Document(
            id=document_id,
            filename=filename,
            storage_bucket=SUPABASE_BUCKET_NAME,
            storage_path=storage_path,
            mime_type="application/pdf",
            file_size=len(file_content),
            status="processing"
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        return document

    except Exception:
        db.rollback()

        # Remove uploaded file if database insertion fails
        try:
            delete_pdf(storage_path)
        except Exception as cleanup_error:
            print("Storage cleanup failed:", cleanup_error)

        raise
