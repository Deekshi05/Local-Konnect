import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react'; // Import useState and useEffect
import { jwtDecode } from 'jwt-decode';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tenders from './pages/Tenders';
import Profile from './pages/Profile';
import Consultations from './pages/Consultations';
import Services from './pages/Services';
import TenderAssistance from './pages/TenderAssistance';
import { USER_ROLES } from './constants';
import './App.css';

function App() {
  console.log('App component rendered/re-rendered'); // Top-level log
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    isSupervisor: false,
  });

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let authenticated = false;
    let supervisor = false;

    if (token && userStr) {
      try {
        const decodedToken = jwtDecode(token);
        const user = JSON.parse(userStr);
        console.log('App.jsx - checkAuthStatus: User data:', user);
        
        authenticated = decodedToken.exp > Date.now() / 1000;
        supervisor = user.role === USER_ROLES.SUPERVISOR;
        
        if (!authenticated) {
          // Clean up if token is expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('App.jsx - Error in checkAuthStatus:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    console.log('App.jsx - checkAuthStatus: Authenticated:', authenticated, 'Supervisor:', supervisor);
    setAuthStatus({ isAuthenticated: authenticated, isSupervisor: supervisor });
  };

  useEffect(() => {
    checkAuthStatus(); // Initial check

    // Listen for custom 'authChange' event
    const handleAuthChange = () => {
      console.log('App.jsx - authChange event received. Re-checking auth status.');
      checkAuthStatus();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              authStatus.isAuthenticated && authStatus.isSupervisor ? (
                <div className="app-layout">
                  <Sidebar />
                  <div className="main-content">
                    {/* <Header /> */}
                    <div className="content">
                      <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="consultations" element={<Consultations />} />
                        <Route path="tender-assistance" element={<TenderAssistance />} />
                        <Route path="tenders" element={<Tenders />} />
                        <Route path="services" element={<Services />} />
                        <Route path="reports" element={
                          <div className="coming-soon">Reports feature coming soon...</div>
                        } />
                        <Route path="profile" element={<Profile />} />
                        <Route path="" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </div>
                  </div>
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
