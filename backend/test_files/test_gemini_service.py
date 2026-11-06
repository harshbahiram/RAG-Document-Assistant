from app.services.gemini_service import generate_response

response = generate_response(
    "Explain what Retrieval-Augmented Generation (RAG) is in three sentences."
)

print("\n========== GEMINI RESPONSE ==========")
print(response)
print("\nSUCCESS: Gemini API test passed!")