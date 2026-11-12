import time
from app.services.embedding_service import generate_embeddings

texts = [
    "This is a sample document for testing embedding performance."
] * 100

generate_embeddings(texts)

start = time.perf_counter()

embeddings = generate_embeddings(texts)

elapsed = time.perf_counter() - start

print("Number of embeddings:", len(embeddings))
print("Warm-up embedding time:", round(elapsed, 3), "seconds")
print("Average per embedding:", round(elapsed / len(embeddings), 5), "seconds")