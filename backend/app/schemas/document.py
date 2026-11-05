from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

class DocumentResponse(BaseModel):
    id: UUID
    filename: str
    file_size: int
    mime_type: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ExtractDocumentResponse(BaseModel):
    document_id: UUID
    filename: str
    page_count: int
    total_characters: int
    preview: list[dict]