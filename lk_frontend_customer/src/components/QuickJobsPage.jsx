import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaPlus, FaUsers, FaComment, FaClock, FaMapMarkerAlt, FaDollarSign, FaCheck } from 'react-icons/fa';
import api from '../api';
import VoiceQueryComponent from './VoiceQueryComponent';
import './QuickJobsPage.css';

const QuickJobCard = ({ job, onExpressInterest, userRole }) => {
  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case 'URGENT': return 'urgency-urgent';
      case 'HIGH': return 'urgency-high';
      case 'MEDIUM': return 'urgency-medium';
      case 'LOW': return 'urgency-low';
      default: return 'urgency-default';
    }
  };

  return (
    <div className="job-card">
      <div className="job-header">
        <h3 className="job-title">{job.title}</h3>
        <span className={`urgency-badge ${getUrgencyClass(job.urgency)}`}>
          {job.urgency}
        </span>
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
      </div>

      <div className="job-footer">
        <div className="service-info">
          <span className="service-name">
            Service: {job.service_details?.name}
          </span>
        </div>
        
        {userRole === 'CONTRACTOR' && job.status === 'OPEN' && (
          <button
            onClick={() => onExpressInterest(job.id)}
            className="interest-button"
          >
            <FaComment />
            Express Interest
          </button>
        )}
      </div>

      {job.interests && job.interests.length > 0 && (
        <div className="job-interests">
          <p className="interests-count">{job.interests.length} contractor(s) interested</p>
        </div>
      )}
    </div>
  );
};

const TrustedContractorCard = ({ contractor }) => {
  return (
    <div className="contractor-card-simple">
      <div className="contractor-header">
        <div className="contractor-info">
          <h3 className="contractor-name">
            {contractor.contractor.user.first_name} {contractor.contractor.user.last_name}
          </h3>
          <p className="contractor-location">{contractor.contractor.city}, {contractor.contractor.state}</p>
        </div>
        <div className="trust-score-badge">
          Trust Score: {contractor.trust_score.toFixed(1)}
        </div>
      </div>
      
      <div className="contractor-stats">
        <span>Rating: {contractor.contractor.rating}/5</span>
        <span>Experience: {contractor.contractor.experience} years</span>
      </div>
      
      <div className="recommendations-info">
        <FaUsers className="recommendations-icon" />
        <span>
          {contractor.direct_recommendations} direct, {contractor.indirect_recommendations} indirect recommendations
        </span>
      </div>
      
      {contractor.connection_path && contractor.connection_path.length > 1 && (
        <div className="connection-path">
          Path: {contractor.connection_path.join(' → ')}
        </div>
      )}
    </div>
  );
};


