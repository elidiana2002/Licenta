// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CreditScorePage from './pages/CreditScorePage';
import ClientHistoryPage from './pages/ClientHistoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Router>
        <div className="navbar-wrapper">
          <Navbar />
        </div>
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/scor" element={<CreditScorePage />} />
            <Route path="/istoric" element={<ClientHistoryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<ProfilePage />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
