import os

class Settings:
    PROJECT_NAME: str = "DocIntel AI"
    API_V1_STR: str = "/api"
    
    # API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Vector Database / Storage configuration
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", os.path.join(os.path.dirname(__file__), "..", "storage"))
    DEMO_DIR: str = os.getenv("DEMO_DIR", os.path.join(os.path.dirname(__file__), "..", "demo_data"))
    
    # Chunking options
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "600"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "100"))
    
    # RAG parameters
    TOP_K_RESULTS: int = int(os.getenv("TOP_K_RESULTS", "5"))
    UNCERTAINTY_THRESHOLD: float = float(os.getenv("UNCERTAINTY_THRESHOLD", "0.15"))
    
    # Supabase / Postgres optional config
    POSTGRES_URL: str = os.getenv("POSTGRES_URL", "")

settings = Settings()

# Ensure directories exist
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
os.makedirs(settings.DEMO_DIR, exist_ok=True)
