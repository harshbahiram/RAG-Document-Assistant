
from uuid import UUID

from app.db.database import SessionLocal
from app.db.models import DocumentChunk
from app.services.document_processing_service import extract_document
from app.services.chunking_service import chunk_document_pages
from app.services.embedding_service import generate_embeddings
from app.services.chunk_storage_service import save_document_chunks


DOCUMENT_ID = "a020ea16-acc4-4c63-b707-0eef27f73e2e"

def main():
    document_id = UUID(DOCUMENT_ID)
    db = SessionLocal()

    try:
        print("Extracting PDF...")
        extracted = extract_document(db, document_id)

        print("Generating chunks...")
        chunks = chunk_document_pages(extracted["pages"])

        print("Total chunks:", len(chunks))

        print("Generating embeddings...")
        embeddings = generate_embeddings(
            [chunk["content"] for chunk in chunks]
        )

        print("Total embeddings:", len(embeddings))

        print("Saving chunks to database...")
        saved_count = save_document_chunks(
            db,
            document_id,
            chunks,
            embeddings
        )

        stored_count = (
            db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == document_id)
            .count()
        )

        print("Saved chunks:", saved_count)
        print("Database chunks:", stored_count)

        assert saved_count == len(chunks)
        assert stored_count == len(chunks)

        print("\nSUCCESS: Chunks and embeddings stored successfully!")

    except Exception as error:
        print("\nTEST FAILED:", error)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
