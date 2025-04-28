import React, { useState } from 'react';
import './ClientHistoryPage.css';

const transactionsMock = [
  { id: 1, type: 'Împrumut', amount: 5000, date: '2025-04-01' },
  { id: 2, type: 'Rambursare', amount: 1000, date: '2025-04-10' },
  { id: 3, type: 'Împrumut', amount: 3000, date: '2025-04-15' },
];

const ClientHistoryPage = () => {
  const [filter, setFilter] = useState('Toate');

  const filteredTransactions = filter === 'Toate'
    ? transactionsMock
    : transactionsMock.filter((t) => t.type === filter);

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
      <ul className="transaction-list">
        {filteredTransactions.map((t) => (
          <li key={t.id} className="transaction-item">
            <span>{t.date}</span>
            <span>{t.type}</span>
            <span>{t.amount} RON</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientHistoryPage;
