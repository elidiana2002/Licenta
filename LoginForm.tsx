/*import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Preluare utilizatori din baza de date
    fetch('http://localhost/api/getUsers.php')
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setError('Eroare la preluarea datelor: ' + data.error);
        } else {
          setUsers(data);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Eroare la conectarea la server');
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('Toate câmpurile sunt obligatorii');
      return;
    }

    // Caută utilizatorul în lista preluată din baza de date
    const user = users.find(
      u => u.email === formData.email && u.password === formData.password
    );

    if (user) {
      const userInfo = {
        id: user.id,
        email: user.email,
        role: user.role
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      setSuccess(`Autentificare reușită! Bun venit!`);
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setError('Email sau parolă incorectă');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Intră în cont</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Parolă"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="login-button">
          Intră în cont
        </button>

        <p className="auth-link">
          Nu ai cont? <Link to="/register">Crează un cont</Link>
        </p>

        {!loading && (
          <div className="user-accounts-info">
            <h3>Conturi disponibile în baza de date:</h3>
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Parolă</th>
                  <th>Rol</th>
                  <th>Data creării</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                    <td>{user.password}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginForm; */