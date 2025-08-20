import { useState, useEffect } from 'react';
import api from '../api';
import '../styles/Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile/');
      console.log('Profile Response:', response.data);
      setProfile(response.data);
      const profileData = response.data.profile_data || {};
      setFormData({
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: response.data.email,
        phone_number: response.data.phone,
        address: response.data.address,
        city: profileData.city,
        state: profileData.state,
        bio: profileData.bio || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone_number,
        address: formData.address,
        profile_data: {
          city: formData.city,
          state: formData.state,
          bio: formData.bio
        }
      };
      const response = await api.put('/profile/', updateData);
      setProfile(response.data);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Supervisor Profile</h1>
        {/* <p>Manage your supervisor account information</p> */}
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
            </div>
            <h2>{profile?.first_name} {profile?.last_name}</h2>
            <p className="role-badge">Supervisor</p>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone_number">Phone Number</label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Professional Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us about your professional experience and expertise..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" onClick={() => setEditing(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-section">
                <h3>Contact Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{profile?.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <span>{profile?.phone || 'Not provided'}</span>
                  </div>
                   <div className="info-item">
                    <label>City:</label>
                    <span>{profile?.profile_data?.city || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>State:</label>
                    <span>{profile?.profile_data?.state || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>Address:</label>
                    <span>{profile?.address || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>Professional Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Experience:</label>
                    <span>{profile?.profile_data?.experience || 0} years</span>
                  </div>
                  <div className="info-item">
                    <label>Qualification:</label>
                    <span>{profile?.profile_data?.qualification || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>Rating:</label>
                    <span>
                      {'⭐'.repeat(Math.floor(profile?.profile_data?.rating || 0))}
                      ({profile?.profile_data?.rating || '0.0'})
                    </span>
                  </div>
                 
                </div>
              </div>
              {profile?.profile_data?.bio && (
                <div className="info-section">
                  <h3>Professional Bio</h3>
                  <p>{profile?.profile_data?.bio}</p>
                </div>
              )}


              <div className="profile-actions">
                <button onClick={() => setEditing(true)} className="edit-btn">
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
