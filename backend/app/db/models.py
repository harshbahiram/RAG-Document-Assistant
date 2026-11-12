
import uuid

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Identity,
    Integer,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import mapped_column

from pgvector.sqlalchemy import Vector

from app.db.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()")
    )

    user_id = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        index=True
    )

    filename = mapped_column(Text, nullable=False)

    storage_bucket = mapped_column(
        Text, nullable=False, server_default=text("'documents'")
    )

    storage_path = mapped_column(
        Text, nullable=False, unique=True
    )

    mime_type = mapped_column(
        Text, nullable=False, server_default=text("'application/pdf'")
    )

    file_size = mapped_column(BigInteger, nullable=False)

    status = mapped_column(
        Text, nullable=False, server_default=text("'processing'")
    )

    error_message = mapped_column(Text, nullable=True)

    created_at = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("NOW()")
    )

    updated_at = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("NOW()")
    )

    __table_args__ = (
        CheckConstraint(
            "file_size > 0",
            name="documents_file_size_positive"
        ),
        CheckConstraint(
            "status IN ('processing', 'completed', 'failed')",
            name="documents_status_check"
        ),
    )


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = mapped_column(
        BigInteger,
        Identity(always=True),
        primary_key=True
    )

    document_id = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False
    )

    content = mapped_column(Text, nullable=False)
    page_number = mapped_column(Integer, nullable=False)
    chunk_index = mapped_column(Integer, nullable=False)

    embedding = mapped_column(Vector(384), nullable=False)

    created_at = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("NOW()")
    )

    __table_args__ = (
        CheckConstraint(
            "page_number >= 1",
            name="valid_page_number"
        ),
        CheckConstraint(
            "chunk_index >= 0",
            name="valid_chunk_index"
        ),
        UniqueConstraint(
            "document_id",
            "chunk_index",
            name="unique_document_chunk"
        ),
    )
