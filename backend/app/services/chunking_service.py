
from functools import lru_cache
from transformers import AutoTokenizer


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Leave room for special tokens added by the embedding model.
CHUNK_SIZE = 180
CHUNK_OVERLAP = 30


@lru_cache(maxsize=1)
def load_tokenizer():
    """Load and cache the tokenizer used by the embedding model."""
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    tokenizer.model_max_length = 10**9
    return tokenizer



def chunk_document_pages(
    pages: list[dict],
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> list[dict]:

    if chunk_size <= 0:
        raise ValueError("Chunk size must be greater than zero.")

    if overlap < 0 or overlap >= chunk_size:
        raise ValueError(
            "Overlap must be non-negative and smaller than chunk size."
        )

    tokenizer = load_tokenizer()
    chunks = []
    chunk_index = 0

    for page in pages:
        page_number = page["page_number"]
        text = page["text"].strip()

        if not text:
            continue

        encoded = tokenizer(
            text,
            add_special_tokens=False,
            return_offsets_mapping=True
        )

        token_ids = encoded["input_ids"]
        offsets = encoded["offset_mapping"]

        start = 0

        while start < len(token_ids):
            end = min(start + chunk_size, len(token_ids))

            char_start = offsets[start][0]
            char_end = offsets[end - 1][1]

            chunk_text = text[char_start:char_end].strip()

            if chunk_text:
                chunks.append({
                    "chunk_index": chunk_index,
                    "page_number": page_number,
                    "content": chunk_text,
                    "token_count": end - start
                })
                chunk_index += 1

            if end == len(token_ids):
                break

            start = end - overlap

    return chunks
