import fitz


def extract_pdf_text(pdf_content: bytes):
    """
    Extract text from a PDF page by page.
    """

    extracted_pages = []

    with fitz.open(
        stream=pdf_content,
        filetype="pdf"
    ) as pdf:

        for page_number, page in enumerate(pdf, start=1):

            text = page.get_text("text").strip()

            if text:
                extracted_pages.append({
                    "page_number": page_number,
                    "text": text
                })

    return extracted_pages