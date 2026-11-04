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