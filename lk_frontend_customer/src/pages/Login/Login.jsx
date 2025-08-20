
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api.js';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../constants';
import './LoginCustomer.css';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginCustomer() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await api.post('/api/login/', {
      email,
      password,
    });

    if (!response.data.access) {
      toast.error('Invalid credentials.');
      return;
    }

    let userRole = null;
    if (response.data.user && response.data.user.role) {
      userRole = response.data.user.role;
    } else {
      try {
        const decodedToken = jwtDecode(response.data.access);
        userRole = decodedToken.role || decodedToken.user_type || null;
      } catch (err) {
        toast.error('Could not determine user role.');
        return;
      }
    }

    if (userRole !== 'CUSTOMER') {
      toast.error('Access denied. Customer credentials required.');
      return;
    }

    localStorage.setItem(ACCESS_TOKEN, response.data.access);
    localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    toast.success('Login successful!');
    navigate('/customer/home');
  } catch (error) {
    console.error(error);
    toast.error('Login failed. Please check your credentials.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome </h2>
            <p>Sign in to your LocalKonnect account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                required
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                required
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <>
                  <div className=""></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register" className="auth-link">Sign up here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginCustomer;
