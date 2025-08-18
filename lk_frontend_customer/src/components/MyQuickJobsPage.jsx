import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaMapMarkerAlt, FaDollarSign, FaUser, FaPhone, FaStar, FaCheck, FaArrowLeft } from 'react-icons/fa';
import api from '../api';
import './MyQuickJobsPage.css';

const MyQuickJobsPage = () => {
  const navigate = useNavigate();
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [activeView, setActiveView] = useState('open'); // 'open', 'assigned', or 'completed'

  useEffect(() => {
    loadMyQuickJobs();
  }, []);

  const loadMyQuickJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/trust-network/my-quick-jobs/');
      setMyJobs(response.data);
    } catch (error) {
      console.error('Error loading my quick jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on status
  const openJobs = myJobs.filter(job => job.status === 'OPEN');
  const assignedJobs = myJobs.filter(job => job.status === 'ASSIGNED');
  const completedJobs = myJobs.filter(job => job.status === 'COMPLETED');

  const handleMarkComplete = async (jobId) => {
    if (!window.confirm('Mark this job as completed? This action cannot be undone.')) {
      return;
    }

    try {
      await api.patch(`/api/trust-network/quick-jobs/${jobId}/`, {
        status: 'COMPLETED',
        completed_at: new Date().toISOString()
      });
      
      // Reload jobs to reflect the status change
      loadMyQuickJobs();
      alert('Job marked as completed successfully!');
    } catch (error) {
      console.error('Error marking job as complete:', error);
      alert('Failed to mark job as complete. Please try again.');
    }
  };

  const handleAssignContractor = async (jobId, contractorId, proposedPrice = null) => {
    if (!contractorId) {
      alert('Contractor information is not available. Cannot assign job.');
      return;
    }

    // Create confirmation message that includes proposed price info
    const confirmMessage = proposedPrice 
      ? `Are you sure you want to assign this contractor? The job budget will be set to ₹${proposedPrice} (contractor's proposed price). This action cannot be undone.`
      : 'Are you sure you want to assign this contractor? This action cannot be undone.';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const payload = {
        contractor_id: contractorId
      };
      
      // Include proposed price if available
      if (proposedPrice !== null && proposedPrice !== undefined) {
        payload.proposed_price = proposedPrice;
      }

      await api.post(`/api/trust-network/quick-jobs/${jobId}/assign/`, payload);
      
      // Reload jobs to reflect the assignment
      loadMyQuickJobs();
      setSelectedJobId(null);
      
      const successMessage = proposedPrice 
        ? `Contractor assigned successfully! Job budget updated to ₹${proposedPrice}.`
        : 'Contractor assigned successfully!';
      alert(successMessage);
    } catch (error) {
      console.error('Error assigning contractor:', error);
      alert('Failed to assign contractor. Please try again.');
    }
  };

  const QuickJobCard = ({ job }) => {
    const isExpanded = selectedJobId === job.id;
    
    return (
      <div className="quick-job-card">
        <div className="job-header" onClick={() => setSelectedJobId(isExpanded ? null : job.id)}>
          <div className="job-title-section">
            <h3 className="job-title">{job.title}</h3>
            <span className={`status-badge ${job.status.toLowerCase()}`}>
              {job.status}
            </span>
          </div>
          <div className="job-meta">
            <span className="urgency-badge urgency-{job.urgency.toLowerCase()}">
              {job.urgency}
            </span>
            <span className="interests-count">
              {job.interests?.length || 0} interested
            </span>
          </div>
        </div>
        
        <div className="job-details">
          <p className="job-description">{job.description}</p>
          <div className="job-info">
            <div className="info-item">
              <FaMapMarkerAlt className="info-icon" />
              <span>{job.location}</span>
            </div>
            <div className="info-item">
              <FaClock className="info-icon" />
              <span>{new Date(job.created_at).toLocaleDateString()}</span>
            </div>
            {job.budget_suggestion && (
              <div className="info-item">
                <FaDollarSign className="info-icon" />
                <span>₹{job.budget_suggestion}</span>
              </div>
            )}
            {(job.status === 'ASSIGNED' || job.status === 'COMPLETED') && 
             job.assigned_contractor && (
              <div className="info-item assigned-contractor">
                <FaUser className="info-icon" />
                <span>
                  Assigned to: {job.assigned_contractor_details ? 
                    `${job.assigned_contractor_details.user?.first_name || ''} ${job.assigned_contractor_details.user?.last_name || ''}`.trim() ||
                    `${job.assigned_contractor_details.first_name || ''} ${job.assigned_contractor_details.last_name || ''}`.trim() ||
                    'Contractor' :
                    job.assigned_contractor.user ? 
                      `${job.assigned_contractor.user.first_name || ''} ${job.assigned_contractor.user.last_name || ''}`.trim() :
                      job.assigned_contractor.name || 'Contractor'
                  }
                  {/* Display phone number if available */}
                  {(job.assigned_contractor_details?.user?.phone_number || job.assigned_contractor?.user?.phone_number) && (
                    <span className="contractor-phone-inline">
                      {' | '}<FaPhone /> {job.assigned_contractor_details?.user?.phone_number || job.assigned_contractor?.user?.phone_number}
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons for assigned jobs */}
        {job.status === 'ASSIGNED' && (
          <div className="job-actions">
            <button 
              className="complete-button"
              onClick={() => handleMarkComplete(job.id)}
            >
              <FaCheck />
              Mark as Complete
            </button>
          </div>
        )}

        {isExpanded && job.interests && job.interests.length > 0 && (
          <div className="interested-contractors">
            <h4 className="section-title">Interested Contractors</h4>
            <div className="contractors-list">
              {job.interests.map((interest) => (
                <ContractorInterestCard 
                  key={interest.id || Math.random()}
                  interest={interest}
                  onAssign={(contractorId) => handleAssignContractor(job.id, contractorId, interest.proposed_price)}
                  isJobOpen={job.status === 'OPEN'}
                />
              ))}
            </div>
          </div>
        )}

        {isExpanded && (!job.interests || job.interests.length === 0) && (
          <div className="no-interests">
            <p>No contractors have expressed interest yet.</p>
          </div>
        )}
      </div>
    );
  };

  const ContractorInterestCard = ({ interest, onAssign, isJobOpen }) => {
    // Handle both possible data structures
    const contractor = interest.contractor_details || interest.contractor;
    
    // Safety checks for undefined data
    if (!contractor) {
      return (
        <div className="contractor-interest-card">
          <p>Contractor information not available</p>
        </div>
      );
    }
    
    // Handle different data structures for contractor name
    let contractorName = 'Unknown Contractor';
    if (contractor.user && (contractor.user.first_name || contractor.user.last_name)) {
      contractorName = `${contractor.user.first_name || ''} ${contractor.user.last_name || ''}`.trim();
    } else if (contractor.first_name || contractor.last_name) {
      contractorName = `${contractor.first_name || ''} ${contractor.last_name || ''}`.trim();
    }
    
    const contractorLocation = contractor.city && contractor.state 
      ? `${contractor.city}, ${contractor.state}`
      : 'Location not specified';

    // Get contractor ID for assignment
    const contractorId = contractor.id || (interest.contractor && interest.contractor.id);
    
    return (
      <div className="contractor-interest-card">
        <div className="contractor-header">
          <div className="contractor-info">
            <h5 className="contractor-name">
              {contractorName}
            </h5>
            <p className="contractor-location">
              {contractorLocation}
            </p>
            {/* Display phone number if available */}
            {(contractor.user?.phone_number || contractor.phone_number) && (
              <p className="contractor-phone">
                <FaPhone /> {contractor.user?.phone_number || contractor.phone_number}
              </p>
            )}
          </div>
          <div className="contractor-stats">
            <div className="stat-item">
              <FaStar className="stat-icon" />
              <span>{contractor.rating || 'N/A'}/5</span>
            </div>
            <div className="stat-item">
              <FaUser className="stat-icon" />
              <span>{contractor.experience || 0} yrs</span>
            </div>
          </div>
        </div>

        {interest.message && (
          <div className="contractor-message">
            <h6>Message:</h6>
            <p>"{interest.message}"</p>
          </div>
        )}

        <div className="interest-footer">
          <div className="proposed-price">
            {interest.proposed_price ? (
              <div className="price-display">
                <span className="price-label">Proposed Price:</span>
                <span className="price-value highlighted">₹{interest.proposed_price}</span>
                <small className="price-note">(Will become job budget)</small>
              </div>
            ) : (
              <span className="no-price">Price not specified</span>
            )}
          </div>
          
          {isJobOpen && contractorId && (
            <button 
              className="assign-button"
              onClick={() => onAssign(contractorId)}
              title={interest.proposed_price ? `Assign and set budget to ₹${interest.proposed_price}` : 'Assign contractor'}
            >
              <FaCheck />
              {interest.proposed_price ? `Assign (₹${interest.proposed_price})` : 'Assign Contractor'}
            </button>
          )}
        </div>

        <div className="interest-timestamp">
          <span>Interested on {new Date(interest.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="my-quick-jobs-container">
        <div className="loading-state">Loading your quick jobs...</div>
      </div>
    );
  }

  return (
    <div className="my-quick-jobs-container">
      <div className="page-header">
        <button 
          onClick={() => navigate('/customer/quick-jobs')} 
          className="back-button"
        >
          <FaArrowLeft />
          Back to Instant Works
        </button>
        <h1 className="page-title">My Quick Jobs</h1>
        <p className="page-subtitle">Manage your posted jobs and review contractor interests</p>
      </div>

      {/* Tab Navigation */}
      <div className="jobs-tabs">
        <button 
          className={`tab-button ${activeView === 'open' ? 'active' : ''}`}
          onClick={() => setActiveView('open')}
        >
          Open Jobs ({openJobs.length})
        </button>
        <button 
          className={`tab-button ${activeView === 'assigned' ? 'active' : ''}`}
          onClick={() => setActiveView('assigned')}
        >
          Assigned Jobs ({assignedJobs.length})
        </button>
        <button 
          className={`tab-button ${activeView === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveView('completed')}
        >
          Completed Jobs ({completedJobs.length})
        </button>
      </div>

      {myJobs.length === 0 ? (
        <div className="empty-state">
          <h3>No Quick Jobs Posted Yet</h3>
          <p>You haven't posted any quick jobs yet. Click on "Post Quick Job" to get started!</p>
        </div>
      ) : (
        <div className="jobs-list">
          {(() => {
            let currentJobs;
            switch (activeView) {
              case 'open':
                currentJobs = openJobs;
                break;
              case 'assigned':
                currentJobs = assignedJobs;
                break;
              case 'completed':
                currentJobs = completedJobs;
                break;
              default:
                currentJobs = openJobs;
            }
            
            return currentJobs.length > 0 ? (
              currentJobs.map(job => (
                <QuickJobCard key={job.id} job={job} />
              ))
            ) : (
              <div className="empty-view">
                <p>No {activeView} jobs found.</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default MyQuickJobsPage;
