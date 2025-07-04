import React, { useEffect, useState } from 'react';

interface User {
  id: number;
  email: string;
  role: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) {
    return (
      <div className="page-container">
        <h2>Nu ești autentificat!</h2>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card">
        <h2>Profilul meu</h2>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Rol:</strong> {user.role}</p>
      </div>
    </div>
  );
};

export default ProfilePage; 