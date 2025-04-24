import AuthLayout from '../components/AuthLayout';
import AuthForm from '../components/AuthForm';

const RegisterPage = () => {
  return (
    <AuthLayout>
      <h2>Înregistrare</h2>
      <AuthForm type="register" />
    </AuthLayout>
  );
};

export default RegisterPage;