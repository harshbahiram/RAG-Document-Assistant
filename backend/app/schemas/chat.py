from pydantic import BaseModel, Field
from uuid import UUID


class AskQuestionRequest(BaseModel):
    question: str = Field(
        min_length=1,
        max_length=2000
    )
    document_id: UUID | None = None
    match_count: int = Field(
        default=5,
        ge=1,
        le=20
    )


class SourceResponse(BaseModel):
    source: str
    document_id: str
    page_number: int
    chunk_id: int
    similarity: float


class AskQuestionResponse(BaseModel):
    question: str
    answer: str
    sources: list[SourceResponse]   