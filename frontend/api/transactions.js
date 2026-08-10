const { transactionsCollection } = require('./_lib/firestore');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const snapshot = await transactionsCollection.orderBy('date', 'desc').get();
    const transactions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(transactions);
  } catch (err) {
    console.error('Erro ao buscar transações:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
