
from uuid import UUID

from app.db.database import SessionLocal
from app.services.document_processing_service import extract_document
from app.services.chunking_service import chunk_document_pages

DOCUMENT_ID = "a020ea16-acc4-4c63-b707-0eef27f73e2e"


def main():
    db = SessionLocal()

    try:
        extracted = extract_document(db, UUID(DOCUMENT_ID))

        pages = extracted["pages"]

        chunks = chunk_document_pages(pages)

        print("\n========== DOCUMENT DETAILS ==========")
        print("Filename:", extracted["filename"])
        print("Pages containing text:", extracted["page_count"])
        print("Total characters:", extracted["total_characters"])
        print("Total chunks:", len(chunks))

        print("\n========== CHUNK DETAILS ==========")

        for chunk in chunks:
            print("\n----------------------------")
            print("Chunk index:", chunk["chunk_index"])
            print("Page number:", chunk["page_number"])
            print("Token count:", chunk["token_count"])
            print("Content:", chunk["content"][:300])

        assert all(c["token_count"] <= 180 for c in chunks)
        assert [c["chunk_index"] for c in chunks] == list(range(len(chunks)))

        extracted_page_numbers = {p["page_number"] for p in pages}
        assert all(
            c["page_number"] in extracted_page_numbers for c in chunks
        )

        print("\nSUCCESS: PDF chunking validation passed!")

    finally:
        db.close()


if __name__ == "__main__":
    main()
