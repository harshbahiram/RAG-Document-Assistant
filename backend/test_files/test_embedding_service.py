from app.services.embedding_service import generate_embeddings


def main():
    texts = [
        "Artificial intelligence is changing technology.",
        "Machine learning is a branch of artificial intelligence."
    ]

    embeddings = generate_embeddings(texts)

    print("Number of embeddings:", len(embeddings))

    for index, embedding in enumerate(embeddings):
        print(f"Embedding {index + 1} dimensions:", len(embedding))
        print("First five values:", embedding[:5])

    assert len(embeddings) == 2
    assert all(len(embedding) == 384 for embedding in embeddings)

    print("\nSUCCESS: Embedding test passed!")


if __name__ == "__main__":
    main()