import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from "../../api.js";
import './RegisterCustomer.css';
import { toast } from 'react-toastify';
import { STATES_CITIES, STATES } from '../../utils/statesCities.js';

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

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [availableCities, setAvailableCities] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'customer_image') {
      const file = e.target.files[0];
      setFormData({ ...formData, customer_image: file });
      
      // Create preview URL
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);
      } else {
        setPreviewImage(null);
      }
    } else if (e.target.name === 'state') {
      const selectedState = e.target.value;
      setFormData({ ...formData, state: selectedState, city: '' });
      setAvailableCities(STATES_CITIES[selectedState] || []);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
if (!emailRegex.test(formData.email)) {
  toast.error('Enter a valid Gmail address.');
  setLoading(false);
  return;
}

// Password validation
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
if (!passwordRegex.test(formData.password)) {
  toast.error('Password must be 8+ characters with a letter and number.');
  setLoading(false);
  return;
}

// Phone number validation (10-digit only)
const phoneRegex = /^\d{10}$/;
if (!phoneRegex.test(formData.phone_number)) {
  toast.error('Enter a valid 10-digit phone number.');
  setLoading(false);
  return;
}
    const submitData = new FormData();
    for (let key in formData) {
      if (formData[key] !== null) {
        submitData.append(key, formData[key]);
      }
    }

    try {
      const response = await api.post('/api/register/customer/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Registration successful! Please log in.');
      
      // Clean up preview URL
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.data) {
        // Handle field-specific errors
        const errors = error.response.data;
        Object.keys(errors).forEach(field => {
          if (Array.isArray(errors[field])) {
            errors[field].forEach(msg => toast.error(`${field}: ${msg}`));
          } else {
            toast.error(`${field}: ${errors[field]}`);
          }
        });
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container register">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Join LocalKonnect to connect with trusted contractors</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form" encType="multipart/form-data">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  id="first_name"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your first name"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  id="last_name"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your last name"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a strong password"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone_number">Phone Number</label>
              <input
                id="phone_number"
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="state">State</label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="" disabled>Select your state</option>
                  {STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="city">City</label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  disabled={loading || !formData.state}
                >
                  <option value="" disabled>
                    {formData.state ? 'Select your city' : 'Select state first'}
                  </option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="customer_image">Profile Image</label>
              <div className="file-input-container">
                <input
                  id="customer_image"
                  type="file"
                  name="customer_image"
                  accept="image/*"
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="file-input"
                />
                <label htmlFor="customer_image" className="file-input-label">
                  <i className="fas fa-upload"></i>
                  {formData.customer_image ? formData.customer_image.name : 'Choose profile image'}
                </label>
              </div>
              
              {previewImage && (
                <div className="image-preview">
                  <img src={previewImage} alt="Preview" />
                </div>
              )}
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <>
                  <div className="loading-spinner small"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="auth-link">Sign in here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterCustomer;
