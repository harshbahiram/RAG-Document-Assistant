import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY"
)
SUPABASE_BUCKET_NAME = os.getenv(
    "SUPABASE_BUCKET_NAME",
    "documents"
)

required_variables = {
    "DATABASE_URL": DATABASE_URL,
    "SUPABASE_URL": SUPABASE_URL,
    "SUPABASE_SERVICE_ROLE_KEY": SUPABASE_SERVICE_ROLE_KEY
}

missing = [
    name for name, value in required_variables.items()
    if not value
]

if missing:
    raise RuntimeError(
        f"Missing environment variables: {', '.join(missing)}"
    )