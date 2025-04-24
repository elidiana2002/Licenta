//src\components\Navbar.tsx
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/" className="nav-link">Acasă</Link>
        <Link to="/scor" className="nav-link">Scor Credit</Link>
        <Link to="/istoric" className="nav-link">Istoric</Link>
      </div>

      <div className="login-container">
        <Link to="/login" className="login-btn">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;