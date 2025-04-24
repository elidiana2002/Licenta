import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/" className="navbar-link">
          Acasă
        </Link>
        <Link to="/scor" className="navbar-link">
          Scor Credit
        </Link>
        <Link to="/istoric" className="navbar-link">
          Istoric
        </Link>
      </div>
      <div className="navbar-login">
        <Link to="/login" className="navbar-login-button">
          Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
