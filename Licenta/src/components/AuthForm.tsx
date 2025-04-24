import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthFormProps {
  type: 'login' | 'register';
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [formData, setFormData] = useState({
    nume: '',
    prenume: '',
    email: '',
    parola: '',
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
        await authService.login(formData.email, formData.parola);
        navigate('/dashboard');
      } else {
        await authService.register(formData);
        navigate('/login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare necunoscută');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        name="nume"
        placeholder="Nume"
        value={formData.nume}
        onChange={handleChange}
      />
      <input
        type="text"
        name="prenume"
        placeholder="Prenume"
        value={formData.prenume}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      <input
        type="password"
        name="parola"
        placeholder="Parola"
        value={formData.parola}
        onChange={handleChange}
      />
      <input
        type="tel"
        name="telefon"
        placeholder="Telefon"
        value={formData.telefon}
        onChange={handleChange}
      />
      <button type="submit">{type === 'login' ? 'Login' : 'Register'}</button>
    </form>
  );
};

export default AuthForm;