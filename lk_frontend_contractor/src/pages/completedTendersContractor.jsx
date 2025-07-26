import React, { useEffect, useState } from 'react';
import { ACCESS_TOKEN } from "../constants";
import Sidebar from '../components/sidebar';
import "../styles/new_tender_card.css";


const CompletedTenders = () => {
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);

        const fetchCompletedTenders = async () => {

            let url = "http://localhost:8000/api/tenders/contractor/selected/";
            let options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }

            try {
                const res = await fetch(url, options);
                if (res.ok) {
                    const data = await res.json();

                    const filteredTenders = data.filter(
                        (assignment) => assignment.payment_status === 'paid' || assignment.payment_status === 'overdue'
                    );

                    console.log(filteredTenders);
                    setTenders(filteredTenders);
                } else {
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

    if (loading) return <p>Loading completed tenders...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className='home-container'>
            <Sidebar />
            <div className='main-content'>
                <div className='dashboard-header'>
                    <h1>Completed Tenders</h1>
                </div>
                {tenders.length === 0 ? (
                    <p>No completed tenders found.</p>
                ) : (
                    <ul>
                        {tenders.map((assignment) => (
                            <div className="bid-card-1" key={assignment.id}>
                                <div className="card-header-1">
                                    <div className="user-id-1">
                                        <strong>Tender ID:</strong> <span>{assignment.tender}</span>
                                    </div>
                                    <div className="service-name-1">
                                        <strong>Location:</strong> <span>{assignment.location}</span>
                                    </div>
                                </div>

                                <div className="card-table-1">
                                    <table>
                                        <tbody>
                                            <tr>
                                                <th>Start Date</th>
                                                <td>{new Date(assignment.start_date).toLocaleString()}</td>
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
                                                <th>Service Name</th>
                                                <td>{assignment.service_name || "N/A"}</td>
                                            </tr>
                                            <tr>
                                                <th>Description</th>
                                                <td>{assignment.description || "No description provided"}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* <div className="card-footer-1">
                                    <div className="details-1">
                                        <p><span>Status:</span> Completed</p>
                                    </div>
                                    <div className="time-left-1">
                                        <div className="time-circle-1">
                                            <span>Done</span>
                                            <small>{assignment.payment_status === "paid" ? "Paid" : "Overdue"}</small>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CompletedTenders;
