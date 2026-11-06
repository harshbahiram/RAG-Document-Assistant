
from app.services.chunking_service import chunk_document_pages


sample_pages = [
    {
        "page_number": 1,
        "text": """
        Artificial Intelligence is a branch of computer science.
        It focuses on building systems that can perform tasks
        that normally require human intelligence.
        """ * 30
    },
    {
        "page_number": 2,
        "text": """
        Machine Learning is a subset of Artificial Intelligence.
        It allows systems to learn patterns from data.
        """ * 20
    }
]

chunks = chunk_document_pages(sample_pages)

print("Total chunks:", len(chunks))

for chunk in chunks:
    print("\n----------------------------")
    print("Chunk index:", chunk["chunk_index"])
    print("Page number:", chunk["page_number"])
    print("Token count:", chunk["token_count"])
    print("Content:", chunk["content"][:200])
