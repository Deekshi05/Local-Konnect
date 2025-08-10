import { useState, useEffect } from 'react';
import api from '../api';
import '../styles/Contractors.css';

const Contractors = () => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContractor, setSelectedContractor] = useState(null);

  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    try {
      const response = await api.get('/contractors/');
      setContractors(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching contractors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading contractors...</div>;
  }

  return (
    <div className="contractors-page">
      <div className="contractors-header">
        <h1>Contractor Management</h1>
        <p>View and manage all contractors in the platform</p>
      </div>

      <div className="contractors-grid">
        {contractors.length > 0 ? (
          contractors.map((contractor) => (
            <div key={contractor.id} className="contractor-card" onClick={() => setSelectedContractor(contractor)}>
              <div className="contractor-header">
                <div className="contractor-avatar">
                  {contractor.first_name?.charAt(0)}{contractor.last_name?.charAt(0)}
                </div>
                <div className="contractor-info">
                  <h3>{contractor.first_name} {contractor.last_name}</h3>
                  <p>{contractor.email}</p>
                  <div className="rating">
                    {'⭐'.repeat(Math.floor(contractor.rating || 4))}
                    <span>({contractor.rating || 4.0})</span>
                  </div>
                </div>
              </div>
              
              <div className="contractor-details">
                <div className="detail-item">
                  <span className="label">Experience:</span>
                  <span className="value">{contractor.experience_years || 0} years</span>
                </div>
                <div className="detail-item">
                  <span className="label">Phone:</span>
                  <span className="value">{contractor.phone_number || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Address:</span>
                  <span className="value">{contractor.address || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Joined:</span>
                  <span className="value">
                    {new Date(contractor.date_joined).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="contractor-footer">
                <button className="view-btn">View Profile</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-contractors">
            <p>No contractors found.</p>
          </div>
        )}
      </div>

      {selectedContractor && (
        <div className="modal-overlay" onClick={() => setSelectedContractor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedContractor.first_name} {selectedContractor.last_name}</h2>
              <button className="close-btn" onClick={() => setSelectedContractor(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="contractor-profile">
                <div className="profile-section">
                  <h3>Contact Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Email:</label>
                      <span>{selectedContractor.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone:</label>
                      <span>{selectedContractor.phone_number || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Address:</label>
                      <span>{selectedContractor.address || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Experience:</label>
                      <span>{selectedContractor.experience_years || 0} years</span>
                    </div>
                    <div className="info-item">
                      <label>Rating:</label>
                      <span>
                        {'⭐'.repeat(Math.floor(selectedContractor.rating || 4))}
                        ({selectedContractor.rating || 4.0})
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Joined:</label>
                      <span>{new Date(selectedContractor.date_joined).toLocaleDateString()}</span>
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

export default Contractors;
