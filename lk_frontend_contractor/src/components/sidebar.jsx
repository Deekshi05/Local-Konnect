import React from "react";
import "../styles/home.css";
import { useNavigate } from "react-router-dom";

function Sidebar() {

    const navigate = useNavigate();

    const newTendersClick = () => {
        navigate("/new_tender_card");
    }

    const profileClick = () => {
        navigate("/contractorProfile");
    }

    const allowedClick = () => {
        navigate("/allowedTenders");
    }

    return(
        <div className="sidebar">
            <div className="logo-section">
                <h2>LocalKonnect</h2>
            </div>
            <button>Dashboard</button>
            <button onClick={newTendersClick}>New Tenders</button>
            <button>Applied Tenders</button>
            <button>Ongoing Tenders</button>
            <button>Completed Tenders</button>
            <button onClick={allowedClick}>Allowed Tenders</button>
            <button onClick={profileClick}>My Profile</button>
        </div>
    );
}

export default Sidebar;