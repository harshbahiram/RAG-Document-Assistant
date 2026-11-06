
from sqlalchemy.orm import Session

from app.db.models import Document, DocumentChunk


def save_document_chunks(
    db: Session,
    document_id,
    chunks: list[dict],
    embeddings: list[list[float]]
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

    document = db.get(Document, document_id)

    if not document:
        raise ValueError("Document not found.")

    try:
        # Remove existing chunks inside the same transaction.
        db.query(DocumentChunk).filter(
            DocumentChunk.document_id == document_id
        ).delete(synchronize_session=False)

        records = [
            DocumentChunk(
                document_id=document_id,
                content=chunk["content"],
                page_number=chunk["page_number"],
                chunk_index=chunk["chunk_index"],
                embedding=embedding
            )
            for chunk, embedding in zip(chunks, embeddings)
        ]

        db.add_all(records)

        # Update status in the same transaction.
        document.status = "completed"
        document.error_message = None

        db.commit()

        return len(records)

    except Exception:
        db.rollback()
        raise
