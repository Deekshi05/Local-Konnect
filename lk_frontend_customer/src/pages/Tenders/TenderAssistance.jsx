import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tendersApi } from '../../api/tenders';
import { toast } from 'react-toastify';
import './TenderAssistance.css';

const TenderAssistance = () => {
    const { assistanceId } = useParams();
    const navigate = useNavigate();
    const [assistance, setAssistance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({
        location: '',
        start_time: '',
        end_time: '',
        customer_limit: 5
    });

    useEffect(() => {
        loadAssistanceDetails();
    }, [assistanceId]);

    const loadAssistanceDetails = async () => {
        try {
            const response = await tendersApi.getTenderAssistance(assistanceId);
            setAssistance(response.data);
            
            // Pre-fill location if physical visit exists
            if (response.data.physical_visit) {
                setFormData(prev => ({
                    ...prev,
                    location: response.data.physical_visit.visit_address
                }));
            }
        } catch (error) {
            toast.error('Failed to load tender assistance details');
            navigate('/appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateTender = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            const response = await tendersApi.createAssistedTender({
                assistance_id: assistanceId,
                location: formData.location,
                start_time: formData.start_time,
                end_time: formData.end_time,
                customer_limit: formData.customer_limit
            });
            const tenderId = response.data.id || response.data.tender_id;
            toast.success('Tender created successfully!');
            navigate(`/tenders/${tenderId}`);
        } catch (error) {
            toast.error('Failed to create tender');
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return <div className="loading-spinner">Loading assistance details...</div>;
    }

    return (
        <div className="tender-assistance-container">
            <h1>Review & Create Tender</h1>

            <div className="assistance-summary">
                <h2>Supervisor's Assistance Summary</h2>
                <div className="summary-grid">
                    <div className="summary-item">
                        <label>Service:</label>
                        <p>{assistance.service.name}</p>
                    </div>
                    <div className="summary-item">
                        <label>Supervisor:</label>
                        <p>{assistance.supervisor.user.first_name} {assistance.supervisor.user.last_name}</p>
                    </div>
                    <div className="summary-item">
                        <label>Estimated Budget:</label>
                        <p>${assistance.estimated_budget}</p>
                    </div>
                    <div className="summary-item">
                        <label>Timeline:</label>
                        <p>{assistance.project_timeline_days} days</p>
                    </div>
                </div>

                <div className="requirements-section">
                    <h3>Requirements Discussed</h3>
                    <div className="requirements-list">
                        {assistance.requirements_discussed.map((req, index) => (
                            <div key={index} className="requirement-item">
                                <h4>{req.category}</h4>
                                <ul>
                                    {req.items.map((item, i) => (
                                        <li key={i}>
                                            {item.name}: {item.quantity} {item.unit}
                                            {item.description && <p>{item.description}</p>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {assistance.special_instructions && (
                    <div className="instructions-section">
                        <h3>Special Instructions</h3>
                        <p>{assistance.special_instructions}</p>
                    </div>
                )}
            </div>

            <form onSubmit={handleCreateTender} className="tender-form">
                <h2>Create Tender</h2>
                
                <div className="form-group">
                    <label>Project Location:</label>
                    <textarea
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter the complete project location"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Start Date & Time:</label>
                        <input
                            type="datetime-local"
                            name="start_time"
                            value={formData.start_time}
                            onChange={handleInputChange}
                            required
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>

                    <div className="form-group">
                        <label>End Date & Time:</label>
                        <input
                            type="datetime-local"
                            name="end_time"
                            value={formData.end_time}
                            onChange={handleInputChange}
                            required
                            min={formData.start_time}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Maximum Number of Contractor Bids:</label>
                    <input
                        type="number"
                        name="customer_limit"
                        value={formData.customer_limit}
                        onChange={handleInputChange}
                        required
                        min="1"
                        max="20"
                    />
                </div>

                <div className="confirmation-notice">
                    <p>By creating this tender, you confirm that:</p>
                    <ul>
                        <li>The requirements listed above are accurate and complete</li>
                        <li>You agree to review contractor bids within the specified timeline</li>
                        <li>The project location and timeline are final</li>
                    </ul>
                </div>

                <button 
                    type="submit" 
                    className="create-button"
                    disabled={creating}
                >
                    {creating ? 'Creating Tender...' : 'Create Tender'}
                </button>
            </form>
        </div>
    );
};

export default TenderAssistance;
