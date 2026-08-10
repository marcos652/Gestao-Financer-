const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// Rota que o React consome
app.get('/api/transactions', (req, res) => {
  try {
    const transactions = db.prepare(
      'SELECT * FROM transactions ORDER BY date DESC'
    ).all();
    res.json(transactions);
  } catch (err) {
    console.error('Erro ao buscar transações:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`);
});
