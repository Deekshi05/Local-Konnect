import { useEffect, useState } from 'react';
import { ACCESS_TOKEN } from "../constants";
import Sidebar from '../components/sidebar';
import { formatDate, formatTimeOnly, formatToIndianTime, isTenderActive } from '../utils/dateUtils';
import "../styles/new_tender_card.css";

const NewTenders = () => {
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTender, setSelectedTender] = useState(null);
    const [requirementsData, setRequirementsData] = useState(null);
    const [requirementBids, setRequirementBids] = useState({});

    useEffect(() => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);

        const fetchNewTenders = async () => {
            const url = "http://localhost:8000/api/tenders/contractor/assigned-with-bid-status/";
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
                    console.log("=== BACKEND RESPONSE for New Tenders /api/tenders/contractor/assigned-with-bid-status/ ===");
                    console.log("URL:", url);
                    console.log("Full Response Data:", JSON.stringify(data, null, 2));
                    console.log("Number of items:", data.length);
                    
                    const filteredTenders = data.filter(
                        (assignment) =>
                            assignment.bid_status === "not_placed" 
                            // && assignment.end_time && new Date(assignment.end_time) >= new Date()
                    );
                    
                    console.log("Filtered New Tenders (bid_status === 'not_placed'):", JSON.stringify(filteredTenders, null, 2));
                    setTenders(filteredTenders);
                } else {
                    console.error("Failed to fetch new tenders. Status:", res.status, "StatusText:", res.statusText);
                    setError("Failed to fetch data");
                }
            } catch (error) {
                alert(error);
            } finally {
                setLoading(false);
            }
        };

        fetchNewTenders();
    }, []);

    if (loading) return <p>Loading new tenders...</p>;
    if (error) return <p>{error}</p>;

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
            setSelectedTender({
                id: data.tender_id,
                title: data.tender_title,
                service: data.service_name
            });
            setRequirementsData(data.requirements);
        } catch (err) {
            console.error("Error:", err.message);
        }
    };

    const handleBack = () => {
        setSelectedTender(null);
        setRequirementsData(null);
        setRequirementBids({});
    };

    const handleBidChange = (requirementId, value) => {
        setRequirementBids((prevBids) => ({
            ...prevBids,
            [requirementId]: value
        }));
    };

    const calculateTotalBidValue = () => {
        if (!requirementsData) return 0;

        return requirementsData.reduce((total, req) => {
            const bidAmount = parseFloat(requirementBids[req.requirement_id]) || 0;
            const quantity = parseFloat(req.quantity) || 0;
            return total + (bidAmount * quantity);
        }, 0);
    };


    const handleSubmitBids = async () => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);

        const bidsArray = Object.entries(requirementBids).map(([reqId, bidAmount]) => ({
            requirement_id: parseInt(reqId),
            bid_amount: parseFloat(bidAmount)
        }));

        if (bidsArray.length === 0) {
            alert("Please enter at least one bid before submitting.");
            return;
        }

        const url = `http://localhost:8000/api/tenders/${selectedTender.id}/submit-bids/`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ bids: bidsArray })
            });

            if (response.ok) {
                const result = await response.json();
                alert("Bids submitted successfully!");
                handleBack();
            } else {
                const errorData = await response.json();
                alert("Error submitting bids: " + JSON.stringify(errorData));
            }
        } catch (error) {
            console.error("Error submitting bids:", error);
            alert("An error occurred while submitting bids.");
        }
    };

    return (
        <div className='home-container'>
            <Sidebar />
            <div className='main-content'>
                <div className='dashboard-header'>
                    <h1>{selectedTender ? selectedTender.title : 'New Tenders'}</h1>
                    {selectedTender && (
                        <button onClick={handleBack} className="back-button">← Back</button>
                    )}
                </div>

                {!selectedTender ? (
                    tenders.length === 0 ? (
                        <p>No new tenders found.</p>
                    ) : (
                        <div>
                            {tenders.map((assignment) => (
                                <div
                                    className="bid-card-1"
                                    key={assignment.tender_id}
                                    onClick={() => handleTenderClick(assignment.tender_id)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="card-header-1">
                                        <div className="user-id-1">
                                            <strong>Title:</strong> <span>{assignment.title}</span>
                                        </div>
                                        <div className="service-name-1">
                                            <strong>Service:</strong> <span>{assignment.service}</span>
                                        </div>
                                    </div>

                                    <div className="card-table-1">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <th>Start Time</th>
                                                    <td>
                                                        {formatToIndianTime(assignment.start_time)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>End Time</th>
                                                    <td>
                                                        {formatToIndianTime(assignment.end_time)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Bid Status</th>
                                                    <td>{assignment.bid_status}</td>
                                                </tr>
                                                <tr>
                                                    <th>Location</th>
                                                    <td>{assignment.location}</td>
                                                </tr>
                                                <tr>
                                                    <th>Description</th>
                                                    <td>{assignment.description}</td>
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
                            <div className="user-id-1">
                                <strong>Service:</strong> <span>{selectedTender.service}</span>
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
                                        <th>Your Bid / unit</th>
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
                                            <td>
                                                <input
                                                    type="number"
                                                    placeholder="Enter bid"
                                                    value={requirementBids[req.requirement_id] || ''}
                                                    onChange={(e) => handleBidChange(req.requirement_id, e.target.value)}
                                                    style={{ padding: "4px", width: "100px" }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
                                Total Tender Value: ₹ {calculateTotalBidValue().toFixed(2)}
                            </div>


                            <div style={{ marginTop: '10px' }}>
                                <button onClick={handleSubmitBids} className="back-button">
                                    Submit Bids
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewTenders;
