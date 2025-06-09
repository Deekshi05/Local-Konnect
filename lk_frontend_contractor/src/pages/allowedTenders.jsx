import React, { useState, useEffect } from "react";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";

function AllowedTenders() {
    const [tenders, setTenders] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get contractor ID from localStorage
        // const contractorIdStr = localStorage.getItem("contractor_id");
        const accessToken = localStorage.getItem(ACCESS_TOKEN);

        if (!accessToken) {
            alert("You need to log in first.");
            navigate("/login");
            return;
        }

        // Fetch all tenders the contractor is allowed to bid on
        api.get("/api/tenders/", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
            .then((response) => {
                console.log("API Response Data:", response.data); // Debugging log
                setTenders(response.data);
            })
            .catch((error) => {
                console.error("Error fetching tenders:", error);
                setError("Error fetching tenders.");
            });
    }, [navigate]);

    return (
        <div>
            <h2>Available Tenders for Bidding</h2>
            {error && <p>{error}</p>}
            {tenders.length > 0 ? (
                <div>
                    {tenders.map((tender) => (
                        <div key={tender.id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
                            <h3>Tender #{tender.id}</h3>
                            <p><strong>Service:</strong> {tender.service_name}</p>
                            <p><strong>Customer:</strong> {tender.customer_name}</p>
                            <p><strong>Supervisor:</strong> {tender.supervisor_name}</p>
                            <button
                                onClick={() => navigate(`/tenders/${tender.id}/bid`)}
                            >
                                Bid on this Tender
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No tenders available for you to bid on.</p>
            )}
        </div>
    );
}

export default AllowedTenders;
