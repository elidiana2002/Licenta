import React, { useState, useEffect } from 'react';
import './ClientHistoryPage.css';
import axios from 'axios';

const ClientHistoryPage = () => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status' | 'account'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  
  // State pentru modalul de transfer repetat
  const [showRepeatTransferModal, setShowRepeatTransferModal] = useState(false);
  interface RepeatTransferData {
    amount: number;
    currency: string;
    destination_client_name: string;
    source_client_name: string;
    transaction_direction: string;
    original_transaction_id: number;
    fromAccountId: number;
    toAccountId?: number | 'phone_transfer' | 'iban_transfer';
    recipientPhone?: string | null;
    recipientIBAN?: string | null;
  }

  const [repeatTransferData, setRepeatTransferData] = useState<RepeatTransferData | null>(null);
  
  // State pentru clientId
  const [clientId, setClientId] = useState<number | null>(null);

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
        
        // Setează clientId pentru a fi folosit în alte funcții
        setClientId(user.id);

        // Debug: verificăm ce avem în user
        console.log('User din localStorage:', user);
        console.log('Client ID care va fi trimis:', user.id);
        
        // Debug: verificăm ce tranzacții avem
        console.log('Tranzacții înainte de filtrare:', transactions);
        
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
          console.log('Tranzacții primite de la API:', data.transactions);
          console.log('Status-uri găsite:', data.transactions.map((t: any) => ({ id: t.id, status: t.status, status_display: t.status_display })));
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
    // Verifică dacă tranzacția are toate datele necesare
    if (!transaction || !transaction.amount || !transaction.destination_client_name) {
      alert('Nu se pot repeta tranzacțiile fără date complete!');
      return;
    }
    
    // Pregătește datele pentru transferul repetat
    const repeatData: RepeatTransferData = {
      amount: parseFloat(transaction.amount) || 0,
      currency: transaction.currency || 'RON',
      destination_client_name: transaction.destination_client_name,
      source_client_name: transaction.source_client_name || 'Client necunoscut',
      transaction_direction: transaction.transaction_direction || 'outgoing',
      original_transaction_id: transaction.id,
      fromAccountId: transaction.account_id || 0,
      toAccountId: transaction.destination_account_id,
      recipientPhone: null, // Nu este disponibil în istoric
      recipientIBAN: null   // Nu este disponibil în istoric
    };
    
    // Debug: afișează ce date avem disponibile
    console.log('Transaction data for repeat:', transaction);
    console.log('Repeat data prepared:', repeatData);
    
    // Verifică dacă datele sunt valide
    if (repeatData.amount <= 0) {
      alert('Suma tranzacției trebuie să fie mai mare decât 0!');
      return;
    }
    
    setRepeatTransferData(repeatData);
    setShowRepeatTransferModal(true);
  };
  
  const handleShowDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTransaction(null);
  };

  const closeRepeatTransferModal = () => {
    setShowRepeatTransferModal(false);
    setRepeatTransferData(null);
  };

  // Verifică dacă modalul trebuie închis automat
  useEffect(() => {
    if (showRepeatTransferModal && (!repeatTransferData || repeatTransferData.amount <= 0)) {
      setShowRepeatTransferModal(false);
      setRepeatTransferData(null);
    }
  }, [showRepeatTransferModal, repeatTransferData]);

  const executeRepeatTransfer = async () => {
    if (!repeatTransferData) {
      alert('Nu există date pentru transferul repetat!');
      return;
    }
    
    // Verifică dacă suma este validă
    if (!repeatTransferData.amount || repeatTransferData.amount <= 0) {
      alert('Suma trebuie să fie mai mare decât 0!');
      return;
    }
    
    if (!clientId) {
      alert('ID-ul clientului nu este disponibil. Te rugăm să te autentifici din nou.');
      return;
    }
    
    try {
      // Determină tipul de transfer pe baza datelor tranzacției originale
      let transferType: 'internal' | 'phone' | 'iban';
      let toAccountId: number | null = null;
      let toPhone: string | null = null;
      let toIban: string | null = null;
      
      // Pentru moment, folosim doar transferuri interne deoarece nu avem recipient_phone/recipient_iban în istoric
      if (repeatTransferData.toAccountId && typeof repeatTransferData.toAccountId === 'number') {
        transferType = 'internal';
        toAccountId = repeatTransferData.toAccountId;
      } else {
        alert('Nu se poate repeta acest tip de transfer. Doar transferurile interne pot fi repetate momentan.');
        return;
      }
      
      // Construiește payload-ul exact ca în CarduriPage.tsx
      const transferData: any = {
        from_account_id: repeatTransferData.fromAccountId,
        amount: repeatTransferData.amount,
        client_id: clientId,
        transfer_type: transferType
      };
      
      // Adaugă câmpurile specifice tipului de transfer
      if (transferType === 'internal') {
        transferData.to_account_id = toAccountId;
      }
      
      // Face apelul către backend cu același format ca CarduriPage.tsx
      const response = await axios.post('http://localhost/api/transferBetweenAccounts.php', transferData);
      
      if ((response.data as any).success) {
        // Afișează mesaj de succes
        alert(`Transfer repetat către ${repeatTransferData.destination_client_name} pentru ${repeatTransferData.amount} ${repeatTransferData.currency} - În așteptare de aprobare!`);
        
        // Închide modalul
        closeRepeatTransferModal();
        
        // Reîmprospătează lista de tranzacții din backend
        window.location.reload();
        
      } else {
        alert(`Eroare la repetarea transferului: ${(response.data as any).message || 'Eroare necunoscută'}`);
      }
      
    } catch (error) {
      console.error('Eroare la executarea transferului repetat:', error);
      alert('Eroare la conectarea cu serverul! Verifică dacă backend-ul rulează.');
    }
  };

  // Filtrare tranzacții
  const filteredTransactions = filter === 'all'
    ? transactions
    : transactions.filter((t) => {
        if (filter === 'completed' || filter === 'accepted') {
          return t.status === 'completed' || t.status === 'accepted';
        }
        if (filter === 'cancelled') {
          return t.status === 'cancelled';
        }
        return t.status === filter;
      });
      
  // Debug: verificăm tranzacțiile după filtrare
  console.log('Filter curent:', filter);
  console.log('Tranzacții după filtrare:', filteredTransactions);
  console.log('Status-uri după filtrare:', filteredTransactions.map((t: any) => ({ id: t.id, status: t.status, status_display: t.status_display })));

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
            <option value="cancelled">Anulate</option>
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
          <span>Acțiuni</span>
        </div>
          <ul className="transaction-list">
            {sortedTransactions.map((t) => (
              <li key={t.id} className="transaction-item">
                <span className="transaction-date">{new Date(t.created_at).toLocaleDateString('ro-RO')}</span>
                <span className={`transaction-status ${t.transaction_direction === 'incoming' ? 'incoming' : 'outgoing'} ${t.status === 'returned' ? 'returned' : ''} ${t.status === 'cancelled' ? 'cancelled' : ''}`}>
                {t.status_display || t.status}
              </span>
                <span className="transaction-amount">
                  {(() => {
                    // Logica pentru afișarea corectă a sumelor
                    let sign = '';
                    let amount = t.amount_formatted || t.amount;
                    
                                          // Debug pentru toate tranzacțiile
                      console.log(`Tranzacție ID ${t.id}:`, {
                        status: t.status,
                        direction: t.transaction_direction,
                        amount: amount,
                        fullTransaction: t
                      });
                    
                    if (t.status === 'rejected' && t.transaction_direction === 'outgoing') {
                      // Tranzacție respinsă - banii se returnează (nu se mai deduc)
                      sign = '+';
                    } else if (t.status === 'cancelled' && t.transaction_direction === 'outgoing') {
                      // Tranzacție anulată - banii se returnează (nu se mai deduc)
                      sign = '+';
                    } else if (t.status === 'returned') {
                      // Pentru tranzacții returnate, logica este inversă:
                      // Dacă originalul era incoming (primești bani), acum returnezi (trimiti bani) = -
                      // Dacă originalul era outgoing (trimiti bani), acum primești înapoi = +
                      if (t.transaction_direction === 'incoming') {
                        // Originalul era incoming (primești bani), acum returnezi (trimiti bani înapoi)
                        sign = '-';
                      } else {
                        // Originalul era outgoing (trimiti bani), acum primești înapoi
                        sign = '+';
                      }
                    } else if (t.transaction_direction === 'incoming') {
                      // Primești bani
                      sign = '+';
                    } else {
                      // Trimiti bani
                      sign = '-';
                    }
                    
                    return `${sign}${amount} ${t.currency || 'RON'}`;
                  })()}
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
                
                {/* Toate butoanele de acțiune în dreapta butonului Detalii */}
                {/* Opțiunea de repetare pentru tranzacțiile pe care le-ai inițiat tu (accepted, completed, rejected, returned) */}
                {t.transaction_direction === 'outgoing' && (t.status === 'accepted' || t.status === 'completed' || t.status === 'rejected' || t.status === 'returned') && (
                  <button 
                    className="action-btn repeat-btn"
                    onClick={() => handleRepeatTransaction(t)}
                  >
                    🔄 Repetă
                  </button>
                )}
                
                {/* Opțiuni de acțiune pentru tranzacțiile în așteptare */}
                {t.status === 'pending' && t.transaction_direction === 'incoming' && (
                  <>
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
                  </>
                )}
                
                {/* Opțiuni pentru tranzacțiile tale (outgoing) - anulare pentru cele în așteptare */}
                {t.status === 'pending' && t.transaction_direction === 'outgoing' && (
                  <button 
                    className="action-btn cancel-btn"
                    onClick={() => handleTransferAction(t.id, 'cancel')}
                  >
                    🚫 Anulează
                  </button>
                )}
                
                {/* Opțiuni pentru tranzacțiile acceptate (incoming) - doar returnează */}
                {t.status === 'accepted' && t.transaction_direction === 'incoming' && (
                  <button 
                    className="action-btn return-btn"
                    onClick={() => handleTransferAction(t.id, 'return')}
                  >
                    💰 Returnează
                  </button>
                )}
            </div>
            

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
                  <span className="info-label">Sumă:</span>
                  <span className="info-value">
                    {(() => {
                      // Logica pentru afișarea corectă a sumelor în modal
                      let sign = '';
                      let amount = selectedTransaction.amount_formatted || selectedTransaction.amount;
                      
                      // Debug pentru toate tranzacțiile în modal
                      console.log(`Modal - Tranzacție ID ${selectedTransaction.id}:`, {
                        status: selectedTransaction.status,
                        direction: selectedTransaction.transaction_direction,
                        amount: amount,
                        fullTransaction: selectedTransaction
                      });
                      
                      if (selectedTransaction.status === 'rejected' && selectedTransaction.transaction_direction === 'outgoing') {
                        // Tranzacție respinsă - banii se returnează (nu se mai deduc)
                        sign = '+';
                      } else if (selectedTransaction.status === 'cancelled' && selectedTransaction.transaction_direction === 'outgoing') {
                        // Tranzacție anulată - banii se returnează (nu se mai deduc)
                        sign = '+';
                      } else if (selectedTransaction.status === 'returned') {
                        // Pentru tranzacții returnate, logica este inversă:
                        // Dacă originalul era incoming (primești bani), acum returnezi (trimiti bani) = -
                        // Dacă originalul era outgoing (trimiti bani), acum primești înapoi = +
                        if (selectedTransaction.transaction_direction === 'incoming') {
                          // Originalul era incoming (primești bani), acum returnezi (trimiti bani înapoi)
                          sign = '-';
                        } else {
                          // Originalul era outgoing (trimiti bani), acum primești înapoi
                          sign = '+';
                        }
                      } else if (selectedTransaction.transaction_direction === 'incoming') {
                        // Primești bani
                        sign = '+';
                      } else {
                        // Trimiti bani
                        sign = '-';
                      }
                      
                      return `${sign}${amount} ${selectedTransaction.currency || 'RON'}`;
                    })()}
                  </span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className={`info-value status-${selectedTransaction.status}`}>
                    {selectedTransaction.status_display || selectedTransaction.status}
                  </span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Tip:</span>
                  <span className="info-value">
                    {selectedTransaction.transaction_direction === 'incoming' ? 'Primești bani' : 'Trimiti bani'}
                  </span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Partener:</span>
                  <span className="info-value">
                    {selectedTransaction.transaction_direction === 'incoming' 
                      ? selectedTransaction.source_client_name || 'Client necunoscut'
                      : selectedTransaction.destination_client_name || 'Client necunoscut'
                    }
                  </span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Data și ora:</span>
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

      {/* Modal pentru transfer repetat */}
      {showRepeatTransferModal && repeatTransferData && repeatTransferData.amount > 0 && (
        <div className="modal-overlay" onClick={closeRepeatTransferModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔄 Repetă Transferul</h2>
              <button className="modal-close-btn" onClick={closeRepeatTransferModal}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="transaction-info">
                <div className="info-row">
                  <span className="info-label">Destinatar:</span>
                  <span className="info-value">
                    {repeatTransferData.destination_client_name || 'Client necunoscut'}
                  </span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Tip tranzacție:</span>
                  <span className="info-value">
                    {repeatTransferData.transaction_direction === 'incoming' ? 'Primești bani' : 'Trimiti bani'}
                  </span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Sumă nouă:</span>
                  <input
                    type="number"
                    value={repeatTransferData.amount}
                    onChange={(e) => setRepeatTransferData((prev: RepeatTransferData | null) => prev ? {
                      ...prev,
                      amount: parseFloat(e.target.value) || 0
                    } : null)}
                    min="0.01"
                    step="0.01"
                    className="amount-input"
                    placeholder="Introdu suma"
                  />
                  <span className="currency-display"> {repeatTransferData.currency}</span>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="modal-close-btn-large" onClick={closeRepeatTransferModal}>
                Anulează
              </button>
              <button 
                className="action-btn repeat-btn" 
                onClick={executeRepeatTransfer}
                style={{ marginLeft: '10px' }}
              >
                🔄 Execută Transferul
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientHistoryPage;
