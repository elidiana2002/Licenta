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
  bank_name: string;
}

interface GetClientResponse {
  success: boolean;
  client?: { id: number };
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
}

const CarduriPage: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [form, setForm] = useState({
    account_id: '',
    card_number: '',
    expiration_date: '',
    cvv: '',
    card_type: 'debit',
  });
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);

  // Fetch client id din localStorage/email
  useEffect(() => {
    const fetchClientId = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) return setLoading(false);
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      try {
        const res = await axios.post<GetClientResponse>('http://localhost/api/getClientByEmail.php', { email: parsedUser.email });
        if (res.data.success && res.data.client) {
          setClientId(res.data.client.id);
        } else {
          setError('Nu s-a găsit clientul.');
        }
      } catch {
        setError('Eroare la conectarea cu serverul!');
      }
    };
    fetchClientId();
  }, []);

  // Fetch cards după ce avem clientId
  useEffect(() => {
    if (!clientId) return;
    const fetchCards = async () => {
      setLoading(true);
      try {
        const res = await axios.post<GetCardsResponse>('http://localhost/api/getCardsByClient.php', { client_id: clientId });
        if (res.data.success) {
          setCards(res.data.cards);
        } else {
          setError(res.data.error || 'Eroare la încărcare carduri');
        }
      } catch {
        setError('Eroare la conectarea cu serverul!');
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [clientId]);

  // Grupare carduri pe bancă
  const grouped = cards.reduce<{ [bank: string]: Card[] }>((acc, card) => {
    if (!acc[card.bank_name]) acc[card.bank_name] = [];
    acc[card.bank_name].push(card);
    return acc;
  }, {});

  // Adăugare card nou
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    if (!form.account_id || !form.card_number || !form.expiration_date || !form.cvv) {
      setAddError('Completează toate câmpurile!');
      return;
    }
    try {
      const res = await axios.post<SimpleResponse>('http://localhost/api/addCard.php', {
        ...form,
        account_id: Number(form.account_id),
      });
      if (res.data.success) {
        setAddSuccess('Card adăugat cu succes!');
        setShowAddForm(false);
        setForm({ account_id: '', card_number: '', expiration_date: '', cvv: '', card_type: 'debit' });
        // Refresh cards
        if (clientId) {
          const cardsRes = await axios.post<GetCardsResponse>('http://localhost/api/getCardsByClient.php', { client_id: clientId });
          if (cardsRes.data.success) setCards(cardsRes.data.cards);
        }
      } else {
        setAddError(res.data.error || 'Eroare la adăugare!');
      }
    } catch {
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
    } catch {
      alert('Eroare la conectarea cu serverul!');
    }
  };

  // Render
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
            Object.entries(grouped).map(([bank, cards]) => (
              <div key={bank} style={{ width: '100%', marginBottom: 24 }}>
                <h3 style={{ margin: '16px 0 8px 0', color: '#b8860b' }}>{bank}</h3>
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
                        <td style={{ padding: 8, border: '1px solid #eee', fontFamily: 'monospace' }}>{card.card_number}</td>
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
            ))
          )
        )}
        <button onClick={() => setShowAddForm(f => !f)} style={{ marginTop: 12, marginBottom: 12, padding: '8px 16px', background: '#ffe680', border: '1px solid #ccc', borderRadius: 4, color: '#111', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}>
          {showAddForm ? 'Renunță' : 'Adaugă card nou'}
        </button>
        {showAddForm && (
          <form onSubmit={handleAddCard} style={{ width: '100%', maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="text" placeholder="ID cont (account_id)" value={form.account_id} onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))} required />
            <input type="text" placeholder="Număr card" value={form.card_number} onChange={e => setForm(f => ({ ...f, card_number: e.target.value }))} required />
            <input type="text" placeholder="Data expirării (YYYY-MM)" value={form.expiration_date} onChange={e => setForm(f => ({ ...f, expiration_date: e.target.value }))} required />
            <input type="text" placeholder="CVV" value={form.cvv} onChange={e => setForm(f => ({ ...f, cvv: e.target.value }))} required />
            <select value={form.card_type} onChange={e => setForm(f => ({ ...f, card_type: e.target.value }))}>
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
              <option value="virtual">Virtual</option>
            </select>
            {addError && <div style={{ color: 'red' }}>{addError}</div>}
            {addSuccess && <div style={{ color: 'green' }}>{addSuccess}</div>}
            <button type="submit" style={{ padding: '8px 16px', background: '#ffe680', border: '1px solid #ccc', borderRadius: 4, color: '#111', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}>Adaugă card</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CarduriPage;