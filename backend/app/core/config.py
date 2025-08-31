from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # Application
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = "sqlite:///./artison.db"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]
    
    # Frontend URL
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_CONNECT_WEBHOOK_SECRET: str = ""
    
    # Support settings
    MINIMUM_SUPPORT_AMOUNT: int = 150  # 150 yen
    PLATFORM_FEE_PERCENT: float = 10.0  # 10% platform fee
    
    class Config:
        env_file = ".env"
        
        @staticmethod
        def parse_env_var(field_name: str, raw_val: str):
            # Handle CORS_ORIGINS as JSON
            if field_name == 'CORS_ORIGINS':
                try:
                    return json.loads(raw_val)
                except json.JSONDecodeError:
                    # Fallback to comma-separated
                    return [origin.strip() for origin in raw_val.split(",")]
            return raw_val


settings = Settings()
