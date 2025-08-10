import React from "react";
import "../styles/home.css";
import { useNavigate } from "react-router-dom";

function Sidebar() {

    const navigate = useNavigate();

    const homeClick = () => {
        navigate("/Home");
    }

    const newTendersClick = () => {
        navigate("/newTendersContractor");
    }

    const appliedClick = () => {
        navigate("/appliedTendersContractor");
    }

    const profileClick = () => {
        navigate("/contractorProfile");
    }

    const allottedClick = () => {
        navigate("/allottedTendersContractor");
    }

    const completedClick = () => {
        navigate("/completedTendersContractor");
    }

    const ongoingClick = () => {
        navigate("/ongoingTendersContractor");
    }

    const quickJobsClick = () => {
        navigate("/quickJobsContractor");
    }

    return(
        <div className="sidebar">
            <div className="logo-section">
                <h2>LocalKonnect</h2>
            </div>
            <button onClick={homeClick}>Dashboard</button>
            <button onClick={newTendersClick}>New Tenders</button>
            <button onClick={appliedClick}>Applied Tenders</button>
            <button onClick={allottedClick}>Upcoming Tenders</button>
            <button onClick={ongoingClick}>Ongoing Tenders</button>
            <button onClick={completedClick}>Completed Tenders</button>
            <button onClick={quickJobsClick}>Quick Jobs</button>
            <button onClick={profileClick}>My Profile</button>
        </div>
    );
}

export default Sidebar;