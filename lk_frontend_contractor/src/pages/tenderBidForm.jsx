import React, { useState, useEffect } from "react";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { useNavigate, useParams } from "react-router-dom";

function TenderBidForm() {
    const { tenderId } = useParams(); // Get the tender ID from the URL
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        tender: tenderId,
        contractor: "",
        prices: "",
        total_cost: "",
    });
    const [error, setError] = useState(null);
    const [tenderDetails, setTenderDetails] = useState(null);

    useEffect(() => {
        // Fetch tender details from the backend
        api.get(`/api/tenders/${tenderId}/`)
            .then((response) => setTenderDetails(response.data))
            .catch((error) => {
                console.error("Error fetching tender details:", error);
                setError("Error fetching tender details.");
            });
    }, [tenderId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Get the access token from localStorage
            const accessToken = localStorage.getItem(ACCESS_TOKEN);

            if (!accessToken) {
                alert("You are not logged in. Please log in to submit a bid.");
                return;
            }

            // Submit the bid with the access token in the headers
            await api.post("/api/tender-bids/", formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            alert("Your bid has been successfully submitted.");
            navigate("/home");
        } catch (error) {
            console.log("Error Response:", error.response?.data || error.message);
            setError("Error submitting bid. Please try again.");
        }
    };

    return tenderDetails ? (
        <div>
            <h2>Bid for Tender: {tenderDetails.title}</h2>
            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>Email</label>
                <input
                    type="email"
                    value={formData.contractor}
                    placeholder="Enter your Email (Contractor)"
                    onChange={handleChange}
                    required
                />
                <label>Price</label>
                <input
                    type="number"
                    value={formData.prices}
                    placeholder="Enter your bid price"
                    onChange={handleChange}
                    required
                />
                <label>Total Cost</label>
                <input
                    type="number"
                    value={formData.total_cost}
                    placeholder="Enter your total cost"
                    onChange={handleChange}
                    required
                />
                <button type="submit">Submit Bid</button>
            </form>
        </div>
    ) : (
        <p>Loading tender details...</p>
    );
}

export default TenderBidForm;
