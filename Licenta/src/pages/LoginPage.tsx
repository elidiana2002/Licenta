import AuthLayout from '../components/AuthLayout';
import AuthForm from '../components/AuthForm';

const LoginPage = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Autentificare</h2>
        <AuthForm type="login" />
      </div>
    </div>
  );
};

export default LoginPage;