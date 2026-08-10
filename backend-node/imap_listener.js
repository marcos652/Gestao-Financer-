require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { transactionsCollection } = require('./database');
const { parseEmailBody } = require('./parser');

const IMAP_CONFIG = {
  user: process.env.EMAIL_ACCOUNT,
  password: process.env.EMAIL_PASSWORD,
  host: process.env.IMAP_SERVER || 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

const processedIds = new Set();

function checkInbox() {
  const imap = new Imap(IMAP_CONFIG);

  imap.once('ready', () => {
    imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        console.error('Erro ao abrir caixa:', err);
        imap.end();
        return;
      }

      // Busca os últimos 10 e-mails
      const total = box.messages.total;
      if (total === 0) {
        console.log('Caixa de entrada vazia. Aguardando...');
        imap.end();
        return;
      }

      const start = Math.max(1, total - 9);
      const fetch = imap.seq.fetch(`${start}:*`, { bodies: '' });

      fetch.on('message', (msg, seqno) => {
        if (processedIds.has(seqno)) return;

        msg.on('body', (stream) => {
          simpleParser(stream, (err, parsed) => {
            if (err) return;

            const subject = parsed.subject || '';

            // Filtra apenas e-mails do Nubank
            const isNubank = parsed.from?.text?.toLowerCase().includes('nubank') ||
                             subject.toLowerCase().includes('transferência') ||
                             subject.toLowerCase().includes('compra') ||
                             subject.toLowerCase().includes('pix');

            if (!isNubank) return;

            processedIds.add(seqno);
            console.log(`\n📧 Lendo e-mail: ${subject}`);

            const body = parsed.text || '';
            const result = parseEmailBody(body);

            if (result.amount > 0) {
              const now = new Date().toISOString();
              transactionsCollection
                .add({
                  date: now,
                  amount: result.amount,
                  merchant: result.merchant,
                  category: result.category,
                  email_body: body.substring(0, 500),
                })
                .then(() => {
                  console.log(`[+] SUCESSO! Transação salva: ${result.merchant} - R$ ${result.amount}`);
                })
                .catch((err) => {
                  console.error('Erro ao salvar transação no Firestore:', err);
                });
            } else {
              console.log('[-] E-mail do Nubank sem valor válido identificado.');
            }
          });
        });
      });

      fetch.once('error', (err) => console.error('Erro no fetch:', err));
      fetch.once('end', () => imap.end());
    });
  });

  imap.once('error', (err) => console.error('Erro IMAP:', err));
  imap.once('end', () => {
    console.log('Aguardando 15 segundos para próxima verificação...');
  });

  imap.connect();
}

console.log('🤖 Iniciando robô de e-mails (Node.js)...');
checkInbox();
setInterval(checkInbox, 15000);
