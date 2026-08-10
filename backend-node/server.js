const express = require('express');
const cors = require('cors');
const { transactionsCollection } = require('./database');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// Rota que o React consome
app.get('/api/transactions', async (req, res) => {
  try {
    const snapshot = await transactionsCollection.orderBy('date', 'desc').get();
    const transactions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(transactions);
  } catch (err) {
    console.error('Erro ao buscar transações:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`);
});
