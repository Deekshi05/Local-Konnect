import React, { useState, useEffect } from 'react';
import { FaStar, FaUsers, FaComment, FaPlus, FaCheck, FaHistory, FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaClock, FaPhone } from 'react-icons/fa';
import api from '../api';
import './TrustRecommendationPage.css';

const TrustRecommendationPage = () => {
  const [workedContractors, setWorkedContractors] = useState([]);
  const [services, setServices] = useState([]);
  const [myRecommendations, setMyRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRecommendForm, setShowRecommendForm] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [expandedContractor, setExpandedContractor] = useState(null);
  const [recommendationForm, setRecommendationForm] = useState({
    trust_level: 5,
    comment: '',
    service_context: ''
  });

  useEffect(() => {
    loadWorkedContractors();
    loadServices();
    loadMyRecommendations();
  }, []);

  const loadWorkedContractors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/trust-network/customer-worked-contractors/');
      console.log('Worked contractors response:', response.data);
      setWorkedContractors(response.data.worked_contractors || []);
    } catch (error) {
      console.error('Error loading worked contractors:', error);
      setWorkedContractors([]);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const response = await api.get('/api/services/');
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadMyRecommendations = async () => {
    try {
      const response = await api.get('/api/trust-network/trust-connections/');
      console.log('My recommendations response:', response.data);
      setMyRecommendations(response.data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleRecommend = (contractor, workItem = null) => {
    console.log('Opening recommendation form for contractor:', contractor);
    console.log('Based on work:', workItem);
    
    setSelectedContractor(contractor);
    setSelectedWork(workItem);
    setShowRecommendForm(true);
    
    // Pre-fill service context if recommending based on specific work
    if (workItem) {
      // Find the service ID from the services list based on work item service name
      const matchingService = services.find(service => 
        service.name.toLowerCase() === workItem.service.toLowerCase()
      );
      
      setRecommendationForm(prev => ({
        ...prev,
        service_context: matchingService ? matchingService.id : null,
        comment: `Based on ${workItem.type === 'tender' ? 'Tender' : 'Quick Job'}: ${workItem.title} (${workItem.service})`
      }));
    } else {
      setRecommendationForm({
        trust_level: 5,
        comment: '',
        service_context: null
      });
    }
  };

  const submitRecommendation = async (e) => {
    e.preventDefault();
    
    if (isAlreadyRecommended(selectedContractor.id)) {
      alert('You have already recommended this contractor');
      setShowRecommendForm(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare payload with proper service_context handling
      const payload = {
        contractor: selectedContractor.id,
        trust_level: recommendationForm.trust_level,
        comment: recommendationForm.comment
      };
      
      // Only include service_context if it's a valid service ID (number)
      if (recommendationForm.service_context && typeof recommendationForm.service_context === 'number') {
        payload.service_context = recommendationForm.service_context;
      }
      
      console.log('Submitting recommendation with payload:', payload);
      
      await api.post('/api/trust-network/trust-connections/', payload);
      
      setShowRecommendForm(false);
      setSelectedContractor(null);
      setSelectedWork(null);
      setRecommendationForm({
        trust_level: 5,
        comment: '',
        service_context: ''
      });
      
      loadMyRecommendations();
      alert('Recommendation submitted successfully!');
    } catch (error) {
      console.error('Error submitting recommendation:', error);
      alert('Failed to submit recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAlreadyRecommended = (contractorId) => {
    return myRecommendations.some(rec => rec.contractor === contractorId);
  };

  const getTrustLevelText = (level) => {
    if (level >= 8) return 'Highly Trusted';
    if (level >= 6) return 'Trusted';
    if (level >= 4) return 'Moderately Trusted';
    return 'Limited Trust';
  };

  const toggleContractorExpansion = (contractorId) => {
    setExpandedContractor(expandedContractor === contractorId ? null : contractorId);
  };

  if (loading && workedContractors.length === 0) {
    return (
      <div className="trust-recommendation-container">
        <div className="loading-state">
          <h2>Loading your work history...</h2>
          <p>Finding contractors you've completed projects with</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trust-recommendation-container">
      <div className="trust-header">
        <h1 className="trust-title">Trust & Recommendations</h1>
        <p className="trust-subtitle">
          Recommend contractors based on your completed work experiences
        </p>
      </div>

      <div className="trust-content">
        {/* Worked Contractors Section */}
        <div className="worked-contractors-section">
          <div className="section-header">
            <h2 className="section-title">
              <FaBriefcase />
              Contractors You've Worked With
            </h2>
            <span className="contractors-count">
              {workedContractors.length} contractor{workedContractors.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {workedContractors.length === 0 ? (
            <div className="empty-state">
              <h3>No Completed Work Found</h3>
              <p>You haven't completed any projects yet. Once you finish work with contractors, you'll be able to recommend them here based on your experience.</p>
            </div>
          ) : (
            <div className="contractors-list">
              {workedContractors.map(contractor => (
                <div key={contractor.id} className="worked-contractor-card">
                  <div className="contractor-header" onClick={() => toggleContractorExpansion(contractor.id)}>
                    <div className="contractor-info">
                      <h3 className="contractor-name">
                        {contractor.user.first_name} {contractor.user.last_name}
                      </h3>
                      <p className="contractor-location">
                        <FaMapMarkerAlt /> {contractor.city}, {contractor.state}
                      </p>
                      {contractor.user.phone_number && (
                        <p className="contractor-phone">
                          <FaPhone /> {contractor.user.phone_number}
                        </p>
                      )}
                      
                      <div className="contractor-stats">
                        <div className="stat-item">
                          <FaStar className="rating-star" />
                          <span>{contractor.rating}/5</span>
                        </div>
                        <span className="stat-item">
                          {contractor.experience} years experience
                        </span>
                        {contractor.trust_score && (
                          <span className={`stat-item trust-score trust-level-${Math.round(contractor.trust_score)}`}>
                            Trust: {contractor.trust_score.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="work-summary">
                      <div className="work-count">
                        <span className="count-number">{contractor.work_history.total_tenders + contractor.work_history.total_quick_jobs}</span>
                        <span className="count-label">Completed Projects</span>
                      </div>
                      
                      <div className="action-area">
                        {isAlreadyRecommended(contractor.id) ? (
                          <div className="recommended-badge">
                            <FaCheck />
                            <span>Recommended</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRecommend(contractor);
                            }}
                            className="recommend-button"
                          >
                            <FaPlus />
                            Recommend
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Recommendations Sidebar */}
        <div className="recommendations-sidebar">
          <div className="sidebar-title">
            My Recommendations 
            <span className="recommendations-count">
              {myRecommendations.length}
            </span>
          </div>
          
          <div className="recommendations-list">
            {myRecommendations.length === 0 ? (
              <p className="no-recommendations">
                No recommendations yet. Start by recommending contractors you've worked with.
              </p>
            ) : (
              myRecommendations.map(recommendation => (
                <div key={recommendation.id} className="recommendation-item">
                  <div className="recommendation-header">
                    <h4 className="recommendation-name">
                      {recommendation.contractor_details?.user?.first_name} {recommendation.contractor_details?.user?.last_name}
                    </h4>
                    {recommendation.contractor_details?.user?.phone_number && (
                      <p className="recommendation-phone">
                        <FaPhone /> {recommendation.contractor_details.user.phone_number}
                      </p>
                    )}
                    <span className={`trust-level-badge level-${recommendation.trust_level}`}>
                      {getTrustLevelText(recommendation.trust_level)}
                    </span>
                  </div>
                  
                  {recommendation.service_details && (
                    <p className="recommendation-context">
                      <strong>Service:</strong> {recommendation.service_details.name}
                    </p>
                  )}
                  
                  {recommendation.comment && (
                    <p className="recommendation-comment">
                      "{recommendation.comment}"
                    </p>
                  )}
                  
                  <p className="recommendation-date">
                    Recommended on {new Date(recommendation.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recommendation Form Modal */}
      {showRecommendForm && selectedContractor && (
        <div className="recommendation-modal">
          <div className="modal-content">
            <form onSubmit={submitRecommendation} className="recommendation-form">
              <div className="form-header">
                <h3>Recommend {selectedContractor.user.first_name} {selectedContractor.user.last_name}</h3>
                {selectedWork && (
                  <p className="form-context">
                    Based on: {selectedWork.title} ({selectedWork.service})
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Trust Level (1-10)
                </label>
                <div className="trust-level-selector">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={recommendationForm.trust_level}
                    onChange={(e) => setRecommendationForm({
                      ...recommendationForm, 
                      trust_level: parseInt(e.target.value)
                    })}
                    className="trust-slider"
                  />
                  <div className="trust-display">
                    <span className="trust-number">{recommendationForm.trust_level}</span>
                    <span className="trust-text">{getTrustLevelText(recommendationForm.trust_level)}</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Service Context (Optional)
                </label>
                <select
                  value={recommendationForm.service_context || ''}
                  onChange={(e) => setRecommendationForm({
                    ...recommendationForm, 
                    service_context: e.target.value ? parseInt(e.target.value) : null
                  })}
                  className="form-input"
                >
                  <option value="">Select a service (optional)</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
                {selectedWork && (
                  <p className="form-help-text">
                    Recommended service: {selectedWork.service}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Comment (Optional)
                </label>
                <textarea
                  value={recommendationForm.comment}
                  onChange={(e) => setRecommendationForm({
                    ...recommendationForm, 
                    comment: e.target.value
                  })}
                  rows="3"
                  placeholder="Share your experience working with this contractor..."
                  className="form-textarea"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowRecommendForm(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    <>
                      <FaComment />
                      Submit Recommendation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustRecommendationPage;
