import AuthLayout from '../components/AuthLayout';
import AuthForm from '../components/AuthForm';

const LoginPage = () => {
  return (
    <AuthLayout>
      <h2>Autentificare</h2>
      <AuthForm type="login" />
    </AuthLayout>
  );
};

export default LoginPage;