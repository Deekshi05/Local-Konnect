import React, { useState, useEffect } from 'react';
import { supervisorApi } from '../api';
import api from '../api';
import { TENDER_STATUS, PROJECT_COMPLEXITY, API_ENDPOINTS } from '../constants';
import '../styles/Tenders.css';

const PRIORITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

const getStatusColor = (status) => {
  switch (status) {
    case 'draft': return 'status-draft';
    case 'published': return 'status-published';
    case 'in_progress': return 'status-in-progress';
    case 'completed': return 'status-completed';
    case 'cancelled': return 'status-cancelled';
    default: return 'status-draft';
  }
};

// Status and Permission Helper Functions
const getStatusInfo = (status) => {
  const statusMap = {
    published: { label: 'Published', color: '#007bff', description: 'Open for contractor bids' },
    bidding: { label: 'Bidding', color: '#ffc107', description: 'Contractors are submitting bids' },
    contractor_selection: { label: 'Contractor Selection', color: '#fd7e14', description: 'Customer is selecting contractor' },
    in_progress: { label: 'In Progress', color: '#28a745', description: 'Work is actively being done' },
    completed: { label: 'Completed', color: '#6c757d', description: 'Project completed successfully' },
    cancelled: { label: 'Cancelled', color: '#dc3545', description: 'Project was cancelled' }
  };
  return statusMap[status] || { label: status, color: '#6c757d', description: 'Unknown status' };
};

const canEdit = (tender) => {
  return false; // Disable edit functionality
};

const canEditProgress = (tender) => {
  return tender.status === 'in_progress';
};

const canEditMilestones = (tender) => {
  return tender.status === 'in_progress';
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'priority-high';
    case 'medium': return 'priority-medium';
    case 'low': return 'priority-low';
    default: return 'priority-medium';
  }
};

