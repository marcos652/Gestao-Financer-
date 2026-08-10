const { transactionsCollection } = require('./_lib/firestore');
const { parseEmailBody } = require('./_lib/parser');

/**
 * Endpoint chamado pelo Atalho do iOS sempre que um e-mail do Nubank chega.
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.WEBHOOK_TOKEN}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { body } = req.body || {};
  if (!body) {
    res.status(400).json({ error: 'Campo "body" é obrigatório' });
    return;
  }

  try {
    const result = parseEmailBody(body);

    if (result.amount <= 0) {
      res.status(200).json({ status: 'ignored', reason: 'Nenhum valor encontrado no e-mail' });
      return;
    }

    const doc = await transactionsCollection.add({
      date: new Date().toISOString(),
      amount: result.amount,
      merchant: result.merchant,
      category: result.category,
      email_body: body.substring(0, 500),
    });

    res.status(201).json({ status: 'success', transaction_id: doc.id });
  } catch (err) {
    console.error('Erro ao processar webhook:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
