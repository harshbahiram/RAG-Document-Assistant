from uuid import UUID

from sqlalchemy.orm import Session

from app.services.retrieval_service import retrieve_relevant_chunks
from app.services.gemini_service import generate_response


def answer_question(
    db: Session,
    question: str,
    match_count: int = 5,
    document_id: UUID | None = None
):
    if not question or not question.strip():
        raise ValueError("Question cannot be empty.")

    chunks = retrieve_relevant_chunks(
        db=db,
        question=question,
        match_count=match_count,
        document_id=document_id
    )

    if not chunks:
        return {
            "question": question,
            "answer": "I couldn't find relevant information in the uploaded documents.",
            "sources": []
        }

    context_parts = []
    sources = []

    for index, chunk in enumerate(chunks, start=1):
        source_label = f"S{index}"

        context_parts.append(
            f"[{source_label} | Page {chunk['page_number']}]\n"
            f"{chunk['content']}"
        )

        sources.append({
            "source": source_label,
            "document_id": chunk["document_id"],
            "page_number": chunk["page_number"],
            "chunk_id": chunk["chunk_id"],
            "similarity": chunk["similarity"]
        })

    context = "\n\n".join(context_parts)

    prompt = f"""
    You are a document question-answering assistant.
    
    Answer the user's question using ONLY the provided document context.
    
    Rules:
    1. Do not invent facts or use outside knowledge.
    2. If the context does not contain the answer, clearly say so.
    3. Provide a clear and direct answer.
    4. Cite supporting information using source labels such as [S1] or [S2].
    5. Do not cite sources that do not support your answer.
    
    DOCUMENT CONTEXT:
    {context}
    
    USER QUESTION:
    {question}
    
    ANSWER:
    """
    answer = generate_response(prompt)

    return {
        "question": question,
        "answer": answer,
        "sources": sources
    }