const formatCurrency = (amount) => {
  if (!amount) return 'Not specified';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Not specified';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const Tenders = () => {
  const [tenders, setTenders] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all'
  });
  
  // Modal states
  const [viewModal, setViewModal] = useState({ open: false, tender: null });
  const [editModal, setEditModal] = useState({ open: false, tender: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, tender: null });
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    budget: '',
    status: 'draft',
    priority: 'medium'
  });

  // Progress editing state
  const [progressModal, setProgressModal] = useState({ open: false, tender: null });
  const [progressForm, setProgressForm] = useState({
    percent_complete: 0,
    current_phase: 'planning',
    notes: '',
    next_milestone: ''
  });

  // Milestone editing state
  const [milestonesModal, setMilestonesModal] = useState({ open: false, tender: null });
  const [milestones, setMilestones] = useState([]);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchTenders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tenders, filters]);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      console.log('Fetching supervisor tenders...');
      
      // Try both approaches to see which one works
      console.log('=== Trying supervisorApi.getTenders() ===');
      try {
        const supervisorApiResponse = await supervisorApi.getTenders();
        console.log('supervisorApi response:', supervisorApiResponse);
      } catch (supervisorApiError) {
        console.error('supervisorApi error:', supervisorApiError);
      }
      
      console.log('=== Trying direct api call (same as Dashboard) ===');
      const response = await api.get(API_ENDPOINTS.TENDERS_SUPERVISOR);
      console.log('Direct api response:', response);
      
      // Handle response data - same as Dashboard
      const tendersData = Array.isArray(response.data) ? response.data : [];
      console.log('Final tenders data:', tendersData);
      setTenders(tendersData);
      
    } catch (err) {
      console.error('Error fetching tenders:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      
      let errorMessage = 'Failed to fetch tenders: ';
      if (err.response?.status === 404) {
        errorMessage += 'Endpoint not found. Please check API configuration.';
      } else if (err.response?.status === 401) {
        errorMessage += 'Authentication required. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage += 'Access denied. You may not have supervisor permissions.';
      } else if (err.response?.status >= 500) {
        errorMessage += 'Server error. Please try again later.';
      } else {
        errorMessage += (err.message || 'Unknown error');
      }
      
      setError(errorMessage);
      setTenders([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tenders];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(tender => tender.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(tender => tender.priority === filters.priority);
    }

    setFilteredTenders(filtered);
  };

  const handleView = (tender) => {
    setViewModal({ open: true, tender });
  };

  const handleEdit = (tender) => {
    setEditForm({
      title: tender.title || '',
      description: tender.description || '',
      location: tender.location || '',
      start_date: tender.start_date ? tender.start_date.split('T')[0] : '',
      end_date: tender.end_date ? tender.end_date.split('T')[0] : '',
      budget: tender.budget || '',
      status: tender.status || 'draft',
      priority: tender.priority || 'medium'
    });
    setEditModal({ open: true, tender });
  };

  const handleDelete = (tender) => {
    setDeleteModal({ open: true, tender });
  };

  const handleEditSubmit = async () => {
    try {
      console.log('Updating tender:', editModal.tender.id, editForm);
      await supervisorApi.updateTender(editModal.tender.id, editForm);
      setEditModal({ open: false, tender: null });
      fetchTenders(); // Refresh the list
    } catch (err) {
      console.error('Error updating tender:', err);
      setError('Failed to update tender: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      console.log('Deleting tender:', deleteModal.tender.id);
      await supervisorApi.deleteTender(deleteModal.tender.id);
      setDeleteModal({ open: false, tender: null });
      fetchTenders(); // Refresh the list
    } catch (err) {
      console.error('Error deleting tender:', err);
      setError('Failed to delete tender: ' + (err.message || 'Unknown error'));
    }
  };

  // Progress Management Handlers
  const handleProgressEdit = async (tender) => {
    try {
      // Fetch current progress
      const response = await supervisorApi.getTenderProgress(tender.id);
      const progress = response.data || tender.progress || {};
      
      setProgressForm({
        percent_complete: progress.percent_complete || 0,
        current_phase: progress.current_phase || 'planning',
        notes: progress.notes || '',
        next_milestone: progress.next_milestone || ''
      });
      setProgressModal({ open: true, tender });
    } catch (err) {
      console.error('Error fetching progress:', err);
      // Use existing progress from tender if API fails
      const progress = tender.progress || {};
      setProgressForm({
        percent_complete: progress.percent_complete || 0,
        current_phase: progress.current_phase || 'planning',
        notes: progress.notes || '',
        next_milestone: progress.next_milestone || ''
      });
      setProgressModal({ open: true, tender });
    }
  };

  const handleProgressSubmit = async () => {
    try {
      console.log('Updating progress for tender:', progressModal.tender.id, progressForm);
      
      // Prepare the data for the API call
      const progressData = {
        percent_complete: progressForm.percent_complete,
        current_phase: progressForm.current_phase,
        notes: progressForm.notes,
        // Convert next_milestone to integer or null
        next_milestone: progressForm.next_milestone ? parseInt(progressForm.next_milestone) : null
      };
      
      console.log('Sending progress data:', progressData);
      await supervisorApi.updateTenderProgress(progressModal.tender.id, progressData);
      setProgressModal({ open: false, tender: null });
      fetchTenders(); // Refresh the list
    } catch (err) {
      console.error('Error updating progress:', err);
      let errorMessage = 'Failed to update progress: ';
      
      if (err.response?.status === 403) {
        errorMessage += 'Permission denied. You can only edit progress for tenders in "in_progress" state.';
      } else {
        errorMessage += (err.response?.data?.detail || err.message || 'Unknown error');
      }
      
      setError(errorMessage);
    }
  };

  // Milestone Management Handlers
  const handleMilestonesEdit = async (tender) => {
    try {
      // Fetch milestones
      const response = await supervisorApi.getTenderMilestones(tender.id);
      setMilestones(response.data || []);
      setMilestonesModal({ open: true, tender });
    } catch (err) {
      console.error('Error fetching milestones:', err);
      setMilestones([]);
      setMilestonesModal({ open: true, tender });
    }
  };

  const handleAddMilestone = async () => {
    try {
      console.log('Creating milestone:', newMilestone);
      await supervisorApi.createTenderMilestone(milestonesModal.tender.id, newMilestone);
      // Refresh milestones
      const response = await supervisorApi.getTenderMilestones(milestonesModal.tender.id);
      setMilestones(response.data || []);
      setNewMilestone({ title: '', description: '', due_date: '', status: 'pending' });
    } catch (err) {
      console.error('Error creating milestone:', err);
      let errorMessage = 'Failed to create milestone: ';
      
      if (err.response?.status === 403) {
        errorMessage += 'Permission denied. You can only add milestones to tenders in "in_progress" state.';
      } else {
        errorMessage += (err.response?.data?.detail || err.message || 'Unknown error');
      }
      
      setError(errorMessage);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      await supervisorApi.deleteTenderMilestone(milestoneId);
      // Refresh milestones
      const response = await supervisorApi.getTenderMilestones(milestonesModal.tender.id);
      setMilestones(response.data || []);
    } catch (err) {
      console.error('Error deleting milestone:', err);
      let errorMessage = 'Failed to delete milestone: ';
      
      if (err.response?.status === 403) {
        errorMessage += 'Permission denied. You can only delete milestones from tenders in "in_progress" state.';
      } else {
        errorMessage += (err.response?.data?.detail || err.message || 'Unknown error');
      }
      
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading tenders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
        <button onClick={fetchTenders} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="tenders-page">
      {/* Header */}
      <div className="tenders-header">
        <h1>Tenders</h1>
        {/* <p>Manage tenders under your supervision</p> */}
      </div>

      {/* Debug Section */}
        {/* <div style={{ background: '#f0f0f0', padding: '1rem', margin: '1rem 0', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
          <h3>Debug Info:</h3>
          <p><strong>Total tenders loaded:</strong> {tenders.length}</p>
          <p><strong>Filtered tenders:</strong> {filteredTenders.length}</p>
          <p><strong>Current filters:</strong> Status: {filters.status}, Priority: {filters.priority}</p>
          <button 
            onClick={fetchTenders} 
            style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Reload Tenders
          </button>
          {tenders.length > 0 && (
            <details style={{ marginTop: '0.5rem' }}>
              <summary>Raw tender data (first item)</summary>
              <pre style={{ fontSize: '0.75rem', overflow: 'auto', maxHeight: '200px' }}>
                {JSON.stringify(tenders[0], null, 2)}
              </pre>
            </details>
          )}
        </div> */}

      {/* Filters */}
      <div className="tenders-filters">
        <button 
          className={filters.status === 'all' ? 'active' : ''} 
          onClick={() => setFilters({ ...filters, status: 'all' })}
        >
          All Status
        </button>
        <button 
          className={filters.status === 'draft' ? 'active' : ''} 
          onClick={() => setFilters({ ...filters, status: 'draft' })}
        >
          Draft
        </button>
        <button 
          className={filters.status === 'published' ? 'active' : ''} 
          onClick={() => setFilters({ ...filters, status: 'published' })}
        >
          Published
        </button>
        <button 
          className={filters.status === 'in_progress' ? 'active' : ''} 
          onClick={() => setFilters({ ...filters, status: 'in_progress' })}
        >
          In Progress
        </button>
        <button 
          className={filters.status === 'completed' ? 'active' : ''} 
          onClick={() => setFilters({ ...filters, status: 'completed' })}
        >
          Completed
        </button>
        
        <div style={{ width: '20px' }}></div>
        
        <button 
          className={filters.priority === 'all' ? 'active' : ''} 
          onClick={() => setFilters({ ...filters, priority: 'all' })}
        >
          All Priority
        </button>
        <button 
          className={filters.priority === 'high' ? 'active' : ''} 
          onClick={() => setFilters({ ...filters, priority: 'high' })}
        >
          High Priority
        </button>
        <button 
          className={filters.priority === 'medium' ? 'active' : ''} 
          onClick={() => setFilters({ ...filters, priority: 'medium' })}
        >
          Medium Priority
        </button>
        <button 
          className={filters.priority === 'low' ? 'active' : ''} 
          onClick={() => setFilters({ ...filters, priority: 'low' })}
        >
          Low Priority
        </button>
      </div>

      {/* Tenders Grid */}
      {filteredTenders.length === 0 ? (
        <div className="no-tenders">
          <p>
            {filters.status !== 'all' || filters.priority !== 'all'
              ? "No tenders match your current filters."
              : "No tenders are currently assigned to your supervision."}
          </p>
        </div>
      ) : (
        <div className="tenders-grid">
          {filteredTenders.map((tender) => (
            <div key={tender.id} className="tender-card" onClick={() => handleView(tender)}>
              <div className="tender-header">
                <h3>{tender.title || 'Untitled Tender'}</h3>
                <div className="status-badges">
                  <span className={`status-badge ${getStatusColor(tender.status)}`}>
                    {tender.status || 'draft'}
                  </span>
                  <span className={`priority-badge ${getPriorityColor(tender.priority)}`}>
                    {tender.priority || 'medium'}
                  </span>
                </div>
              </div>
              
              <div className="tender-content">
                <div className="tender-description">
                  {tender.description || 'No description provided'}
                </div>
                
                <div className="tender-details">
                  <div className="detail-item">
                    <span className="label">Customer:</span>
                    <span className="value">
                      {tender.customer?.user?.first_name && tender.customer?.user?.last_name
                        ? `${tender.customer.user.first_name} ${tender.customer.user.last_name}`
                        : 'Not specified'}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label">Service:</span>
                    <span className="value">{tender.service?.name || 'Not specified'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label">Location:</span>
                    <span className="value">{tender.location || 'Not specified'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label">Budget:</span>
                    <span className="value">{formatCurrency(tender.budget)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label">Timeline:</span>
                    <span className="value">
                      {formatDate(tender.start_date)} - {formatDate(tender.end_date)}
                    </span>
                  </div>
                  
                  {tender.status === 'in_progress' && tender.progress && (
                    <div className="detail-item">
                      <span className="label">Progress:</span>
                      <span className="value">
                        {Math.round(tender.progress.percent_complete || 0)}% 
                        ({tender.progress.current_phase || 'Planning'})
                      </span>
                    </div>
                  )}
                  
                  {tender.tender_requirements && tender.tender_requirements.length > 0 && (
                    <div className="detail-item">
                      <span className="label">Requirements:</span>
                      <span className="value">{tender.tender_requirements.length}</span>
                    </div>
                  )}
                  
                  
                </div>
              </div>
              
              <div className="tender-footer">
                <div className="tender-status-info" data-status={tender.status}>
                  <span className={`status-badge ${getStatusColor(tender.status)}`}>
                    {getStatusInfo(tender.status).label}
                  </span>
                  <small className="status-description">
                    {getStatusInfo(tender.status).description}
                  </small>
                  
                  {!canEdit(tender) && tender.status !== 'completed' && tender.status !== 'cancelled' && (
                    <small className="edit-restriction">
                      <i className="fas fa-info-circle"></i> 
                      Editing restricted - tender is in {getStatusInfo(tender.status).label.toLowerCase()} state
                    </small>
                  )}
                </div>
                
                <div className="action-buttons">
                  <button className="view-btn" onClick={(e) => { e.stopPropagation(); handleView(tender); }}>
                    View Details
                  </button>
                  
                  {canEdit(tender) && (
                    <button className="edit-btn" onClick={(e) => { e.stopPropagation(); handleEdit(tender); }}>
                      Edit
                    </button>
                  )}
                  
                  {canEditProgress(tender) && (
                    <button className="progress-btn" onClick={(e) => { e.stopPropagation(); handleProgressEdit(tender); }}>
                      Progress
                    </button>
                  )}
                  
                  {canEditMilestones(tender) && (
                    <button className="milestones-btn" onClick={(e) => { e.stopPropagation(); handleMilestonesEdit(tender); }}>
                      Milestones
                    </button>
                  )}
                  
                  {tender.status === 'completed' && (
                    <button className="btn-view-only" disabled>
                      <i className="fas fa-check-circle"></i> View Only
                    </button>
                  )}
                  
                  {tender.status === 'cancelled' && (
                    <button className="btn-cancelled" disabled>
                      <i className="fas fa-ban"></i> Cancelled
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {viewModal.open && (
        <div className="modal-overlay" onClick={() => setViewModal({ open: false, tender: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{viewModal.tender?.title || 'Tender Details'}</h2>
              <button 
                className="modal-close" 
                onClick={() => setViewModal({ open: false, tender: null })}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {viewModal.tender && (
                <div className="tender-info">
                  <div className="info-section">
                    <h4>Basic Information</h4>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span className={`status-badge ${getStatusColor(viewModal.tender.status)}`}>
                        {viewModal.tender.status || 'draft'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Priority:</span>
                      <span className={`priority-badge ${getPriorityColor(viewModal.tender.priority)}`}>
                        {viewModal.tender.priority || 'medium'}
                      </span>
                    </div>
                  </div>

                  <div className="info-section">
                    <h4>Customer Information</h4>
                    <div className="detail-item">
                      <span className="label">Name:</span>
                      <span className="value">
                        {viewModal.tender.customer?.user?.first_name && viewModal.tender.customer?.user?.last_name
                          ? `${viewModal.tender.customer.user.first_name} ${viewModal.tender.customer.user.last_name}`
                          : 'Not specified'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Email:</span>
                      <span className="value">{viewModal.tender.customer?.user?.email || 'Not specified'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone:</span>
                      <span className="value">{viewModal.tender.customer?.user?.phone_number || 'Not specified'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Location:</span>
                      <span className="value">
                        {viewModal.tender.customer?.city && viewModal.tender.customer?.state
                          ? `${viewModal.tender.customer.city}, ${viewModal.tender.customer.state}`
                          : 'Not specified'}
                      </span>
                    </div>
                  </div>

                  <div className="info-section">
                    <h4>Service & Project Details</h4>
                    <div className="detail-item">
                      <span className="label">Service:</span>
                      <span className="value">{viewModal.tender.service?.name || 'Not specified'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Location:</span>
                      <span className="value">{viewModal.tender.location || 'Not specified'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Budget:</span>
                      <span className="value">{formatCurrency(viewModal.tender.budget)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Start Date:</span>
                      <span className="value">{formatDate(viewModal.tender.start_date)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">End Date:</span>
                      <span className="value">{formatDate(viewModal.tender.end_date)}</span>
                    </div>
                  </div>

                  {viewModal.tender.tender_requirements && viewModal.tender.tender_requirements.length > 0 && (
                    <div className="info-section">
                      <h4>Requirements ({viewModal.tender.tender_requirements.length})</h4>
                      <div className="requirements-list">
                        {viewModal.tender.tender_requirements.map((req, index) => (
                          <div key={req.id || index} className="requirement-item">
                            <div className="requirement-header">
                              <span className="requirement-name">{req.requirement?.name || 'Requirement'}</span>
                              {req.is_critical && <span className="critical-badge">Critical</span>}
                            </div>
                            <div className="requirement-details">
                              <span>Category: {req.category?.name || 'N/A'}</span>
                              <span>Qty: {req.quantity || 'N/A'} {req.units || ''}</span>
                            </div>
                            {req.description && (
                              <div className="requirement-description">{req.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {viewModal.tender.progress && (
                    <div className="info-section">
                      <h4>Progress Information</h4>
                      <div className="progress-info">
                        <div className="progress-bar">
                          <div className="progress-label">
                            <span>Completion: {Math.round(viewModal.tender.progress.percent_complete || 0)}%</span>
                          </div>
                          <div className="progress-track">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${viewModal.tender.progress.percent_complete || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="detail-item">
                          <span className="label">Current Phase:</span>
                          <span className="value">{viewModal.tender.progress.current_phase || 'Planning'}</span>
                        </div>
                        {viewModal.tender.progress.notes && (
                          <div className="detail-item">
                            <span className="label">Notes:</span>
                            <span className="value">{viewModal.tender.progress.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="description-section">
                    <h4>Description</h4>
                    <p>{viewModal.tender.description || 'No description provided'}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setViewModal({ open: false, tender: null })}
              >
                Close
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setViewModal({ open: false, tender: null });
                  handleEdit(viewModal.tender);
                }}
              >
                Edit Tender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {progressModal.open && (
        <div className="modal-overlay" onClick={() => setProgressModal({ open: false, tender: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Progress - {progressModal.tender?.title}</h2>
              <button 
                className="modal-close" 
                onClick={() => setProgressModal({ open: false, tender: null })}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-section">
                <label>Completion Percentage</label>
                <div className="progress-input-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressForm.percent_complete}
                    onChange={(e) => setProgressForm({ ...progressForm, percent_complete: parseFloat(e.target.value) })}
                    className="progress-slider"
                  />
                  <span className="progress-value">{Math.round(progressForm.percent_complete)}%</span>
                </div>
              </div>

              <div className="form-section">
                <label>Current Phase</label>
                <select
                  value={progressForm.current_phase}
                  onChange={(e) => setProgressForm({ ...progressForm, current_phase: e.target.value })}
                  className="form-select"
                >
                  <option value="planning">Planning</option>
                  <option value="design">Design</option>
                  <option value="procurement">Procurement</option>
                  <option value="execution">Execution</option>
                  <option value="testing">Testing</option>
                  <option value="completion">Completion</option>
                  <option value="handover">Handover</option>
                </select>
              </div>

              <div className="form-section">
                <label>Progress Notes</label>
                <textarea
                  value={progressForm.notes}
                  onChange={(e) => setProgressForm({ ...progressForm, notes: e.target.value })}
                  placeholder="Add notes about current progress, challenges, or next steps..."
                  rows="4"
                  className="form-textarea"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setProgressModal({ open: false, tender: null })}
              >
                Back
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleProgressSubmit}
              >
                Update Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestones Modal */}
      {milestonesModal.open && (
        <div className="modal-overlay" onClick={() => setMilestonesModal({ open: false, tender: null })}>
          <div className="modal-content milestone-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Milestones - {milestonesModal.tender?.title}</h2>
              <button 
                className="modal-close" 
                onClick={() => setMilestonesModal({ open: false, tender: null })}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {/* Add New Milestone */}
              <div className="add-milestone-section">
                <h3>Add New Milestone</h3>
                <div className="milestone-form">
                  <div className="form-row">
                    <div className="form-section">
                      <label>Title</label>
                      <input
                        type="text"
                        value={newMilestone.title}
                        onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                        placeholder="Milestone title"
                        className="form-input"
                      />
                    </div>
                    <div className="form-section">
                      <label>Due Date</label>
                      <input
                        type="date"
                        value={newMilestone.due_date}
                        onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-section">
                    <label>Description</label>
                    <textarea
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                      placeholder="Milestone description"
                      rows="2"
                      className="form-textarea"
                    />
                  </div>
                  <button onClick={handleAddMilestone} className="btn btn-primary add-milestone-btn">
                    Add Milestone
                  </button>
                </div>
              </div>

              {/* Existing Milestones */}
              <div className="milestones-list">
                <h3>Existing Milestones ({milestones.length})</h3>
                {milestones.length === 0 ? (
                  <p className="no-milestones">No milestones created yet.</p>
                ) : (
                  <div className="milestones-grid">
                    {milestones.map((milestone) => (
                      <div key={milestone.id} className="milestone-card">
                        <div className="milestone-header">
                          <h4>{milestone.title}</h4>
                          <span className={`milestone-status ${milestone.status}`}>
                            {milestone.status}
                          </span>
                        </div>
                        <p className="milestone-description">{milestone.description}</p>
                        <div className="milestone-details">
                          <div className="milestone-date">
                            <strong>Due:</strong> {new Date(milestone.due_date).toLocaleDateString()}
                          </div>
                          {milestone.completed_date && (
                            <div className="milestone-completed">
                              <strong>Completed:</strong> {new Date(milestone.completed_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="milestone-actions">
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteMilestone(milestone.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setMilestonesModal({ open: false, tender: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenders;
