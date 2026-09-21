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
INSTAGRAM: {getattr(user, 'instagram', '') or ''}
WIBER   : {user.wiber or ''}
========================================
    SCAN QR CODE TO SAVE
========================================"""


# --- Статистик (QR уншуулалт / товч дарсан) ---

def create_scan_event(
    db: Session,
    user_id: int,
    ip_address: str = None,
    location: str = None,
    device: str = None,
    browser: str = None,
    referrer: str = None,
    source: str = None,
):
    scan = models.CardScan(
        user_id=user_id,
        ip_address=ip_address,
        location=location,
        device=device,
        browser=browser,
        referrer=referrer,
        source=source,
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return scan


def create_click_event(
    db: Session,
    user_id: int,
    label: str,
    href: str = None,
    ip_address: str = None,
    location: str = None,
    device: str = None,
):
    click = models.CardClick(
        user_id=user_id,
        label=label,
        href=href,
        ip_address=ip_address,
        location=location,
        device=device,
    )
    db.add(click)
    db.commit()
    db.refresh(click)
    return click


def get_analytics_summary(db: Session, user_id: int):
    from sqlalchemy import func as sql_func

    total_scans = (
        db.query(models.CardScan)
        .filter(models.CardScan.user_id == user_id)
        .count()
    )
    unique_visitors = (
        db.query(models.CardScan.ip_address)
        .filter(
            models.CardScan.user_id == user_id,
            models.CardScan.ip_address.isnot(None),
        )
        .distinct()
        .count()
    )
    total_clicks = (
        db.query(models.CardClick)
        .filter(models.CardClick.user_id == user_id)
        .count()
    )

    clicks_grouped = (
        db.query(models.CardClick.label, sql_func.count(models.CardClick.id).label("count"))
        .filter(models.CardClick.user_id == user_id)
        .group_by(models.CardClick.label)
        .order_by(sql_func.count(models.CardClick.id).desc())
        .all()
    )
    clicks_by_label = [{"label": label, "count": count} for label, count in clicks_grouped]

    recent_scans = (
        db.query(models.CardScan)
        .filter(models.CardScan.user_id == user_id)
        .order_by(models.CardScan.created_at.desc())
        .limit(20)
        .all()
    )
    recent_clicks = (
        db.query(models.CardClick)
        .filter(models.CardClick.user_id == user_id)
        .order_by(models.CardClick.created_at.desc())
        .limit(20)
        .all()
    )

    return {
        "total_scans": total_scans,
        "unique_visitors": unique_visitors,
        "total_clicks": total_clicks,
        "clicks_by_label": clicks_by_label,
        "recent_scans": recent_scans,
        "recent_clicks": recent_clicks,
    }


# --- Карт захиалга ---

# Захиалгын vнийг backend талд ТООЦООЛНО — клиентээс ирсэн vнэд ХЭЗЭЭ Ч
# найдахгvй (хэрэглэгч devtools-оор өөрчлөх эрсдэлтэй).
ORDER_PRICES = {
    ("qr", "phone"): 50_000,
    ("qr", "physical"): 70_000,
    ("card", "vertical"): 80_000,
    ("card", "horizontal"): 80_000,
}


def calculate_order_price(order_type: str, qr_subtype: str = None, card_orientation: str = None) -> int:
    key = (order_type, qr_subtype if order_type == "qr" else card_orientation)
    price = ORDER_PRICES.get(key)
    if price is None:
        raise ValueError("Захиалгын төрөл/дэд төрөл буруу байна")
    return price


def create_order(db: Session, user_id: int, order: schemas.OrderCreate):
    price = calculate_order_price(order.order_type, order.qr_subtype, order.card_orientation)
    db_order = models.CardOrder(
        user_id=user_id,
        order_type=order.order_type,
        qr_subtype=order.qr_subtype,
        card_orientation=order.card_orientation,
        price=price,
        contact_phone=order.contact_phone,
        quantity=order.quantity,
        address=order.address,
        note=order.note,
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


def get_all_orders(db: Session):
    """
    Admin-д зориулсан — бvх хэрэглэгчийн захиалгыг хамгийн сvvлээс нь
    жагсаана. Захиалагч бvрийн БОДИТ User объект болон QRDesign-ийг хамт
    буцаана — ингэснээр frontend талд захиалагчийн картыг (CardPreview) болон
    QR-ийг шууд зурж харуулж чадна.
    """
    rows = (
        db.query(models.CardOrder, models.User)
        .join(models.User, models.CardOrder.user_id == models.User.id)
        .order_by(models.CardOrder.created_at.desc())
        .all()
    )
    result = []
    for order, user in rows:
        qr_design = get_qr_design_by_user(db, user.id)
        result.append({
            "id": order.id,
            "order_type": order.order_type,
            "qr_subtype": order.qr_subtype,
            "card_orientation": order.card_orientation,
            "price": order.price,
            "contact_phone": order.contact_phone,
            "quantity": order.quantity,
            "address": order.address,
            "note": order.note,
            "status": order.status,
            "created_at": order.created_at,
            "user": user,
            "qr_design": qr_design,
        })
    return result


def update_order_status(db: Session, order_id: int, status: str):
    order = db.query(models.CardOrder).filter(models.CardOrder.id == order_id).first()
    if not order:
        return None
    order.status = status
    db.commit()
    db.refresh(order)
    return order