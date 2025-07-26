import { useEffect, useState } from 'react';
import { ACCESS_TOKEN } from "../constants";
import Sidebar from '../components/sidebar';
import "../styles/new_tender_card.css";


const AppliedTenders = () => {
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);

        const fetchAppliedTenders = async () => {

            let url = "http://localhost:8000/api/tenders/contractor/assigned-with-bid-status/";
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
                        (assignment) => assignment.bid_status === 'placed'
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

        fetchAppliedTenders();
    }, []);

    if (loading) return <p>Loading applied tenders...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className='home-container'>
            <Sidebar />
            <div className='main-content'>
                <div className='dashboard-header'>
                    <h1>Applied Tenders</h1>
                </div>
                {tenders.length === 0 ? (
                    <p>No applied tenders found.</p>
                ) : (
                    <ul>
                        {tenders.map((assignment) => (
                            <div className="bid-card-1" key={assignment.tender_id}>
                                <div className="card-header-1">
                                    <div className="user-id-1">
                                        <strong>Tender ID:</strong> <span>{assignment.tender_id}</span>
                                    </div>
                                    <div className="service-name-1">
                                        <strong>Service:</strong> <span>{assignment.service}</span>
                                    </div>
                                </div>

                                <div className="card-table-1">
                                    <table>
                                        <tbody>
                                            <tr>
                                                <th>Location</th>
                                                <td>{assignment.location}</td>
                                            </tr>
                                            <tr>
                                                <th>Start Date</th>
                                                <td>{new Date(assignment.start_time).toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <th>End Date</th>
                                                <td>{new Date(assignment.end_time).toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <th>Bid Status</th>
                                                <td>{assignment.bid_status}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* <div className="card-footer-1">
                                    <div className="details-1">
                                        <p><span>Status:</span> Applied</p>
                                    </div>
                                    <div className="time-left-1">
                                        <div className="time-circle-1">
                                            <span>Bid</span>
                                            <small>Placed</small>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        ))
                        }
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AppliedTenders;
