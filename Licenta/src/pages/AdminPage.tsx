import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
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
        if (usersResponse.data.success) {
          setUsers(usersResponse.data.users);
          setStats(prev => ({ ...prev, users: usersResponse.data.users.length }));
        }

        // Încarcă statisticile (simulate pentru moment)
        setStats(prev => ({
          ...prev,
          accounts: 0,
          transactions: 0,
          cards: 0
        }));

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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Se încarcă...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: 'red'
      }}>
        {error}
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa', 
      padding: '2rem'
    }}>
      {/* Header cu titlu */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '2.5rem', 
          fontWeight: 'bold',
          color: '#333'
        }}>
          Admin Panel
        </h1>
      </div>

      {/* Statistici */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          border: '3px solid #f8d71c',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#666' }}>Utilizatori</h3>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f8d71c' }}>
            {stats.users}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          border: '3px solid #28a745',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#666' }}>Conturi</h3>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#28a745' }}>
            {stats.accounts}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          border: '3px solid #007bff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#666' }}>Tranzacții</h3>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#007bff' }}>
            {stats.transactions}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          border: '3px solid #fd7e14',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#666' }}>Carduri</h3>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fd7e14' }}>
            {stats.cards}
          </div>
        </div>
      </div>

      {/* Tabelul utilizatorilor */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          margin: '0 0 2rem 0', 
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: '#333'
        }}>
          Utilizatori înregistrați
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '1rem'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8d71c' }}>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>ID</th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>Nume</th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>Email</th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>Rol</th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>Data înregistrării</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} style={{
                  borderBottom: '1px solid #eee',
                  backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa'
                }}>
                  <td style={{ padding: '1rem' }}>{user.id}</td>
                  <td style={{ padding: '1rem' }}>{user.first_name} {user.last_name}</td>
                  <td style={{ padding: '1rem' }}>{user.email}</td>
                  <td style={{ 
                    padding: '1rem',
                    backgroundColor: user.role === 'admin' ? '#f8d71c' : '#e3f2fd',
                    color: user.role === 'admin' ? '#333' : '#1976d2',
                    fontWeight: 'bold',
                    borderRadius: '6px'
                  }}>
                    {user.role}
                  </td>
                  <td style={{ padding: '1rem' }}>{formatDate(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Butoane de acțiune */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button style={{
          backgroundColor: '#f8d71c',
          color: '#333',
          border: 'none',
          borderRadius: '8px',
          padding: '1rem 2rem',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease'
        }}>
          Export Date
        </button>

        <button style={{
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '1rem 2rem',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease'
        }}>
          Backup Baza de Date
        </button>

        <button style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '1rem 2rem',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease'
        }}>
          Rapoarte
        </button>
      </div>
    </div>
  );
};

export default AdminPage;
