import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Card {
  id: number;
  account_id: number;
  card_number: string;
  expiration_date: string;
  cvv: string;
  status: string;
  card_type: string;
  issued_at: string;
  iban: string;
  currency: string;
  bank_id: number;
}

interface GetClientResponse {
  success: boolean;
  client?: { id: number };
  error?: string;
}

interface GetAccountsResponse {
  success: boolean;
  accounts?: { id: number; iban: string; currency: string; account_type: string }[];
  error?: string;
}

interface GetCardsResponse {
  success: boolean;
  cards: Card[];
  error?: string;
}

interface SimpleResponse {
  success?: boolean;
  error?: string;
  debug?: any;
}

// Funcții de criptare/decriptare simple
const ENCRYPTION_KEY = 'licenta2024';

// TEMPORAR: Eliminăm criptarea pentru a face aplicația să funcționeze
const encryptData = (data: string): string => {
  return data; // Returnează datele necriptate
};

// TEMPORAR: Eliminăm decriptarea pentru a face aplicația să funcționeze
const decryptData = (encryptedData: string): string => {
  return encryptedData; // Returnează datele fără decriptare
};

const CarduriPage: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [form, setForm] = useState({
    card_number: '',
    expiration_date: '',
    cvv: '',
    card_type: 'debit',
    bank_id: '',
    status: 'active',
    iban: '',
    currency: 'RON',
  });
  const [useChaseFormat, setUseChaseFormat] = useState(false);
  const [showOtherBankInput, setShowOtherBankInput] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [accountData, setAccountData] = useState<{ iban: string; currency: string; account_type: string } | null>(null);
  const [banks, setBanks] = useState<{ id: number; name: string }[]>([]);

  // Fetch client id și account id din localStorage/email
  useEffect(() => {
    const fetchClientData = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) return setLoading(false);
      const parsedUser = JSON.parse(userData);
      try {
        const clientRes = await axios.post<GetClientResponse>('http://localhost/api/getClientByEmail.php', { email: parsedUser.email });
        if (clientRes.data.success && clientRes.data.client) {
          setClientId(clientRes.data.client.id);
          
          const accountsRes = await axios.post<GetAccountsResponse>('http://localhost/api/getAccountsByClient.php', { client_id: clientRes.data.client.id });
          if (accountsRes.data.success && accountsRes.data.accounts && accountsRes.data.accounts.length > 0) {
            const account = accountsRes.data.accounts[0];
            setAccountId(account.id);
            setAccountData(account);
          } else {
            setError('Clientul nu are niciun cont bancar. Contactează administratorul.');
          }
        } else {
          setError('Nu s-a găsit clientul.');
        }
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError('Eroare la conectarea cu serverul!');
      }
    };
    fetchClientData();
  }, []);

  // Fetch băncile disponibile
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await axios.get<{ success: boolean; banks: { id: number; name: string }[] }>('http://localhost/api/getBanks.php');
        console.log('Banks response:', res.data);
        if (res.data.success) {
          setBanks(res.data.banks);
          console.log('Banks set:', res.data.banks);
        }
      } catch (err) {
        console.error('Error fetching banks:', err);
      }
    };
    fetchBanks();
  }, []);

  // Funcție pentru pre-completarea automată a formularului
  const prefillForm = () => {
    if (accountData) {
      setForm({
        card_number: '',
        expiration_date: '',
        cvv: '',
        card_type: 'debit',
        bank_id: banks.length > 0 ? banks[0].id.toString() : '',
        status: 'active',
        iban: accountData.iban,
        currency: accountData.currency,
      });
    }
  };

  // Pre-completează formularul când se deschide
  useEffect(() => {
    if (showAddForm && accountData) {
      prefillForm();
    }
  }, [showAddForm, accountData]);

  // Fetch cards după ce avem clientId
  useEffect(() => {
    if (!clientId) return;
    const fetchCards = async () => {
      setLoading(true);
      try {
        const res = await axios.post<GetCardsResponse>('http://localhost/api/getCardsByClient.php', { client_id: clientId });
        if (res.data.success) {
          const decryptedCards = res.data.cards.map(card => ({
            ...card,
            card_number: decryptData(card.card_number),
            expiration_date: decryptData(card.expiration_date),
            cvv: decryptData(card.cvv)
          }));
          setCards(decryptedCards);
        } else {
          setError(res.data.error || 'Eroare la încărcare carduri');
        }
      } catch (err) {
        console.error('Error fetching cards:', err);
        setError('Eroare la conectarea cu serverul!');
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [clientId]);

  // Grupare carduri pe bancă
  const grouped = cards.reduce<{ [bank: string]: Card[] }>((acc, card) => {
    const bankKey = `bank_${card.bank_id}`;
    if (!acc[bankKey]) acc[bankKey] = [];
    acc[bankKey].push(card);
    return acc;
  }, {});

  // Formatare automată număr card
  const formatCardNumber = (value: string, isChaseFormat: boolean): string => {
    const cleaned = value.replace(/\D/g, '');
    if (isChaseFormat) {
      return cleaned.slice(0, 32).replace(/(\d{4})/g, '$1 ').trim();
    } else {
      return cleaned.slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
    }
  };

  // Formatare automată data expirării (MM/YY)
  const formatExpirationDate = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      const month = cleaned.slice(0, 2);
      const year = cleaned.slice(2, 4);
      if (month && year) {
        return `${month}/${year}`;
      }
      return month;
    }
    return cleaned;
  };

  // Gestionare selecție bancă
  const handleBankChange = (value: string) => {
    if (value === 'other') {
      setShowOtherBankInput(true);
      setForm(f => ({ ...f, bank_id: '' }));
    } else {
      setShowOtherBankInput(false);
      setForm(f => ({ ...f, bank_id: value }));
    }
  };

  // Validare formular
  const validateForm = () => {
    if (!form.card_number || !form.expiration_date || !form.cvv || !form.bank_id) {
      return 'Completează toate câmpurile!';
    }
    
    const cleanedCardNumber = form.card_number.replace(/\s/g, '');
    
    if (useChaseFormat) {
      if (!/^\d{16,32}$/.test(cleanedCardNumber)) {
        return 'Numărul cardului trebuie să aibă între 16-32 cifre!';
      }
    } else {
      if (!/^\d{16}$/.test(cleanedCardNumber)) {
        return 'Numărul cardului trebuie să aibă exact 16 cifre!';
      }
    }
    
    if (!/^\d{3}$/.test(form.cvv)) {
      return 'CVV-ul trebuie să aibă exact 3 cifre!';
    }
    
    if (!/^\d{2}\/\d{2}$/.test(form.expiration_date)) {
      return 'Data expirării trebuie să fie în format MM/YY!';
    }
    
    const [month, year] = form.expiration_date.split('/');
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (monthNum < 1 || monthNum > 12) {
      return 'Luna trebuie să fie între 01-12!';
    }
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return 'Data expirării nu poate fi în trecut!';
    }
    
    if (!form.bank_id || form.bank_id === '') {
      return 'Selectează o bancă!';
    }
    
    return null;
  };

  // Adăugare card nou
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    
    if (!clientId) {
      setAddError('Nu s-a putut identifica clientul!');
      return;
    }
    
    const validationError = validateForm();
    if (validationError) {
      setAddError(validationError);
      return;
    }
    
    try {
      const encryptedData = {
        client_id: clientId,
        account_id: accountId,
        card_number: encryptData(form.card_number),
        expiration_date: encryptData(form.expiration_date),
        cvv: encryptData(form.cvv),
        card_type: form.card_type,
        bank_id: form.bank_id,
        status: form.status,
        iban: form.iban,
        currency: form.currency,
      };
      
      console.log('Sending data:', encryptedData);
      
                           const res = await axios.post<SimpleResponse>('http://localhost/api/addCard.php', encryptedData);
      if (res.data.success) {
        setAddSuccess('Card adăugat cu succes!');
        setShowAddForm(false);
        setForm({ card_number: '', expiration_date: '', cvv: '', card_type: 'debit', bank_id: '', status: 'active', iban: '', currency: 'RON' });
        setUseChaseFormat(false);
        setShowOtherBankInput(false);
        
        if (clientId) {
                                           const accountsRes = await axios.post<GetAccountsResponse>('http://localhost/api/getAccountsByClient.php', { client_id: clientId });
          if (accountsRes.data.success && accountsRes.data.accounts && accountsRes.data.accounts.length > 0) {
            const account = accountsRes.data.accounts[0];
            setAccountId(account.id);
            setAccountData(account);
          }
          
                                           const cardsRes = await axios.post<GetCardsResponse>('http://localhost/api/getCardsByClient.php', { client_id: clientId });
          if (cardsRes.data.success) {
            const decryptedCards = cardsRes.data.cards.map(card => ({
              ...card,
              card_number: decryptData(card.card_number),
              expiration_date: decryptData(card.expiration_date),
              cvv: decryptData(card.cvv)
            }));
            setCards(decryptedCards);
          }
        }
      } else {
        setAddError(res.data.error || 'Eroare la adăugare!');
        if (res.data.debug) {
          console.log('Debug info:', res.data.debug);
        }
      }
    } catch (err) {
      console.error('Error adding card:', err);
      setAddError('Eroare la conectarea cu serverul!');
    }
  };

  // Ștergere card
  const handleDelete = async (id: number) => {
    if (!window.confirm('Sigur vrei să ștergi acest card?')) return;
    try {
                           const res = await axios.post<SimpleResponse>('http://localhost/api/deleteCard.php', { id });
      if (res.data.success) {
        setCards(cards.filter(c => c.id !== id));
      } else {
        alert(res.data.error || 'Eroare la ștergere!');
      }
    } catch (err) {
      console.error('Error deleting card:', err);
      alert('Eroare la conectarea cu serverul!');
    }
  };

  // Formatare număr card pentru afișare
  const displayCardNumber = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    return cleaned.replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'flex-start' }}>
      <div className="card" style={{ maxWidth: 700, margin: '0 auto', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px #0002', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 18, fontSize: 30, fontWeight: 700, letterSpacing: 1 }}>Carduri</h2>
        
        {loading ? (
          <div>Se încarcă...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          Object.keys(grouped).length === 0 ? (
            <div style={{ marginBottom: 16 }}>Nu ai niciun card adăugat.</div>
          ) : (
            Object.entries(grouped).map(([bankKey, cards]) => {
              const bankId = parseInt(bankKey.replace('bank_', ''));
              const bankName = banks.find(b => b.id === bankId)?.name || `Banca ${bankId}`;
              
              return (
                <div key={bankKey} style={{ width: '100%', marginBottom: 24 }}>
                  <h3 style={{ margin: '16px 0 8px 0', color: '#b8860b' }}>{bankName}</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                    <thead>
                      <tr style={{ background: '#fffbe6' }}>
                        <th style={{ padding: 8, border: '1px solid #eee' }}>Număr card</th>
                        <th style={{ padding: 8, border: '1px solid #eee' }}>Tip</th>
                        <th style={{ padding: 8, border: '1px solid #eee' }}>Expiră</th>
                        <th style={{ padding: 8, border: '1px solid #eee' }}>IBAN</th>
                        <th style={{ padding: 8, border: '1px solid #eee' }}>Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cards.map(card => (
                        <tr key={card.id}>
                          <td style={{ padding: 8, border: '1px solid #eee', fontFamily: 'monospace' }}>{displayCardNumber(card.card_number)}</td>
                          <td style={{ padding: 8, border: '1px solid #eee' }}>{card.card_type}</td>
                          <td style={{ padding: 8, border: '1px solid #eee' }}>{card.expiration_date}</td>
                          <td style={{ padding: 8, border: '1px solid #eee' }}>{card.iban}</td>
                          <td style={{ padding: 8, border: '1px solid #eee' }}>
                            <button onClick={() => handleDelete(card.id)} style={{ color: '#b00020', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Șterge</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })
          )
        )}
        
        <button onClick={() => setShowAddForm(f => !f)} style={{ marginTop: 12, marginBottom: 12, padding: '8px 16px', background: '#ffe680', border: '1px solid #ccc', borderRadius: 4, color: '#111', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}>
          {showAddForm ? 'Renunță' : 'Adaugă card nou'}
        </button>
        
        {showAddForm && (
          <form onSubmit={handleAddCard} style={{ width: '100%', maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input 
                type="text" 
                placeholder={useChaseFormat ? "Număr card (16-32 cifre)" : "Număr card (16 cifre)"}
                value={form.card_number} 
                onChange={e => setForm(f => ({ ...f, card_number: formatCardNumber(e.target.value, useChaseFormat) }))} 
                maxLength={useChaseFormat ? 35 : 19}
                required 
                style={{ flex: 1 }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                <input 
                  type="checkbox" 
                  checked={useChaseFormat} 
                  onChange={e => {
                    setUseChaseFormat(e.target.checked);
                    setForm(f => ({ ...f, card_number: '' }));
                  }}
                />
                Chase format
              </label>
            </div>
            
            <input 
              type="text" 
              placeholder="Data expirării (MM/YY)" 
              value={form.expiration_date} 
              onChange={e => setForm(f => ({ ...f, expiration_date: formatExpirationDate(e.target.value) }))} 
              maxLength={5}
              required 
            />
            
            <input 
              type="text" 
              placeholder="CVV (3 cifre)" 
              value={form.cvv} 
              onChange={e => setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))} 
              maxLength={3}
              required 
            />
            
            <select value={form.card_type} onChange={e => setForm(f => ({ ...f, card_type: e.target.value }))}>
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
              <option value="virtual">Virtual</option>
            </select>
            
            <select value={form.bank_id} onChange={e => handleBankChange(e.target.value)} required>
              <option value="">Selectează banca</option>
              {banks.map(bank => (
                <option key={bank.id} value={bank.id.toString()}>
                  {bank.name}
                </option>
              ))}
              <option value="other">Altă bancă</option>
            </select>
            
            {showOtherBankInput && (
              <input 
                type="text" 
                placeholder="Numele băncii (manual)" 
                value={form.bank_id} 
                onChange={e => setForm(f => ({ ...f, bank_id: e.target.value }))} 
                required 
              />
            )}
            
            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
              <option value="RON">RON</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
            
            <div style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
              <strong>IBAN:</strong> {form.iban || 'Se va pre-completa automat'}
            </div>
            
            {addError && <div style={{ color: 'red' }}>{addError}</div>}
            {addSuccess && <div style={{ color: 'green' }}>{addSuccess}</div>}
            
            <button type="submit" style={{ padding: '8px 16px', background: '#ffe680', border: '1px solid #ccc', borderRadius: 4, color: '#111', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}>
              Adaugă card
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CarduriPage;
