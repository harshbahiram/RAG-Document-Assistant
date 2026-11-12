from pathlib import Path

from app.services.pdf_service import extract_pdf_text

pdf_path = Path("test_files/sample.pdf")

if not pdf_path.exists():
    raise FileNotFoundError(f"PDF not found: {pdf_path}")

pdf_content = pdf_path.read_bytes()

pages = extract_pdf_text(pdf_content)

print("Total pages containing extractable text:", len(pages))

for page in pages:
    print(f"\n--- Page {page['page_number']} ---")
    print(page["text"][:500])