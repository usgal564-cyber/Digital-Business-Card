from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .routers import user_router, card_router
from . import models, database, schemas

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Digital Business Card API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_router)
app.include_router(card_router)

# Auth endpoint
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