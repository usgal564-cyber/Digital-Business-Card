from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect

from . import models, database, schemas
from .routers import user_router, card_router
from .crud import get_user_by_phone, create_user, create_session
from .schemas import UserCreate

# Create database tables
models.Base.metadata.create_all(bind=database.engine)


def _ensure_columns(table_name: str, column_defs: list):
    """
    `models.Base.metadata.create_all()` зөвхөн ДУТУУ table-уудыг үvсгэдэг —
    аль хэдийн байгаа table-д шинэ багана автоматаар нэмдэггvй. Иймд эхлэх
    бvр шалгаад, дутуу баганыг ALTER TABLE-ээр нэмнэ.

    column_defs: [(багана_нэр, SQL_төрөл_ба_default), ...]
    """
    inspector = inspect(database.engine)
    if table_name not in inspector.get_table_names():
        return  # create_all дөнгөж vvсгэсэн бол багана хэдийнээ орсон байна

    existing = {col["name"] for col in inspector.get_columns(table_name)}

    with database.engine.connect() as conn:
        for col_name, ddl in column_defs:
            if col_name in existing:
                continue
            try:
                conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {ddl}"))
                conn.commit()
                print(f"[migration] {table_name}.{col_name} багана нэмэгдлээ.")
            except Exception as e:
                # Багана аль хэдийн байгаа эсвэл өөр шалтгаанаар алдаа гарвал
                # апп унтрахгvйгээр лог хэвлээд vргэлжлvvлнэ.
                print(f"[migration] {table_name}.{col_name} нэмэхэд алдаа гарлаа (vл тоомсорлов): {e}")


_ensure_columns("users", [
    ("card_design", "VARCHAR(20) DEFAULT 'neumorphic'"),
    ("instagram", "VARCHAR(255)"),
    ("is_admin", "INTEGER DEFAULT 0"),
])
_ensure_columns("qr_designs", [
    ("dot_style", "VARCHAR(30)"),
    ("eye_style", "VARCHAR(30)"),
    ("corner_frame_color", "VARCHAR(7)"),
    ("corner_dot_color", "VARCHAR(7)"),
    ("add_white_frame", "INTEGER DEFAULT 0"),
    ("frame_color", "VARCHAR(7)"),
])
_ensure_columns("card_orders", [
    ("qr_subtype", "VARCHAR(20)"),
    ("card_orientation", "VARCHAR(20)"),
    ("price", "INTEGER DEFAULT 0"),
    ("contact_phone", "VARCHAR(20)"),
])

app = FastAPI(title="Digital Business Card API", version="1.0.0")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://business-card-eight-ochre.vercel.app",  # Өмнөх screenshot дээрх Vercel URL
        "https://digital-business-card-orpin-psi.vercel.app",
        "https://punch.mn",
        "https://www.punch.mn",
        "*"  # Түр хугацаанд CORS алдааг бүрэн хаахын тулд (хэрэв хэрэгтэй бол)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_router)
app.include_router(card_router)


# Auth endpoint
@app.post("/api/auth/login", response_model=schemas.LoginResponse)
async def login(
    payload: schemas.LoginRequest, 
    db: Session = Depends(database.get_db)  # SessionLocal-ийг Session болгож зассан
):
    phone = payload.phone
    user = get_user_by_phone(db, phone)

    if not user:
        user_create = UserCreate(phone=phone)
        user = create_user(db, user_create)

    session = create_session(db, user.id, expires_minutes=60 * 24 * 7)

    return {
        "token": session.token,
        "user": user
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Digital Business Card API is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
