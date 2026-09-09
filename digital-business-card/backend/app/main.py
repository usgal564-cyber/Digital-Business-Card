from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from . import models, database, schemas
from .routers import user_router, card_router

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Digital Business Card API", version="1.0.0")

# CORS - custom OPTIONS handler-гүйгээр, зөвхөн middleware ашиглана
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(card_router)

@app.get("/")
async def root():
    return {"message": "Digital Business Card API status OK"}

@app.post("/api/auth/login", response_model=schemas.LoginResponse)
async def login(payload: schemas.LoginRequest, db: database.SessionLocal = Depends(database.get_db)):
    from .crud import get_user_by_phone, create_user, create_session
    from .schemas import UserCreate

    phone = payload.phone
    user = get_user_by_phone(db, phone)

    if not user:
        user_create = UserCreate(phone=phone)
        user = create_user(db, user_create)

    session = create_session(db, user.id, expires_minutes=60 * 24 * 7)

    return {"token": session.token, "user": user}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Digital Business Card API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10000)