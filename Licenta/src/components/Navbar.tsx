//src\components\Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  // Simulare user logat: dacă există "user" în localStorage
  const user = localStorage.getItem('user');

  const handleLogout = () => {
    localStorage.removeItem('user');
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/" className="nav-link">Acasă</Link>
        <Link to="/scor" className="nav-link">Scor Credit</Link>
        <Link to="/istoric" className="nav-link">Istoric</Link>
      </div>
      {user ? (
        <div className="profile-container" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
          {/* Iconiță profil (SVG) */}
          <div className="profile-icon">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M16 20v-2a4 4 0 0 0-8 0v2"/></svg>
          </div>
          {dropdownOpen && (
            <div className="profile-dropdown">
              <Link to="/account" className="dropdown-item">Profil</Link>
              {/* <Link to="/settings" className="dropdown-item">Setări</Link> */}
              <Link to="/carduri" className="dropdown-item">Carduri</Link>
              <button className="dropdown-item logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      ) : (
        <div className="login-container">
          <Link to="/login" className="login-btn">Login</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;