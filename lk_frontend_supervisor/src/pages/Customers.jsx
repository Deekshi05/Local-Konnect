import { useState, useEffect } from 'react';
import api from '../api';
import '../styles/Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers/');
      setCustomers(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  return (
    <div className="customers-page">
      <div className="customers-header">
        <h1>Customer Management</h1>
        <p>View and manage all customers in the platform</p>
      </div>

      <div className="customers-grid">
        {customers.length > 0 ? (
          customers.map((customer) => (
            <div key={customer.id} className="customer-card" onClick={() => setSelectedCustomer(customer)}>
              <div className="customer-header">
                <div className="customer-avatar">
                  {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
                </div>
                <div className="customer-info">
                  <h3>{customer.first_name} {customer.last_name}</h3>
                  <p>{customer.email}</p>
                </div>
              </div>
              
              <div className="customer-details">
                <div className="detail-item">
                  <span className="label">Phone:</span>
                  <span className="value">{customer.phone_number || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Location:</span>
                  <span className="value">{customer.location || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Joined:</span>
                  <span className="value">
                    {new Date(customer.date_joined).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="customer-footer">
                <button className="view-btn">View Profile</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-customers">
            <p>No customers found.</p>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedCustomer.first_name} {selectedCustomer.last_name}</h2>
              <button className="close-btn" onClick={() => setSelectedCustomer(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="customer-profile">
                <div className="profile-section">
                  <h3>Contact Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Email:</label>
                      <span>{selectedCustomer.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone:</label>
                      <span>{selectedCustomer.phone_number || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Location:</label>
                      <span>{selectedCustomer.location || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Joined:</label>
                      <span>{new Date(selectedCustomer.date_joined).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
