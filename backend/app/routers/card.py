from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db
from ..auth import get_current_user, get_current_admin
from ..models import User
from ..utils import get_client_ip, parse_user_agent, get_location_from_ip

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


@router.post("/{user_id}/track")
async def track_card_event(
    user_id: int,
    payload: schemas.TrackEventRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Нийтэд нээлттэй (AUTH ШААРДАХГVЙ) endpoint — /c/[id] хуудаснаас QR
    уншуулалт болон товч дарсан vйлдлийг бvртгэнэ. Frontend-ийн
    `trackCardEvent()` энд дуудагдана.

    Картын эзэн олдохгvй тохиолдолд ч зочны хуудсыг тасалдуулахгvйн тулд
    алдаа биш "ignored" төлөв буцаана.
    """
    user = crud.get_user_by_id(db, user_id)
    if not user:
        return {"status": "ignored"}

    ip = get_client_ip(request)
    device, browser = parse_user_agent(payload.user_agent or "")
    location = get_location_from_ip(ip)

    if payload.type == "scan":
        crud.create_scan_event(
            db,
            user_id=user_id,
            ip_address=ip,
            location=location,
            device=device,
            browser=browser,
            referrer=payload.referrer,
        )
    elif payload.type == "click":
        crud.create_click_event(
            db,
            user_id=user_id,
            label=payload.label or "unknown",
            href=payload.href,
            ip_address=ip,
            location=location,
            device=device,
        )

    return {"status": "ok"}


@router.get("/analytics", response_model=schemas.CardAnalyticsSummary)
async def get_card_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Нэвтэрсэн хэрэглэгчийн ӨӨРИЙН картын статистикийг буцаана."""
    return crud.get_analytics_summary(db, current_user.id)


@router.post("/order", response_model=schemas.OrderResponse)
async def create_card_order(
    order: schemas.OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Хэрэглэгч /card хуудсанаас захиалга vvсгэхэд дуудагдана. Нэвтэрсэн байх
    шаардлагатай. Талбаруудыг эндvvс баталгаажуулж, vнийг backend талд
    ТООЦООЛНО (клиентээс ирсэн vнэнд найдахгvй).
    """
    if order.order_type not in ("qr", "card"):
        raise HTTPException(status_code=400, detail="order_type нь 'qr' эсвэл 'card' байх ёстой")

    if order.order_type == "qr" and order.qr_subtype not in ("phone", "physical"):
        raise HTTPException(status_code=400, detail="qr_subtype нь 'phone' эсвэл 'physical' байх ёстой")

    if order.order_type == "card" and order.card_orientation not in ("vertical", "horizontal"):
        raise HTTPException(
            status_code=400, detail="card_orientation нь 'vertical' эсвэл 'horizontal' байх ёстой"
        )

    # Хvргэлт шаардсан төрлvvдэд (биет QR наалт, хэвлэмэл карт) хаяг заавал
    needs_delivery = order.order_type == "card" or (order.order_type == "qr" and order.qr_subtype == "physical")
    if needs_delivery and not (order.address or "").strip():
        raise HTTPException(status_code=400, detail="Энэ захиалгад хvргэлтийн хаяг шаардлагатай")

    if not (order.contact_phone or "").strip():
        raise HTTPException(status_code=400, detail="Холбогдох утасны дугаар шаардлагатай")

    try:
        return crud.create_order(db, current_user.id, order)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/orders", response_model=list[schemas.AdminOrderResponse])
async def list_all_orders(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Зөвхөн admin эрхтэй хэрэглэгчид зориулав — бvх хэрэглэгчийн захиалгыг
    буцаана. Frontend талд /admin хуудсанд л (admin эсэхээс хамаараад)
    харагдана.
    """
    return crud.get_all_orders(db)


@router.patch("/order/{order_id}/status", response_model=schemas.OrderResponse)
async def update_order_status(
    order_id: int,
    payload: schemas.OrderStatusUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Admin захиалгын статусыг (жишээ нь 'paid', 'shipped') шинэчилнэ."""
    order = crud.update_order_status(db, order_id, payload.status)
    if not order:
        raise HTTPException(status_code=404, detail="Захиалга олдсонгvй")
    return order