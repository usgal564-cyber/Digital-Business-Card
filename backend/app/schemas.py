from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    phone: str
    name: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = "male"
    email: Optional[str] = None
    location: Optional[str] = None
    facebook: Optional[str] = None
    wiber: Optional[str] = None
    website: Optional[str] = None
    profile_image: Optional[str] = None
    background_image: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    facebook: Optional[str] = None
    wiber: Optional[str] = None
    website: Optional[str] = None
    profile_image: Optional[str] = None
    background_image: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# QR Design Schemas
class QRDesignBase(BaseModel):
    qr_color: str = "#1a1a2e"
    qr_bg_color: str = "#ffffff"
    qr_size: int = 150
    qr_logo: Optional[str] = None

class QRDesignCreate(QRDesignBase):
    user_id: int

class QRDesignUpdate(BaseModel):
    qr_color: Optional[str] = None
    qr_bg_color: Optional[str] = None
    qr_size: Optional[int] = None
    qr_logo: Optional[str] = None

class QRDesignResponse(QRDesignBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Login Schemas
class LoginRequest(BaseModel):
    phone: str

class LoginResponse(BaseModel):
    token: str
    user: UserResponse

# Card Data Schema
class CardDataResponse(BaseModel):
    user: UserResponse
    qr_design: Optional[QRDesignResponse] = None
    vcf_content: str
    text_content: str