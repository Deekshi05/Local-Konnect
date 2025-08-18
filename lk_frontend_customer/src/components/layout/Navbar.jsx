import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    const isCustomerPath = location.pathname.startsWith('/customer');

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to={user ? "/customer/dashboard" : "/"} className="navbar-logo">
                    Local Konnect
                </Link>

                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    {!user && (
                        <>
                            <Link 
                                to="/" 
                                className={`navbar-link ${isActive('/') ? 'active' : ''}`} 
                                onClick={closeMenu}
                            >
                                <i className="fas fa-home"></i> Home
                            </Link>
                            <Link 
                                to="/about" 
                                className={`navbar-link ${isActive('/about') ? 'active' : ''}`} 
                                onClick={closeMenu}
                            >
                                <i className="fas fa-info-circle"></i> About
                            </Link>
                            <Link 
                                to="/services" 
                                className={`navbar-link ${isActive('/services') ? 'active' : ''}`} 
                                onClick={closeMenu}
                            >
                                <i className="fas fa-tools"></i> Services
                            </Link>
                        </>
                    )}
                    
                    {user && (
                        <div className="navbar-links">
                            <Link 
                                to="/customer/dashboard" 
                                className={`navbar-link ${isActive('/customer/dashboard') ? 'active' : ''}`} 
                                onClick={closeMenu}
                            >
                                <i className="fas fa-tachometer-alt"></i> Dashboard
                            </Link>
                            <Link 
                                to="/customer/services" 
                                className={`navbar-link ${isActive('/customer/services') ? 'active' : ''}`} 
                                onClick={closeMenu}
                            >
                                <i className="fas fa-tools"></i> Services
                            </Link>
                            <Link 
                                to="/customer/quick-jobs" 
                                className={`navbar-link ${isActive('/customer/quick-jobs') ? 'active' : ''}`} 
                                onClick={closeMenu}
                            >
                                <i className="fas fa-bolt"></i> Quick Jobs
                            </Link>
                            <Link 
                                to="/customer/my-quick-jobs" 
                                className={`navbar-link ${isActive('/customer/my-quick-jobs') ? 'active' : ''}`} 
                                onClick={closeMenu}
                            >
                                <i className="fas fa-list-check"></i> My Quick Jobs
                            </Link>
                            <Link 
                                to="/customer/trust-network" 
                                className={`navbar-link ${isActive('/customer/trust-network') ? 'active' : ''}`} 
                                onClick={closeMenu}
                            >
                                <i className="fas fa-users"></i> Trust Network
                            </Link>
                            <Link 
                                to="/customer/appointments" 
                                className={`navbar-link ${isActive('/customer/appointments') ? 'active' : ''}`} 
                                onClick={closeMenu}
                            >
                                <i className="fas fa-calendar-alt"></i> Appointments
                            </Link>
                            <Link 
                                to="/customer/tenders" 
                                className={`navbar-link ${isActive('/customer/tenders') ? 'active' : ''}`} 
                                onClick={closeMenu}
                            >
                                <i className="fas fa-file-contract"></i> Tenders
                            </Link>
                            <Link 
                                to="/customer/profile" 
                                className={`navbar-link ${isActive('/customer/profile') ? 'active' : ''}`} 
                                onClick={closeMenu}
                            >
                                <i className="fas fa-user"></i> Profile
                            </Link>
                            <button 
                                onClick={() => { handleLogout(); closeMenu(); }} 
                                className="auth-button logout-button"
                            >
                                <i className="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </div>
                    )}

                    {!user && (
                        <div className="navbar-auth">
                            <Link to="/login" className="auth-button login-button" onClick={closeMenu}>
                                <i className="fas fa-sign-in-alt"></i> Login
                            </Link>
                            <Link to="/register" className="auth-button signup-button" onClick={closeMenu}>
                                <i className="fas fa-user-plus"></i> Sign Up
                            </Link>
                        </div>
                    )}
                </div>

                <div className="menu-toggle" onClick={toggleMenu}>
                    {isMenuOpen ? '✕' : '☰'}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
