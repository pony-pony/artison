from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.api.deps import get_current_active_user
from app.domains.auth import schemas, service
from app.domains.auth.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.User)
def register(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    try:
        # 引数名を修正: user -> user_create
        return service.create_user(db=db, user_create=user_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=schemas.Token)
def login(
    credentials: schemas.LoginCredentials,
    db: Session = Depends(get_db)
):
    user = service.authenticate_user(
        db, 
        email=credentials.email, 
        password=credentials.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = service.create_token(user.id)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.User)
def get_current_user(
    current_user: User = Depends(get_current_active_user)
):
    return current_user
