import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTenderById, getTenderBidSummary, selectContractor } from '../../api/tenders';
import './ContractorSelection.css';

const ContractorSelection = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tender, setTender] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selecting, setSelecting] = useState(false);
    const [selectedBid, setSelectedBid] = useState(null);

    useEffect(() => {
        fetchTenderAndBids();
    }, [id]);

    const fetchTenderAndBids = async () => {
        try {
            setLoading(true);
            const [tenderData, bidsData] = await Promise.all([
                getTenderById(id),
                getTenderBidSummary(id)
            ]);
            setTender(tenderData.data);
            setBids(bidsData.data || []);
        } catch (err) {
            setError('Failed to fetch tender and bids');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectContractor = async (bidId, contractorId) => {
        try {
            setSelecting(true);
            await selectContractor(id, contractorId);
            setSelectedBid(bidId);
            
            // Show success message and redirect after delay
            setTimeout(() => {
                navigate('/tenders');
            }, 2000);
        } catch (err) {
            setError('Failed to select contractor');
            console.error('Error:', err);
        } finally {
            setSelecting(false);
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

    if (loading) {
        return (
            <div className="contractor-selection-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading bids...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="contractor-selection-container">
                <div className="error-container">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button onClick={() => navigate('/tenders')} className="back-button">
                        Back to Tenders
                    </button>
                </div>
            </div>
        );
    }

    if (!tender) {
        return (
            <div className="contractor-selection-container">
                <div className="error-container">
                    <i className="fas fa-search"></i>
                    <h3>Tender Not Found</h3>
                    <button onClick={() => navigate('/tenders')} className="back-button">
                        Back to Tenders
                    </button>
                </div>
            </div>
        );
    }

    if (selectedBid) {
        return (
            <div className="contractor-selection-container">
                <div className="success-container">
                    <i className="fas fa-check-circle"></i>
                    <h3>Contractor Selected Successfully!</h3>
                    <p>The selected contractor will be notified and work can begin.</p>
                    <div className="success-actions">
                        <button onClick={() => navigate('/tenders')} className="action-button primary">
                            View All Tenders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="contractor-selection-container">
            <div className="selection-header">
                <div className="header-content">
                    <h1>Select Contractor</h1>
                    <p className="header-subtitle">
                        Choose the best contractor for "{tender.title}"
                    </p>
                </div>
                <button 
                    onClick={() => navigate('/tenders')} 
                    className="back-button"
                >
                    <i className="fas fa-arrow-left"></i>
                    Back to Tenders
                </button>
            </div>

            <div className="tender-summary">
                <div className="summary-content">
                    <h3>{tender.title}</h3>
                    <div className="summary-details">
                        <div className="detail-item">
                            <span className="label">Budget:</span>
                            <span className="value">{formatCurrency(tender.budget)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Service:</span>
                            <span className="value">{tender.service?.name || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Total Bids:</span>
                            <span className="value">{bids.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {bids.length === 0 ? (
                <div className="no-bids">
                    <i className="fas fa-inbox"></i>
                    <h3>No Bids Received</h3>
                    <p>No contractors have submitted bids for this tender yet.</p>
                    <button onClick={() => navigate('/tenders')} className="action-button">
                        Back to Tenders
                    </button>
                </div>
            ) : (
                <div className="bids-grid">
                    {bids.map((contractorBid) => (
                        <div key={contractorBid.contractor_id} className="bid-card">
                            <div className="bid-header">
                                <div className="contractor-info">
                                    <div className="contractor-avatar">
                                        <i className="fas fa-building"></i>
                                    </div>
                                    <div className="contractor-details">
                                        <h4>{contractorBid.name || 'Contractor'}</h4>
                                        <p className="contractor-contact">
                                            {contractorBid.city}, {contractorBid.state}
                                        </p>
                                        <div className="contractor-rating">
                                            <div className="stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <i 
                                                        key={i} 
                                                        className={`fas fa-star ${
                                                            i < (contractorBid.rating || 0) ? 'filled' : ''
                                                        }`}
                                                    ></i>
                                                ))}
                                            </div>
                                            <span className="rating-text">
                                                ({contractorBid.rating || 0}/5)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bid-amount">
                                    <span className="amount-label">Total Bid</span>
                                    <span className="amount-value">
                                        {formatCurrency(contractorBid.total_bid)}
                                    </span>
                                </div>
                            </div>

                            <div className="bid-details">
                                <div className="detail-row">
                                    <span className="label">Experience:</span>
                                    <span className="value">{contractorBid.experience || 0} years</span>
                                </div>
                                
                                {contractorBid.bids && contractorBid.bids.length > 0 && (
                                    <div className="bid-breakdown">
                                        <h5>Bid Breakdown:</h5>
                                        {contractorBid.bids.map((bidItem, index) => (
                                            <div key={index} className="breakdown-item">
                                                <span className="item-name">{bidItem.requirement}</span>
                                                <span className="item-details">
                                                    {bidItem.quantity} × {formatCurrency(bidItem.bid_amount)} = {formatCurrency(bidItem.subtotal)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bid-actions">
                                <button
                                    onClick={() => handleSelectContractor(contractorBid.contractor_id, contractorBid.contractor_id)}
                                    disabled={selecting}
                                    className="select-button"
                                >
                                    {selecting ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            Selecting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-check"></i>
                                            Select This Contractor
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContractorSelection;
