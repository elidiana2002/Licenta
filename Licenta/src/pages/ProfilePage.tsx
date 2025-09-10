import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
        if (parsedUser.role === 'user' || parsedUser.role === 'admin') {
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

  if (!user || (user.role !== 'user' && user.role !== 'admin')) {
    return (
      <div className="page-container">
        <h2>🚫 Acces interzis!</h2>
        <p>Trebuie să fii logat ca utilizator sau admin pentru a accesa această pagină.</p>
        <Link to="/login">🔐 Fă login aici</Link>
      </div>
    );
  }

  if (loading) return <div className="page-container">⏳ Se încarcă profilul...</div>;
  if (error) return <div className="page-container">❌ Eroare: {error}</div>;
  if (!client) return <div className="page-container">👤 Nu s-au găsit date pentru profil.</div>;

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
    <div className="page-container profile-page-container">
      <div className="card profile-card">
        <h2 className="profile-title">👤 Profilul meu</h2>
        {((saveError && !editMode) || (saveSuccess && !editMode)) && (
          <div className={`profile-message ${saveError ? 'error' : 'success'}`}>
            {saveError || saveSuccess}
          </div>
        )}
        {editMode ? (
          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label>Prenume:
                <input name="first_name" value={formData.first_name} onChange={handleInputChange} required />
              </label>
            </div>
            <div className="form-group">
              <label>Nume:
                <input name="last_name" value={formData.last_name} onChange={handleInputChange} required />
              </label>
            </div>
            <div className="form-group">
              <label>Email:
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </label>
            </div>
            <div className="form-group">
              <label>Adresă:
                <input name="address" value={formData.address} onChange={handleInputChange} />
              </label>
            </div>
            <div className="form-group">
              <label>Telefon:
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
            <div className="form-group">
              <label>Parolă nouă:
                <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Lasă gol dacă nu vrei să schimbi" />
              </label>
            </div>
            {saveError && <div className="form-error">{saveError}</div>}
            {saveSuccess && <div className="form-success">{saveSuccess}</div>}
            <div className="form-buttons">
              <button type="submit" disabled={saving} className="save-button">
                {saving ? '💾 Se salvează...' : '💾 Salvează'}
              </button>
              <button type="button" onClick={() => setEditMode(false)} className="cancel-button">
                ❌ Anulează
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <table className="profile-table">
              <tbody>
                {[
                  { label: 'Prenume', value: client.first_name },
                  { label: 'Nume', value: client.last_name },
                  { label: 'Email', value: client.email },
                  { label: 'Adresă', value: client.address },
                  { label: 'Telefon', value: client.phone },
                ].map((row, idx) => (
                  <tr key={row.label} className={`profile-row ${idx % 2 === 0 ? 'even' : 'odd'}`}>
                    <th className="profile-label">{row.label}</th>
                    <td className="profile-value">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!editMode && (
          <button onClick={handleEditClick} className="edit-button">
            ✏️ Editează profilul
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 