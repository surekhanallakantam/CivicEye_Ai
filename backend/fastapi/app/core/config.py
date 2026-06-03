import os


class Settings:
    def __init__(self) -> None:
        self.supabase_url = os.getenv("SUPABASE_URL", "")
        self.supabase_anon_key = os.getenv("SUPABASE_ANON_KEY", "")
        self.supabase_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        self.supabase_db_url = os.getenv("SUPABASE_DB_URL", "")
        # AI_PROVIDER: 'gemini' or 'huggingface' — fallback to 'gemini'
        self.ai_provider = os.getenv("AI_PROVIDER", "gemini")

        # Optional provider-specific keys
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.hf_api_key = os.getenv("HF_API_KEY", "")
        # GROQ provider settings
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")
        self.groq_endpoint = os.getenv("GROQ_ENDPOINT", "")


settings = Settings()
