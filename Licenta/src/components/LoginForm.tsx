// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

interface LoginResponse {
  success?: boolean;
  user?: {
    id: number;
    email: string;
    role: string;
  };
  error?: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    console.log('Formular login trimis!', formData);
    try {
      const response = await axios.post<LoginResponse>(
        'http://localhost/api/loginUser.php',
        {
          email: formData.email,
          password: formData.password,
        }
      );
      const data = response.data;
      console.log('Login response:', data);
      if (data.success) {
        setSuccess('Autentificare reușită! Vei fi redirecționat...');
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => navigate('/'), 1500);
      } else {
        setError(data.error || 'Email sau parolă incorectă!');
      }
    } catch (err: any) {
      setError('Eroare la conectarea cu serverul!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Autentificare</h1>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
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
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
            onClick={() => console.log('Buton login apasat!')}
          >
            {isLoading ? 'Se autentifică...' : 'Intră în cont'}
          </button>
        </form>
        <div className="auth-switch">
          Nu ai cont? <Link to="/register">Crează un cont</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
