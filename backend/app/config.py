from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Union, Any

class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # AI
    GEMINI_API_KEY: str
    
    # Slack (optional)
    SLACK_WEBHOOK_URL: str = ""
    
    # CORS
    CORS_ORIGINS: Any = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"]
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except:
                    pass
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return [v]
    
    model_config = SettingsConfigDict(
        env_file = ".env",
        case_sensitive = True,
        extra = "ignore"
    )

settings = Settings()
