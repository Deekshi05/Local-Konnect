import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTenderById, getTenderMilestones } from '../../api/tenders';
import Loading from '../../components/common/Loading';
import './WorkProgress.css';

const WorkProgress = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tender, setTender] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTenderProgress();
    }, [id]);

    const fetchTenderProgress = async () => {
        try {
            setLoading(true);
            const [tenderData, milestonesData] = await Promise.all([
                getTenderById(id),
                getTenderMilestones(id)
            ]);
            setTender(tenderData);
            setMilestones(milestonesData || []);
        } catch (err) {
            setError('Failed to fetch tender progress');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const calculateProgress = () => {
        if (milestones.length === 0) return 0;
        const completedMilestones = milestones.filter(m => m.status === 'completed').length;
        return Math.round((completedMilestones / milestones.length) * 100);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return 'fas fa-check-circle';
            case 'in_progress':
                return 'fas fa-clock';
            case 'pending':
                return 'far fa-clock';
            default:
                return 'far fa-circle';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return '#10b981';
            case 'in_progress':
                return '#f59e0b';
            case 'pending':
                return '#6b7280';
            default:
                return '#6b7280';
        }
    };

    if (loading) {
        return <Loading message="Loading work progress..." size="large" />;
    }

    if (error) {
        return (
            <div className="work-progress-container">
                <div className="error-container">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button onClick={() => navigate('/customer/tenders')} className="back-button">
                        Back to Tenders
                    </button>
                </div>
            </div>
        );
    }

    if (!tender) {
        return (
            <div className="work-progress-container">
                <div className="error-container">
                    <i className="fas fa-search"></i>
                    <h3>Tender Not Found</h3>
                    <button onClick={() => navigate('/customer/tenders')} className="back-button">
                        Back to Tenders
                    </button>
                </div>
            </div>
        );
    }

    const progress = calculateProgress();

    return (
        <div className="work-progress-container">
            <div className="progress-header">
                <div className="header-content">
                    <h1>Work Progress</h1>
                    <p className="header-subtitle">
                        Track the progress of "{tender.title}"
                    </p>
                </div>
                <button 
                    onClick={() => navigate('/customer/tenders')} 
                    className="back-button"
                >
                    <i className="fas fa-arrow-left"></i>
                    Back to Tenders
                </button>
            </div>

            <div className="tender-overview">
                <div className="overview-content">
                    <div className="overview-main">
                        <h3>{tender.title}</h3>
                        <div className="tender-meta">
                            <div className="meta-item">
                                <span className="label">Contractor:</span>
                                <span className="value">
                                    {tender.selected_contractor?.company_name || 'N/A'}
                                </span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Started:</span>
                                <span className="value">
                                    {tender.start_date ? formatDate(tender.start_date) : 'N/A'}
                                </span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Due Date:</span>
                                <span className="value">
                                    {tender.due_date ? formatDate(tender.due_date) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="overview-progress">
                        <div className="progress-circle">
                            <div className="progress-circle-inner">
                                <span className="progress-percentage">{progress}%</span>
                                <span className="progress-label">Complete</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="progress-sections">
                <div className="section-header">
                    <h2>Project Milestones</h2>
                    <div className="milestones-summary">
                        <span className="milestone-count">
                            {milestones.filter(m => m.status === 'completed').length} of {milestones.length} completed
                        </span>
                    </div>
                </div>

                {milestones.length === 0 ? (
                    <div className="no-milestones">
                        <i className="fas fa-tasks"></i>
                        <h3>No Milestones Set</h3>
                        <p>The contractor hasn't set up project milestones yet.</p>
                    </div>
                ) : (
                    <div className="milestones-timeline">
                        {milestones.map((milestone, index) => (
                            <div key={milestone.id} className="milestone-item">
                                <div className="milestone-marker">
                                    <i 
                                        className={getStatusIcon(milestone.status)} 
                                        style={{ color: getStatusColor(milestone.status) }}
                                    ></i>
                                </div>
                                <div className="milestone-content">
                                    <div className="milestone-header">
                                        <h4>{milestone.title}</h4>
                                        <span className={`milestone-status ${milestone.status}`}>
                                            {milestone.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {milestone.description && (
                                        <p className="milestone-description">
                                            {milestone.description}
                                        </p>
                                    )}
                                    <div className="milestone-details">
                                        {milestone.target_date && (
                                            <div className="milestone-date">
                                                <i className="fas fa-calendar"></i>
                                                <span>Target: {formatDate(milestone.target_date)}</span>
                                            </div>
                                        )}
                                        {milestone.completion_date && (
                                            <div className="milestone-date completed">
                                                <i className="fas fa-check"></i>
                                                <span>Completed: {formatDate(milestone.completion_date)}</span>
                                            </div>
                                        )}
                                        {milestone.amount && (
                                            <div className="milestone-amount">
                                                <i className="fas fa-rupee-sign"></i>
                                                <span>{formatCurrency(milestone.amount)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {index < milestones.length - 1 && (
                                    <div className="milestone-connector"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="progress-actions">
                <h3>Need Help?</h3>
                <div className="action-buttons">
                    <button className="action-button secondary">
                        <i className="fas fa-comments"></i>
                        Contact Contractor
                    </button>
                    <button className="action-button secondary">
                        <i className="fas fa-phone"></i>
                        Call Support
                    </button>
                    <button className="action-button primary">
                        <i className="fas fa-file-alt"></i>
                        View Contract Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkProgress;
