//src\pages\CreditScorePage.tsx
import React, { useState, useEffect } from "react";
import "../App.css";

const CreditScorePage = () => {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [debts, setDebts] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoDataLoaded, setAutoDataLoaded] = useState(false);
  const [cards, setCards] = useState<Array<{card_id: number, card_number: string, card_type: string, expiration_date: string, status: string, account_ibans?: string, accounts_count?: number}>>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('all');
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1month');

  const calculateScore = () => {
    const incomeVal = parseFloat(income) || 0;
    const expensesVal = parseFloat(expenses) || 0;
    const debtsVal = parseFloat(debts) || 0;
    const calculatedScore = incomeVal - expensesVal - (debtsVal * 2);
    setScore(calculatedScore);
  };

  const clearInputs = () => {
    setIncome('');
    setExpenses('');
    setDebts('');
    setScore(null);
    setAutoDataLoaded(false);
    setSelectedPeriod('1month');
    setSelectedCardId('all');
  };

  // Verifică autentificarea la încărcarea paginii
  useEffect(() => {
    // Verifică mai multe chei posibile pentru client_id
    const clientId = localStorage.getItem('client_id') || 
                    localStorage.getItem('clientId') || 
                    localStorage.getItem('user_id') ||
                    localStorage.getItem('userId') ||
                    localStorage.getItem('user');
    
    console.log('CreditScorePage - localStorage keys:', Object.keys(localStorage));
    console.log('CreditScorePage - clientId found:', clientId);
    
    // Debug: verifică ce conține cheia "user"
    const userData = localStorage.getItem('user');
    console.log('CreditScorePage - user data:', userData);
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('CreditScorePage - parsed user:', parsedUser);
      } catch (e) {
        console.log('CreditScorePage - user data is not JSON:', userData);
      }
    }
    
    if (clientId) {
      setIsLoggedIn(true);
      console.log('CreditScorePage - User is logged in with client_id:', clientId);
      
      // Încarcă accounturile clientului
      console.log('useEffect - About to fetch accounts for clientId:', clientId);
      
      if (typeof clientId === 'string' && clientId.startsWith('{')) {
        try {
          const userData = JSON.parse(clientId);
          const extractedClientId = userData.id || userData.client_id || userData.user_id;
          console.log('useEffect - Extracted clientId from JSON:', extractedClientId);
          if (extractedClientId) {
            console.log('useEffect - Calling fetchCards with extracted ID');
            fetchCards(extractedClientId.toString());
          }
        } catch (e) {
          console.error('Error parsing user data in useEffect:', e);
        }
      } else if (clientId) {
        console.log('useEffect - Calling fetchCards with direct clientId');
        fetchCards(clientId);
      }
    } else {
      console.log('CreditScorePage - No client_id found in localStorage');
    }
  }, []);

  // Funcție pentru a încărca cardurile clientului
  const fetchCards = async (clientId: string): Promise<void> => {
    console.log('fetchCards called with clientId:', clientId);
    setLoadingAccounts(true);
    try {
      const response = await fetch('http://localhost/api/getAccountsByClient.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ client_id: parseInt(clientId) }),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success && data.cards) {
          setCards(data.cards);
          console.log('Cards loaded:', data.cards);
          console.log('Cards state updated:', data.cards);
          console.log('Cards count:', data.cards.length);
          
          // Debug: afișează informații despre carduri
          data.cards.forEach((card: any, index: number) => {
            console.log(`Card ${index + 1}:`, {
              card_id: card.card_id,
              card_number: card.card_number,
              accounts_count: card.accounts_count,
              account_ibans: card.account_ibans
            });
          });
        } else {
          console.log('No cards found or error in response');
          console.log('Response data:', data);
          
          // Afișează mesajul de eroare din backend
          if (data.error) {
            console.log('Backend error:', data.error);
          }
        }
      } else {
        console.log('Response not ok:', response.status);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const fetchAutomaticData = async (): Promise<void> => {
    // Verifică mai multe chei posibile pentru client_id
    let clientId = localStorage.getItem('client_id') || 
                   localStorage.getItem('clientId') || 
                   localStorage.getItem('user_id') ||
                   localStorage.getItem('userId') ||
                   localStorage.getItem('user');
    
    console.log('fetchAutomaticData - clientId raw:', clientId);
    
    // Dacă clientId este un JSON string, îl parsez
    if (clientId && clientId.startsWith('{')) {
      try {
        const userData = JSON.parse(clientId);
        clientId = userData.id || userData.client_id || userData.user_id;
        console.log('Parsed userData:', userData);
        console.log('Extracted clientId:', clientId);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    console.log('fetchAutomaticData - clientId final:', clientId);
    
    if (!clientId) {
      alert('Trebuie să fii autentificat pentru a folosi funcția automată!');
      return;
    }

    setLoading(true);
    try {
      console.log('Încerc să mă conectez la:', 'http://localhost/api/getTransactions.php');
      
      // Construiește payload-ul în funcție de card-ul selectat
      const payload: any = { 
        client_id: parseInt(clientId), 
        limit: 1000 // Măresc limita pentru a avea toate tranzacțiile
      };
      
      // Dacă este selectat un card specific, adaug card_id
      if (selectedCardId !== 'all') {
        payload.card_id = parseInt(selectedCardId);
      }
      
      console.log('Payload final:', payload);
      
      const response = await fetch('http://localhost/api/getTransactions.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response from backend:', data);
        
        if (data.success && data.transactions && data.transactions.length > 0) {
          console.log('Transactions received:', data.transactions);
          
          // Calculează datele reale din tranzacții
          let totalIncome = 0;
          let totalExpenses = 0;
          let totalDebts = 0;
          
          // Calculează datoriile din balanțele accounturilor asociate cardului
          if (selectedCardId === 'all') {
            // Pentru toate cardurile, calculează datoriile totale
            totalDebts = cards.reduce((sum, card) => {
              // Aici ar trebui să accesăm balance-urile accounturilor asociate cardului
              // Pentru moment, setăm o valoare default
              return sum + 0; // Nu avem acces la balance în acest context
            }, 0);
          } else {
            // Pentru un card specific, calculează datoriile doar pentru accounturile asociate
            const selectedCard = cards.find(card => card.card_id.toString() === selectedCardId);
            if (selectedCard) {
              // Aici ar trebui să accesăm balance-urile accounturilor asociate cardului
              totalDebts = 0; // Nu avem acces la balance în acest context
            }
          }
          
          // Calculează veniturile și cheltuielile din tranzacții
          data.transactions.forEach((transaction: any) => {
            const amount = parseFloat(transaction.amount) || 0;
            const direction = transaction.transaction_direction;
            
            if (direction === 'incoming') {
              totalIncome += amount;
            } else if (direction === 'outgoing') {
              totalExpenses += amount;
            }
          });
          
          // Calculează medii lunare în funcție de perioada selectată
          let monthlyIncome = 0;
          let monthlyExpenses = 0;
          
          switch (selectedPeriod) {
            case '1month':
              monthlyIncome = totalIncome;
              monthlyExpenses = totalExpenses;
              break;
            case '3months':
              monthlyIncome = totalIncome / 3;
              monthlyExpenses = totalExpenses / 3;
              break;
            case '6months':
              monthlyIncome = totalIncome / 6;
              monthlyExpenses = totalExpenses / 6;
              break;
            case '1year':
              monthlyIncome = totalIncome / 12;
              monthlyExpenses = totalExpenses / 12;
              break;
            case 'all':
              // Pentru toate tranzacțiile, calculează media pe toată perioada
              const totalMonths = Math.max(1, Math.ceil(data.transactions.length / 10)); // Aproximare
              monthlyIncome = totalIncome / totalMonths;
              monthlyExpenses = totalExpenses / totalMonths;
              break;
            default:
              monthlyIncome = totalIncome / 3;
              monthlyExpenses = totalExpenses / 3;
          }
          
          console.log('Calculated data:', {
            monthlyIncome,
            monthlyExpenses,
            totalDebts,
            totalIncome,
            totalExpenses,
            selectedCardId,
            totalTransactions: data.transactions.length
          });
          
          setIncome(monthlyIncome.toFixed(2));
          setExpenses(monthlyExpenses.toFixed(2));
          setDebts(totalDebts.toFixed(2));
          setAutoDataLoaded(true);
          
          // Mesaj personalizat în funcție de selecție
          let successMessage = 'Datele au fost încărcate automat din baza de date!';
          if (selectedCardId !== 'all') {
            const selectedCard = cards.find(card => card.card_id.toString() === selectedCardId);
            if (selectedCard) {
              successMessage = `Datele au fost încărcate pentru cardul ${selectedCard.card_number} (${selectedCard.accounts_count} account)!`;
            }
          }
          alert(successMessage);
        } else {
          alert('Nu s-au putut încărca datele: ' + (data.error || 'Eroare necunoscută'));
        }
      } else {
        alert('Eroare la conectarea cu serverul!');
      }
    } catch (error) {
      console.error('Eroare la încărcarea datelor:', error);
      alert('Eroare la conectarea cu serverul!');
    } finally {
      setLoading(false);
    }
  };

  // Funcție care permite doar numere în input
  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>): void => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) { // Acceptă doar cifre și un singur punct
      setter(value);
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Calculează-ți Scorul de Credit</h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={fetchAutomaticData}
            disabled={!isLoggedIn || loading || autoDataLoaded}
            className="general-button"
            style={{ 
              flex: 1, 
              marginRight: '0.5rem', 
              opacity: (isLoggedIn && !loading && !autoDataLoaded) ? 1 : 0.6,
              backgroundColor: autoDataLoaded ? '#27ae60' : undefined,
              color: autoDataLoaded ? 'white' : undefined
            }}
            title={`isLoggedIn: ${isLoggedIn}, loading: ${loading}, autoDataLoaded: ${autoDataLoaded}`}
          >
            {loading ? 'Se încarcă...' : autoDataLoaded ? '✓ Date încărcate' : 'CALCUL AUTOMAT'}
          </button>
          <button
            onClick={clearInputs}
            className="general-button"
            style={{ flex: 1, marginLeft: '0.5rem', backgroundColor: '#e74c3c', color: 'white' }}
          >
            Resetare
          </button>
        </div>

        {!isLoggedIn && (
          <p style={{ fontSize: '0.9rem', color: '#e74c3c', marginBottom: '1rem', textAlign: 'center' }}>
            *Necesită autentificare pentru a folosi funcția automată
          </p>
        )}
        
        {autoDataLoaded && (
          <p style={{ fontSize: '0.9rem', color: '#27ae60', marginBottom: '1rem', textAlign: 'center' }}>
            ✓ Datele au fost încărcate automat din baza de date
          </p>
        )}


        

        
        {/* Loading state for accounts */}
        {isLoggedIn && loadingAccounts && (
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#e8f4fd', border: '1px solid #bee5eb', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ color: '#0c5460', margin: '0', fontWeight: 'bold' }}>
              🔄 Se încarcă conturile bancare...
            </p>
          </div>
        )}
        
        {/* Error message when cards fail to load */}
        {isLoggedIn && !loadingAccounts && cards.length === 0 && (
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ color: '#c33', margin: '0', fontWeight: 'bold' }}>
              ⚠️ Nu s-au putut încărca cardurile bancare
            </p>
                         <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
               Clientul nu are carduri asociate cu accounturile bancare sau există o problemă de configurare.
             </p>
             <p style={{ color: '#999', margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>
               Client ID: {(() => {
                 const clientId = localStorage.getItem('client_id') || 
                                localStorage.getItem('clientId') || 
                                localStorage.getItem('user_id') ||
                                localStorage.getItem('userId') ||
                                localStorage.getItem('user');
                 if (clientId && clientId.startsWith('{')) {
                   try {
                     const userData = JSON.parse(clientId);
                     return userData.id || userData.client_id || userData.user_id || 'Unknown';
                   } catch (e) {
                     return 'Parse Error';
                   }
                 }
                 return clientId || 'Not Found';
               })()}
             </p>
            <button 
              onClick={() => {
                const clientId = localStorage.getItem('client_id') || 
                               localStorage.getItem('clientId') || 
                               localStorage.getItem('user_id') ||
                               localStorage.getItem('userId') ||
                               localStorage.getItem('user');
                if (clientId) {
                  if (typeof clientId === 'string' && clientId.startsWith('{')) {
                    try {
                      const userData = JSON.parse(clientId);
                      const extractedClientId = userData.id || userData.client_id || userData.user_id;
                      if (extractedClientId) fetchCards(extractedClientId.toString());
                    } catch (e) {
                      console.error('Error parsing user data:', e);
                    }
                  } else {
                    fetchCards(clientId);
                  }
                }
              }}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#c33',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🔄 Reîncearcă
            </button>
          </div>
        )}
        
        {/* Dropdown pentru selectarea cardului */}
        {isLoggedIn && cards.length > 0 && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            {/* Text explicativ deasupra dropdown-ului */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.5rem 0', lineHeight: '1.4' }}>
                💡 Selectează "Toate cardurile" pentru credit score general sau un card specific pentru calculul individual
              </p>
            </div>
            
            <label htmlFor="cardSelect" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Selectează cardul pentru calcul:
            </label>
            <select
              id="cardSelect"
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '1rem',
                minWidth: '300px'
              }}
            >
              <option value="all">🏦 Toate cardurile (Credit Score General)</option>
              {cards.map((card) => (
                <option key={card.card_id} value={card.card_id}>
                  💳 Card: {card.card_number} ({card.accounts_count} account) - {card.card_type}
                </option>
              ))}
            </select>
            {loadingAccounts && (
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                Se încarcă cardurile...
              </p>
            )}
          </div>
        )}

        {/* Dropdown pentru selectarea perioadei de timp */}
        {isLoggedIn && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <label htmlFor="periodSelect" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Selectează perioada pentru calcul:
            </label>
            <select
              id="periodSelect"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '1rem',
                minWidth: '200px'
              }}
            >
              <option value="1month">📅 Ultima lună</option>
              <option value="3months">📅 Ultimele 3 luni</option>
              <option value="6months">📅 Ultimele 6 luni</option>
              <option value="1year">📅 Ultimul an</option>
              <option value="all">📅 Toate tranzacțiile</option>
            </select>
          </div>
        )}

        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); calculateScore(); }}>
          <input
            type="number"
            placeholder="Venit lunar"
            value={income}
            onChange={(e) => {
              handleNumericInput(e, setIncome);
              if (autoDataLoaded) setAutoDataLoaded(false);
            }}
          />
          <input
            type="number"
            placeholder="Cheltuieli lunare"
            value={expenses}
            onChange={(e) => {
              handleNumericInput(e, setExpenses);
              if (autoDataLoaded) setAutoDataLoaded(false);
            }}
          />
          <input
            type="number"
            placeholder="Datorii totale"
            value={debts}
            onChange={(e) => {
              handleNumericInput(e, setDebts);
              if (autoDataLoaded) setAutoDataLoaded(false);
            }}
          />
          <button type="submit" className="general-button">Calculează</button>
        </form>

        {score !== null && (
          <div style={{ marginTop: "1.5rem", fontSize: "1.5rem", color: "#2a2a2a" }}>
            Scorul tău este: {score}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditScorePage;
