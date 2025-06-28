import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api.js'; // Adjust if needed
import './LoginCustomer.css';   // Optional styling

function LoginCustomer() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/api/login/', {
        email,
        password
      });

      // Save tokens to localStorage or sessionStorage
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);

      setMessage('Login successful!');
      navigate('/');  // Redirect to Home page

    } catch (error) {
      console.error(error);
      setMessage('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>

      {message && <p className="response-message">{message}</p>}
    </div>
  );
}

export default LoginCustomer;
