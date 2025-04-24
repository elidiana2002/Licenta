import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CreditScorePage from './pages/CreditScorePage';
import ClientHistoryPage from './pages/ClientHistoryPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Router>
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
          <Navbar />
        </div>
        <div style={{ marginTop: '64px', flex: 1, fontFamily: 'Georgia, serif', fontSize: 'px' }}>
          <Routes>
            <Route path="/" element={<div style={{ marginBottom: '32px' }}><HomePage /></div>} />
            <Route path="/scor" element={<div style={{ marginBottom: '32px' }}><CreditScorePage /></div>} />
            <Route path="/istoric" element={<div style={{ marginBottom: '32px' }}><ClientHistoryPage /></div>} />
            <Route path="/login" element={<div style={{ textAlign: 'right' }}><LoginPage /></div>} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
