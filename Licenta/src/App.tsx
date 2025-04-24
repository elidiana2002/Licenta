import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CreditScorePage from './pages/CreditScorePage';
import ClientHistoryPage from './pages/ClientHistoryPage';
import LoginPage from './pages/LoginPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="navbar-wrapper">
          <Navbar />
        </div>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/scor" element={<CreditScorePage />} />
            <Route path="/istoric" element={<ClientHistoryPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;