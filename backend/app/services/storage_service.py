
from uuid import UUID

from app.core.supabase import supabase
from app.core.config import SUPABASE_BUCKET_NAME


def _validate_storage_path(file_path: str):

    try:
        filename = file_path.removesuffix(".pdf")
        UUID(filename)
    except (ValueError, AttributeError):
        raise ValueError("Invalid document storage path.")

    if not file_path.endswith(".pdf"):
        raise ValueError("Only PDF storage paths are allowed.")


def upload_pdf(file_path: str, file_content: bytes):
    _validate_storage_path(file_path)

    return supabase.storage.from_(
        SUPABASE_BUCKET_NAME
    ).upload(
        path=file_path,
        file=file_content,
        file_options={
            "content-type": "application/pdf",
            "upsert": "false",
        },
    )


def download_pdf(file_path: str):
    _validate_storage_path(file_path)

    return supabase.storage.from_(
        SUPABASE_BUCKET_NAME
    ).download(file_path)


def delete_pdf(file_path: str):
    _validate_storage_path(file_path)

    return supabase.storage.from_(
        SUPABASE_BUCKET_NAME
    ).remove([file_path])
