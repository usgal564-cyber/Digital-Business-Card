from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# SQLite ашиглах - файлд суурилсан өгөгдлийн сан
DATABASE_URL = "sqlite:///./digital_card.db"

# SQLite холболт үүсгэх
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}  # SQLite-д зориулсан
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()