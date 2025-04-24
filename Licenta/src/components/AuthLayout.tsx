import React from 'react';
import '../App.css';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="brand-header">
          <h1>Credit<span>BT</span></h1>
          <p>Soluții bancare personalizate</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;