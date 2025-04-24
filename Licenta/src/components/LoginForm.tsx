// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    parola: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.login({ email: formData.email, password: formData.parola });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare necunoscută');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Intră în cont</h2>
        {error && <p className="error-msg">{error}</p>}
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
          name="parola"
          placeholder="Parolă"
          value={formData.parola}
          onChange={handleChange}
          required
        />
        <button type="submit">Intră în cont</button>
        <p className="auth-link">
          Nu ai cont? <Link to="/register">Crează un cont</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
