//src\components\RegisterForm.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register:', formData);
    // TODO: Trimite datele către backend
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Crează un cont</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nume complet"
            value={formData.name}
            onChange={handleChange}
            required
          />
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
          <button type="submit" className="auth-button">
            Înregistrează-te
          </button>
        </form>
        <div className="auth-switch">
          Ai deja un cont? <Link to="/login">Autentifică-te</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
