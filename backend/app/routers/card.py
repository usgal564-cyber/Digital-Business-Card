from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db
from ..auth import get_current_user
from ..models import User

router = APIRouter(prefix="/api/card", tags=["card"])

@router.get("/qr-design", response_model=schemas.QRDesignResponse)
async def get_qr_design(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    qr_design = crud.get_qr_design_by_user(db, current_user.id)
    if not qr_design:
        qr_create = schemas.QRDesignCreate(user_id=current_user.id)
        qr_design = crud.create_qr_design(db, qr_create)
    return qr_design

@router.put("/qr-design", response_model=schemas.QRDesignResponse)
async def update_qr_design(
    qr_update: schemas.QRDesignUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    qr_design = crud.update_qr_design(db, current_user.id, qr_update)
    if not qr_design:
        qr_create = schemas.QRDesignCreate(user_id=current_user.id, **qr_update.dict(exclude_unset=True))
        qr_design = crud.create_qr_design(db, qr_create)
    return qr_design

@router.get("/vcf")
async def download_vcf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vcf_content = crud.generate_vcf(current_user)
    return {
        "content": vcf_content,
        "filename": f"{current_user.name or 'contact'}.vcf"
    }

@router.get("/text")
async def get_text_content(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    text_content = crud.generate_text_content(current_user)
    return {"content": text_content}