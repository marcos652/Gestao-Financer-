# Automação Financeira Pessoal

Sistema para monitoramento de gastos via e-mail (usando atalhos do iOS) com um Dashboard moderno em React.

## Como funciona

1. O iOS Shortcuts (Atalhos) detecta um novo e-mail do Nubank (automação pessoal).
2. Ele envia um POST para o webhook (`/api/webhook`).
3. Uma função serverless (Node.js, hospedada na Vercel) recebe, extrai o valor e o estabelecimento via Regex, e salva no Firestore (Firebase).
4. O Dashboard em React (também na Vercel) consome `/api/transactions` e exibe métricas em tempo real.

> O projeto tem ainda um `backend/` (Python/FastAPI + SQLite) e um `backend-node/` (Express + robô IMAP) usados em versões anteriores/deploy no Railway. A versão atual, pensada para rodar 100% na Vercel, vive em `frontend/api/`.

## Setup Frontend + API (Vercel)

Requisitos: Node.js, conta na Vercel, projeto no Firebase com Firestore ativado.

1. Entre na pasta do frontend (é o projeto raiz para a Vercel):
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Rode localmente com a Vercel CLI (necessário para as funções em `api/` funcionarem):
```bash
npx vercel dev
```

4. Configure as variáveis de ambiente no painel da Vercel (Settings > Environment Variables):
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `WEBHOOK_TOKEN`

5. No import do projeto na Vercel, defina **Root Directory** = `frontend`.

## Configurando o Atalho no iOS

1. No app Atalhos, crie uma **Automação Pessoal** do tipo "E-mail" (recebido, com filtro pelo remetente do Nubank) e desative "Perguntar Antes de Executar".
2. Adicione a ação "Obter Conteúdo da URL".
3. Configure a URL para `https://SEU_PROJETO.vercel.app/api/webhook`.
4. Método: `POST`.
5. Cabeçalhos:
   - `Authorization`: `Bearer meu-token-secreto`
   - `Content-Type`: `application/json`
6. Corpo (JSON), usando as variáveis do e-mail recebido:
   - `subject`: Assunto do e-mail
   - `body`: Corpo do e-mail
   - `sender`: (Opcional) Remetente
