import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Unauthorized.css';

const Unauthorized = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const getHomeLink = () => {
        switch (user?.role) {
            case 'CUSTOMER':
                return '/services';
            case 'CONTRACTOR':
                return '/contractor/dashboard';
            case 'SUPERVISOR':
                return '/supervisor/dashboard';
            default:
                return '/';
        }
    };

    return (
        <div className="unauthorized-container">
            <div className="unauthorized-content">
                <h1>Access Denied</h1>
                <p>You don't have permission to access this page.</p>
                
                {user ? (
                    <>
                        <Link to={getHomeLink()} className="home-button">
                            Go to Dashboard
                        </Link>
                        <button 
                            onClick={() => navigate(-1)} 
                            className="back-button"
                        >
                            Go Back
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="login-button">
                        Login
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Unauthorized;
