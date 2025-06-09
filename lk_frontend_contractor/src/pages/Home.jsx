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
        {/* <div>
            <h1>Home Page - Contractors</h1>
            <button onClick={handleClick}>Click Me</button>
            <button onClick={profileClick}>Profile</button>
            <button onClick={handleLogOut}>LogOut</button>
        </div> */}
        <div className="home-container">
                <Sidebar />
                <div className="main-content">
                    <div className="dashboard-header">
                        <h1>Dashboard</h1>
                        <button className="logout-button" onClick={handleLogOut}>
                            Logout
                        </button>
                    </div>
        
                    {/* <section>
                        <h2>Clients</h2>
                        <div className="clients-board">
                            <div className="crm-column">
                                <h4>Lead</h4>
                                <div className="client-card">Client #3</div>
                            </div>
                            <div className="crm-column">
                                <h4>Proposal Sent</h4>
                                <div className="client-card">Client #2</div>
                            </div>
                            <div className="crm-column">
                                <h4>Customer</h4>
                                <div className="client-card">Client #1</div>
                            </div>
                        </div>
                    </section> */}
                </div>
            </div>
        </div>
    );
}

export default Home