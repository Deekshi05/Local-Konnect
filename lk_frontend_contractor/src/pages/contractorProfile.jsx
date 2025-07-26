import React, { useState, useEffect } from 'react';
import '../styles/contractorProfile.css';
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN } from '../constants';
import api from '../api';

const ContractorProfile = () => {

  const navigate = useNavigate();

  // const [availability, setAvailability] = useState(true);
  const [contractor, setContractor] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    profile_data: {
      address: '',
      city: '',
      state: '',
      experience: '',
      rating: '',
    }
  });

  const handleHome = () => {
    navigate("/home");
  };

  useEffect(() => {
    // Fetch logged-in contractor details
    const fetchContractorData = async () => {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN);
        const res = await api.get("api/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = (res.data);

        setContractor({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          profile_data: {
            address: data.profile_data?.address,
            city: data.profile_data?.city,
            state: data.profile_data?.state,
            experience: data.profile_data?.experience,
            rating: data.profile_data?.rating,
          },
        });

        // setAvailability(data.availability);
      } catch (error) {
        console.error('Error fetching contractor data:', error);
      }
    };

    fetchContractorData();
  }, []);

  return (
    <div className="contractor-wrapper">

      <button onClick={handleHome} className='home-button'>Home</button>

      <div className="avatar-container">
        <img
          src="https://img.icons8.com/ios-filled/100/000000/user.png"
          alt="Contractor Avatar"
          className="avatar-img"
        />
      </div>

      <h2>Profile</h2>

      {/* <div className="form-group availability-row">
        <span className="availability-label">My Availability</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={availability}
            onChange={() => setAvailability(!availability)}
          />
          <span className="slider"></span>
        </label>
      </div> */}

      <div className="form-group">
        <label>First Name</label>
        <input type="text" value={contractor.first_name || ''} readOnly />
      </div>

      <div className="form-group">
        <label>Last Name</label>
        <input type="text" value={contractor.last_name || ''} readOnly />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input type="text" value={contractor.email || ''} readOnly />
      </div>

      <div className="form-group">
        <label>Phone Number</label>
        <input type="text" value={contractor.phone_number || ''} readOnly />
      </div>

      <div className="form-group">
        <label>Address</label>
        <input type="text" value={contractor.profile_data?.address || ''} readOnly />
      </div>

      <div className="form-group">
        <label>City</label>
        <input type="text" value={contractor.profile_data?.city || ''} readOnly />
      </div>

      <div className="form-group">
        <label>State</label>
        <input type="text" value={contractor.profile_data?.state || ''} readOnly />
      </div>

      <div className="form-group">
        <label>Experience</label>
        <input type="text" value={contractor.profile_data?.experience} readOnly />
      </div>

      <div className="form-group">
        <label>Rating</label>
        <input type="text" value={contractor.profile_data?.rating} readOnly />
      </div>
      {/* 
      <div className="form-group">
        <label>Title</label>
        <select value={contractor.title} >
          <option value="">Choose a title</option>
          <option value="Painter">Painter</option>
          <option value="Carpenter">Carpenter</option>
          <option value="Electrician">Electrician</option>
        </select>
      </div> */}



    </div>
  );
};

export default ContractorProfile;
