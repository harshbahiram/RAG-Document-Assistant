
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import Document
from app.services.storage_service import download_pdf
from app.services.pdf_service import extract_pdf_text
from app.services.chunking_service import chunk_document_pages
from app.services.embedding_service import generate_embeddings
from app.services.chunk_storage_service import save_document_chunks


def get_user_document(
    db: Session,
    document_id: UUID,
    user_id: UUID,
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
        raise ValueError("Document not found.")

    return document


def extract_document(
    db: Session,
    document_id: UUID,
    user_id: UUID,
):
    document = get_user_document(
        db,
        document_id,
        user_id,
    )

    pdf_content = download_pdf(document.storage_path)

    extracted_pages = extract_pdf_text(pdf_content)

    if not extracted_pages:
        raise ValueError(
            "No extractable text found. This PDF may require OCR."
        )

    total_characters = sum(
        len(page["text"]) for page in extracted_pages
    )

    return {
        "document_id": str(document.id),
        "filename": document.filename,
        "page_count": len(extracted_pages),
        "total_characters": total_characters,
        "pages": extracted_pages,
    }


def process_document(
    db: Session,
    document_id: UUID,
    user_id: UUID,
):
    document = get_user_document(
        db,
        document_id,
        user_id,
    )

    try:
        document.status = "processing"
        document.error_message = None
        db.commit()

        extracted = extract_document(
            db,
            document_id,
            user_id,
        )

        chunks = chunk_document_pages(
            extracted["pages"]
        )

        if not chunks:
            raise ValueError("No text chunks generated.")

        texts = [
            chunk["content"]
            for chunk in chunks
        ]

        embeddings = generate_embeddings(texts)

        saved_count = save_document_chunks(
            db=db,
            document_id=document_id,
            user_id=user_id,
            chunks=chunks,
            embeddings=embeddings,
        )

        document.status = "completed"
        document.error_message = None
        db.commit()

        return {
            "document_id": str(document_id),
            "filename": extracted["filename"],
            "page_count": extracted["page_count"],
            "total_characters": extracted["total_characters"],
            "total_chunks": saved_count,
            "status": "completed",
        }

    except Exception as error:
        db.rollback()

        try:
            failed_document = get_user_document(
                db,
                document_id,
                user_id,
            )

            failed_document.status = "failed"

            if isinstance(error, ValueError):
                failed_document.error_message = str(error)[:500]
            else:
                failed_document.error_message = (
                    "Document processing failed. Please try again."
                )

            db.commit()

        except Exception:
            db.rollback()

        raise
