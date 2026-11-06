from google import genai

from app.core.config import GEMINI_API_KEY, GEMINI_MODEL


def get_gemini_client():
    return genai.Client(api_key=GEMINI_API_KEY)


def generate_response(prompt: str) -> str:
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty.")

    client = get_gemini_client()

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    return response.text.strip()