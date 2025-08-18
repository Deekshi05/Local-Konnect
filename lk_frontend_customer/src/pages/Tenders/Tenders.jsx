import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tendersApi } from '../../api/tenders';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';
import './Tenders.css';

const Tenders = () => {
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        loadTenders();
    }, []);

    const loadTenders = async () => {
        try {
            const response = await tendersApi.getUserTenders();
            setTenders(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error loading tenders:', error);
            toast.error(error.response?.data?.message || 'Failed to load tenders');
            setTenders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkComplete = async (tenderId, tenderTitle) => {
        const confirmMessage = `Are you sure you want to mark "${tenderTitle}" as complete?\n\n` +
            `⚠️ WARNING: This action cannot be undone!`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            await tendersApi.markTenderComplete(tenderId);
            toast.success('Tender marked as complete successfully!');
            loadTenders(); // Reload the list
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to mark tender as complete';
            toast.error(errorMessage);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'draft': 'gray',
            'published': 'blue',
            'bidding': 'orange',
            'contractor_selection': 'purple',
            'in_progress': 'green',
            'completed': 'emerald',
            'cancelled': 'red'
        };
        return colors[status] || 'gray';
    };

    const getStatusText = (status) => {
        const statusTexts = {
            'draft': 'Draft',
            'published': 'Open for Bids',
            'bidding': 'Receiving Bids',
            'contractor_selection': 'Select Contractor',
            'in_progress': 'Work in Progress',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusTexts[status] || status;
    };

    const getTenderPhase = (tender) => {
        if (tender.status === 'published' && tender.bid_count > 0) {
            return 'bidding';
        }
        if (tender.status === 'published' && tender.bid_count === 0) {
            return 'published';
        }
        if (tender.status === 'bidding' && !tender.selected_contractor) {
            return 'contractor_selection';
        }
        return tender.status;
    };

    const filteredTenders = tenders.filter(tender => {
        const phase = getTenderPhase(tender);
        switch (activeTab) {
            case 'active':
                return ['published', 'bidding', 'contractor_selection', 'in_progress'].includes(phase);
            case 'bidding':
                return ['published', 'bidding', 'contractor_selection'].includes(phase);
            case 'in_progress':
                return phase === 'in_progress';
            case 'completed':
                return ['completed', 'cancelled'].includes(phase);
            default:
                return true;
        }
    });

    if (loading) {
        return <Loading message="Loading your tenders..." size="large" />;
    }

    return (
        <div className="tenders-container">
            <div className="tenders-header">
                <div className="header-content">
                    <h1>My Tenders</h1>
                    <p className="header-subtitle">Manage and track your project requests</p>
                </div>
                <Link to="/customer/tenders/create" className="action-button primary">
                    <i className="fas fa-plus"></i> Create New Tender
                </Link>
            </div>

            <div className="tenders-stats">
                <div className="stat-card">
                    <div className="stat-number">{tenders.filter(t => getTenderPhase(t) === 'published').length}</div>
                    <div className="stat-label">Open for Bids</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{tenders.filter(t => getTenderPhase(t) === 'bidding').length}</div>
                    <div className="stat-label">Receiving Bids</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{tenders.filter(t => getTenderPhase(t) === 'in_progress').length}</div>
                    <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{tenders.filter(t => getTenderPhase(t) === 'completed').length}</div>
                    <div className="stat-label">Completed</div>
                </div>
            </div>

            <div className="tenders-tabs">
                <button
                    className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Tenders ({tenders.length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active ({tenders.filter(t => ['published', 'bidding', 'contractor_selection', 'in_progress'].includes(getTenderPhase(t))).length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'bidding' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bidding')}
                >
                    Bidding ({tenders.filter(t => ['published', 'bidding', 'contractor_selection'].includes(getTenderPhase(t))).length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'in_progress' ? 'active' : ''}`}
                    onClick={() => setActiveTab('in_progress')}
                >
                    In Progress ({tenders.filter(t => getTenderPhase(t) === 'in_progress').length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Completed ({tenders.filter(t => ['completed', 'cancelled'].includes(getTenderPhase(t))).length})
                </button>
            </div>

            <div className="tenders-grid">
                {filteredTenders.map(tender => {
                    const phase = getTenderPhase(tender);
                    return (
                        <div key={tender.id} className="tender-card">
                            <div className="tender-card-header">
                                <div className={`status-badge ${getStatusColor(phase)}`}>
                                    {getStatusText(phase)}
                                </div>
                                <div className="tender-actions">
                                    <Link 
                                        to={`/customer/tenders/${tender.id}`} 
                                        className="action-link"
                                        title="View Details"
                                    >
                                        <i className="fas fa-eye"></i>
                                        <span>View</span>
                                    </Link>
                                    {phase === 'contractor_selection' && (
                                        <Link 
                                            to={`/customer/tenders/${tender.id}/select-contractor`} 
                                            className="action-link select"
                                            title="Select Contractor"
                                        >
                                            <i className="fas fa-user-check"></i>
                                            <span>Select</span>
                                        </Link>
                                    )}
                                    {phase === 'in_progress' && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleMarkComplete(tender.id, tender.title || tender.service?.name || 'Untitled Tender');
                                            }}
                                            className="action-link complete"
                                            title="Mark as Complete"
                                        >
                                            <i className="fas fa-check-circle"></i>
                                            <span>Complete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <h3 className="tender-title">{tender.title || tender.service?.name || 'Untitled Tender'}</h3>
                            
                            <div className="tender-info">
                                <div className="info-row">
                                    <span className="label">Service:</span>
                                    <span className="value">{tender.service?.name || 'Not specified'}</span>
                                </div>
                                {tender.supervisor?.user && (
                                    <div className="info-row">
                                        <span className="label">Supervisor:</span>
                                        <span className="value">{tender.supervisor.user.first_name} {tender.supervisor.user.last_name}</span>
                                    </div>
                                )}
                                {tender.selected_contractor?.user && (
                                    <div className="info-row">
                                        <span className="label">Contractor:</span>
                                        <span className="value">
                                            {tender.selected_contractor.user.first_name} {tender.selected_contractor.user.last_name}
                                        </span>
                                    </div>
                                )}
                                {tender.budget && (
                                    <div className="info-row">
                                        <span className="label">Budget:</span>
                                        <span className="value">${parseFloat(tender.budget).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="tender-dates">
                                {tender.start_date && (
                                    <div className="date-info">
                                        <span className="label">Start:</span>
                                        <span className="value">{new Date(tender.start_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {tender.end_date && (
                                    <div className="date-info">
                                        <span className="label">End:</span>
                                        <span className="value">{new Date(tender.end_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Bidding Phase Info */}
                            {phase === 'published' && (
                                <div className="tender-phase-info waiting">
                                    <i className="fas fa-clock"></i>
                                    <span>Waiting for bids...</span>
                                </div>
                            )}

                            {phase === 'bidding' && (
                                <div className="tender-phase-info bidding">
                                    <i className="fas fa-gavel"></i>
                                    <span>{tender.bid_count || 0} bid{(tender.bid_count || 0) !== 1 ? 's' : ''} received</span>
                                    <Link 
                                        to={`/customer/tenders/${tender.id}/bids`}
                                        className="view-bids-link"
                                    >
                                        View Bids
                                    </Link>
                                </div>
                            )}

                            {phase === 'contractor_selection' && (
                                <div className="tender-phase-info selection">
                                    <i className="fas fa-user-check"></i>
                                    <span>Ready to select contractor</span>
                                    <Link 
                                        to={`/customer/tenders/${tender.id}/select-contractor`}
                                        className="select-contractor-link"
                                    >
                                        Select Now
                                    </Link>
                                </div>
                            )}

                            {phase === 'in_progress' && (
                                <div className="tender-phase-info progress">
                                    <div className="progress-header">
                                        <i className="fas fa-tools"></i>
                                        <span>Work in Progress</span>
                                        <Link 
                                            to={`/customer/tenders/${tender.id}/progress`}
                                            className="view-bids-link"
                                        >
                                            View Progress
                                        </Link>
                                    </div>
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill" 
                                            style={{width: `${tender.progress?.percent_complete || 0}%`}}
                                        />
                                        <span className="progress-text">
                                            {tender.progress?.percent_complete || 0}% Complete
                                        </span>
                                    </div>
                                </div>
                            )}

                            {phase === 'completed' && (
                                <div className="tender-phase-info completed">
                                    <i className="fas fa-check-circle"></i>
                                    <span>Project completed successfully</span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredTenders.length === 0 && (
                    <div className="no-tenders">
                        <div className="no-tenders-icon">
                            <i className="fas fa-clipboard-list"></i>
                        </div>
                        <h3>No {activeTab === 'all' ? '' : activeTab} tenders found</h3>
                        <p>
                            {activeTab === 'active' || activeTab === 'all' 
                                ? "Start by creating your first tender or book a consultation with a supervisor to get expert guidance!"
                                : `You don't have any ${activeTab} tenders at the moment.`
                            }
                        </p>
                        {(activeTab === 'active' || activeTab === 'all') && (
                            <div className="no-tenders-actions">
                                <Link to="/customer/tenders/create" className="action-button">
                                    <i className="fas fa-plus"></i> Create Tender
                                </Link>
                                <Link to="/customer/consultation" className="action-button secondary">
                                    <i className="fas fa-user-tie"></i> Book Consultation
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tenders;
