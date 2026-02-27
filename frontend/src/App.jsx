import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Users, Zap } from 'lucide-react';
import CEOPage from './components/CEOPage';
import UserPage from './components/UserPage';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="glass-panel" style={{ margin: '1rem', borderRadius: '12px' }}>
      <div className="logo gradient-text">
        <Zap size={28} />
        QoreLogic AI
      </div>
      <div className="nav-links">
        <Link to="/ceo" className={location.pathname === '/ceo' ? 'active' : ''}>
          <Shield size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          CEO Portal
        </Link>
        <Link to="/user" className={location.pathname === '/user' ? 'active' : ''}>
          <Users size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          User Access
        </Link>
      </div>
    </nav>
  );
};

const Home = () => (
  <div className="container" style={{ textAlign: 'center', marginTop: '10vh' }}>
    <h1 className="gradient-text" style={{ fontSize: '4rem', marginBottom: '1rem' }}>Enterprise Knowledge AI</h1>
    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
      Bridge the gap between executive strategy and team execution with our retrieval-augmented intelligence platform.
    </p>
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
      <Link to="/ceo" className="btn btn-primary">Enter CEO Portal</Link>
      <Link to="/user" className="btn btn-secondary">Enter User Portal</Link>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ceo" element={<CEOPage />} />
        <Route path="/user" element={<UserPage />} />
      </Routes>
    </Router>
  );
}

export default App;
