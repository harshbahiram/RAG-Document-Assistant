from sqlalchemy import text
from app.db.database import SessionLocal

DOCUMENT_ID = "a020ea16-acc4-4c63-b707-0eef27f73e2e"

CHUNK_IDS = [277, 347, 351]

db = SessionLocal()

try:
    for chunk_id in CHUNK_IDS:
        print(f"\n{'=' * 70}")
        print(f"NEIGHBOURING CHUNKS FOR ID: {chunk_id}")

        query = text("""
            WITH target AS (
                SELECT chunk_index
                FROM public.document_chunks
                WHERE id = :chunk_id
                  AND document_id = CAST(:document_id AS UUID)
            )
            SELECT c.id, c.page_number, c.chunk_index, c.content
            FROM public.document_chunks c
            CROSS JOIN target t
            WHERE c.document_id = CAST(:document_id AS UUID)
              AND c.chunk_index BETWEEN t.chunk_index - 1
                                    AND t.chunk_index + 1
            ORDER BY c.chunk_index
        """)

        rows = db.execute(
            query,
            {
                "chunk_id": chunk_id,
                "document_id": DOCUMENT_ID
            }
        ).mappings().all()

        for row in rows:
            print(f"\nChunk: {row['id']}")
            print(f"Page: {row['page_number']}")
            print(f"Index: {row['chunk_index']}")
            print(row["content"])

finally:
    db.close()