import imaplib
import email
import os
import time
import re
from email.header import decode_header
from dotenv import load_dotenv
from backend import parser, database, models

load_dotenv()

# Garante que a tabela do banco de dados seja criada
models.Base.metadata.create_all(bind=database.engine)

IMAP_SERVER = os.getenv("IMAP_SERVER", "imap.gmail.com")
EMAIL_ACCOUNT = os.getenv("EMAIL_ACCOUNT", "seu-email@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "sua-senha-de-app")

processed_ids = set()

def extract_text_from_html(html_content):
    # Remove tags HTML simples e converte &nbsp; em espaço
    text = re.sub(r'<[^>]+>', ' ', html_content)
    text = text.replace('&nbsp;', ' ')
    return text

def process_email(subject, body):
    parsed_data = parser.parse_email_body(body)
    
    if parsed_data["amount"] > 0:
        db = database.SessionLocal()
        db_transaction = models.Transaction(
            amount=parsed_data["amount"],
            merchant=parsed_data["merchant"],
            category=parsed_data["category"],
            email_body=body
        )
        db.add(db_transaction)
        db.commit()
        db.close()
        print(f"[+] SUCESSO! Nova transação salva: {parsed_data['merchant']} - R$ {parsed_data['amount']}")
    else:
        print("[-] E-mail lido, mas não encontrou formato de transação Nubank válido.")

def check_inbox():
    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL_ACCOUNT, EMAIL_PASSWORD)
        mail.select("inbox")
        
        # Busca os últimos 50 e-mails recebidos (lidos ou não lidos) para garantir que não perdeu nada
        status, messages = mail.search(None, "ALL")
        if status == "OK":
            all_ids = messages[0].split()
            # Pega os 10 mais recentes
            recent_ids = all_ids[-10:] if len(all_ids) > 10 else all_ids
            
            found_new = False
            for e_id in recent_ids:
                if e_id in processed_ids:
                    continue
                    
                processed_ids.add(e_id)
                found_new = True
                
                res, msg_data = mail.fetch(e_id, "(RFC822)")
                for response_part in msg_data:
                    if isinstance(response_part, tuple):
                        msg = email.message_from_bytes(response_part[1])
                        subject, encoding = decode_header(msg["Subject"])[0]
                        if isinstance(subject, bytes):
                            try:
                                subject = subject.decode(encoding if encoding else 'utf-8')
                            except:
                                subject = str(subject)
                        
                        # Filtra para só processar se for Nubank ou se parecer alerta
                        if "nubank" not in subject.lower() and "transferência" not in subject.lower():
                            continue

                        print(f"\nLendo e-mail: {subject}")
                        
                        body = ""
                        if msg.is_multipart():
                            for part in msg.walk():
                                content_type = part.get_content_type()
                                if content_type == "text/plain":
                                    body += part.get_payload(decode=True).decode('utf-8', errors='ignore')
                                elif content_type == "text/html":
                                    html_body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                                    body += extract_text_from_html(html_body)
                        else:
                            content_type = msg.get_content_type()
                            raw_body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
                            if content_type == "text/html":
                                body = extract_text_from_html(raw_body)
                            else:
                                body = raw_body

                        process_email(subject, body)
            
            if not found_new:
                print("Nenhum e-mail novo encontrado. Aguardando...")

        mail.logout()
    except Exception as e:
        print(f"Erro ao acessar IMAP: {e}")

if __name__ == "__main__":
    print("Iniciando IMAP Listener (Aprimorado)...")
    while True:
        check_inbox()
        time.sleep(15) # Checa a cada 15 segundos para ser mais rápido
