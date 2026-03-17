from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.deps import get_admin_user, get_current_user
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import UserOut

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return current_user


@router.get("/", response_model=List[UserOut])
async def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """[Admin only] List all users."""
    return db.query(User).all()


@router.patch("/{user_id}/deactivate", response_model=UserOut)
async def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """[Admin only] Deactivate a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user
