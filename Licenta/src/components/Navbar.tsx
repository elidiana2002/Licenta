//src\components\Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  // Simulare user logat: dacă există "user" în localStorage
  const user = localStorage.getItem('user');
  const userData = user ? JSON.parse(user) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      {/* Hamburger Menu Button - Stânga */}
      <button className="hamburger-menu" onClick={toggleMobileMenu}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>Meniu</h3>
              <button className="close-mobile-menu" onClick={() => setMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="mobile-menu-links">
              <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Acasă
              </Link>
              <Link to="/dashboard" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/scor" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Scor Credit
              </Link>
              <Link to="/istoric" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Istoric
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation Links - Ascunse pe mobile */}
      <div className="nav-links desktop-only">
        <Link to="/" className="nav-link">Acasă</Link>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/scor" className="nav-link">Scor Credit</Link>
        <Link to="/istoric" className="nav-link">Istoric</Link>
      </div>

      {/* Profile/Login - Dreapta */}
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
              {userData && userData.role === 'admin' && (
                <Link to="/admin" className="dropdown-item">Admin Panel</Link>
              )}
              <button className="dropdown-item logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      ) : (
        <div className="login-container">
          <Link to="/login" className="login-btn">Conectează-te</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;