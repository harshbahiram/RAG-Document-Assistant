from app.core.supabase import supabase

try:
    bucket = supabase.storage.get_bucket("documents")

    print("Bucket found!")
    print("Bucket name:", bucket.name)
    print("Public:", bucket.public)

except Exception as error:
    print("Bucket access failed:", repr(error))