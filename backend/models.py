from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from .database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.utcnow, index=True)
    amount = Column(Float, nullable=False)
    merchant = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=True)
    email_body = Column(String, nullable=True) # Guarda o corpo do e-mail original para auditoria
