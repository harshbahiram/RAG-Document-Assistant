
import logging

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user
from app.schemas.chat import (
    AskQuestionRequest,
    AskQuestionResponse,
)
from app.services.rag_service import answer_question

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/chat",
    tags=["Chat"],
)


@router.post(
    "/ask",
    response_model=AskQuestionResponse,
)
def ask_question(
    request: AskQuestionRequest,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user),
):
    try:
        result = answer_question(
            db=db,
            question=request.question,
            user_id=user_id,
            match_count=request.match_count,
            document_id=request.document_id,
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except Exception:
        logger.exception(
            "RAG question-answering failed"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to generate an answer",
        )
