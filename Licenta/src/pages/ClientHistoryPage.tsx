import React, { useState, useEffect } from 'react';
import './ClientHistoryPage.css';

const ClientHistoryPage = () => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status' | 'account'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Preluăm datele utilizatorului din localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setError('Nu ești autentificat! Te rugăm să te autentifici mai întâi.');
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        if (!user.id) {
          setError('Nu există ID de utilizator! Te rugăm să te autentifici din nou.');
          setLoading(false);
          return;
        }

        // Debug: verificăm ce avem în user
        console.log('User din localStorage:', user);
        console.log('Client ID care va fi trimis:', user.id);
        
        // Facem cererea direct către API-ul corect
        const response = await fetch('http://localhost/api/getTransactions.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ client_id: user.id })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
          setTransactions(data.transactions || []);
        } else {
          setError(data.error || 'Eroare la preluarea tranzacțiilor');
        }
      } catch (err) {
        console.error('Eroare completă:', err);
        if (err instanceof Error) {
          setError(`Eroare la conectarea cu serverul: ${err.message}`);
        } else {
          setError('Eroare la conectarea cu serverul');
        }
      }
      setLoading(false);
    };
    fetchTransactions();
  }, []);
  
  // Funcții pentru acțiunile de transfer
  const handleTransferAction = async (transactionId: number, action: 'accept' | 'reject' | 'return' | 'cancel') => {
    try {
      const response = await fetch('http://localhost/api/processTransferNotification.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: transactionId, action })
      });
      
      const data = await response.json();
      if (data.success) {
        // Reîncarcă tranzacțiile
        window.location.reload();
      } else {
        setError(data.error || 'Eroare la procesarea acțiunii');
      }
    } catch (err) {
      setError('Eroare la conectarea cu serverul');
    }
  };
  
  const handleRepeatTransaction = (transaction: any) => {
    // Implementează logica pentru repetarea tranzacției
    // Poate deschide un modal sau naviga la pagina de transfer
    alert(`Repetă transferul către ${transaction.other_party} pentru ${transaction.amount} ${transaction.currency}`);
  };
  
  const handleShowDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTransaction(null);
  };

  // Filtrare tranzacții
  const filteredTransactions = filter === 'all'
    ? transactions
    : transactions.filter((t) => {
        if (filter === 'completed' || filter === 'accepted') {
          return t.status === 'completed' || t.status === 'accepted';
        }
        return t.status === filter;
      });

  // Sortare tranzacții
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case 'amount':
        aValue = parseFloat(a.amount);
        bValue = parseFloat(b.amount);
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'account':
        aValue = a.source_account_number || '';
        bValue = b.source_account_number || '';
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="history-container">
      <h1>Istoric Tranzacții</h1>
      <div className="controls-section">
        <div className="filter-section">
          <label htmlFor="filter">Filtrează după status:</label>
          <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Toate</option>
            <option value="completed">Finalizate (completed/accepted)</option>
            <option value="pending">În așteptare</option>
            <option value="rejected">Respinse</option>
          </select>
        </div>
        
        <div className="sort-section">
          <label htmlFor="sortBy">Sortează după:</label>
          <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="date">Dată</option>
            <option value="amount">Sumă</option>
            <option value="status">Status</option>
            <option value="account">Account (IBAN)</option>
          </select>
          
          <button 
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={`Sortare ${sortOrder === 'asc' ? 'descrescătoare' : 'crescătoare'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
      {loading ? (
        <p>Se încarcă...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : sortedTransactions.length === 0 ? (
        <p>Nu există tranzacții pentru a fi afișate.</p>
      ) : (
        <>
                  <div className="transaction-header">
          <span>Dată</span>
          <span>Status</span>
          <span>Sumă</span>
          <span>Client Sursă</span>
          <span>Tip Tranzacție</span>
        </div>
          <ul className="transaction-list">
            {sortedTransactions.map((t) => (
              <li key={t.id} className="transaction-item">
                <span className="transaction-date">{new Date(t.created_at).toLocaleDateString('ro-RO')}</span>
                <span className={`transaction-status ${t.transaction_direction === 'incoming' ? 'incoming' : 'outgoing'} ${t.status === 'returned' ? 'returned' : ''}`}>
                {t.status_display || t.status}
              </span>
                <span className="transaction-amount">
                  {t.transaction_direction === 'incoming' ? '+' : '-'}
                  {t.amount_formatted || t.amount} {t.currency || 'RON'}
                </span>
                              <span className="transaction-client">
                  {t.transaction_direction === 'incoming' 
                    ? t.source_client_name || 'Client necunoscut'
                    : t.destination_client_name || 'Client necunoscut'
                  }
                </span>
                            <div className="transaction-type-section">
                <button 
                  className="action-btn details-btn"
                  onClick={() => handleShowDetails(t)}
                >
                  📋 Detalii
                </button>
                
                              {/* Opțiunea de repetare pentru tranzacțiile pe care le-ai inițiat tu */}
              {t.transaction_direction === 'outgoing' && (t.status === 'accepted' || t.status === 'completed') && (
                <button 
                  className="action-btn repeat-btn"
                  onClick={() => handleRepeatTransaction(t)}
                >
                  🔄 Repetă
                </button>
              )}
            </div>
            
            {/* Opțiuni de acțiune pentru tranzacțiile în așteptare */}
            {t.status === 'pending' && t.transaction_direction === 'incoming' && (
              <div className="transaction-actions">
                <button 
                  className="action-btn accept-btn"
                  onClick={() => handleTransferAction(t.id, 'accept')}
                >
                  ✅ Acceptă
                </button>
                <button 
                  className="action-btn reject-btn"
                  onClick={() => handleTransferAction(t.id, 'reject')}
                >
                  ❌ Respinge
                </button>
              </div>
            )}
            
            {/* Opțiuni pentru tranzacțiile tale (outgoing) - anulare pentru cele în așteptare */}
            {t.status === 'pending' && t.transaction_direction === 'outgoing' && (
              <div className="transaction-actions">
                <button 
                  className="action-btn cancel-btn"
                  onClick={() => handleTransferAction(t.id, 'cancel')}
                >
                  🚫 Anulează tranzacția
                </button>
              </div>
            )}
            
            {/* Opțiuni pentru tranzacțiile acceptate (incoming) */}
            {t.status === 'accepted' && t.transaction_direction === 'incoming' && (
              <div className="transaction-actions">
                <button 
                  className="action-btn return-btn"
                  onClick={() => handleTransferAction(t.id, 'return')}
                >
                  💰 Returnează
                </button>
                <button 
                  className="action-btn repeat-btn"
                  onClick={() => handleRepeatTransaction(t)}
                >
                  🔄 Repetă
                </button>
              </div>
            )}
            </li>
          ))}
        </ul>
        </>
      )}
      
      {/* Modal pentru detalii tranzacție */}
      {showDetailsModal && selectedTransaction && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalii Tranzacție</h2>
              <button className="modal-close-btn" onClick={closeDetailsModal}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="transaction-info">
                <div className="info-row">
                  <span className="info-label">ID Tranzacție:</span>
                  <span className="info-value">{selectedTransaction.id}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Tip:</span>
                  <span className="info-value">{selectedTransaction.transaction_type || 'transfer'}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Metodă:</span>
                  <span className="info-value">{selectedTransaction.method || 'IBAN'}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Categorie:</span>
                  <span className="info-value">{selectedTransaction.category || 'other'}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Descriere:</span>
                  <span className="info-value">{selectedTransaction.description || `Transfer de la account #${selectedTransaction.source_account_number || '1'} către account #${selectedTransaction.destination_account_number || '12'}`}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className={`info-value status-${selectedTransaction.status}`}>
                    {selectedTransaction.status_display || selectedTransaction.status}
                  </span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Direcție:</span>
                  <span className="info-value">
                    {selectedTransaction.transaction_direction === 'incoming' ? 'Primești bani' : 'Trimiti bani'}
                  </span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Partener:</span>
                  <span className="info-value">{selectedTransaction.other_party || '111 111'}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Data:</span>
                  <span className="info-value">
                    {new Date(selectedTransaction.created_at).toLocaleDateString('ro-RO')}, {new Date(selectedTransaction.created_at).toLocaleTimeString('ro-RO')}
                  </span>
                </div>
                
                {selectedTransaction.balance_after_formatted && (
                  <div className="info-row">
                    <span className="info-label">Sold după tranzacție:</span>
                    <span className="info-value">
                      {selectedTransaction.balance_after_formatted} {selectedTransaction.currency || 'RON'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="modal-close-btn-large" onClick={closeDetailsModal}>
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientHistoryPage;
