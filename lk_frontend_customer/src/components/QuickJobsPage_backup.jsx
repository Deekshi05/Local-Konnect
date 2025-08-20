import React, { useState, useEffect } from 'react';
import { FaPlus, FaUsers, FaComment, FaClock, FaMapMarkerAlt, FaDollarSign } from 'react-icons/fa';
import api from '../api';
import VoiceQueryComponent from './VoiceQueryComponent';
import './QuickJobsPage.css';

const QuickJobCard = ({ job, onExpressInterest, userRole }) => {
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
          {job.urgency}
        </span>
      </div>
      
      <p className="text-gray-600 mb-3">{job.description}</p>
      
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <FaMapMarkerAlt size={16} />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <FaClock size={16} />
          <span>{new Date(job.created_at).toLocaleDateString()}</span>
        </div>
        {job.budget_suggestion && (
          <div className="flex items-center gap-1">
            <FaDollarSign size={16} />
            <span>₹{job.budget_suggestion}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Service: {job.service_details?.name}
          </span>
        </div>
        
        {userRole === 'CONTRACTOR' && job.status === 'OPEN' && (
          <button
            onClick={() => onExpressInterest(job.id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaComment size={16} />
            Express Interest
          </button>
        )}
      </div>

      {job.interests && job.interests.length > 0 && (
        <div className="mt-4 pt-3 border-t">
          <p className="text-sm text-gray-600 mb-2">{job.interests.length} contractor(s) interested</p>
        </div>
      )}
    </div>
  );
};

const TrustedContractorCard = ({ contractor }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-green-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            {contractor.contractor.user.first_name} {contractor.contractor.user.last_name}
          </h3>
          <p className="text-sm text-gray-600">{contractor.contractor.city}, {contractor.contractor.state}</p>
        </div>
        <div className="text-right">
          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            Trust Score: {contractor.trust_score.toFixed(1)}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        <span>Rating: {contractor.contractor.rating}/5</span>
        <span>Experience: {contractor.contractor.experience} years</span>
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        <FaUsers size={16} className="text-blue-500" />
        <span className="text-gray-600">
          {contractor.direct_recommendations} direct, {contractor.indirect_recommendations} indirect recommendations
        </span>
      </div>
      
      {contractor.connection_path && contractor.connection_path.length > 1 && (
        <div className="mt-2 text-xs text-gray-500">
          Path: {contractor.connection_path.join(' → ')}
        </div>
      )}
    </div>
  );
};

const QuickJobsPage = () => {
  const [quickJobs, setQuickJobs] = useState([]);
  const [trustedContractors, setTrustedContractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  
  // Get user role from localStorage (matches existing pattern in CustomerLayout)
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userRole = user.role || 'CUSTOMER';
  
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    description: '',
    location: '',
    urgency: 'MEDIUM',
    budget_suggestion: '',
    service: 1
  });

  const [services, setServices] = useState([]);

  useEffect(() => {
    loadQuickJobs();
    loadTrustedContractors();
    loadServices();
  }, []);

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
    try {
      await api.post('/api/trust-network/quick-jobs/', newJobForm);
      setNewJobForm({
        title: '',
        description: '',
        location: '',
        urgency: 'MEDIUM',
        budget_suggestion: '',
        service: 1
      });
      setActiveTab('browse');
      loadQuickJobs();
    } catch (error) {
      console.error('Error creating quick job:', error);
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
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          onClick={() => setActiveTab('browse')}
          className={`tab-button ${activeTab === 'browse' ? 'active' : ''}`}
        >
          Browse Jobs
        </button>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Available Quick Jobs</h2>
                {userRole === 'CUSTOMER' && (
                  <button
                    onClick={handleVoiceQuery}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <FaComment size={16} />
                    Try Voice Assistant
                  </button>
                )}
              </div>
              
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div>
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
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Open Jobs</span>
                  <span className="font-semibold">{quickJobs.filter(j => j.status === 'OPEN').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Urgent Jobs</span>
                  <span className="font-semibold text-red-600">
                    {quickJobs.filter(j => j.urgency === 'URGENT' || j.urgency === 'HIGH').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trusted Contractors</span>
                  <span className="font-semibold text-green-600">{trustedContractors.length}</span>
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
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Post a Quick Job</h2>
              <form onSubmit={handleCreateQuickJob} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={newJobForm.title}
                    onChange={(e) => setNewJobForm({...newJobForm, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newJobForm.description}
                    onChange={(e) => setNewJobForm({...newJobForm, description: e.target.value})}
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={newJobForm.location}
                      onChange={(e) => setNewJobForm({...newJobForm, location: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                    <select
                      value={newJobForm.urgency}
                      onChange={(e) => setNewJobForm({...newJobForm, urgency: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Suggestion (₹)</label>
                  <input
                    type="number"
                    value={newJobForm.budget_suggestion}
                    onChange={(e) => setNewJobForm({...newJobForm, budget_suggestion: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaPlus size={16} />
                  Post Quick Job
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'trusted' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Trusted Contractors in Your Network</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trustedContractors.map((contractor, index) => (
                <TrustedContractorCard key={index} contractor={contractor} />
              ))}
            </div>
            {trustedContractors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No trusted contractors in your network yet. Start by recommending contractors you've worked with!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickJobsPage;
