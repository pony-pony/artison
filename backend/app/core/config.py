from pydantic_settings import BaseSettings
from typing import List
import json
import os


class Settings(BaseSettings):
    # Application
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = "sqlite:///./artison.db"
    
    # CORS - 環境変数から直接JSONをパース
    @property
    def CORS_ORIGINS(self) -> List[str]:
        cors_env = os.getenv("CORS_ORIGINS", '["http://localhost:5173"]')
        try:
            return json.loads(cors_env)
        except json.JSONDecodeError:
            # JSONパースに失敗した場合、カンマ区切りの文字列として処理
            return [origin.strip() for origin in cors_env.split(",")]
    
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


settings = Settings()
