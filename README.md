# Automação Financeira Pessoal

Sistema para monitoramento de gastos via e-mail (usando atalhos do iOS) com um Dashboard moderno em React.

## Como funciona

1. O iOS Shortcuts (Atalhos) detecta novos e-mails (ou é acionado manualmente).
2. Ele envia um POST para o webhook da API (`/webhook`).
3. O Backend em FastAPI (Python) recebe, extrai o valor e o estabelecimento via Regex, e salva no banco de dados SQLite.
4. O Dashboard em React consome os dados e exibe métricas em tempo real.

## Setup Backend (API)

Requisitos: Python 3.9+

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. Inicie o servidor FastAPI:
```bash
uvicorn backend.main:app --reload
```
A API rodará em `http://localhost:8000`.

## Setup Frontend (React)

Requisitos: Node.js

1. Entre na pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
O React rodará em `http://localhost:5173`.

## Configurando o Atalho no iOS

1. Crie um novo atalho.
2. Adicione a ação "Obter Conteúdo da URL".
3. Configure a URL para `http://SEU_IP:8000/webhook` (ou a URL de produção).
4. Método: `POST`.
5. Cabeçalhos:
   - `Authorization`: `Bearer meu-token-secreto`
   - `Content-Type`: `application/json`
6. Corpo (JSON):
   - `subject`: Assunto do e-mail
   - `body`: Corpo do e-mail
   - `sender`: (Opcional) Remetente
