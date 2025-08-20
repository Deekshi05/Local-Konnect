import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tendersApi } from '../../api/tenders';
import { toast } from 'react-toastify';
import { getUserAvatarUrl } from '../../utils/imageUtils';
import Loading from '../../components/common/Loading';
import './TenderDetail.css';

const TenderDetail = () => {
    const { tenderId } = useParams();
    const navigate = useNavigate();
    const [tender, setTender] = useState(null);
    const [bids, setBids] = useState([]);
    const [contractorBids, setContractorBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [milestones, setMilestones] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);

    useEffect(() => {
        loadTenderDetails();
    }, [tenderId]);

    const loadTenderDetails = async () => {
        try {
            setLoading(true);
            const [tenderRes, bidsRes, contractorBidsRes] = await Promise.all([
                tendersApi.getTenderById(tenderId),
                tendersApi.getTenderBids(tenderId).catch(() => ({ data: [] })),
                tendersApi.getTenderBidSummary(tenderId).catch(() => ({ data: [] }))
            ]);

            setTender(tenderRes.data);
            setBids(bidsRes.data || []);
            setContractorBids(contractorBidsRes.data || []);
            
            // Load milestones and audit logs if available
            try {
                const [milestonesRes, logsRes] = await Promise.all([
                    tendersApi.getTenderMilestones(tenderId).catch(() => ({ data: [] })),
                    tendersApi.getTenderAuditLogs(tenderId).catch(() => ({ data: [] }))
                ]);
                setMilestones(milestonesRes.data || []);
                setAuditLogs(logsRes.data || []);
            } catch (error) {
                console.warn('Failed to load milestones or audit logs:', error);
            }
        } catch (error) {
            console.error('Failed to load tender details:', error);
            toast.error('Failed to load tender details');
            navigate('/customer/tenders');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectContractor = async (contractorId) => {
        if (!window.confirm('Are you sure you want to select this contractor? This action cannot be undone.')) {
            return;
        }

        setSelecting(true);
        try {
            await tendersApi.selectContractor(tenderId, contractorId);
            toast.success('Contractor selected successfully!');
            loadTenderDetails(); // Reload to get updated status
        } catch (error) {
            toast.error('Failed to select contractor');
        } finally {
            setSelecting(false);
        }
    };

    const handleMarkComplete = async () => {
        const confirmMessage = `Are you sure you want to mark this tender as complete?\n\n` +
            `⚠️ WARNING: This action cannot be undone!\n\n` +
            `By marking this tender as complete, you confirm that:\n` +
            `• All work has been satisfactorily completed\n` +
            `• You have inspected and approved the work\n` +
            `• Any final payments to the contractor have been processed\n\n` +
            `Click OK to proceed or Cancel to go back.`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        setSelecting(true);
        try {
            await tendersApi.markTenderComplete(tenderId);
            toast.success('Tender marked as complete successfully!');
            loadTenderDetails(); // Reload to get updated status
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to mark tender as complete';
            toast.error(errorMessage);
        } finally {
            setSelecting(false);
        }
    };

    if (loading) {
        return <Loading message="Loading tender details..." size="large" />;
    }

    return (
        <div className="tender-detail-container">
            <div className="tender-header">
                <div className="header-top">
                    <button 
                        onClick={() => navigate('/customer/tenders')} 
                        className="back-button"
                    >
                        ← Back to Tenders
                    </button>
                </div>
                <div className="header-main">
                    <h1>{tender.title || tender.service.name}</h1>
                    <div className={`status-badge ${tender.status}`}>
                        {tender.status}
                    </div>
                </div>
            </div>

            <div className="tender-tabs">
                <button
                    className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab-button ${activeTab === 'bids' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bids')}
                >
                    Contractor Bids
                </button>
                <button
                    className={`tab-button ${activeTab === 'milestones' ? 'active' : ''}`}
                    onClick={() => setActiveTab('milestones')}
                >
                    Milestones
                </button>
                <button
                    className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
            </div>

            <div className="tender-content">
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Service</label>
                                <p>{tender.service.name}</p>
                            </div>
                            <div className="info-item">
                                <label>Supervisor</label>
                                <p>{tender.supervisor.user.first_name} {tender.supervisor.user.last_name}</p>
                            </div>
                            <div className="info-item">
                                <label>Location</label>
                                <p>{tender.location}</p>
                            </div>
                            <div className="info-item">
                                <label>Initial Budget</label>
                                <p>${tender.budget}</p>
                            </div>
                            {tender.selected_contractor && contractorBids.length > 0 && (
                                <div className="info-item">
                                    <label>Final Contract Cost</label>
                                    <p className="final-cost">
                                        ${contractorBids.find(cb => cb.contractor_id === tender.selected_contractor.id)?.total_bid || 'N/A'}
                                    </p>
                                </div>
                            )}
                            <div className="info-item">
                                <label>Start Date</label>
                                <p>{new Date(tender.start_date).toLocaleDateString()}</p>
                            </div>
                            <div className="info-item">
                                <label>End Date</label>
                                <p>{new Date(tender.end_date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {tender.description && (
                            <div className="description-section">
                                <h3>Description</h3>
                                <p>{tender.description}</p>
                            </div>
                        )}

                        <div className="requirements-section">
                            <div className="requirements-header">
                                <h3>Requirements ({tender.tender_requirements.length} items)</h3>
                                <div className="requirements-summary">
                                    <span className="critical-count">
                                        {tender.tender_requirements.filter(req => req.is_critical).length} Critical
                                    </span>
                                </div>
                            </div>
                            <div className="requirements-grid">
                                {tender.tender_requirements.map(req => (
                                    <div key={req.id} className={`requirement-card ${req.is_critical ? 'critical' : ''}`}>
                                        <div className="requirement-header">
                                            <h4>{req.requirement.name}</h4>
                                            {req.is_critical && (
                                                <span className="critical-badge">⚠️ Critical</span>
                                            )}
                                        </div>
                                        <div className="requirement-details">
                                            <div className="detail-row">
                                                <span className="label">Category:</span>
                                                <span className="category-tag">{req.category.name}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Quantity:</span>
                                                <span className="quantity">{req.quantity} {req.units}</span>
                                            </div>
                                            {req.description && (
                                                <div className="description">
                                                    <span className="label">Description:</span>
                                                    <p>{req.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {tender.selected_contractor && (
                            <div className="contractor-section">
                                <h3>Selected Contractor</h3>
                                <div className="contractor-card">
                                    <img 
                                        src={getUserAvatarUrl(tender.selected_contractor, 'contractor')} 
                                        alt={tender.selected_contractor.user.first_name} 
                                    />
                                    <div className="contractor-info">
                                        <h4>{tender.selected_contractor.user.first_name} {tender.selected_contractor.user.last_name}</h4>
                                        <p>Rating: {tender.selected_contractor.rating}/5</p>
                                        <p>Experience: {tender.selected_contractor.experience} years</p>
                                    </div>
                                </div>
                                
                                {/* Mark as Complete Button - only show for in_progress tenders */}
                                {tender.status === 'in_progress' && (
                                    <div className="contractor-actions">
                                        <button
                                            className="complete-tender-btn"
                                            onClick={handleMarkComplete}
                                            disabled={selecting}
                                        >
                                            {selecting ? 'Processing...' : '✅ Mark as Complete'}
                                        </button>
                                        <p className="complete-warning">
                                            ⚠️ This action cannot be undone. Only mark as complete when all work is finished and you're satisfied with the results.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'bids' && (
                    <div className="bids-section">
                        {(() => {
                            // Group bids by contractor
                            const bidsByContractor = {};
                            bids.forEach(bid => {
                                const contractorId = bid.contractor.id;
                                if (!bidsByContractor[contractorId]) {
                                    bidsByContractor[contractorId] = {
                                        contractor: bid.contractor,
                                        bids: [],
                                        totalCost: 0
                                    };
                                }
                                bidsByContractor[contractorId].bids.push(bid);
                                // Calculate total cost (bid_amount * quantity from requirement)
                                const quantity = bid.tender_requirement?.quantity || 1;
                                bidsByContractor[contractorId].totalCost += parseFloat(bid.bid_amount) * quantity;
                            });

                            return Object.values(bidsByContractor).map(contractorData => (
                                <div key={contractorData.contractor.id} className="contractor-bid-group">
                                    <div className="contractor-header">
                                        <div className="contractor-info">
                                            <img 
                                                src={getUserAvatarUrl(contractorData.contractor, 'contractor')} 
                                                alt={contractorData.contractor.user.first_name}
                                                className="contractor-avatar"
                                            />
                                            <div className="contractor-details">
                                                <h3>{contractorData.contractor.user.first_name} {contractorData.contractor.user.last_name}</h3>
                                                <div className="contractor-meta">
                                                    <span className="rating">⭐ {contractorData.contractor.rating}/5</span>
                                                    <span className="experience">🛠️ {contractorData.contractor.experience} years</span>
                                                    <span className="location">📍 {contractorData.contractor.city}, {contractorData.contractor.state}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="total-cost">
                                            <span className="cost-label">Total Bid Amount</span>
                                            <span className="cost-value">${contractorData.totalCost.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="requirement-bids">
                                        <h4>Requirement-wise Bids ({contractorData.bids.length} items)</h4>
                                        <div className="bids-grid">
                                            {contractorData.bids.map(bid => (
                                                <div key={bid.id} className="requirement-bid-card">
                                                    <div className="requirement-header">
                                                        <h5>{bid.tender_requirement?.requirments?.name || 'Requirement'}</h5>
                                                        <span className="category">{bid.tender_requirement?.category?.name}</span>
                                                    </div>
                                                    <div className="bid-pricing">
                                                        <div className="pricing-row">
                                                            <span>Unit Price:</span>
                                                            <span className="unit-price">${bid.bid_amount}</span>
                                                        </div>
                                                        <div className="pricing-row">
                                                            <span>Quantity:</span>
                                                            <span>{bid.tender_requirement?.quantity || 1} {bid.tender_requirement?.units}</span>
                                                        </div>
                                                        <div className="pricing-row total">
                                                            <span>Subtotal:</span>
                                                            <span className="subtotal">${(parseFloat(bid.bid_amount) * (bid.tender_requirement?.quantity || 1)).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {bid.proposal_description && (
                                                        <div className="proposal">
                                                            <h6>Proposal:</h6>
                                                            <p>{bid.proposal_description}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {bid.attachments && bid.attachments.length > 0 && (
                                                        <div className="attachments">
                                                            <h6>Attachments:</h6>
                                                            <div className="attachment-list">
                                                                {bid.attachments.map(attachment => (
                                                                    <a 
                                                                        key={attachment.id}
                                                                        href={attachment.file}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="attachment-link"
                                                                    >
                                                                        📎 {attachment.name}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {tender.status === 'published' && !tender.selected_contractor && (
                                        <div className="contractor-actions">
                                            <button
                                                className="select-contractor-btn"
                                                onClick={() => handleSelectContractor(contractorData.contractor.id)}
                                                disabled={selecting}
                                            >
                                                {selecting ? 'Selecting...' : `Select This Contractor ($${contractorData.totalCost.toFixed(2)})`}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ));
                        })()}

                        {bids.length === 0 && (
                            <div className="no-bids">
                                <div className="no-bids-icon">📋</div>
                                <h3>No Bids Received Yet</h3>
                                <p>Contractors haven't submitted bids for this tender yet. Check back later!</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'milestones' && (
                    <div className="milestones-section">
                        <div className="milestone-timeline">
                            {milestones.map((milestone, index) => (
                                <div 
                                    key={milestone.id} 
                                    className={`milestone-item ${milestone.status}`}
                                >
                                    <div className="milestone-dot" />
                                    <div className="milestone-content">
                                        <h4>{milestone.title}</h4>
                                        <p>{milestone.description}</p>
                                        <div className="milestone-dates">
                                            <span>Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
                                            {milestone.completed_date && (
                                                <span>Completed: {new Date(milestone.completed_date).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                        {milestone.completion_notes && (
                                            <div className="completion-notes">
                                                <p>{milestone.completion_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="history-section">
                        <div className="audit-timeline">
                            {auditLogs.map(log => (
                                <div key={log.id} className="audit-item">
                                    <div className="audit-dot" />
                                    <div className="audit-content">
                                        <div className="audit-header">
                                            <h4>{log.action}</h4>
                                            <span>{new Date(log.created_at).toLocaleString()}</span>
                                        </div>
                                        <p>{log.description}</p>
                                        <p className="audit-user">By: {log.user.first_name} {log.user.last_name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TenderDetail;
