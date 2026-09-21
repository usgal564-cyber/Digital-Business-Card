import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db
from ..auth import get_current_user
from ..models import User

router = APIRouter(prefix="/api/user", tags=["user"])

@router.get("/me", response_model=schemas.UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
async def update_current_user(
    user_update: schemas.UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_user = crud.update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.get("/me/card-data")
async def get_card_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    qr_design = crud.get_qr_design_by_user(db, current_user.id)
    vcf = crud.generate_vcf(current_user)
    text = crud.generate_text_content(current_user)
    
    return {
        "user": current_user,
        "qr_design": qr_design,
        "vcf_content": vcf,
        "text_content": text
    }

@router.get("/{user_id}/public")
async def get_public_card(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    vcf = crud.generate_vcf(user)

    return {
        "user": user,
        "vcf_content": vcf,
    }


@router.post("/me/claim-admin", response_model=schemas.UserResponse)
async def claim_admin(
    payload: schemas.AdminClaimRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Нэг удаагийн admin эрх авах route. Render дээрх орчны хувьсагч
    ADMIN_SECRET-тэй ижил утга илгээвэл одоогийн нэвтэрсэн хэрэглэгчийг
    admin болгоно. Ашигласны дараа ADMIN_SECRET-ийг устгах/солихыг зөвлөж
    байна (аюулгvй байдлын vvднээс).
    """
    expected = os.getenv("ADMIN_SECRET")
    if not expected or payload.secret != expected:
        raise HTTPException(status_code=403, detail="Буруу secret")

    current_user.is_admin = 1
    db.commit()
    db.refresh(current_user)
    return current_user