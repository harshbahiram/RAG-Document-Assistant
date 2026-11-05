from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException
)
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.database import get_db
from app.services.document_service import create_document
from app.schemas.document import DocumentResponse, ExtractDocumentResponse
from app.services.document_processing_service import extract_document


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Validate filename
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required"
        )

    # Validate PDF extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    # Read uploaded file
    file_content = await file.read()

    # Validate empty file
    if not file_content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    # Validate file size
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size exceeds 20 MB limit"
        )

    # Validate actual PDF signature
    if not file_content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file"
        )

    try:
        document = create_document(
            db=db,
            filename=file.filename,
            file_content=file_content
        )

        return document

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to upload document"
        )

@router.post(
    "/{document_id}/extract",
    response_model=ExtractDocumentResponse
)
def extract_document_endpoint(
    document_id: UUID,
    db: Session = Depends(get_db)
):
    try:
        result = extract_document(db, document_id)

        # Return a small preview, not the entire document
        preview = [
            {
                "page_number": page["page_number"],
                "character_count": len(page["text"]),
                "text_preview": page["text"][:300]
            }
            for page in result["pages"]
        ]

        return {
            "document_id": result["document_id"],
            "filename": result["filename"],
            "page_count": result["page_count"],
            "total_characters": result["total_characters"],
            "preview": preview
        }

    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Document extraction failed"
        )