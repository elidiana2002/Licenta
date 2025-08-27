//src\components\RegisterForm.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  CNP: string;
  address: string;
  phone: string;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  CNP?: string;
  address?: string;
  phone?: string;
}

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    CNP: '',
    address: '',
    phone: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateField = (name: string, value: string) => {
    let error = '';
    if (name === 'first_name') {
      if (value.length < 2) error = 'Prenumele trebuie să aibă cel puțin 2 caractere';
    }
    if (name === 'last_name') {
      if (value.length < 2) error = 'Numele trebuie să aibă cel puțin 2 caractere';
    }
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) error = 'Adresa de email nu este validă';
    }
    if (name === 'CNP') {
      if (!/^\d{13}$/.test(value)) error = 'CNP-ul trebuie să aibă exact 13 cifre';
    }
    if (name === 'phone') {
      // Permite format internațional: +40, +44, etc. + numărul
      const phoneRegex = /^(\+\d{1,4})?(\d{7,15})$/;
      if (!phoneRegex.test(value)) error = 'Telefonul trebuie să aibă format valid (ex: +40722123456 sau 0722123456)';
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Pentru CNP - permite doar numere, max 13 cifre
    if (name === 'CNP') {
      processedValue = value.replace(/\D/g, '').slice(0, 13);
    }
    
    // Pentru telefon - permite + și numere, cu limită de 20 caractere
    if (name === 'phone') {
      // Permite doar + și numere
      processedValue = value.replace(/[^\d+]/g, '');
      // Verifică că + este doar la început
      if (processedValue.includes('+') && !processedValue.startsWith('+')) {
        processedValue = processedValue.replace(/\+/g, '');
      }
      // Limitează la 20 caractere
      processedValue = processedValue.slice(0, 20);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    if (["first_name", "last_name", "email", "CNP", "phone"].includes(name)) {
      const error = validateField(name, processedValue);
      setErrors(prev => ({ ...prev, [name]: error || undefined }));
    } else if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (["first_name", "last_name", "email", "CNP", "phone"].includes(name)) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error || undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (formData.first_name.length < 2) {
      newErrors.first_name = 'Prenumele trebuie să aibă cel puțin 2 caractere';
    }
    if (formData.last_name.length < 2) {
      newErrors.last_name = 'Numele trebuie să aibă cel puțin 2 caractere';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Adresa de email nu este validă';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Parola trebuie să aibă cel puțin 6 caractere';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Parolele nu coincid';
    }
    if (!/^\d{13}$/.test(formData.CNP)) {
      newErrors.CNP = 'CNP-ul trebuie să aibă exact 13 cifre';
    }
    if (!formData.address) {
      newErrors.address = 'Adresa este obligatorie';
    }
    // Permite format internațional: +40, +44, etc. + numărul
    const phoneRegex = /^(\+\d{1,4})?(\d{7,15})$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Telefonul trebuie să aibă format valid (ex: +40722123456 sau 0722123456)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
              const response = await axios.post('http://localhost/api/registerUser.php', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        CNP: formData.CNP,
        address: formData.address,
        phone: formData.phone
      });
      if ((response.data as any).success) {
        navigate('/login', { state: { message: 'Înregistrare reușită! Te poți autentifica acum.' } });
      }
    } catch (error: any) {
      setServerError(error.response?.data?.error || 'A apărut o eroare la înregistrare');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Crează un cont</h1>
        {serverError && <div className="error-message">{serverError}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="first_name"
              placeholder="Prenume"
              value={formData.first_name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.first_name ? 'error' : ''}
              required
            />
            {errors.first_name && <span className="error-text">{errors.first_name}</span>}
          </div>
          <div className="form-group">
            <input
              type="text"
              name="last_name"
              placeholder="Nume"
              value={formData.last_name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.last_name ? 'error' : ''}
              required
            />
            {errors.last_name && <span className="error-text">{errors.last_name}</span>}
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.email ? 'error' : ''}
              required
              autoComplete="email"
            />
            {errors.email && (
              <span className="error-text" style={{ color: '#e74c3c', fontWeight: 'bold' }}>{errors.email}</span>
            )}
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Parolă"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              required
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmă parola"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              required
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>
          <div className="form-group">
            <input
              type="text"
              name="CNP"
              placeholder="CNP (13 cifre)"
              value={formData.CNP}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.CNP ? 'error' : ''}
              required
              maxLength={13}
              inputMode="numeric"
            />
            {errors.CNP && <span className="error-text">{errors.CNP}</span>}
          </div>
          <div className="form-group">
            <input
              type="text"
              name="address"
              placeholder="Adresă"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? 'error' : ''}
              required
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>
          <div className="form-group">
            <input
              type="tel"
              name="phone"
              placeholder="Telefon (ex: +40722123456 sau 0722123456)"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.phone ? 'error' : ''}
              required
              maxLength={20}
              inputMode="tel"
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Se procesează...' : 'Înregistrează-te'}
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
