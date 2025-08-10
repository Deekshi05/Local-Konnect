import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Dispatch custom event to trigger auth state update
    window.dispatchEvent(new Event('authChange'));
    
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/consultations', label: 'Consultations', icon: '💬' },
    { path: '/tender-assistance', label: 'Tender Assistance', icon: '📝' },
    { path: '/tenders', label: 'Tenders', icon: '📋' },
    { path: '/services', label: 'My Services', icon: '🔧' },
    // { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Local Konnect</h2>
        <p>Supervisor Portal</p>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
