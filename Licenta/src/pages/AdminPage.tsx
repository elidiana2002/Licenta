import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPage.css';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
  cnp?: string;
  address?: string;
  phone?: string;
}

interface AdminStats {
  users: number;
  accounts: number;
  transactions: number;
  cards: number;
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats>({ users: 0, accounts: 0, transactions: 0, cards: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    password: '',
    cnp: '',
    address: '',
    phone: ''
  });
  const [editingCard, setEditingCard] = useState<any | null>(null);
  const [editCardForm, setEditCardForm] = useState({
    card_number: '',
    card_type: '',
    status: '',
    expiry_date: '',
    cvv: ''
  });
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'default' | 'asc' | 'desc'}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verifică dacă utilizatorul este admin
        const userData = localStorage.getItem('user');
        if (!userData) {
          setError('Nu ești autentificat');
          setLoading(false);
          return;
        }

        const user = JSON.parse(userData);
        if (user.role !== 'admin') {
          setError('Acces interzis - doar adminii pot accesa această pagină');
          setLoading(false);
          return;
        }

        // Încarcă utilizatorii
        const usersResponse = await axios.get('http://localhost/api/getUsers.php');
        const usersData = usersResponse.data as { success: boolean; users: User[] };
        if (usersData.success) {
          setUsers(usersData.users);
          setStats(prev => ({ ...prev, users: usersData.users.length }));
        }

        // Încarcă conturile
        try {
          const accountsResponse = await axios.get('http://localhost/api/getAllAccounts.php');
          const accountsData = accountsResponse.data as { success: boolean; accounts: any[] };
          if (accountsData.success) {
            setAccounts(accountsData.accounts || []);
            setStats(prev => ({ ...prev, accounts: accountsData.accounts.length }));
          }
        } catch (err) {
          console.log('Nu s-au putut încărca conturile:', err);
          setStats(prev => ({ ...prev, accounts: 0 }));
        }

        // Încarcă tranzacțiile
        try {
          const transactionsResponse = await axios.get('http://localhost/api/getAllTransactions.php');
          const transactionsData = transactionsResponse.data as { success: boolean; transactions: any[] };
          if (transactionsData.success) {
            setTransactions(transactionsData.transactions || []);
            setStats(prev => ({ ...prev, transactions: transactionsData.transactions.length }));
          }
        } catch (err) {
          console.log('Nu s-au putut încărca tranzacțiile:', err);
          setStats(prev => ({ ...prev, transactions: 0 }));
        }

        // Încarcă cardurile
        try {
          const cardsResponse = await axios.get('http://localhost/api/getAllCards.php');
          const cardsData = cardsResponse.data as { success: boolean; cards: any[] };
          if (cardsData.success) {
            setCards(cardsData.cards || []);
            setStats(prev => ({ ...prev, cards: cardsData.cards.length }));
          }
        } catch (err) {
          console.log('Nu s-au putut încărca cardurile:', err);
          setStats(prev => ({ ...prev, cards: 0 }));
        }

        setLoading(false);
      } catch (err) {
        setError('Eroare la încărcarea datelor');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        ⏳ Se încarcă datele...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        ❌ {error}
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      password: '', // Nu afișăm parola existentă
      cnp: user.cnp || '',
      address: user.address || '',
      phone: user.phone || ''
    });
    setSaveMessage('');
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    setSaving(true);
    setSaveMessage('');

    try {
      const response = await axios.post('http://localhost/api/updateClientProfile.php', {
        id: editingUser.id,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        role: editForm.role,
        password: editForm.password,
        cnp: editForm.cnp,
        address: editForm.address,
        phone: editForm.phone
      });

      const responseData = response.data as { success: boolean; error?: string };
      if (responseData.success) {
        // Actualizează lista de utilizatori
        setUsers(users.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...editForm }
            : user
        ));
        
        setSaveMessage('Utilizatorul a fost actualizat cu succes!');
        
        // Închide modalul după 1.5 secunde
        setTimeout(() => {
          setEditingUser(null);
          setEditForm({ first_name: '', last_name: '', email: '', role: '', password: '', cnp: '', address: '', phone: '' });
          setSaveMessage('');
        }, 1500);
      } else {
        setSaveMessage('Eroare la actualizarea utilizatorului: ' + (responseData.error || 'Eroare necunoscută'));
      }
    } catch (err) {
      console.error('Eroare la actualizarea utilizatorului:', err);
      setSaveMessage('Eroare la conectarea cu serverul!');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ first_name: '', last_name: '', email: '', role: '', password: '', cnp: '', address: '', phone: '' });
    setSaveMessage('');
    setSaving(false);
  };

  const handleEditCard = (card: any) => {
    setEditingCard(card);
    setEditCardForm({
      card_number: card.card_number || '',
      card_type: card.card_type || '',
      status: card.status || '',
      expiry_date: card.expiry_date || '',
      cvv: card.cvv || ''
    });
    setSaveMessage('');
  };

  const handleSaveCardEdit = async () => {
    if (!editingCard) return;

    setSaving(true);
    setSaveMessage('');

    try {
      const response = await axios.post('http://localhost/api/updateCard.php', {
        id: editingCard.id,
        card_number: editCardForm.card_number,
        card_type: editCardForm.card_type,
        status: editCardForm.status,
        expiry_date: editCardForm.expiry_date,
        cvv: editCardForm.cvv
      });

      const responseData = response.data as { success: boolean; error?: string };
      if (responseData.success) {
        // Actualizează lista de carduri
        setCards(cards.map(card =>
          card.id === editingCard.id
            ? { ...card, ...editCardForm }
            : card
        ));

        setSaveMessage('Cardul a fost actualizat cu succes!');

        // Închide modalul după 1.5 secunde
        setTimeout(() => {
          setEditingCard(null);
          setEditCardForm({ card_number: '', card_type: '', status: '', expiry_date: '', cvv: '' });
          setSaveMessage('');
        }, 1500);
      } else {
        setSaveMessage('Eroare la actualizarea cardului: ' + (responseData.error || 'Eroare necunoscută'));
      }
    } catch (err) {
      console.error('Eroare la actualizarea cardului:', err);
      setSaveMessage('Eroare la conectarea cu serverul!');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelCardEdit = () => {
    setEditingCard(null);
    setEditCardForm({ card_number: '', card_type: '', status: '', expiry_date: '', cvv: '' });
    setSaveMessage('');
    setSaving(false);
  };

  const handleExportData = async () => {
    try {
      setSaving(true);
      setSaveMessage('Se exportă datele...');

      // Creează un obiect cu toate datele
      const exportData = {
        users: users,
        accounts: accounts,
        transactions: transactions,
        cards: cards,
        stats: stats,
        exportDate: new Date().toISOString(),
        exportedBy: 'Admin Panel'
      };

      // Creează și descarcă fișierul JSON
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `banca_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSaveMessage('Datele au fost exportate cu succes!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Eroare la export:', error);
      setSaveMessage('Eroare la exportarea datelor!');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleBackupDatabase = async () => {
    try {
      setSaving(true);
      setSaveMessage('Se creează backup-ul bazei de date...');

      const response = await axios.post('http://localhost/api/backupDatabase.php');
      const responseData = response.data as { success: boolean; error?: string; backupFile?: string };
      
      if (responseData.success) {
        setSaveMessage('Backup-ul bazei de date a fost creat cu succes!');
        
        // Descarcă fișierul de backup dacă există
        if (responseData.backupFile) {
          const link = document.createElement('a');
          link.href = `http://localhost/api/backups/${responseData.backupFile}`;
          link.download = responseData.backupFile;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        setSaveMessage('Eroare la crearea backup-ului: ' + (responseData.error || 'Eroare necunoscută'));
      }
      
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Eroare la backup:', error);
      setSaveMessage('Eroare la conectarea cu serverul pentru backup!');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateReports = async () => {
    try {
      setSaving(true);
      setSaveMessage('Se generează rapoartele...');

      // Creează rapoarte în format HTML
      const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Rapoarte Banca - ${new Date().toLocaleDateString('ro-RO')}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8d71c; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rapoarte Banca</h1>
            <p>Generat la: ${new Date().toLocaleString('ro-RO')}</p>
          </div>
          
          <div class="section">
            <h2>Statistici Generale</h2>
            <div class="stats">
              <div class="stat-card">
                <h3>${stats.users}</h3>
                <p>Utilizatori</p>
              </div>
              <div class="stat-card">
                <h3>${stats.accounts}</h3>
                <p>Conturi</p>
              </div>
              <div class="stat-card">
                <h3>${stats.transactions}</h3>
                <p>Tranzacții</p>
              </div>
              <div class="stat-card">
                <h3>${stats.cards}</h3>
                <p>Carduri</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Utilizatori</h2>
            <table>
              <tr><th>ID</th><th>Nume</th><th>Email</th><th>Rol</th><th>Data Înregistrării</th></tr>
              ${users.map(user => `
                <tr>
                  <td>${user.id}</td>
                  <td>${user.first_name} ${user.last_name}</td>
                  <td>${user.email}</td>
                  <td>${user.role}</td>
                  <td>${new Date(user.created_at).toLocaleDateString('ro-RO')}</td>
                </tr>
              `).join('')}
            </table>
          </div>

          <div class="section">
            <h2>Conturi</h2>
            <table>
              <tr><th>ID</th><th>IBAN</th><th>Bancă</th><th>Sold</th><th>Tip</th></tr>
              ${accounts.map(account => `
                <tr>
                  <td>${account.id}</td>
                  <td>${account.iban}</td>
                  <td>${account.bank_name}</td>
                  <td>${account.balance} RON</td>
                  <td>${account.account_type}</td>
                </tr>
              `).join('')}
            </table>
          </div>

          <div class="section">
            <h2>Tranzacții</h2>
            <table>
              <tr><th>ID</th><th>Descriere</th><th>Sumă</th><th>Status</th><th>Data</th></tr>
              ${transactions.map(transaction => `
                <tr>
                  <td>${transaction.id}</td>
                  <td>${transaction.description}</td>
                  <td>${transaction.amount} RON</td>
                  <td>${transaction.status}</td>
                  <td>${new Date(transaction.created_at).toLocaleDateString('ro-RO')}</td>
                </tr>
              `).join('')}
            </table>
          </div>

          <div class="section">
            <h2>Carduri</h2>
            <table>
              <tr><th>ID</th><th>Număr Card</th><th>Tip</th><th>Status</th><th>Data Expirării</th></tr>
              ${cards.map(card => `
                <tr>
                  <td>${card.id}</td>
                  <td>${card.card_number}</td>
                  <td>${card.card_type}</td>
                  <td>${card.status}</td>
                  <td>${new Date(card.expiry_date).toLocaleDateString('ro-RO')}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        </body>
        </html>
      `;

      // Descarcă raportul HTML
      const dataBlob = new Blob([reportHTML], { type: 'text/html' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `raport_banca_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSaveMessage('Rapoartele au fost generate cu succes!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Eroare la generarea rapoartelor:', error);
      setSaveMessage('Eroare la generarea rapoartelor!');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      const existingIndex = prevConfig.findIndex(config => config.key === key);
      
      if (existingIndex === -1) {
        // Prima dată când se face click pe această coloană
        return [{ key, direction: 'asc' }, ...prevConfig];
      } else {
        const currentDirection = prevConfig[existingIndex].direction;
        let newDirection: 'default' | 'asc' | 'desc';
        
        if (currentDirection === 'default') {
          newDirection = 'asc';
        } else if (currentDirection === 'asc') {
          newDirection = 'desc';
        } else {
          newDirection = 'default';
        }
        
        if (newDirection === 'default') {
          // Elimină coloana din sortare
          return prevConfig.filter((_, index) => index !== existingIndex);
        } else {
          // Actualizează direcția
          const newConfig = [...prevConfig];
          newConfig[existingIndex] = { key, direction: newDirection };
          return newConfig;
        }
      }
    });
  };

  const getSortIcon = (key: string) => {
    const config = sortConfig.find(c => c.key === key);
    if (!config) return '⇅'; // default - săgeți sus și jos
    
    switch (config.direction) {
      case 'asc': return '↑';
      case 'desc': return '↓';
      default: return '⇅';
    }
  };

  const sortData = (data: any[]) => {
    if (sortConfig.length === 0) return data;
    
    return [...data].sort((a, b) => {
      for (const config of sortConfig) {
        let aValue = a[config.key];
        let bValue = b[config.key];
        
        // Tratare specială pentru rol
        if (config.key === 'role') {
          const roleOrder = { 'admin': 1, 'manager': 2, 'user': 3 };
          aValue = roleOrder[aValue as keyof typeof roleOrder] || 4;
          bValue = roleOrder[bValue as keyof typeof roleOrder] || 4;
        }
        
        // Tratare pentru numere
        if (config.key === 'id') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }
        
        if (aValue < bValue) {
          return config.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return config.direction === 'asc' ? 1 : -1;
        }
      }
      return 0;
    });
  };

  const getFilteredData = () => {
    let filteredData: any[] = [];
    
    if (activeFilter === 'all') {
      filteredData = users.filter(user => {
        const matchesSearch = searchTerm === '' || 
          user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
    } else if (activeFilter === 'user') {
      filteredData = users.filter(user => {
        const matchesSearch = searchTerm === '' || 
          user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch && user.role === 'user';
      });
    } else if (activeFilter === 'manager') {
      filteredData = users.filter(user => {
        const matchesSearch = searchTerm === '' || 
          user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch && user.role === 'manager';
      });
    } else if (activeFilter === 'admin') {
      filteredData = users.filter(user => {
        const matchesSearch = searchTerm === '' || 
          user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch && user.role === 'admin';
      });
    } else if (activeFilter === 'accounts') {
      filteredData = accounts.filter(account => {
        const matchesSearch = searchTerm === '' || 
          account.iban?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.bank_name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
    } else if (activeFilter === 'transactions') {
      filteredData = transactions.filter(transaction => {
        const matchesSearch = searchTerm === '' || 
          transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.amount?.toString().includes(searchTerm);
        return matchesSearch;
      });
    } else if (activeFilter === 'cards') {
      filteredData = cards.filter(card => {
        const matchesSearch = searchTerm === '' || 
          card.card_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.card_type?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
    }
    
    // Aplică sortarea
    return sortData(filteredData);
  };

  const filteredData = getFilteredData();

  return (
    <div className="admin-page">
      {/* Header cu titlu */}
      <div className="admin-header">
        <h1 className="admin-title">
          🔧 Admin Panel
        </h1>
      </div>

      {/* Statistici */}
      <div className="admin-stats">
        <div 
          className={`stat-card stat-card-yellow ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterClick('all')}
          style={{ cursor: 'pointer' }}
        >
          <h3 className="stat-title">👥 Utilizatori</h3>
          <div className="stat-number stat-number-yellow">
            {stats.users}
          </div>
        </div>

        <div 
          className={`stat-card stat-card-green ${activeFilter === 'accounts' ? 'active' : ''}`}
          onClick={() => handleFilterClick('accounts')}
          style={{ cursor: 'pointer' }}
        >
          <h3 className="stat-title">🏦 Conturi</h3>
          <div className="stat-number stat-number-green">
            {stats.accounts}
          </div>
        </div>

        <div 
          className={`stat-card stat-card-blue ${activeFilter === 'transactions' ? 'active' : ''}`}
          onClick={() => handleFilterClick('transactions')}
          style={{ cursor: 'pointer' }}
        >
          <h3 className="stat-title">💸 Tranzacții</h3>
          <div className="stat-number stat-number-blue">
            {stats.transactions}
          </div>
        </div>

        <div 
          className={`stat-card stat-card-orange ${activeFilter === 'cards' ? 'active' : ''}`}
          onClick={() => handleFilterClick('cards')}
          style={{ cursor: 'pointer' }}
        >
          <h3 className="stat-title">💳 Carduri</h3>
          <div className="stat-number stat-number-orange">
            {stats.cards}
          </div>
        </div>
      </div>

      {/* Tabelul utilizatorilor */}
      <div className="admin-table-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          <h2 className="admin-table-title" style={{ margin: 0 }}>
            {activeFilter === 'all' && 'Utilizatori înregistrați'}
            {activeFilter === 'user' && 'Utilizatori cu rol User'}
            {activeFilter === 'manager' && 'Utilizatori cu rol Manager'}
            {activeFilter === 'admin' && 'Utilizatori cu rol Admin'}
            {activeFilter === 'accounts' && 'Conturi bancare'}
            {activeFilter === 'transactions' && 'Tranzacții'}
            {activeFilter === 'cards' && 'Carduri bancare'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="text"
              placeholder={
                activeFilter === 'accounts' ? 'Caută conturi...' :
                activeFilter === 'transactions' ? 'Caută tranzacții...' :
                activeFilter === 'cards' ? 'Caută carduri...' :
                'Caută utilizatori...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem',
                minWidth: '250px'
              }}
            />
            <span style={{ 
              color: '#666', 
              fontSize: '0.9rem',
              backgroundColor: '#f8f9fa',
              padding: '0.5rem 1rem',
              borderRadius: '6px'
            }}>
              {filteredData.length} din {
                activeFilter === 'accounts' ? accounts.length :
                activeFilter === 'transactions' ? transactions.length :
                activeFilter === 'cards' ? cards.length :
                users.length
              } {activeFilter === 'accounts' ? 'conturi' : activeFilter === 'transactions' ? 'tranzacții' : activeFilter === 'cards' ? 'carduri' : 'utilizatori'}
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                {activeFilter === 'accounts' && (
                  <>
                    <th 
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('id')}
                    >
                      ID {getSortIcon('id')}
                    </th>
                    <th>IBAN</th>
                    <th>Bancă</th>
                    <th>Sold</th>
                    <th>Tip</th>
                  </>
                )}
                {activeFilter === 'transactions' && (
                  <>
                    <th 
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('id')}
                    >
                      ID {getSortIcon('id')}
                    </th>
                    <th>Descriere</th>
                    <th>Sumă</th>
                    <th>Status</th>
                    <th>Data</th>
                  </>
                )}
                {activeFilter === 'cards' && (
                  <>
                    <th 
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('id')}
                    >
                      ID {getSortIcon('id')}
                    </th>
                    <th>Număr Card</th>
                    <th>Tip</th>
                    <th>Status</th>
                    <th>Data Expirării</th>
                    <th>Acțiuni</th>
                  </>
                )}
                {(activeFilter === 'all' || activeFilter === 'user' || activeFilter === 'manager' || activeFilter === 'admin') && (
                  <>
                    <th 
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('id')}
                    >
                      ID {getSortIcon('id')}
                    </th>
                    <th>Nume</th>
                    <th>Email</th>
                    <th 
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('role')}
                    >
                      Rol {getSortIcon('role')}
                    </th>
                    <th>Data înregistrării</th>
                    <th>Acțiuni</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeFilter === 'accounts' && filteredData.map((account) => (
                <tr key={account.id}>
                  <td>{account.id}</td>
                  <td>{account.iban}</td>
                  <td>{account.bank_name}</td>
                  <td>{account.balance} RON</td>
                  <td>{account.account_type}</td>
                </tr>
              ))}
              {activeFilter === 'transactions' && filteredData.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.amount} RON</td>
                  <td>
                    <span className={`role-badge ${transaction.status === 'completed' ? 'role-admin' : 'role-user'}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td>{formatDate(transaction.created_at)}</td>
                </tr>
              ))}
              {activeFilter === 'cards' && filteredData.map((card) => (
                <tr key={card.id}>
                  <td>{card.id}</td>
                  <td>{card.card_number}</td>
                  <td>{card.card_type}</td>
                  <td>
                    <span className={`role-badge ${card.status === 'active' ? 'role-admin' : 'role-user'}`}>
                      {card.status}
                    </span>
                  </td>
                  <td>{formatDate(card.expiry_date)}</td>
                  <td>
                    <button 
                      className="admin-btn admin-btn-yellow"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      onClick={() => handleEditCard(card)}
                    >
                      Editează
                    </button>
                  </td>
                </tr>
              ))}
              {(activeFilter === 'all' || activeFilter === 'user' || activeFilter === 'manager' || activeFilter === 'admin') && filteredData.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.first_name} {user.last_name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <button 
                      className="admin-btn admin-btn-yellow"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      onClick={() => handleEditUser(user)}
                    >
                      Editează
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Butoane de acțiune */}
      <div className="admin-actions">
        <button 
          className="admin-btn admin-btn-yellow"
          onClick={handleExportData}
          disabled={saving}
        >
          {saving && saveMessage.includes('export') ? '📤 Se exportă...' : '📤 Export Date'}
        </button>

        <button 
          className="admin-btn admin-btn-green"
          onClick={handleBackupDatabase}
          disabled={saving}
        >
          {saving && saveMessage.includes('backup') ? '💾 Se creează backup...' : '💾 Backup Baza de Date'}
        </button>

        <button 
          className="admin-btn admin-btn-blue"
          onClick={handleGenerateReports}
          disabled={saving}
        >
          {saving && saveMessage.includes('rapoarte') ? '📊 Se generează...' : '📊 Rapoarte'}
        </button>
      </div>

      {/* Mesaj de feedback pentru butoanele de acțiune */}
      {saveMessage && (saveMessage.includes('export') || saveMessage.includes('backup') || saveMessage.includes('rapoarte')) && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          backgroundColor: saveMessage.includes('succes') ? '#d4edda' : '#f8d7da',
          color: saveMessage.includes('succes') ? '#155724' : '#721c24',
          border: `1px solid ${saveMessage.includes('succes') ? '#c3e6cb' : '#f5c6cb'}`,
          zIndex: 1001,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: '300px'
        }}>
          {saveMessage}
        </div>
      )}

      {/* Modal de editare */}
      {editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem' }}>
              Editează utilizatorul: {editingUser.first_name} {editingUser.last_name}
            </h3>
            
            {saveMessage && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                borderRadius: '6px',
                backgroundColor: saveMessage.includes('succes') ? '#d4edda' : '#f8d7da',
                color: saveMessage.includes('succes') ? '#155724' : '#721c24',
                border: `1px solid ${saveMessage.includes('succes') ? '#c3e6cb' : '#f5c6cb'}`,
                fontSize: '0.9rem'
              }}>
                {saveMessage}
              </div>
            )}
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Prenume:
              </label>
              <input
                type="text"
                value={editForm.first_name}
                onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Nume:
              </label>
              <input
                type="text"
                value={editForm.last_name}
                onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Email:
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Rol:
              </label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Parolă (lasă gol pentru a nu schimba):
              </label>
              <input
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                placeholder="Introduceți noua parolă"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                CNP:
              </label>
              <input
                type="text"
                value={editForm.cnp}
                onChange={(e) => setEditForm({...editForm, cnp: e.target.value})}
                placeholder="1234567890123"
                maxLength={13}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Adresă:
              </label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                placeholder="Introduceți adresa completă"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Telefon:
              </label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                placeholder="0712345678"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelEdit}
                className="admin-btn admin-btn-yellow"
                style={{ padding: '0.75rem 1.5rem' }}
                disabled={saving}
              >
                Anulează
              </button>
              <button
                onClick={handleSaveEdit}
                className="admin-btn admin-btn-green"
                style={{ 
                  padding: '0.75rem 1.5rem',
                  opacity: saving ? 0.7 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
                disabled={saving}
              >
                {saving ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de editare carduri */}
      {editingCard && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem' }}>
              Editează cardul: {editingCard.card_number}
            </h3>
            
            {saveMessage && (
              <div style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                borderRadius: '6px',
                backgroundColor: saveMessage.includes('succes') ? '#d4edda' : '#f8d7da',
                color: saveMessage.includes('succes') ? '#155724' : '#721c24',
                border: `1px solid ${saveMessage.includes('succes') ? '#c3e6cb' : '#f5c6cb'}`
              }}>
                {saveMessage}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Număr Card:
              </label>
              <input
                type="text"
                value={editCardForm.card_number}
                onChange={(e) => setEditCardForm({...editCardForm, card_number: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Tip Card:
              </label>
              <select
                value={editCardForm.card_type}
                onChange={(e) => setEditCardForm({...editCardForm, card_type: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Status:
              </label>
              <select
                value={editCardForm.status}
                onChange={(e) => setEditCardForm({...editCardForm, status: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Data Expirării:
              </label>
              <input
                type="date"
                value={editCardForm.expiry_date}
                onChange={(e) => setEditCardForm({...editCardForm, expiry_date: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                CVV:
              </label>
              <input
                type="text"
                value={editCardForm.cvv}
                onChange={(e) => setEditCardForm({...editCardForm, cvv: e.target.value})}
                placeholder="123"
                maxLength={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelCardEdit}
                disabled={saving}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                Anulează
              </button>
              <button
                onClick={handleSaveCardEdit}
                disabled={saving}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {saving ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
