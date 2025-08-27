import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface AuthFormProps {
  type: 'login' | 'register';
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    telefon: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (type === 'login') {
        await authService.login({ email: formData.email, password: formData.password });
        navigate('/dashboard');
      } else {
        await authService.register({ name: formData.name, email: formData.email, password: formData.password });
        navigate('/login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare necunoscută');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{type === 'login' ? 'Intră în cont' : 'Creează un cont'}</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <input
            type="text"
            name="name"
            placeholder="Nume complet"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {type === 'register' && (
            <input
              type="tel"
              name="telefon"
              placeholder="Telefon (ex: +40722123456 sau 0722123456)"
              value={formData.telefon}
              onChange={handleChange}
              required
              maxLength={20}
              inputMode="tel"
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Parolă"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button className="auth-button" type="submit">
            {type === 'login' ? 'Intră în cont' : 'Creează cont'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
