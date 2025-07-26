import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";

function Home() {
    const navigate = useNavigate();

    const handleLogOut = () => {
        localStorage.clear()
        navigate("/login");
    }
    
    return (
        <div>
            <div className="home-container">
                <Sidebar />
                <div className="main-content">
                    <div className="dashboard-header">
                        <h1>Dashboard</h1>
                        <button className="logout-button" onClick={handleLogOut}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home