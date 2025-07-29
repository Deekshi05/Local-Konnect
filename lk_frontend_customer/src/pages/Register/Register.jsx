import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../api.js";
import './RegisterCustomer.css';

function RegisterCustomer() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    city: '',
    state: '',
    customer_image: null,
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'customer_image') {
      setFormData({ ...formData, customer_image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    for (let key in formData) {
      submitData.append(key, formData[key]);
    }

    try {
      const response = await api.post('/api/register/customer/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message || 'Registration successful');

      // Wait briefly, then navigate to home
      setTimeout(() => {
        navigate('/login');
      }, 1500); // 1.5 seconds delay for user to see the message
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="form-container">
      <h2>Customer Registration</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>Email:</label>
        <input type="email" name="email" onChange={handleChange} required />

        <label>Password:</label>
        <input type="password" name="password" onChange={handleChange} required />

        <label>First Name:</label>
        <input type="text" name="first_name" onChange={handleChange} required />

        <label>Last Name:</label>
        <input type="text" name="last_name" onChange={handleChange} required />

        <label>Phone Number:</label>
        <input type="text" name="phone_number" onChange={handleChange} required />

        <label>City:</label>
        <input type="text" name="city" onChange={handleChange} required />

        <label>State:</label>
        <input type="text" name="state" onChange={handleChange} required />

        <label>Customer Image:</label>
        <input type="file" name="customer_image" accept="image/*" onChange={handleChange} required />

        <button type="submit">Register</button>
      </form>

      {message && <p className="response-message">{message}</p>}
    </div>
  );
}

export default RegisterCustomer;
