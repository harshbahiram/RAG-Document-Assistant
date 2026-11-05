from app.core.supabase import supabase
from app.core.config import SUPABASE_BUCKET_NAME


def upload_pdf(file_path: str, file_content: bytes):
    """
    Upload a PDF to Supabase Storage.
    """

    response = supabase.storage.from_(
        SUPABASE_BUCKET_NAME
    ).upload(
        path=file_path,
        file=file_content,
        file_options={
            "content-type": "application/pdf",
            "upsert": "false"
        }
    )

    return response

def download_pdf(file_path: str):
    """
    Download a PDF from Supabase Storage.
    """

    response = supabase.storage.from_(
        SUPABASE_BUCKET_NAME
    ).download(file_path)

    return response


def delete_pdf(file_path: str):
    """
    Delete a PDF from Supabase Storage.
    """

    response = supabase.storage.from_(
        SUPABASE_BUCKET_NAME
    ).remove([file_path])

    return response