import { useEffect, useState } from 'react';
import api from "../../api.js";
import './Profile.css'; // Optional CSS for styling

function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/profile/')
            .then(response => {
                setProfile(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Failed to fetch profile:', error);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading profile...</p>;
    if (!profile) return <p>Profile not found.</p>;

    const { first_name, last_name, email, phone_number, role, profile_data } = profile;
    const { city, state, customer_image } = profile_data || {};

    return (
        <div className="profile-page">
            <h2>My Profile</h2>
            <div className="profile-card">
                {customer_image && (
                    <img
                        src={customer_image}
                        alt="Profile"
                        className="profile-image"
                    />
                )}
                <div className="profile-info">
                    <p><strong>Name:</strong> {first_name} {last_name}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Phone:</strong> {phone_number}</p>
                    <p><strong>Role:</strong> {role}</p>
                    <p><strong>City:</strong> {city}</p>
                    <p><strong>State:</strong> {state}</p>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
