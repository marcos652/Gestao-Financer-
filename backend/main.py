import os
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

from . import models, database, parser

# Cria as tabelas
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="API Automação Financeira")

# CORS para permitir o front-end React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, defina o domínio do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Token simples para webhook (pode vir de .env depois)
WEBHOOK_TOKEN = os.getenv("WEBHOOK_TOKEN", "meu-token-secreto")

class EmailPayload(BaseModel):
    subject: str
    body: str
    sender: Optional[str] = None

class TransactionResponse(BaseModel):
    id: int
    date: str
    amount: float
    merchant: str
    category: Optional[str] = None
    
    class Config:
        orm_mode = True

@app.post("/webhook", status_code=201)
def receive_email_webhook(
    payload: EmailPayload, 
    authorization: str = Header(None),
    db: Session = Depends(database.get_db)
):
    """
    Endpoint chamado pelo iOS Shortcuts sempre que um e-mail chega.
    """
    if authorization != f"Bearer {WEBHOOK_TOKEN}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    parsed_data = parser.parse_email_body(payload.body)
    
    if parsed_data["amount"] == 0.0:
        return {"status": "ignored", "reason": "No amount found in email"}
        
    db_transaction = models.Transaction(
        amount=parsed_data["amount"],
        merchant=parsed_data["merchant"],
        category=parsed_data["category"],
        email_body=payload.body
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    return {"status": "success", "transaction_id": db_transaction.id}

@app.get("/api/transactions")
def get_transactions(db: Session = Depends(database.get_db)):
    """
    Lista transações para o Dashboard.
    """
    transactions = db.query(models.Transaction).order_by(models.Transaction.date.desc()).all()
    # Formatando a data
    result = []
    for t in transactions:
        result.append({
            "id": t.id,
            "date": t.date.isoformat(),
            "amount": t.amount,
            "merchant": t.merchant,
            "category": t.category
        })
    return result
