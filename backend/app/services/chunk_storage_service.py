
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import Document, DocumentChunk


def save_document_chunks(
    db: Session,
    document_id: UUID,
    user_id: UUID,
    chunks: list[dict],
    embeddings: list[list[float]],
):
    if len(chunks) != len(embeddings):
        raise ValueError(
            "Number of chunks and embeddings must match."
        )

    if not chunks:
        raise ValueError("No chunks available to save.")

    for embedding in embeddings:
        if len(embedding) != 384:
            raise ValueError(
                "Each embedding must contain exactly 384 dimensions."
            )

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

    try:
        db.query(DocumentChunk).filter(
            DocumentChunk.document_id == document_id
        ).delete(synchronize_session=False)

        records = [
            DocumentChunk(
                document_id=document_id,
                content=chunk["content"],
                page_number=chunk["page_number"],
                chunk_index=chunk["chunk_index"],
                embedding=embedding,
            )
            for chunk, embedding in zip(chunks, embeddings)
        ]

        db.add_all(records)

        document.status = "completed"
        document.error_message = None

        db.commit()

        return len(records)

    except Exception:
        db.rollback()
        raise
