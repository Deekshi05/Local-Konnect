import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import '../styles/Header.css';

const Header = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser(decodedToken);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const getUserInitials = () => {
    if (!user) return 'S';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'S';
  };

  const getUserName = () => {
    if (!user) return 'Supervisor';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Supervisor';
  };

  return (
    <header className="header">
      <div className="header-title">
        <h1>Supervisor Dashboard</h1>
      </div>
      
      <div className="header-actions">
        <div className="user-info">
          <div className="user-avatar">
            {getUserInitials()}
          </div>
          <span>{getUserName()}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
