import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  phone: string;
  role: string;
}

interface GetClientResponse {
  success?: boolean;
  client?: Client;
  error?: string;
}

const ProfilePage: React.FC = () => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    phone: '',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    const fetchClient = async () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        if (parsedUser.role === 'user') {
          try {
                         const res = await axios.post<GetClientResponse>('http://localhost/api/getClientByEmail.php', {
              email: parsedUser.email,
            });
            if (res.data.success && res.data.client) {
              setClient(res.data.client);
              setFormData({
                first_name: res.data.client.first_name || '',
                last_name: res.data.client.last_name || '',
                email: res.data.client.email || '',
                address: res.data.client.address || '',
                phone: res.data.client.phone || '',
                password: '',
              });
            }
            else setError(res.data.error || 'Eroare la încărcare');
          } catch {
            setError('Eroare la conectarea cu serverul!');
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchClient();
  }, []);

  if (!user || user.role !== 'user') {
    return <div className="page-container"><h2>Acces interzis!</h2></div>;
  }

  if (loading) return <div className="page-container">Se încarcă...</div>;
  if (error) return <div className="page-container">{error}</div>;
  if (!client) return <div className="page-container">Nu s-au găsit date pentru profil.</div>;

  const handleEditClick = () => {
    setEditMode(true);
    setSaveError('');
    setSaveSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const payload = {
        id: client.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        address: formData.address,
        phone: formData.phone,
        password: formData.password, // poate fi gol
      };
              const res = await axios.post('http://localhost/api/updateClientProfile.php', payload);
      const data = res.data as { success?: boolean; error?: string };
      if (data.success) {
        setClient({ ...client, ...payload }); // 'password' nu există în Client, deci nu îl includem
        setEditMode(false);
        setSaveSuccess('Profil actualizat cu succes!');
        setFormData(f => ({ ...f, password: '' }));
      } else {
        setSaveError(data.error || 'Eroare la salvare!');
      }
    } catch {
      setSaveError('Eroare la conectarea cu serverul!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      justifyContent: 'flex-start',
    }}>
      <div className="card" style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: 32,
        borderRadius: 16,
        boxShadow: '0 4px 24px #0002',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: 18, fontSize: 30, fontWeight: 700, letterSpacing: 1 }}>Profilul meu</h2>
        {((saveError && !editMode) || (saveSuccess && !editMode)) && (
          <div style={{
            marginBottom: 24,
            padding: '12px 20px',
            borderRadius: 8,
            fontSize: 18,
            fontWeight: 500,
            textAlign: 'center',
            color: saveError ? '#b00020' : '#1b5e20',
            background: saveError ? '#ffeaea' : '#eaffea',
            border: `1px solid ${saveError ? '#b00020' : '#1b5e20'}`,
            boxShadow: '0 2px 8px #0001',
            maxWidth: 400,
            width: '100%',
          }}>
            {saveError || saveSuccess}
          </div>
        )}
        {editMode ? (
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 12 }}>
              <label>Prenume:<br />
                <input name="first_name" value={formData.first_name} onChange={handleInputChange} required />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Nume:<br />
                <input name="last_name" value={formData.last_name} onChange={handleInputChange} required />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Email:<br />
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Adresă:<br />
                <input name="address" value={formData.address} onChange={handleInputChange} />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Telefon:<br />
                <input 
                  name="phone" 
                  type="tel"
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  placeholder="Ex: +40722123456 sau 0722123456"
                  maxLength={20}
                  inputMode="tel"
                />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Parolă nouă:<br />
                <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Lasă gol dacă nu vrei să schimbi" />
              </label>
            </div>
            {saveError && <div style={{ color: 'red' }}>{saveError}</div>}
            {saveSuccess && <div style={{ color: 'green' }}>{saveSuccess}</div>}
            <button type="submit" disabled={saving} style={{
              padding: '8px 16px',
              background: '#ffe680',
              border: '1px solid #ccc',
              borderRadius: 4,
              color: '#111',
              fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}>{saving ? 'Se salvează...' : 'Salvează'}</button>
            <button type="button" onClick={() => setEditMode(false)} style={{
              padding: '8px 16px',
              background: '#ffe680',
              border: '1px solid #ccc',
              borderRadius: 4,
              color: '#111',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}>Anulează</button>
          </form>
        ) : (
          <>
            <table style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              marginBottom: 16,
              borderRadius: 12,
              overflow: 'hidden',
              fontFamily: 'Segoe UI, Arial, sans-serif',
              fontSize: 18,
              boxShadow: '0 2px 8px #0001',
            }}>
              <tbody>
                {[
                  { label: 'Prenume', value: client.first_name },
                  { label: 'Nume', value: client.last_name },
                  { label: 'Email', value: client.email },
                  { label: 'Adresă', value: client.address },
                  { label: 'Telefon', value: client.phone },
                ].map((row, idx) => (
                  <tr
                    key={row.label}
                    style={{
                      background: idx % 2 === 0 ? '#fffbe6' : '#fff',
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = '#ffe680')}
                    onMouseOut={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#fffbe6' : '#fff')}
                  >
                    <th style={{
                      textAlign: 'left',
                      padding: '12px 20px',
                      background: '#ffe680',
                      border: 'none',
                      width: 140,
                      fontWeight: 600,
                      borderTopLeftRadius: idx === 0 ? 12 : 0,
                      borderBottomLeftRadius: idx === 4 ? 12 : 0,
                    }}>{row.label}</th>
                    <td style={{
                      padding: '12px 20px',
                      border: 'none',
                      borderTopRightRadius: idx === 0 ? 12 : 0,
                      borderBottomRightRadius: idx === 4 ? 12 : 0,
                      color: '#222',
                      background: 'transparent',
                    }}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {!editMode && (
          <button
            onClick={handleEditClick}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              background: '#ffe680',
              border: '1px solid #ccc',
              borderRadius: 4,
              color: '#111',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Editează profilul
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 