
from uuid import UUID

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user
from app.services.document_service import (
    create_document,
    get_all_documents,
    remove_document,
)
from app.schemas.document import (
    DocumentResponse,
    ExtractDocumentResponse,
)
from app.services.document_processing_service import (
    extract_document,
    process_document,
)

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


@router.get("/", response_model=list[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user),
):
    return get_all_documents(db, user_id)


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required",
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed",
        )

    file_content = await file.read()

    if not file_content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty",
        )

    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size exceeds 20 MB limit",
        )

    if not file_content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file",
        )

    try:
        return create_document(
            db=db,
            filename=file.filename,
            file_content=file_content,
            user_id=user_id,
        )

    except Exception as error:
        import logging
        logging.exception("Document upload failed")
        raise HTTPException(
            status_code=500,
            detail="Failed to upload document",
        ) from error


@router.post(
    "/{document_id}/extract",
    response_model=ExtractDocumentResponse,
)
def extract_document_endpoint(
    document_id: UUID,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user),
):
    try:
        return extract_document(
            db,
            document_id,
            user_id=user_id,
        )

    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Document extraction failed",
        )


@router.post("/{document_id}/process")
def process_document_endpoint(
    document_id: UUID,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user),
):
    try:
        return process_document(
            db,
            document_id,
            user_id=user_id,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Document processing failed",
        )


@router.delete("/{document_id}")
def delete_document_endpoint(
    document_id: UUID,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user),
):
    try:
        return remove_document(
            db,
            document_id,
            user_id,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Document deletion failed",
        )
