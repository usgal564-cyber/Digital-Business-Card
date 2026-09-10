# Digital Business Card

Утасны дугаараар нэвтэрч, QR кодтой цахим нэрийн хуудас үүсгэх MVP.

- **Backend:** FastAPI + SQLAlchemy (SQLite)
- **Frontend:** Next.js 16 (App Router) + Tailwind CSS

## Ажиллуулах

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000 (docs: http://localhost:8000/docs)

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

## Онцлог

- Утасны дугаараар нэвтрэх (бүртгэл автоматаар үүснэ)
- Профайл мэдээлэл засах (нэр, албан тушаал, компани, холбоо барих мэдээлэл)
- QR код бүхий цахим нэрийн хуудас
- QR кодны өнгө, дэвсгэр, хэмжээг өөрчлөх
- vCard (.vcf) болон текст файл татах
- Картын холбоосыг хуулж хуваалцах

## Бүтэц

```
backend/
  app/
    main.py         # FastAPI app, login endpoint
    models.py        # SQLAlchemy models
    schemas.py        # Pydantic schemas
    crud.py           # DB operations
    auth.py           # Bearer token auth
    routers/          # /api/user, /api/card
frontend/
  app/
    login/           # Нэвтрэх
    dashboard/        # Dashboard
    card/             # Миний карт
    design/           # QR дизайн
  components/          # Sidebar, BusinessCard, QRCode, Toast
  lib/                 # api.ts (axios client), types.ts
```