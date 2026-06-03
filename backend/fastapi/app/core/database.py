from .config import settings


def get_supabase_db_url() -> str:
    return settings.supabase_db_url


def is_database_configured() -> bool:
    return bool(settings.supabase_db_url)
