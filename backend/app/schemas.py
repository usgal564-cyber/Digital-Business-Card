from pydantic import BaseModel
from typing import Optional, List
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
    instagram: Optional[str] = None
    wiber: Optional[str] = None
    website: Optional[str] = None
    profile_image: Optional[str] = None
    background_image: Optional[str] = None
    # Картын харагдах загвар: neumorphic / cyber / abstract / glass
    card_design: Optional[str] = "neumorphic"

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
    instagram: Optional[str] = None
    wiber: Optional[str] = None
    website: Optional[str] = None
    profile_image: Optional[str] = None
    background_image: Optional[str] = None
    card_design: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_admin: bool = False
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
    dot_style: Optional[str] = None
    eye_style: Optional[str] = None
    corner_frame_color: Optional[str] = None
    corner_dot_color: Optional[str] = None
    add_white_frame: Optional[bool] = False
    frame_color: Optional[str] = None

class QRDesignCreate(QRDesignBase):
    user_id: int

class QRDesignUpdate(BaseModel):
    qr_color: Optional[str] = None
    qr_bg_color: Optional[str] = None
    qr_size: Optional[int] = None
    qr_logo: Optional[str] = None
    dot_style: Optional[str] = None
    eye_style: Optional[str] = None
    corner_frame_color: Optional[str] = None
    corner_dot_color: Optional[str] = None
    add_white_frame: Optional[bool] = None
    frame_color: Optional[str] = None

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


# --- Статистик (QR уншуулалт / товч дарсан) ---

class TrackEventRequest(BaseModel):
    # "scan" эсвэл "click"
    type: str
    label: Optional[str] = None
    href: Optional[str] = None
    referrer: Optional[str] = None
    user_agent: Optional[str] = None


class CardScanEventResponse(BaseModel):
    id: int
    created_at: datetime
    location: Optional[str] = None
    device: Optional[str] = None
    browser: Optional[str] = None
    referrer: Optional[str] = None
    source: Optional[str] = None

    class Config:
        from_attributes = True


class CardClickEventResponse(BaseModel):
    id: int
    created_at: datetime
    label: str
    href: Optional[str] = None
    location: Optional[str] = None
    device: Optional[str] = None

    class Config:
        from_attributes = True


class ClickLabelCount(BaseModel):
    label: str
    count: int


class CardAnalyticsSummary(BaseModel):
    total_scans: int
    unique_visitors: int
    total_clicks: int
    clicks_by_label: List[ClickLabelCount]
    recent_scans: List[CardScanEventResponse]
    recent_clicks: List[CardClickEventResponse]


# --- Карт захиалга ---

class OrderCreate(BaseModel):
    # "qr" (QR код) эсвэл "card" (хэвлэмэл карт)
    order_type: str
    # order_type == "qr" vед заавал: "phone" (утсан дээр) эсвэл "physical" (биетээр)
    qr_subtype: Optional[str] = None
    # order_type == "card" vед заавал: "vertical" эсвэл "horizontal"
    card_orientation: Optional[str] = None
    contact_phone: Optional[str] = None
    quantity: int = 1
    address: Optional[str] = None
    note: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    order_type: str
    qr_subtype: Optional[str] = None
    card_orientation: Optional[str] = None
    price: int
    contact_phone: Optional[str] = None
    quantity: int
    address: Optional[str] = None
    note: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AdminOrderResponse(BaseModel):
    id: int
    order_type: str
    qr_subtype: Optional[str] = None
    card_orientation: Optional[str] = None
    price: int
    contact_phone: Optional[str] = None
    quantity: int
    address: Optional[str] = None
    note: Optional[str] = None
    status: str
    created_at: datetime
    # Admin-ийн /admin хуудсанд захиалагчийн БОДИТ картыг (CardPreview) болон
    # QR-ийг шууд зурж харуулахын тулд бvтэн User болон QRDesign-ийг хамт
    # буцаана.
    user: UserResponse
    qr_design: Optional[QRDesignResponse] = None

    class Config:
        from_attributes = True


class AdminClaimRequest(BaseModel):
    secret: str


class OrderStatusUpdate(BaseModel):
    status: str
