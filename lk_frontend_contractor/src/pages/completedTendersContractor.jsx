import React, { useEffect, useState } from 'react';
import { ACCESS_TOKEN } from "../constants";
import Sidebar from '../components/sidebar';
import { formatToIndianTime } from '../utils/dateUtils';
import "../styles/new_tender_card.css";

const CompletedTenders = () => {
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completedTender, setCompletedTender] = useState(null);
    const [requirementsData, setRequirementsData] = useState(null);

    useEffect(() => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);

        const fetchCompletedTenders = async () => {
            const url = "http://localhost:8000/api/tenders/contractor/selected/";
            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            };

            try {
                const res = await fetch(url, options);
                if (res.ok) {
                    const data = await res.json();
                    console.log("=== BACKEND RESPONSE for Completed Tenders /api/tenders/contractor/selected/ ===");
                    console.log("URL:", url);
                    console.log("Full Response Data:", JSON.stringify(data, null, 2));
                    console.log("Number of items:", data.length);
                    
                    const filteredTenders = data.filter(
                        (assignment) => assignment.payment_status === 'paid' || assignment.payment_status === 'overdue'
                    );
                    
                    console.log("Filtered Completed Tenders (payment_status === 'paid' || 'overdue'):", JSON.stringify(filteredTenders, null, 2));
                    setTenders(filteredTenders);
                } else {
                    console.error("Failed to fetch completed tenders. Status:", res.status, "StatusText:", res.statusText);
                    setError("Failed to fetch data");
                }
            } catch (error) {
                alert(error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompletedTenders();
    }, []);

    const handleTenderClick = async (tenderId) => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);
        const url = `http://localhost:8000/api/tenders/${tenderId}/requirements-with-bids/`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch requirements with bids");
            }

            const data = await response.json();
            setCompletedTender({
                id: data.tender_id,
                title: data.tender_title,
                service: data.service_name
            });
            setRequirementsData(data.requirements || []);
            console.log(data.requirements);
        } catch (err) {
            console.error("Error:", err.message);
        }
    };

    const handleBack = () => {
        setCompletedTender(null);
        setRequirementsData(null);
    };

    const calculateTotalBidValue = () => {
        if (!requirementsData) return 0;
        return requirementsData.reduce((total, req) => {
            const bidAmount = parseFloat(req.bid_amount) || 0;
            const quantity = parseFloat(req.quantity) || 0;
            return total + (bidAmount * quantity);
        }, 0);
    };

    if (loading) return <p>Loading completed tenders...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className='home-container'>
            <Sidebar />
            <div className='main-content'>
                <div className='dashboard-header'>
                    <h1>{completedTender ? completedTender.title : 'Completed Tenders'}</h1>
                    {completedTender && (
                        <button onClick={handleBack} className="back-button">← Back</button>
                    )}
                </div>
                {!completedTender ? (
                    tenders.length === 0 ? (
                        <p>No completed tenders found.</p>
                    ) : (
                        <div>
                            {tenders.map((assignment) => (
                                <div
                                    className="bid-card-1"
                                    key={assignment.tender}
                                    onClick={() => handleTenderClick(assignment.tender)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="card-header-1">
                                        <div className="user-id-1">
                                            <strong>Title:</strong> <span>{assignment.tender_title}</span>
                                        </div>
                                        <div className="service-name-1">
                                            <strong>Service:</strong> <span>{assignment.service.name || "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="card-table-1">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <th>Start Date</th>
                                                    <td>{formatToIndianTime(assignment.start_date)}</td>
                                                </tr>
                                                <tr>
                                                    <th>Due Date</th>
                                                    <td>{new Date(assignment.due_date).toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <th>Payment Status</th>
                                                    <td>{assignment.payment_status}</td>
                                                </tr>
                                                <tr>
                                                    <th>Location</th>
                                                    <td>{assignment.tender_location || "N/A"}</td>
                                                </tr>
                                                <tr>
                                                    <th>Description</th>
                                                    <td>{assignment.tender_description || "No description provided"}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="bid-card-1">
                        <div className="card-header-1">
                            <div className="service-name-1">
                                <strong>Service:</strong> <span>{completedTender.service || 'N/A'}</span>
                            </div>
                            <div className="service-name-1">
                                <strong>Total Requirements:</strong> <span>{requirementsData.length}</span>
                            </div>
                        </div>

                        <div className="card-table-1">
                            <table>
                                <thead>
                                    <tr>
                                        <th>S.No.</th>
                                        <th>Requirement</th>
                                        <th>Category</th>
                                        <th>Description</th>
                                        <th>Quantity</th>
                                        <th>Unit</th>
                                        <th>Your Bid</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requirementsData.map((req, index) => (
                                        <tr key={req.requirement_id}>
                                            <td>{index + 1}</td>
                                            <td>{req.requirement_name}</td>
                                            <td>{req.category_name}</td>
                                            <td>{req.description}</td>
                                            <td>{req.quantity}</td>
                                            <td>{req.units}</td>
                                            <td>{req.bid_amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
                                Total Tender Value: ₹ {calculateTotalBidValue().toFixed(2)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompletedTenders;
