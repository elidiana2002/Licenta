import React, { useState, useEffect } from 'react';
import './ClientHistoryPage.css';

const ClientHistoryPage = () => {
  const [filter, setFilter] = useState('Toate');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Presupunem că emailul clientului este stocat în localStorage după login
        const email = localStorage.getItem('userEmail');
        if (!email) {
          setError('Nu există email de utilizator!');
          setLoading(false);
          return;
        }
        const response = await fetch('http://localhost/licenta/api/getClientByEmail.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (data.success) {
          setTransactions(data.istoric || []);
        } else {
          setError(data.error || 'Eroare la preluarea tranzacțiilor');
        }
      } catch (err) {
        setError('Eroare la conectarea cu serverul');
      }
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = filter === 'Toate'
    ? transactions
    : transactions.filter((t) => t.tip === filter);

  return (
    <div className="history-container">
      <h1>Istoric Tranzacții</h1>
      <div className="filter-section">
        <label htmlFor="filter">Filtrează după tip:</label>
        <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="Toate">Toate</option>
          <option value="Împrumut">Împrumut</option>
          <option value="Rambursare">Rambursare</option>
        </select>
      </div>
      {loading ? (
        <p>Se încarcă...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <ul className="transaction-list">
          {filteredTransactions.map((t) => (
            <li key={t.id} className="transaction-item">
              <span>{t.data_tranzactie}</span>
              <span>{t.tip}</span>
              <span>{t.suma} RON</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClientHistoryPage;
