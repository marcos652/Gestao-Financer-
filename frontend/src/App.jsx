import { useState, useEffect } from 'react';
import { 
  PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Wallet, 
  TrendingUp, 
  History, 
  PieChart, 
  BarChart3, 
  ListOrdered 
} from 'lucide-react';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = () => {
      fetch('http://localhost:8000/api/transactions')
        .then(res => res.json())
        .then(data => {
          if(data) {
            setTransactions(data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("API error", err);
          setLoading(false);
        });
    };

    // Busca os dados imediatamente ao carregar a página
    fetchTransactions();

    // Configura o robôzinho do React para buscar dados novos a cada 10 segundos
    const intervalId = setInterval(fetchTransactions, 10000);

    // Limpeza ao sair da página
    return () => clearInterval(intervalId);
  }, []);

  const totalGasto = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  // Data for Category Pie Chart
  const categoryDataRaw = transactions.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});
  
  const categoryData = Object.keys(categoryDataRaw).map(key => ({
    name: key,
    value: categoryDataRaw[key]
  }));
  
  const COLORS = ['#fe3e6d', '#ff7b9c', '#ffb3c6', '#ffccd5', '#ffe6ea'];
  
  // Data for Daily Bar Chart
  const dailyDataRaw = transactions.reduce((acc, curr) => {
    const day = new Date(curr.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'});
    acc[day] = (acc[day] || 0) + curr.amount;
    return acc;
  }, {});

  const dailyData = Object.keys(dailyDataRaw).map(key => ({
    date: key,
    amount: dailyDataRaw[key]
  })).reverse(); // simple reverse for mock timeline

  const topCategory = Object.entries(categoryDataRaw).sort((a,b) => b[1] - a[1])[0] || ['Nenhuma', 0];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>FinanceAuto</h1>
        <div style={{color: 'var(--text-secondary)'}}>Dashboard de Despesas</div>
      </header>

      {loading ? (
        <div style={{textAlign: 'center', marginTop: '4rem'}}>Carregando...</div>
      ) : (
        <>
          <section className="summary-cards">
            <div className="card">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={18} color="var(--accent-color)" />
                Gasto Total do Mês
              </div>
              <div className="card-value">{formatCurrency(totalGasto)}</div>
            </div>
            <div className="card">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="var(--accent-color)" />
                Maior Despesa (Categoria)
              </div>
              <div className="card-value" style={{fontSize: '1.5rem', fontWeight: 400, marginTop: '0.5rem'}}>{topCategory[0]} ({formatCurrency(topCategory[1])})</div>
            </div>
            <div className="card">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="var(--accent-color)" />
                Última Transação
              </div>
              <div className="card-value" style={{fontSize: '1.25rem', fontWeight: 400, marginTop: '0.75rem'}}>
                {transactions[0] ? `${transactions[0].merchant} - ${formatCurrency(transactions[0].amount)}` : 'Nenhuma'}
              </div>
            </div>
          </section>

          {/* Charts Section */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="card" style={{ height: '350px' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChart size={18} color="var(--text-secondary)" />
                Despesas por Categoria
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#fe3e6d"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            
            <div className="card" style={{ height: '350px' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} color="var(--text-secondary)" />
                Gastos Diários
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6c757d', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6c757d', fontSize: 12}} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} cursor={{fill: '#f4f6f8'}} />
                  <Bar dataKey="amount" fill="#fe3e6d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="transactions-section">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ListOrdered size={24} color="var(--accent-color)" />
              Histórico de Transações
            </h2>
            <div style={{overflowX: 'auto'}}>
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Estabelecimento</th>
                    <th>Categoria</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td>{formatDate(t.date)}</td>
                      <td style={{fontWeight: '500', color: 'var(--text-primary)'}}>{t.merchant}</td>
                      <td><span className="tag">{t.category || 'Outros'}</span></td>
                      <td style={{fontWeight: 'bold', color: 'var(--text-primary)'}}>
                        {formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Nenhuma transação encontrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default App;
