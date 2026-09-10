from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime, timedelta
import secrets

# User CRUD
def get_user_by_phone(db: Session, phone: str):
    return db.query(models.User).filter(models.User.phone == phone).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

# QR Design CRUD
def get_qr_design_by_user(db: Session, user_id: int):
    return db.query(models.QRDesign).filter(models.QRDesign.user_id == user_id).first()

def create_qr_design(db: Session, qr_design: schemas.QRDesignCreate):
    db_qr = models.QRDesign(**qr_design.dict())
    db.add(db_qr)
    db.commit()
    db.refresh(db_qr)
    return db_qr

def update_qr_design(db: Session, user_id: int, qr_update: schemas.QRDesignUpdate):
    db_qr = get_qr_design_by_user(db, user_id)
    if not db_qr:
        return None
    
    update_data = qr_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_qr, key, value)
    
    db.commit()
    db.refresh(db_qr)
    return db_qr

# Session CRUD
def create_session(db: Session, user_id: int, expires_minutes: int = 30):
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=expires_minutes)
    
    db_session = models.Session(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_session_by_token(db: Session, token: str):
    return db.query(models.Session).filter(
        models.Session.token == token,
        models.Session.expires_at > datetime.utcnow()
    ).first()

# Generate VCF content
def generate_vcf(user: models.User):
    return f"""BEGIN:VCARD
VERSION:3.0
FN:{user.name or ''}
N:{user.name or ''};;;;
ORG:{user.company or ''}
TITLE:{user.title or ''}
TEL;TYPE=CELL:{user.phone}
EMAIL:{user.email or ''}
ADR:{user.location or ''}
URL:{user.website or ''}
NOTE:Facebook: {user.facebook or ''} | Wiber: {user.wiber or ''}
END:VCARD"""

# Generate Text content
def generate_text_content(user: models.User):
    return f"""========================================
    DIGITAL BUSINESS CARD
========================================
NAME    : {user.name or ''}
TITLE   : {user.title or ''}
COMPANY : {user.company or ''}
PHONE   : {user.phone or ''}
EMAIL   : {user.email or ''}
LOCATION: {user.location or ''}
WEBSITE : {user.website or ''}
FACEBOOK: {user.facebook or ''}
WIBER   : {user.wiber or ''}
========================================
    SCAN QR CODE TO SAVE
========================================"""