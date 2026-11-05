from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import Document
from app.services.storage_service import download_pdf
from app.services.pdf_service import extract_pdf_text


def extract_document(db: Session, document_id: UUID):
    
    document = db.get(Document, document_id)

    if not document:
        raise ValueError("Document not found")

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
        "pages": extracted_pages
    }