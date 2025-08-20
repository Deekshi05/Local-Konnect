import { useState, useEffect } from 'react';
import api from '../api';
import { API_ENDPOINTS, APPOINTMENT_STATUS, VISIT_STATUS, PROJECT_COMPLEXITY, TENDER_ASSISTANCE_STATUS } from '../constants';
import '../styles/Consultations.css';

const Consultations = () => {
  const [appointments, setAppointments] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showTenderAssistanceModal, setShowTenderAssistanceModal] = useState(false);
  const [assessmentData, setAssessmentData] = useState({
    project_complexity: 'medium',
    physical_visit_required: false,
    skip_physical_visit_reason: '',
    estimated_budget_range: ''
  });
  const [tenderAssistanceData, setTenderAssistanceData] = useState({
    requirements_text: '',
    estimated_budget: '',
    project_timeline_days: '',
    special_instructions: ''
  });

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      setError('');

      const [appointmentsRes, visitsRes] = await Promise.all([
        api.get(API_ENDPOINTS.VIRTUAL_APPOINTMENTS_SUPERVISOR),
        api.get(API_ENDPOINTS.PHYSICAL_VISITS_SUPERVISOR)
      ]);

      setAppointments(appointmentsRes.data || []);
      setVisits(visitsRes.data || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setError('Failed to load consultations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status, notes = '') => {
    try {
      await api.patch(`${API_ENDPOINTS.VIRTUAL_APPOINTMENT_UPDATE}${appointmentId}/update/`, {
        status,
        notes
      });
      
      // Refresh data
      fetchConsultations();
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment status.');
    }
  };

  const updateVisitStatus = async (visitId, status, notes = '', customerWilling = null) => {
    try {
      const updateData = { status, notes };
      if (customerWilling !== null) {
        updateData.customer_willing_for_tender = customerWilling;
      }

      await api.patch(`${API_ENDPOINTS.PHYSICAL_VISIT_UPDATE}${visitId}/update/`, updateData);
      
      // Refresh data
      fetchConsultations();
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating visit:', error);
      alert('Failed to update visit status.');
    }
  };

  const assessProjectComplexity = async (appointmentId) => {
    try {
      await api.post(`${API_ENDPOINTS.ASSESS_COMPLEXITY}${appointmentId}/assess-complexity/`, assessmentData);
      
      // Refresh data
      fetchConsultations();
      setShowAssessmentModal(false);
      setSelectedItem(null);
      
      // Reset assessment data
      setAssessmentData({
        project_complexity: 'medium',
        physical_visit_required: false,
        skip_physical_visit_reason: '',
        estimated_budget_range: ''
      });
    } catch (error) {
      console.error('Error assessing complexity:', error);
      alert('Failed to assess project complexity.');
    }
  };

  const createTenderAssistance = async (appointmentOrVisit) => {
    try {
      const payload = {
        customer: appointmentOrVisit.customer_id,
        supervisor: appointmentOrVisit.supervisor_id,
        service: appointmentOrVisit.service_id,
        virtual_appointment: activeTab === 'appointments' ? appointmentOrVisit.id : null,
        physical_visit: activeTab === 'visits' ? appointmentOrVisit.id : null,
        ...tenderAssistanceData
      };

      await api.post(API_ENDPOINTS.TENDER_ASSISTANCE_CREATE, payload);
      
      // Refresh data
      fetchConsultations();
      setShowTenderAssistanceModal(false);
      setSelectedItem(null);
      
      // Reset tender assistance data
      setTenderAssistanceData({
        requirements_text: '',
        estimated_budget: '',
        project_timeline_days: '',
        special_instructions: ''
      });
      
      alert('Tender assistance record created successfully!');
    } catch (error) {
      console.error('Error creating tender assistance:', error);
      alert('Already tender assistance exists for this appointment/visit.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'var(--lk-warning)',
      completed: 'var(--lk-success)',
      cancelled: 'var(--lk-error)',
      no_show: 'var(--lk-error)',
      payment_pending: 'var(--lk-warning)',
      confirmed: 'var(--lk-info)'
    };
    return colors[status] || 'var(--lk-secondary)';
  };

  const getStatusText = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="consultations-page">
        <div className="loading">Loading consultations...</div>
      </div>
    );
  }

  return (
    <div className="consultations-page">
      <div className="consultations-header">
        <h1>Consultation Management</h1>
        {/* <p>Manage your virtual appointments and physical visits</p> */}
      </div>

      {error && (
        <div className="error-message" style={{ 
          background: 'var(--lk-error-light)', 
          color: 'var(--lk-error)', 
          padding: 'var(--lk-spacing)', 
          borderRadius: 'var(--lk-radius)', 
          marginBottom: 'var(--lk-spacing-md)' 
        }}>
          {error}
        </div>
      )}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Virtual Appointments ({appointments.length})
        </button>
        <button 
          className={`tab ${activeTab === 'visits' ? 'active' : ''}`}
          onClick={() => setActiveTab('visits')}
        >
          Physical Visits ({visits.length})
        </button>
      </div>

      <div className="filter-section">
        <div className="status-filters">
          <button 
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          {activeTab === 'appointments' ? (
            Object.entries(APPOINTMENT_STATUS).map(([key, value]) => (
              <button
                key={value}
                className={`filter-btn ${statusFilter === value ? 'active' : ''}`}
                onClick={() => setStatusFilter(value)}
              >
                {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
              </button>
            ))
          ) : (
            Object.entries(VISIT_STATUS).map(([key, value]) => (
              <button
                key={value}
                className={`filter-btn ${statusFilter === value ? 'active' : ''}`}
                onClick={() => setStatusFilter(value)}
              >
                {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
              </button>
            ))
          )}
        </div>
      </div>

      {activeTab === 'appointments' && (
        <div className="appointments-section">
          <div className="appointments-grid">
            {appointments.filter(appointment => statusFilter === 'all' || appointment.status === statusFilter).length > 0 ? (
              appointments.filter(appointment => statusFilter === 'all' || appointment.status === statusFilter).map((appointment) => (
                <div key={appointment.id} className="appointment-card" onClick={() => setSelectedItem(appointment)}>
                  <div className="appointment-header">
                    <h3>{appointment.customer_name || 'Customer'}</h3>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(appointment.status) }}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                  
                  <div className="appointment-content">
                    <div className="detail-item">
                      <span className="label">Service:</span>
                      <span className="value">{appointment.service_name || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Date:</span>
                      <span className="value">
                        {new Date(appointment.scheduled_time).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Time:</span>
                      <span className="value">
                        {new Date(appointment.scheduled_time).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Duration:</span>
                      <span className="value">{appointment.duration_minutes} minutes</span>
                    </div>
                  </div>
                  
                  <div className="appointment-footer">
                    <button className="btn btn-primary">View Details</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>No virtual appointments found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'visits' && (
        <div className="visits-section">
          <div className="visits-grid">
            {visits.filter(visit => statusFilter === 'all' || visit.status === statusFilter).length > 0 ? (
              visits.filter(visit => statusFilter === 'all' || visit.status === statusFilter).map((visit) => (
                <div key={visit.id} className="visit-card" onClick={() => setSelectedItem(visit)}>
                  <div className="visit-header">
                    <h3>{visit.customer_name || 'Customer'}</h3>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(visit.status) }}
                    >
                      {getStatusText(visit.status)}
                    </span>
                  </div>
                  
                  <div className="visit-content">
                    <div className="detail-item">
                      <span className="label">Service:</span>
                      <span className="value">{visit.service_name || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Date:</span>
                      <span className="value">
                        {new Date(visit.scheduled_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Time:</span>
                      <span className="value">{visit.scheduled_time}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Address:</span>
                      <span className="value">{visit.visit_address || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Fee:</span>
                      <span className="value">₹{visit.visit_fee || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="visit-footer">
                    <button className="btn btn-primary">View Details</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>No physical visits found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedItem && activeTab === 'appointments' && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Appointment Details</h2>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="appointment-details">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Customer:</label>
                    <span>{selectedItem.customer_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Service:</label>
                    <span>{selectedItem.service_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Date:</label>
                    <span>{new Date(selectedItem.scheduled_time).toLocaleDateString()}</span>
                  </div>
                  <div className="info-item">
                    <label>Time:</label>
                    <span>{new Date(selectedItem.scheduled_time).toLocaleTimeString()}</span>
                  </div>
                  <div className="info-item">
                    <label>Duration:</label>
                    <span>{selectedItem.duration_minutes} minutes</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedItem.status) }}
                    >
                      {getStatusText(selectedItem.status)}
                    </span>
                  </div>
                </div>
                
                {selectedItem.notes && (
                  <div className="notes-section">
                    <h4>Notes</h4>
                    <p>{selectedItem.notes}</p>
                  </div>
                )}
                
                {selectedItem.status === 'scheduled' && (
                  <div className="action-buttons">
                    <button 
                      className="btn btn-success"
                      onClick={() => updateAppointmentStatus(selectedItem.id, 'completed')}
                    >
                      Mark as Completed
                    </button>
                    <button 
                      className="btn btn-info"
                      onClick={() => setShowAssessmentModal(true)}
                    >
                      Assess Project Complexity
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowTenderAssistanceModal(true)}
                    >
                      Create Tender Assistance
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => updateAppointmentStatus(selectedItem.id, 'cancelled')}
                    >
                      Cancel Appointment
                    </button>
                  </div>
                )}
                
                {selectedItem.status === 'completed' && (
                  <div className="action-buttons">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowTenderAssistanceModal(true)}
                    >
                      Create Tender Assistance
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visit Detail Modal */}
      {selectedItem && activeTab === 'visits' && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Visit Details</h2>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="visit-details">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Customer:</label>
                    <span>{selectedItem.customer_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Service:</label>
                    <span>{selectedItem.service_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Date:</label>
                    <span>{new Date(selectedItem.scheduled_date).toLocaleDateString()}</span>
                  </div>
                  <div className="info-item">
                    <label>Time:</label>
                    <span>{selectedItem.scheduled_time}</span>
                  </div>
                  <div className="info-item">
                    <label>Address:</label>
                    <span>{selectedItem.visit_address}</span>
                  </div>
                  <div className="info-item">
                    <label>Fee:</label>
                    <span>₹{selectedItem.visit_fee}</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedItem.status) }}
                    >
                      {getStatusText(selectedItem.status)}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Payment Status:</label>
                    <span>{selectedItem.payment_status}</span>
                  </div>
                </div>
                
                {selectedItem.supervisor_notes && (
                  <div className="notes-section">
                    <h4>Supervisor Notes</h4>
                    <p>{selectedItem.supervisor_notes}</p>
                  </div>
                )}
                
                {selectedItem.status === 'confirmed' && (
                  <div className="action-buttons">
                    <button 
                      className="btn btn-success"
                      onClick={() => updateVisitStatus(selectedItem.id, 'completed', '', true)}
                    >
                      Complete Visit (Customer Willing)
                    </button>
                    <button 
                      className="btn btn-warning"
                      onClick={() => updateVisitStatus(selectedItem.id, 'completed', '', false)}
                    >
                      Complete Visit (Customer Not Willing)
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowTenderAssistanceModal(true)}
                    >
                      Create Tender Assistance
                    </button>
                  </div>
                )}
                
                {selectedItem.status === 'completed' && (
                  <div className="action-buttons">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowTenderAssistanceModal(true)}
                    >
                      Create Tender Assistance
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Complexity Assessment Modal */}
      {showAssessmentModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowAssessmentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assess Project Complexity</h2>
              <button className="close-btn" onClick={() => setShowAssessmentModal(false)}>×</button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              assessProjectComplexity(selectedItem.id);
            }} className="assessment-form">
              <div className="form-group">
                <label htmlFor="project_complexity">Project Complexity *</label>
                <select
                  id="project_complexity"
                  value={assessmentData.project_complexity}
                  onChange={(e) => setAssessmentData(prev => ({
                    ...prev,
                    project_complexity: e.target.value
                  }))}
                  required
                >
                  <option value="simple">Simple</option>
                  <option value="medium">Medium</option>
                  <option value="complex">Complex</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={assessmentData.physical_visit_required}
                    onChange={(e) => setAssessmentData(prev => ({
                      ...prev,
                      physical_visit_required: e.target.checked
                    }))}
                  />
                  Physical visit required
                </label>
              </div>

              {!assessmentData.physical_visit_required && (
                <div className="form-group">
                  <label htmlFor="skip_reason">Reason for skipping physical visit *</label>
                  <textarea
                    id="skip_reason"
                    value={assessmentData.skip_physical_visit_reason}
                    onChange={(e) => setAssessmentData(prev => ({
                      ...prev,
                      skip_physical_visit_reason: e.target.value
                    }))}
                    required={!assessmentData.physical_visit_required}
                    rows="3"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="budget_range">Estimated Budget Range</label>
                <input
                  type="text"
                  id="budget_range"
                  value={assessmentData.estimated_budget_range}
                  onChange={(e) => setAssessmentData(prev => ({
                    ...prev,
                    estimated_budget_range: e.target.value
                  }))}
                  placeholder="e.g., ₹50,000 - ₹1,00,000"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Submit Assessment
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowAssessmentModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tender Assistance Modal */}
      {showTenderAssistanceModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowTenderAssistanceModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Tender Assistance</h2>
              <button className="close-btn" onClick={() => setShowTenderAssistanceModal(false)}>×</button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              createTenderAssistance(selectedItem);
            }} className="tender-assistance-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="estimated_budget">Estimated Budget (₹) *</label>
                  <input
                    type="number"
                    id="estimated_budget"
                    value={tenderAssistanceData.estimated_budget}
                    onChange={(e) => setTenderAssistanceData(prev => ({
                      ...prev,
                      estimated_budget: e.target.value
                    }))}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="timeline">Project Timeline (Days) *</label>
                  <input
                    type="number"
                    id="timeline"
                    value={tenderAssistanceData.project_timeline_days}
                    onChange={(e) => setTenderAssistanceData(prev => ({
                      ...prev,
                      project_timeline_days: e.target.value
                    }))}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="requirements">Requirements Discussed</label>
                <textarea
                  id="requirements"
                  value={tenderAssistanceData.requirements_text}
                  onChange={(e) => setTenderAssistanceData(prev => ({
                    ...prev,
                    requirements_text: e.target.value
                  }))}
                  rows="4"
                  placeholder="Key requirements discussed during consultation...&#10;• First requirement&#10;• Second requirement&#10;• Third requirement"
                />
                <small className="form-help">
                  Enter each requirement on a new line. You can use bullet points (•) for better formatting.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="instructions">Special Instructions</label>
                <textarea
                  id="instructions"
                  value={tenderAssistanceData.special_instructions}
                  onChange={(e) => setTenderAssistanceData(prev => ({
                    ...prev,
                    special_instructions: e.target.value
                  }))}
                  rows="3"
                  placeholder="Any special instructions for the customer or contractors..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Create Assistance Record
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowTenderAssistanceModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consultations; 