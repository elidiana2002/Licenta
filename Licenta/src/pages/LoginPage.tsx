//import AuthLayout from '../components/AuthLayout';
import { Link } from "react-router-dom";
import "../App.css"; // sau un fișier separat dacă vrei

const LoginPage = () => {
  return (
    <div className="page-container">
      <div className="card">
        <h2>Autentificare</h2>
        <form>
          <input type="email" placeholder="Email" required /><br /><br />
          <input type="password" placeholder="Parolă" required /><br /><br />
          <button type="submit">Intră în cont</button>
        </form>

        <div className="redirect">
          Nu ai cont? <Link to="/register">Crează unul</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
