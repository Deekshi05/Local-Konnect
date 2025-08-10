import React, { useState, useEffect, useCallback } from 'react';
import { FaClock, FaMapMarkerAlt, FaDollarSign, FaComment, FaPlus, FaEye, FaCheck, FaUser, FaPhone } from 'react-icons/fa';
import Sidebar from '../components/sidebar';
import api from '../api';
import '../styles/quickJobs.css';

const QuickJobCard = React.memo(({ job, showInterestButton = true, jobType = 'available', onExpressInterest, onMarkComplete }) => {
  const hasExpressedInterest = job.interests && job.interests.length > 0;
  
  return (
    <div className="quick-job-card">
      <div className="job-header">
        <h3 className="job-title">{job.title}</h3>
        <div className="job-badges">
          <span className={`urgency-badge urgency-${job.urgency.toLowerCase()}`}>
            {job.urgency}
          </span>
          {job.status && (
            <span className={`status-badge status-${job.status.toLowerCase()}`}>
              {job.status}
            </span>
          )}
        </div>
      </div>
      
      <p className="job-description">{job.description}</p>
      
      <div className="job-meta">
        <div className="meta-item">
          <FaMapMarkerAlt className="meta-icon" />
          <span>{job.location}</span>
        </div>
        <div className="meta-item">
          <FaClock className="meta-icon" />
          <span>{new Date(job.created_at).toLocaleDateString()}</span>
        </div>
        {job.budget_suggestion && (
          <div className="meta-item">
            <FaDollarSign className="meta-icon" />
            <span>₹{job.budget_suggestion}</span>
          </div>
        )}
        {job.customer_details && (
          <div className="meta-item customer-info">
            <FaUser className="meta-icon" />
            <span>
              Customer: {job.customer_details.user?.first_name} {job.customer_details.user?.last_name}
              {job.customer_details.user?.phone_number && (
                <span className="customer-phone">
                  {' | '}<FaPhone /> {job.customer_details.user.phone_number}
                </span>
              )}
            </span>
          </div>
        )}
        {job.completed_at && (
          <div className="meta-item">
            <FaCheck className="meta-icon" />
            <span>Completed: {new Date(job.completed_at).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="job-footer">
        <div className="service-info">
          <span>Service: {job.service_details?.name}</span>
          
        </div>
        
        {jobType === 'available' && showInterestButton && !hasExpressedInterest && (
          <button 
            className="interest-button"
            onClick={() => onExpressInterest(job.id)}
          >
            <FaComment />
            Express Interest
          </button>
        )}
        
        {jobType === 'available' && hasExpressedInterest && (
          <span className="already-interested">✓ Interest Expressed</span>
        )}

        
      </div>
    </div>
  );
});

const QuickJobsContractor = () => {
  const [quickJobs, setQuickJobs] = useState([]);
  const [myInterests, setMyInterests] = useState([]);
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [interestForm, setInterestForm] = useState({
    message: '',
    proposed_price: ''
  });
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);

  useEffect(() => {
    loadQuickJobs();
    loadMyInterests();
    loadAssignedJobs();
    loadCompletedJobs();
  }, []);

  const loadQuickJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trust-network/quick-jobs/?status=OPEN');



      setQuickJobs(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error loading quick jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyInterests = async () => {
    try {
      // We'll need to get contractor's interests - for now using all jobs with interests
      const response = await api.get('/trust-network/quick-jobs/');
      
      // Filter jobs where current contractor has expressed interest
      const jobsWithMyInterests = response.data.filter(job => 
        job.interests && job.interests.some(interest => 
          interest.contractor && interest.contractor.user
        )
      );
      setMyInterests(jobsWithMyInterests);
    } catch (error) {
      console.error('Error loading my interests:', error);
    }
  };

  const loadAssignedJobs = async () => {
    try {
      const response = await api.get('/trust-network/contractor-assigned-jobs/');
      setAssignedJobs(response.data || []);
    } catch (error) {
      console.error('Error loading assigned jobs:', error);
      // Check if it's a 404 or authentication issue
      if (error.response && error.response.status === 404) {
        console.log('Contractor profile not found - this might be a customer account');
      }
      setAssignedJobs([]);
    }
  };

  const loadCompletedJobs = async () => {
    try {
      const response = await api.get('/trust-network/contractor-completed-jobs/');
      setCompletedJobs(response.data || []);
    } catch (error) {
      console.error('Error loading completed jobs:', error);
      // Check if it's a 404 or authentication issue
      if (error.response && error.response.status === 404) {
        console.log('Contractor profile not found - this might be a customer account');
      }
      setCompletedJobs([]);
    }
  };

  const handleInputChange = useCallback((field, value) => {
    setInterestForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleMessageChange = useCallback((e) => {
    setInterestForm(prev => ({
      ...prev,
      message: e.target.value
    }));
  }, []);

  const handlePriceChange = useCallback((e) => {
    setInterestForm(prev => ({
      ...prev,
      proposed_price: e.target.value
    }));
  }, []);

  const handleExpressInterest = async () => {
    if (!selectedJobId) return;
    
    try {
      const response = await api.post('/trust-network/quick-job-interests/', {
        quick_job: selectedJobId,
        message: interestForm.message,
        proposed_price: interestForm.proposed_price ? parseFloat(interestForm.proposed_price) : null
      });

      alert('Interest expressed successfully!');
      setShowInterestModal(false);
      setInterestForm({ message: '', proposed_price: '' });
      setSelectedJobId(null);
      loadQuickJobs();
      loadMyInterests();
    } catch (error) {
      console.error('Error expressing interest:', error);
      alert('Failed to express interest. Please try again.');
    }
  };

  const handleMarkComplete = async (jobId) => {
    if (!window.confirm('Mark this job as completed? This action cannot be undone.')) {
      return;
    }

    try {
      await api.patch(`/trust-network/quick-jobs/${jobId}/`, {
        status: 'COMPLETED',
        completed_at: new Date().toISOString()
      });
      
      alert('Job marked as completed successfully!');
      loadAssignedJobs();
      loadCompletedJobs();
    } catch (error) {
      console.error('Error marking job as complete:', error);
      alert('Failed to mark job as complete. Please try again.');
    }
  };

  const openInterestModal = useCallback((jobId) => {
    setSelectedJobId(jobId);
    setShowInterestModal(true);
    // Reset form when opening modal
    setInterestForm({ message: '', proposed_price: '' });
  }, []);

  const closeInterestModal = useCallback(() => {
    setShowInterestModal(false);
    setSelectedJobId(null);
    setInterestForm({ message: '', proposed_price: '' });
  }, []);

  const InterestModal = () => {
    if (!showInterestModal) return null;

    return (
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeInterestModal()}>
        <div className="modal-content">
          <h3>Express Interest in Quick Job</h3>
          
          <div className="form-group">
            <label>Message (Optional)</label>
            <textarea
              value={interestForm.message}
              onChange={handleMessageChange}
              placeholder="Describe your availability and why you're the right fit for this job..."
              rows="4"
            />
          </div>
          
          <div className="form-group">
            <label>Proposed Price (₹) (Optional)</label>
            <input
              type="number"
              value={interestForm.proposed_price}
              onChange={handlePriceChange}
              placeholder="Enter your proposed price"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="modal-actions">
            <button 
              className="cancel-button"
              onClick={closeInterestModal}
              type="button"
            >
              Cancel
            </button>
            <button 
              className="submit-button"
              onClick={handleExpressInterest}
              type="button"
            >
              Express Interest
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Quick Jobs & Community</h1>
          <div className="tab-navigation">
            <button
              onClick={() => setActiveTab('available')}
              className={`tab-button ${activeTab === 'available' ? 'active' : ''}`}
            >
              Available Jobs
            </button>
            <button
              onClick={() => setActiveTab('interests')}
              className={`tab-button ${activeTab === 'interests' ? 'active' : ''}`}
            >
              My Interests
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              className={`tab-button ${activeTab === 'assigned' ? 'active' : ''}`}
            >
              Assigned Jobs ({assignedJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
            >
              Completed Jobs ({completedJobs.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading quick jobs...</div>
        ) : (
          <div className="jobs-content">
            {activeTab === 'available' && (
              <div className="available-jobs">
                <div className="section-header">
                  <h2>Available Quick Jobs</h2>
                  <p>Browse urgent jobs posted by customers in your area</p>
                </div>
                
                {quickJobs.length === 0 ? (
                  <div className="empty-state">
                    <h3>No Quick Jobs Available</h3>
                    <p>There are currently no open quick jobs. Check back later!</p>
                  </div>
                ) : (
                  <div className="jobs-grid">
                    {quickJobs.map(job => (
                      <QuickJobCard 
                        key={job.id} 
                        job={job} 
                        jobType="available"
                        onExpressInterest={openInterestModal}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'interests' && (
              <div className="my-interests">
                <div className="section-header">
                  <h2>Jobs I'm Interested In</h2>
                  <p>Track the jobs you've expressed interest in</p>
                </div>
                
                {myInterests.length === 0 ? (
                  <div className="empty-state">
                    <h3>No Interests Yet</h3>
                    <p>You haven't expressed interest in any quick jobs yet. Browse available jobs to get started!</p>
                  </div>
                ) : (
                  <div className="jobs-grid">
                    {myInterests.map(job => (
                      <QuickJobCard 
                        key={job.id} 
                        job={job} 
                        jobType="interest"
                        showInterestButton={false} 
                        onExpressInterest={openInterestModal}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'assigned' && (
              <div className="assigned-jobs">
                <div className="section-header">
                  <h2>Assigned Jobs</h2>
                  <p>Jobs that have been assigned to you and are waiting for completion</p>
                </div>
                
                {assignedJobs.length === 0 ? (
                  <div className="empty-state">
                    <h3>No Assigned Jobs</h3>
                    <p>You don't have any assigned jobs at the moment. Keep expressing interest in available jobs!</p>
                  </div>
                ) : (
                  <div className="jobs-grid">
                    {assignedJobs.map(job => (
                      <QuickJobCard 
                        key={job.id} 
                        job={job} 
                        jobType="assigned"
                        showInterestButton={false}
                        onMarkComplete={handleMarkComplete}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'completed' && (
              <div className="completed-jobs">
                <div className="section-header">
                  <h2>Completed Jobs</h2>
                  <p>Jobs you have successfully completed</p>
                </div>
                
                {completedJobs.length === 0 ? (
                  <div className="empty-state">
                    <h3>No Completed Jobs</h3>
                    <p>You haven't completed any jobs yet. Complete assigned jobs to build your reputation!</p>
                  </div>
                ) : (
                  <div className="jobs-grid">
                    {completedJobs.map(job => (
                      <QuickJobCard 
                        key={job.id} 
                        job={job} 
                        jobType="completed"
                        showInterestButton={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <InterestModal />
    </div>
  );
};

export default QuickJobsContractor;
