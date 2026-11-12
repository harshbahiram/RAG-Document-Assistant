
import pymupdf


MAX_PDF_PAGES = 500
MAX_EXTRACTED_CHARS = 5_000_000


def extract_pdf_text(pdf_content: bytes):
    """
    Extract text from a PDF page by page with basic resource limits.
    """

    if not pdf_content:
        raise ValueError("PDF file is empty.")

    extracted_pages = []
    total_chars = 0

    try:
        with pymupdf.open(
            stream=pdf_content,
            filetype="pdf"
        ) as pdf:

            if pdf.is_encrypted:
                raise ValueError(
                    "Password-protected PDFs are not supported."
                )

            if len(pdf) == 0:
                raise ValueError("PDF contains no pages.")

            if len(pdf) > MAX_PDF_PAGES:
                raise ValueError(
                    f"PDF exceeds the maximum limit of "
                    f"{MAX_PDF_PAGES} pages."
                )

            for page_number, page in enumerate(pdf, start=1):

                page_text = page.get_text("text").strip()

                total_chars += len(page_text)

                if total_chars > MAX_EXTRACTED_CHARS:
                    raise ValueError(
                        "PDF contains too much extractable text."
                    )

                if page_text:
                    extracted_pages.append({
                        "page_number": page_number,
                        "text": page_text
                    })

    except ValueError:
        raise

    except Exception as error:
        raise ValueError(
            "Unable to read this PDF. It may be corrupted or invalid."
        ) from error

    return extracted_pages
