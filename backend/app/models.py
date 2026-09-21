from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base  # ЭНЭ ЗӨВ АЖИЛЛАХ ЁСТОЙ

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100))
    title = Column(String(100))
    company = Column(String(100))
    age = Column(Integer)
    gender = Column(String(10), default="male")
    email = Column(String(255))
    location = Column(String(255))
    facebook = Column(String(255))
    instagram = Column(String(255))
    wiber = Column(String(100))
    website = Column(String(255))
    profile_image = Column(Text)
    background_image = Column(Text)
    # Хэрэглэгчийн сонгосон картын харагдах загвар (neumorphic / cyber / abstract / glass).
    # /card хуудсанд сонгож "Хадгалах" дарахад энд хадгалагдана, /c/[id] дээр
    # зочдод харагдана.
    card_design = Column(String(20), default="neumorphic", server_default="neumorphic")
    # Зөвхөн admin эрхтэй хэрэглэгч захиалгын жагсаалтыг (/analytics) харна.
    # DB-д гар аргаар шинэчлэх эсвэл нэг удаагийн /api/user/me/claim-admin
    # route-оор (ADMIN_SECRET-тэй) идэвхжvvлнэ.
    is_admin = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    qr_design = relationship("QRDesign", back_populates="user", uselist=False)
    sessions = relationship("Session", back_populates="user")

class QRDesign(Base):
    __tablename__ = "qr_designs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    qr_color = Column(String(7), default="#1a1a2e")
    qr_bg_color = Column(String(7), default="#ffffff")
    qr_size = Column(Integer, default=150)
    qr_logo = Column(Text)
    # Frontend-ийн /design хуудсанд ашиглагддаг боловч өмнө нь энд байгаагvй
    # байсан баганууд — эдгээр дутуу байснаас "зөвхөн өнгө хадгалагдаад,
    # QR-ийн хэлбэр/хvрээний тохиргоо хадгалагдахгvй" гэсэн алдаа гарч байв.
    dot_style = Column(String(30))
    eye_style = Column(String(30))
    corner_frame_color = Column(String(7))
    corner_dot_color = Column(String(7))
    add_white_frame = Column(Integer, default=0)  # SQLite boolean -> 0/1
    frame_color = Column(String(7))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="qr_design")


class CardScan(Base):
    """QR код уншуулалт (хуудас нээгдэх) бvр бvртгэгдэнэ."""
    __tablename__ = "card_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    ip_address = Column(String(64))
    location = Column(String(255))
    device = Column(String(100))
    browser = Column(String(100))
    referrer = Column(String(500))
    source = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CardClick(Base):
    """Картан дээрх товч/холбоос дарсан vйлдэл бvр бvртгэгдэнэ."""
    __tablename__ = "card_clicks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    label = Column(String(100))
    href = Column(String(500))
    ip_address = Column(String(64))
    location = Column(String(255))
    device = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CardOrder(Base):
    """
    Хэрэглэгч /card хуудсанд орж карт захиалахад vvсдэг мөр.

    order_type: "qr" (QR код) эсвэл "card" (хэвлэмэл карт)
      - order_type == "qr" vед qr_subtype: "phone" (утсан дээр, 50,000₮)
        эсвэл "physical" (биетээр, 70,000₮)
      - order_type == "card" vед card_orientation: "vertical" эсвэл
        "horizontal" — хоёулаа адилхан 80,000₮
    status: "pending" -> "done" эсвэл "cancelled" (admin гар аргаар тэмдэглэнэ)
    """
    __tablename__ = "card_orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    order_type = Column(String(20), nullable=False)  # "qr" | "card"
    qr_subtype = Column(String(20))  # "phone" | "physical" (зөвхөн order_type=="qr")
    card_orientation = Column(String(20))  # "vertical" | "horizontal" (зөвхөн order_type=="card")
    price = Column(Integer, default=0)  # Backend тооцоолсон vнэ (төгрөгөөр)
    contact_phone = Column(String(20))
    quantity = Column(Integer, default=1)
    address = Column(String(500))
    note = Column(Text)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    
    user = relationship("User", back_populates="sessions")
