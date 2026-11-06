
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services.embedding_service import generate_embeddings


def retrieve_relevant_chunks(
    db: Session,
    question: str,
    match_count: int = 5,
    document_id: UUID | None = None
):
    if not question or not question.strip():
        raise ValueError("Question cannot be empty.")

    if match_count <= 0:
        raise ValueError("match_count must be greater than zero.")

    query_embedding = generate_embeddings([question.strip()])[0]

    # Convert embedding into pgvector-compatible input.
    embedding_string = "[" + ",".join(
        str(value) for value in query_embedding
    ) + "]"

    sql = text("""
        SELECT *
        FROM public.match_document_chunks(
            CAST(:query_embedding AS extensions.vector(384)),
            :match_count,
            CAST(:filter_document_id AS UUID)
        )
    """)

    results = db.execute(
        sql,
        {
            "query_embedding": embedding_string,
            "match_count": match_count,
            "filter_document_id": (
                str(document_id) if document_id else None
            )
        }
    ).mappings().all()

    return [
        {
            "chunk_id": row["id"],
            "document_id": str(row["document_id"]),
            "content": row["content"],
            "page_number": row["page_number"],
            "chunk_index": row["chunk_index"],
            "similarity": float(row["similarity"])
        }
        for row in results
    ]
