import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.chat import (
    AskQuestionRequest,
    AskQuestionResponse
)
from app.services.rag_service import answer_question

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/chat",
    tags=["Chat"]
)


@router.post("/ask", response_model=AskQuestionResponse)
def ask_question(
    request: AskQuestionRequest,
    db: Session = Depends(get_db)
):
    try:
        result = answer_question(
            db=db,
            question=request.question,
            match_count=request.match_count,
            document_id=request.document_id
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        logger.exception("RAG question-answering failed")

        raise HTTPException(
            status_code=500,
            detail="Failed to generate an answer"
        )