const QuickJobsPage = () => {
  const location = useLocation();
  const [quickJobs, setQuickJobs] = useState([]);
  const [trustedContractors, setTrustedContractors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Get user role from localStorage (memoized to prevent unnecessary re-renders)
  const user = useMemo(() => JSON.parse(localStorage.getItem('user')) || {}, []);
  const userRole = user.role || 'CUSTOMER';
  
  // Ref to track if we've processed the voice-generated job data
  const processedJobDataRef = useRef(false);
  
  const [activeTab, setActiveTab] = useState(userRole === 'CUSTOMER' ? 'voice' : 'browse');
  
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    description: '',
    location: '',
    urgency: 'MEDIUM',
    budget_suggestion: '',
    service: ''
  });

  const [services, setServices] = useState([]);

  useEffect(() => {
    loadQuickJobs();
    loadTrustedContractors();
    loadServices();
  }, []);

  // Handle voice-generated job data from navigation
  useEffect(() => {
    if (location.state?.generatedJob && services.length > 0 && !processedJobDataRef.current) {
      const jobData = location.state.generatedJob;
      console.log('Received voice-generated job data:', jobData);
      
      // Improved service matching logic
      let matchingService = null;
      
      // First, try to match by service_id if provided
      if (jobData.service_id) {
        matchingService = services.find(service => service.id === jobData.service_id);
      }
      
      // If no service_id or not found, try to match by service_name
      if (!matchingService && jobData.service_name) {
        const serviceName = jobData.service_name.toLowerCase();
        
        // Try exact match first
        matchingService = services.find(service => 
          service.name.toLowerCase() === serviceName
        );
        
        // If not found, try partial match
        if (!matchingService) {
          matchingService = services.find(service => 
            service.name.toLowerCase().includes(serviceName) ||
            serviceName.includes(service.name.toLowerCase())
          );
        }
        
        // If still not found, try keyword matching
        if (!matchingService) {
          const keywords = serviceName.split(' ');
          matchingService = services.find(service => 
            keywords.some(keyword => 
              service.name.toLowerCase().includes(keyword) ||
              service.description?.toLowerCase().includes(keyword)
            )
          );
        }
      }
      
      // Default to first service if no match found
      const selectedService = matchingService || services[0];
      
      // Pre-fill the form with voice-generated data
      setNewJobForm({
        title: jobData.title || '',
        description: jobData.description || '',
        location: jobData.location || user.city + ', ' + user.state || '',
        urgency: jobData.urgency || 'MEDIUM',
        budget_suggestion: jobData.budget_suggestion || '',
        service: selectedService?.id || ''
      });
      
      // Switch to create tab to show the pre-filled form
      setActiveTab('create');
      
      // Mark as processed to prevent re-triggering
      processedJobDataRef.current = true;
      
      // Clear the location state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.generatedJob, services.length]);

  const loadServices = async () => {
    try {
      const response = await api.get('/api/services/');
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadQuickJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/trust-network/quick-jobs/');
      setQuickJobs(response.data);
    } catch (error) {
      console.error('Error loading quick jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrustedContractors = async () => {
    try {
      const response = await api.get('/api/trust-network/trusted-contractors/');
      setTrustedContractors(response.data);
    } catch (error) {
      console.error('Error loading trusted contractors:', error);
    }
  };

  const handleCreateQuickJob = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newJobForm.service) {
      alert('Please select a service category');
      return;
    }
    
    try {
      const jobData = {
        ...newJobForm,
        service: parseInt(newJobForm.service)
      };
      
      await api.post('/api/trust-network/quick-jobs/', jobData);
      setNewJobForm({
        title: '',
        description: '',
        location: '',
        urgency: 'MEDIUM',
        budget_suggestion: '',
        service: ''
      });
      setActiveTab('voice');
      loadQuickJobs();
    } catch (error) {
      console.error('Error creating quick job:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to create quick job. Please try again.';
      alert(errorMessage);
    }
  };

  const handleExpressInterest = async (jobId) => {
    try {
      await api.post('/api/trust-network/quick-job-interests/', {
        quick_job: jobId,
        message: 'I am interested in this job and can complete it promptly.',
        proposed_price: null
      });
      loadQuickJobs(); // Reload to show updated interest count
    } catch (error) {
      console.error('Error expressing interest:', error);
    }
  };

  const handleVoiceQuery = async () => {
    // This is now handled by VoiceQueryComponent
    setActiveTab('voice');
  };

  const handleJobDataGenerated = (jobData) => {
    // Pre-fill form with AI-generated data
    setNewJobForm({
      ...newJobForm,
      ...jobData
    });
    setActiveTab('create');
  };

  return (
    <div className="quick-jobs-container">
      <div className="quick-jobs-header">
        <h1 className="page-title">Quick Jobs & Trust Network</h1>
        <p className="page-subtitle">Find trusted contractors through your network or post urgent job needs</p>
        {userRole === 'CUSTOMER' && (
          <div className="header-actions">
            <Link to="/customer/my-quick-jobs" className="my-works-button">
              <FaUsers />
              View My Works
            </Link>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {userRole !== 'CUSTOMER' && (
          <button
            onClick={() => setActiveTab('browse')}
            className={`tab-button ${activeTab === 'browse' ? 'active' : ''}`}
          >
            Browse Jobs
          </button>
        )}
        {userRole === 'CUSTOMER' && (
          <>
            <button
              onClick={() => setActiveTab('voice')}
              className={`tab-button ${activeTab === 'voice' ? 'active' : ''}`}
            >
              🎤 Voice Assistant
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            >
              Post Quick Job
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab('trusted')}
          className={`tab-button ${activeTab === 'trusted' ? 'active' : ''}`}
        >
          Trusted Contractors
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'browse' && (
        <div className="jobs-grid">
          <div className="jobs-main">
            <div className="section-header">
              <h2 className="section-title">Available Quick Jobs</h2>
              {userRole === 'CUSTOMER' && (
                <button
                  onClick={handleVoiceQuery}
                  className="voice-assistant-button"
                >
                  <FaComment />
                  Try Voice Assistant
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : (
              <div className="jobs-list">
                {quickJobs.map(job => (
                  <QuickJobCard 
                    key={job.id} 
                    job={job} 
                    onExpressInterest={handleExpressInterest}
                    userRole={userRole}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="jobs-sidebar">
            <h3 className="sidebar-title">Quick Stats</h3>
            <div className="stats-card">
              <div className="stat-item">
                <span className="stat-label">Open Jobs</span>
                <span className="stat-value">{quickJobs.filter(j => j.status === 'OPEN').length}</span>
              </div>
              <div className="stat-item urgent">
                <span className="stat-label">Urgent Jobs</span>
                <span className="stat-value">
                  {quickJobs.filter(j => j.urgency === 'URGENT' || j.urgency === 'HIGH').length}
                </span>
              </div>
              <div className="stat-item trusted">
                <span className="stat-label">Trusted Contractors</span>
                <span className="stat-value">{trustedContractors.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'voice' && userRole === 'CUSTOMER' && (
        <VoiceQueryComponent 
          onJobDataGenerated={handleJobDataGenerated}
          services={services}
        />
      )}

      {activeTab === 'create' && userRole === 'CUSTOMER' && (
        <div className="create-job-section">
          <div className="job-form-container">
            <h2 className="form-title">Post a Quick Job</h2>
            <form onSubmit={handleCreateQuickJob} className="job-form">
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  value={newJobForm.title}
                  onChange={(e) => setNewJobForm({...newJobForm, title: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={newJobForm.description}
                  onChange={(e) => setNewJobForm({...newJobForm, description: e.target.value})}
                  rows="3"
                  className="form-textarea"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    value={newJobForm.location}
                    onChange={(e) => setNewJobForm({...newJobForm, location: e.target.value})}
                    className="form-input"
                    placeholder="Enter your complete address"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Service Category</label>
                  <select
                    value={newJobForm.service}
                    onChange={(e) => setNewJobForm({...newJobForm, service: parseInt(e.target.value)})}
                    className="form-select"
                    required
                  >
                    <option value="">Select a service</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Urgency</label>
                  <select
                    value={newJobForm.urgency}
                    onChange={(e) => setNewJobForm({...newJobForm, urgency: e.target.value})}
                    className="form-select"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Budget Suggestion (₹)</label>
                  <input
                    type="number"
                    value={newJobForm.budget_suggestion}
                    onChange={(e) => setNewJobForm({...newJobForm, budget_suggestion: e.target.value})}
                    className="form-input"
                    placeholder="Optional budget estimate"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="submit-button"
              >
                <FaPlus />
                Post Quick Job
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'trusted' && (
        <div className="trusted-section">
          <h2 className="section-title">Trusted Contractors in Your Network</h2>
          <div className="contractors-grid">
            {trustedContractors.map((contractor, index) => (
              <TrustedContractorCard key={index} contractor={contractor} />
            ))}
          </div>
          {trustedContractors.length === 0 && (
            <div className="empty-state">
              No trusted contractors in your network yet. Start by recommending contractors you've worked with!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuickJobsPage;
