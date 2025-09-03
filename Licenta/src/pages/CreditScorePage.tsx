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
        
        // Dacă avem user data, setăm isLoggedIn și încărcăm cardurile
        if (parsedUser && parsedUser.id) {
          setIsLoggedIn(true);
          console.log('CreditScorePage - User is logged in with user ID:', parsedUser.id);
          fetchCards(parsedUser.id.toString());
        }
      } catch (e) {
        console.log('CreditScorePage - user data is not JSON:', userData);
      }
    } else if (clientId) {
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
      const response = await fetch('http://localhost/api/getCardsByClient.php', {
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
          let totalAccountBalance = 0;
          
          // Calculează balance-urile totale din accounts
          if (selectedCardId === 'all') {
            // Pentru toate cardurile, calculează balance-urile totale
            // Vom face un request separat pentru a obține balance-urile
            try {
              const balanceResponse = await fetch('http://localhost/api/getAccountBalances.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id: parseInt(clientId) })
              });
              
              if (balanceResponse.ok) {
                const balanceData = await balanceResponse.json();
                console.log('Balance response:', balanceData);
                if (balanceData.success && balanceData.accounts) {
                  totalAccountBalance = balanceData.total_balance || 0;
                  console.log('Total account balance:', totalAccountBalance);
                }
              }
            } catch (error) {
              console.error('Error fetching account balances:', error);
            }
          } else {
            // Pentru un card specific, calculează balance-urile doar pentru accounturile asociate
            const selectedCard = cards.find(card => card.card_id.toString() === selectedCardId);
            if (selectedCard && selectedCard.account_ibans) {
              try {
                const balanceResponse = await fetch('http://localhost/api/getAccountBalances.php', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ client_id: parseInt(clientId) })
                });
                
                if (balanceResponse.ok) {
                  const balanceData = await balanceResponse.json();
                  console.log('Balance response for specific card:', balanceData);
                  if (balanceData.success && balanceData.accounts) {
                    const cardAccountIbans = selectedCard.account_ibans.split(', ');
                    totalAccountBalance = balanceData.accounts
                      .filter((account: any) => cardAccountIbans.includes(account.iban))
                      .reduce((sum: number, account: any) => {
                        return sum + (parseFloat(account.balance) || 0);
                      }, 0);
                    console.log('Card-specific account balance:', totalAccountBalance);
                  }
                }
              } catch (error) {
                console.error('Error fetching account balances for specific card:', error);
              }
            }
          }
          
          // Calculează veniturile din balance-urile pozitive (exclude balance-urile negative)
          let totalIncomeFromBalances = 0;
          if (selectedCardId === 'all') {
            // Pentru credit score general, calculează veniturile din toate accounturile pozitive
            try {
              const balanceResponse = await fetch('http://localhost/api/getAccountBalances.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id: parseInt(clientId) })
              });
              
              if (balanceResponse.ok) {
                const balanceData = await balanceResponse.json();
                if (balanceData.success && balanceData.accounts) {
                  // Calculează veniturile din balance-urile pozitive
                  balanceData.accounts.forEach((account: any) => {
                    const balance = parseFloat(account.balance) || 0;
                    if (balance > 0) {
                      totalIncomeFromBalances += balance;
                      console.log(`Account ${account.iban} has positive balance: ${balance} (income)`);
                    }
                  });
                }
              }
            } catch (error) {
              console.error('Error fetching account balances for income calculation:', error);
            }
            totalIncome = totalIncomeFromBalances; // Resetăm și folosim doar balance-urile pozitive
            console.log('General credit score - using only positive account balances as income');
          } else {
            // Pentru card specific, calculează veniturile din balance-urile pozitive ale cardului
            const selectedCard = cards.find(card => card.card_id.toString() === selectedCardId);
            if (selectedCard && selectedCard.account_ibans) {
              try {
                const balanceResponse = await fetch('http://localhost/api/getAccountBalances.php', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ client_id: parseInt(clientId) })
                });
                
                if (balanceResponse.ok) {
                  const balanceData = await balanceResponse.json();
                  if (balanceData.success && balanceData.accounts) {
                    const cardAccountIbans = selectedCard.account_ibans.split(', ');
                    balanceData.accounts
                      .filter((account: any) => cardAccountIbans.includes(account.iban))
                      .forEach((account: any) => {
                        const balance = parseFloat(account.balance) || 0;
                        if (balance > 0) {
                          totalIncomeFromBalances += balance;
                          console.log(`Card account ${account.iban} has positive balance: ${balance} (income)`);
                        }
                      });
                  }
                }
              } catch (error) {
                console.error('Error fetching account balances for card-specific income calculation:', error);
              }
            }
            totalIncome += totalIncomeFromBalances; // Adăugăm balance-urile pozitive la tranzacții
            console.log('Card-specific credit score - adding positive account balances to transaction income');
          }
          
          // Calculează datoriile din balance-urile negative (carduri de credit)
          let totalDebtsFromBalances = 0;
          if (selectedCardId === 'all') {
            // Pentru credit score general, calculează datoriile din toate accounturile
            try {
              const balanceResponse = await fetch('http://localhost/api/getAccountBalances.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id: parseInt(clientId) })
              });
              
              if (balanceResponse.ok) {
                const balanceData = await balanceResponse.json();
                if (balanceData.success && balanceData.accounts) {
                  // Calculează datoriile din balance-urile negative
                  balanceData.accounts.forEach((account: any) => {
                    const balance = parseFloat(account.balance) || 0;
                    if (balance < 0) {
                      totalDebtsFromBalances += Math.abs(balance); // Datoria este valoarea absolută
                      console.log(`Account ${account.iban} has negative balance: ${balance} (debt: ${Math.abs(balance)})`);
                    }
                  });
                }
              }
            } catch (error) {
              console.error('Error fetching account balances for debt calculation:', error);
            }
          } else {
            // Pentru card specific, calculează datoriile doar pentru accounturile asociate
            const selectedCard = cards.find(card => card.card_id.toString() === selectedCardId);
            if (selectedCard && selectedCard.account_ibans) {
              try {
                const balanceResponse = await fetch('http://localhost/api/getAccountBalances.php', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ client_id: parseInt(clientId) })
                });
                
                if (balanceResponse.ok) {
                  const balanceData = await balanceResponse.json();
                  if (balanceData.success && balanceData.accounts) {
                    const cardAccountIbans = selectedCard.account_ibans.split(', ');
                    balanceData.accounts
                      .filter((account: any) => cardAccountIbans.includes(account.iban))
                      .forEach((account: any) => {
                        const balance = parseFloat(account.balance) || 0;
                        if (balance < 0) {
                          totalDebtsFromBalances += Math.abs(balance);
                          console.log(`Card account ${account.iban} has negative balance: ${balance} (debt: ${Math.abs(balance)})`);
                        }
                      });
                  }
                }
              } catch (error) {
                console.error('Error fetching account balances for card-specific debt calculation:', error);
              }
            }
          }
          
          // Adaugă datoriile din balance-uri la datoriile totale
          totalDebts += totalDebtsFromBalances;
          console.log('Debt calculation:', {
            totalDebtsFromBalances: totalDebtsFromBalances,
            totalDebts: totalDebts
          });
          
          console.log('Final income calculation:', {
            selectedCardId: selectedCardId,
            totalIncome: totalIncome,
            totalIncomeFromBalances: totalIncomeFromBalances,
            totalAccountBalance: totalAccountBalance,
            isGeneral: selectedCardId === 'all'
          });
          
          // Calculează veniturile și cheltuielile din tranzacții
          console.log('Processing transactions:', data.transactions.length);
          data.transactions.forEach((transaction: any, index: number) => {
            const amount = parseFloat(transaction.amount) || 0;
            const direction = transaction.transaction_direction;
            
            console.log(`Transaction ${index + 1}:`, {
              id: transaction.id,
              amount: amount,
              direction: direction,
              account_iban: transaction.account_iban,
              destination_account_iban: transaction.destination_account_iban
            });
            
            // Filtrează tranzacțiile pe card specific dacă este selectat
            if (selectedCardId !== 'all') {
              // Verifică dacă tranzacția aparține cardului selectat
              const selectedCard = cards.find(card => card.card_id.toString() === selectedCardId);
              if (selectedCard && selectedCard.account_ibans) {
                // Verifică dacă tranzacția este asociată cu accounturile cardului
                const cardAccountIbans = selectedCard.account_ibans.split(', ');
                if (transaction.account_iban && !cardAccountIbans.includes(transaction.account_iban)) {
                  console.log(`Skipping transaction ${transaction.id} - not for selected card`);
                  return; // Sărim această tranzacție dacă nu aparține cardului
                }
              }
            }
            
            // Pentru credit score general: procesăm doar cheltuielile (outgoing)
            // Pentru card specific: procesăm atât veniturile cât și cheltuielile
            if (selectedCardId === 'all') {
              // Credit Score General: doar cheltuielile
              if (direction === 'outgoing') {
                totalExpenses += amount;
                console.log(`General - Added ${amount} to expenses (total: ${totalExpenses})`);
              }
            } else {
              // Credit Score per Card: veniturile și cheltuielile
              if (direction === 'incoming') {
                totalIncome += amount;
                console.log(`Card-specific - Added ${amount} to income (total: ${totalIncome})`);
              } else if (direction === 'outgoing') {
                totalExpenses += amount;
                console.log(`Card-specific - Added ${amount} to expenses (total: ${totalExpenses})`);
              }
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
            totalAccountBalance,
            selectedCardId,
            totalTransactions: data.transactions.length,
            breakdown: {
              accountBalance: totalAccountBalance,
              transactionIncome: totalIncome - totalAccountBalance,
              transactionExpenses: totalExpenses
            }
          });
          
          setIncome(monthlyIncome.toFixed(2));
          setExpenses(monthlyExpenses.toFixed(2));
          setDebts(totalDebts.toFixed(2));
          setAutoDataLoaded(true);
          
          // Calculează automat și scorul de credit
          const incomeVal = monthlyIncome;
          const expensesVal = monthlyExpenses;
          const debtsVal = totalDebts;
          const calculatedScore = incomeVal - expensesVal - (debtsVal * 2);
          setScore(calculatedScore);
          
          // Mesaj personalizat în funcție de selecție
          let successMessage = `Datele au fost încărcate automat din baza de date! (Credit Score General - Venituri: ${totalIncomeFromBalances.toFixed(2)} RON, Datorii: ${totalDebtsFromBalances.toFixed(2)} RON + cheltuieli din tranzacții)`;
          if (selectedCardId !== 'all') {
            const selectedCard = cards.find(card => card.card_id.toString() === selectedCardId);
            if (selectedCard) {
              successMessage = `Datele au fost încărcate pentru cardul ${selectedCard.card_number} (${selectedCard.accounts_count} account, Venituri: ${totalIncomeFromBalances.toFixed(2)} RON, Datorii: ${totalDebtsFromBalances.toFixed(2)} RON + toate tranzacțiile)!`;
            }
          }
          
          // Nu mai afișăm alert-ul pentru a nu întrerupe experiența
          console.log(successMessage);
          console.log('Scorul de credit calculat automat:', calculatedScore);
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

  // Funcție pentru afișarea mesajelor de ajutor/îndrumare
  const renderCreditScoreAdvice = (score: number, income: number, expenses: number, debts: number) => {
    const adviceStyle = {
      padding: '1rem',
      borderRadius: '8px',
      marginTop: '1rem',
      fontSize: '0.9rem',
      lineHeight: '1.5'
    };

    // Analizează factorii care afectează credit score-ul
    const debtToIncomeRatio = income > 0 ? (debts / income) * 100 : 0;
    const expenseToIncomeRatio = income > 0 ? (expenses / income) * 100 : 0;
    
    let adviceColor = '';
    let adviceIcon = '';
    let adviceTitle = '';
    let adviceMessage = '';
    let suggestions: string[] = [];

    if (score >= 1000) {
      adviceColor = '#27ae60';
      adviceIcon = '🎉';
      adviceTitle = 'Excelent!';
      adviceMessage = 'Credit score-ul tău este foarte bun!';
      suggestions = [
        'Menține această situație financiară stabilă',
        'Continuă să economisești regulat',
        'Monitorizează periodic credit score-ul'
      ];
    } else if (score >= 500) {
      adviceColor = '#2ecc71';
      adviceIcon = '👍';
      adviceTitle = 'Bun!';
      adviceMessage = 'Credit score-ul tău este acceptabil, dar poate fi îmbunătățit.';
      suggestions = [
        'Încearcă să reduci cheltuielile lunare',
        'Economisește mai mult din venituri',
        'Plătește datoriile existente'
      ];
    } else if (score >= 0) {
      adviceColor = '#f39c12';
      adviceIcon = '⚠️';
      adviceTitle = 'Acceptabil';
      adviceMessage = 'Credit score-ul tău este în limitele acceptabile, dar necesită atenție.';
      suggestions = [
        'Redu semnificativ cheltuielile lunare',
        'Crește veniturile dacă este posibil',
        'Plătește prioritariamente datoriile cu dobânzi mari',
        'Evită noi datorii'
      ];
    } else {
      adviceColor = '#e74c3c';
      adviceIcon = '🚨';
      adviceTitle = 'Necesită atenție!';
      adviceMessage = 'Credit score-ul tău este scăzut și necesită acțiuni imediate.';
      suggestions = [
        'Redu drastic cheltuielile lunare',
        'Plătește urgent toate datoriile',
        'Caută surse suplimentare de venit',
        'Consultează un specialist financiar',
        'Evită complet noi datorii'
      ];
    }

    // Adaugă sugestii specifice bazate pe analiza financiară
    if (debtToIncomeRatio > 50) {
      suggestions.push('⚠️ Datoriile reprezintă peste 50% din venituri - acest lucru afectează negativ credit score-ul');
    }
    
    if (expenseToIncomeRatio > 80) {
      suggestions.push('⚠️ Cheltuielile reprezintă peste 80% din venituri - încearcă să economisești mai mult');
    }
    
    if (debts > income * 2) {
      suggestions.push('🚨 Datoriile sunt de 2 ori mai mari decât veniturile - acest lucru este foarte riscant');
    }

    return (
      <div style={{
        ...adviceStyle,
        backgroundColor: adviceColor + '15',
        border: `2px solid ${adviceColor}`,
        color: '#2c3e50'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '0.5rem',
          fontWeight: 'bold',
          fontSize: '1rem'
        }}>
          <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>{adviceIcon}</span>
          <span style={{ color: adviceColor }}>{adviceTitle}</span>
        </div>
        
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>
          {adviceMessage}
        </p>
        
        <div style={{ marginTop: '0.5rem' }}>
          <strong style={{ color: adviceColor }}>Sugestii pentru îmbunătățire:</strong>
          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem' }}>
            {suggestions.map((suggestion, index) => (
              <li key={index} style={{ marginBottom: '0.3rem' }}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Informații suplimentare despre factorii de risc */}
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.5rem', 
          backgroundColor: '#ecf0f1', 
          borderRadius: '4px',
          fontSize: '0.8rem'
        }}>
          <strong>Analiza financiară:</strong>
          <div style={{ marginTop: '0.3rem' }}>
            • Datorii/venituri: {debtToIncomeRatio.toFixed(1)}%
            {debtToIncomeRatio > 30 && <span style={{ color: '#e74c3c' }}> (Ridicat)</span>}
          </div>
          <div>
            • Cheltuieli/venituri: {expenseToIncomeRatio.toFixed(1)}%
            {expenseToIncomeRatio > 70 && <span style={{ color: '#e74c3c' }}> (Ridicat)</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Calculează-ți Scorul de Credit</h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={fetchAutomaticData}
            disabled={!isLoggedIn || loading}
            className="general-button"
            style={{ 
              flex: 1, 
              marginRight: '0.5rem', 
              opacity: (isLoggedIn && !loading) ? 1 : 0.6,
              backgroundColor: autoDataLoaded ? '#27ae60' : undefined,
              color: autoDataLoaded ? 'white' : undefined
            }}
            title={`isLoggedIn: ${isLoggedIn}, loading: ${loading}`}
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
            ✓ Datele au fost încărcate automat din baza de date (Balance pozitive = venituri, Balance negative = datorii)
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
              onChange={(e) => {
                setSelectedCardId(e.target.value);
                // Resetează datele calculate când se schimbă selecția
                if (autoDataLoaded) {
                  setIncome('');
                  setExpenses('');
                  setDebts('');
                  setScore(null);
                  setAutoDataLoaded(false);
                }
              }}
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
              onChange={(e) => {
                setSelectedPeriod(e.target.value);
                // Resetează datele calculate când se schimbă perioada
                if (autoDataLoaded) {
                  setIncome('');
                  setExpenses('');
                  setDebts('');
                  setScore(null);
                  setAutoDataLoaded(false);
                }
              }}
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
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ fontSize: "1.5rem", color: "#2a2a2a", marginBottom: "1rem" }}>
              Scorul tău este: {score}
            </div>
            
            {/* Mesaj de ajutor/îndrumare */}
            {renderCreditScoreAdvice(score, parseFloat(income) || 0, parseFloat(expenses) || 0, parseFloat(debts) || 0)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditScorePage;
