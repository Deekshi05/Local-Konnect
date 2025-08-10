import { useState, useEffect } from 'react';
import api from '../api';
import { API_ENDPOINTS, TENDER_ASSISTANCE_STATUS } from '../constants';
import '../styles/TenderAssistance.css';

const TenderAssistance = () => {
  const [assistanceRecords, setAssistanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    requirements_text: '',
    estimated_budget: '',
    project_timeline_days: '',
    special_instructions: '',
    status: ''
  });

  useEffect(() => {
    fetchAssistanceRecords();
  }, []);

  const fetchAssistanceRecords = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(API_ENDPOINTS.TENDER_ASSISTANCE_SUPERVISOR);
      setAssistanceRecords(response.data || []);
    } catch (error) {
      console.error('Error fetching assistance records:', error);
      setError('Failed to load assistance records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createAssistedTender = async (assistanceId) => {
    try {
      const tenderData = {
        title: `Project for ${selectedRecord.customer_name}`,
        description: `${selectedRecord.service_name} project based on consultation`,
        assistance: assistanceId
      };

      await api.post(API_ENDPOINTS.ASSISTED_TENDER_CREATE, tenderData);
      
      // Refresh data
      fetchAssistanceRecords();
      setSelectedRecord(null);
      
      alert('Tender created successfully! The customer can now post it to contractors.');
    } catch (error) {
      console.error('Error creating assisted tender:', error);
      alert('Failed to create tender. Please try again.');
    }
  };

  const handleEdit = () => {
    setEditForm({
      requirements_text: selectedRecord.requirements_text_display || '',
      estimated_budget: selectedRecord.estimated_budget || '',
      project_timeline_days: selectedRecord.project_timeline_days || '',
      special_instructions: selectedRecord.special_instructions || '',
      status: selectedRecord.status || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await api.patch(`${API_ENDPOINTS.TENDER_ASSISTANCE_DETAIL.replace(':id', selectedRecord.id)}`, editForm);
      
      // Refresh data
      await fetchAssistanceRecords();
      
      // Update selected record
      const updatedRecord = assistanceRecords.find(record => record.id === selectedRecord.id);
      setSelectedRecord(updatedRecord);
      setIsEditing(false);
      
      alert('Tender assistance updated successfully!');
    } catch (error) {
      console.error('Error updating tender assistance:', error);
      alert('Failed to update tender assistance. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      requirements_text: '',
      estimated_budget: '',
      project_timeline_days: '',
      special_instructions: '',
      status: ''
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      in_progress: 'var(--lk-warning)',
      completed: 'var(--lk-success)',
      cancelled: 'var(--lk-error)'
    };
    return colors[status] || 'var(--lk-secondary)';
  };

  const getStatusText = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredRecords = assistanceRecords.filter(record => {
    if (filter === 'all') return true;
    return record.status === filter;
  });

  if (loading) {
    return (
      <div className="tender-assistance-page">
        <div className="loading">Loading assistance records...</div>
      </div>
    );
  }

  return (
    <div className="tender-assistance-page">
      <div className="assistance-header">
        <h1>Tender Assistance Management</h1>
        {/* <p>Track and manage your consultation-to-tender conversion process</p> */}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="assistance-filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Records ({assistanceRecords.length})
        </button>
        <button 
          className={filter === 'in_progress' ? 'active' : ''}
          onClick={() => setFilter('in_progress')}
        >
          In Progress ({assistanceRecords.filter(r => r.status === 'in_progress').length})
        </button>
        <button 
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completed ({assistanceRecords.filter(r => r.status === 'completed').length})
        </button>
        <button 
          className={filter === 'cancelled' ? 'active' : ''}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled ({assistanceRecords.filter(r => r.status === 'cancelled').length})
        </button>
      </div>

      <div className="assistance-grid">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div key={record.id} className="assistance-card" onClick={() => setSelectedRecord(record)}>
              <div className="assistance-header-card">
                <h3>{record.customer_name}</h3>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(record.status) }}
                >
                  {getStatusText(record.status)}
                </span>
              </div>
              
              <div className="assistance-content">
                <div className="detail-item">
                  <span className="label">Service:</span>
                  <span className="value">{record.service_name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Budget:</span>
                  <span className="value">₹{record.estimated_budget || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Timeline:</span>
                  <span className="value">{record.project_timeline_days || 'N/A'} days</span>
                </div>
                <div className="detail-item">
                  <span className="label">Created:</span>
                  <span className="value">{new Date(record.created_at).toLocaleDateString()}</span>
                </div>
                {record.tender_posted && (
                  <div className="detail-item">
                    <span className="label">Tender:</span>
                    <span className="value posted">Posted</span>
                  </div>
                )}
              </div>
              
              <div className="assistance-footer">
                <button className="btn btn-primary">View Details</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-assistance">
            <p>No assistance records found for the selected filter.</p>
          </div>
        )}
      </div>

      {/* Assistance Detail Modal */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assistance Record Details</h2>
              <button className="close-btn" onClick={() => setSelectedRecord(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="assistance-details">
                <div className="info-section">
                  <h3>Basic Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Customer:</label>
                      <span>{selectedRecord.customer_name}</span>
                    </div>
                    <div className="info-item">
                      <label>Service:</label>
                      <span>{selectedRecord.service_name}</span>
                    </div>
                    <div className="info-item">
                      <label>Status:</label>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedRecord.status) }}
                      >
                        {getStatusText(selectedRecord.status)}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Created:</label>
                      <span>{new Date(selectedRecord.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Project Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Estimated Budget:</label>
                      <span>₹{selectedRecord.estimated_budget || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <label>Timeline:</label>
                      <span>{selectedRecord.project_timeline_days || 'Not specified'} days</span>
                    </div>
                    <div className="info-item">
                      <label>Tender Posted:</label>
                      <span className={selectedRecord.tender_posted ? 'posted' : 'not-posted'}>
                        {selectedRecord.tender_posted ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {selectedRecord.tender_id && (
                      <div className="info-item">
                        <label>Tender ID:</label>
                        <span>#{selectedRecord.tender_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="info-section">
                  <div className="section-header">
                    <h3>Requirements Discussed</h3>
                    {!isEditing && (
                      <button className="btn btn-secondary btn-sm" onClick={handleEdit}>
                        <i className="fas fa-edit"></i> Edit
                      </button>
                    )}
                  </div>
                  
                  <div className="requirements-content">
                    {isEditing ? (
                      <div className="edit-form">
                        <div className="form-group">
                          <label>Requirements (one per line):</label>
                          <textarea
                            className="form-textarea"
                            rows="8"
                            placeholder="Enter requirements, one per line&#10;• First requirement&#10;• Second requirement&#10;• Third requirement"
                            value={editForm.requirements_text}
                            onChange={(e) => setEditForm({...editForm, requirements_text: e.target.value})}
                          />
                          <small className="form-help">
                            Enter each requirement on a new line. You can use bullet points (•) for better formatting.
                          </small>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>Estimated Budget (₹):</label>
                            <input
                              type="number"
                              className="form-input"
                              placeholder="Enter estimated budget"
                              value={editForm.estimated_budget}
                              onChange={(e) => setEditForm({...editForm, estimated_budget: e.target.value})}
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Timeline (days):</label>
                            <input
                              type="number"
                              className="form-input"
                              placeholder="Project duration in days"
                              value={editForm.project_timeline_days}
                              onChange={(e) => setEditForm({...editForm, project_timeline_days: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label>Special Instructions:</label>
                          <textarea
                            className="form-textarea"
                            rows="4"
                            placeholder="Any special instructions or notes"
                            value={editForm.special_instructions}
                            onChange={(e) => setEditForm({...editForm, special_instructions: e.target.value})}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Status:</label>
                          <select
                            className="form-select"
                            value={editForm.status}
                            onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                          >
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        
                        <div className="form-actions">
                          <button className="btn btn-primary" onClick={handleSave}>
                            <i className="fas fa-save"></i> Save Changes
                          </button>
                          <button className="btn btn-secondary" onClick={handleCancel}>
                            <i className="fas fa-times"></i> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {selectedRecord.requirements_text_display ? (
                          <div className="requirements-display">
                            {selectedRecord.requirements_text_display.split('\n').map((line, index) => (
                              <div key={index} className="requirement-item">
                                {line}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="empty-state">
                            <p>No requirements discussed yet.</p>
                            <button className="btn btn-secondary" onClick={handleEdit}>
                              Add Requirements
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {selectedRecord.special_instructions && (
                  <div className="info-section">
                    <h3>Special Instructions</h3>
                    <p>{selectedRecord.special_instructions}</p>
                  </div>
                )}

                {selectedRecord.virtual_appointment_id && (
                  <div className="info-section">
                    <h3>Related Consultation</h3>
                    <p>Virtual Appointment ID: #{selectedRecord.virtual_appointment_id}</p>
                  </div>
                )}

                {selectedRecord.physical_visit_id && (
                  <div className="info-section">
                    <h3>Related Visit</h3>
                    <p>Physical Visit ID: #{selectedRecord.physical_visit_id}</p>
                  </div>
                )}

                {selectedRecord.status === 'completed' && !selectedRecord.tender_posted && (
                  <div className="action-buttons">
                    <button 
                      className="btn btn-primary"
                      onClick={() => createAssistedTender(selectedRecord.id)}
                    >
                      Create Tender for Customer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenderAssistance;
