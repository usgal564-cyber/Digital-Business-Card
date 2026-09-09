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
    wiber = Column(String(100))
    website = Column(String(255))
    profile_image = Column(Text)
    background_image = Column(Text)
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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="qr_design")

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    
    user = relationship("User", back_populates="sessions")