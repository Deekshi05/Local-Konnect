import React, { useState, useEffect } from 'react';
import '../styles/contractorProfile.css';
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN } from '../constants';
import api from '../api';

const ContractorProfile = () => {
  const navigate = useNavigate();

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

  const [services, setServices] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [newService, setNewService] = useState('');

  const [confirmDialog, setConfirmDialog] = useState({
    message: '',
    onConfirm: null,
    onCancel: null
  });

  const token = localStorage.getItem(ACCESS_TOKEN);

  // Handle scroll lock when dialog is open
  useEffect(() => {
    if (confirmDialog.message) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [confirmDialog]);

  const fetchContractorData = async () => {
    try {
      const res = await api.get("http://localhost:8000/api/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      setContractor({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone,
        profile_data: {
          address: data.profile_data?.address,
          city: data.profile_data?.city,
          state: data.profile_data?.state,
          experience: data.profile_data?.experience,
          rating: data.profile_data?.rating,
        },
      });
    } catch (error) {
      console.error('Error fetching contractor data:', error);
    }
  };

  const fetchMyServices = async () => {
    try {
      const res = await api.get("http://localhost:8000/api/contractor/services/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyServices(res.data.map(item => item.service));
    } catch (error) {
      console.error('Error fetching contractor services:', error);
    }
  };

  const fetchAllServices = async () => {
    try {
      const res = await api.get("http://localhost:8000/api/services/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data);
    } catch (error) {
      console.error('Error fetching all services:', error);
    }
  };

  useEffect(() => {
    fetchContractorData();
    fetchMyServices();
    fetchAllServices();
  }, []);

  const showConfirmation = (message, onConfirm, onCancel = null) => {
    setConfirmDialog({ message, onConfirm, onCancel });
  };

  const handleDialogOk = () => {
    if (confirmDialog.onConfirm) confirmDialog.onConfirm();
    setConfirmDialog({ message: '', onConfirm: null, onCancel: null });
  };

  const handleDialogCancel = () => {
    if (confirmDialog.onCancel) confirmDialog.onCancel();
    setConfirmDialog({ message: '', onConfirm: null, onCancel: null });
  };

  const handleAddService = () => {
    if (!newService) return;
    showConfirmation(
      "Are you sure you want to add this service?",
      async () => {
        try {
          await api.post("http://localhost:8000/api/contractor/services/add/", {
            service_id: parseInt(newService)
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setNewService('');
          fetchMyServices();
        } catch (error) {
          console.error('Error adding service:', error);
        }
      },
      () => {
        console.log("Add service cancelled");
      }
    );
  };

  const handleRemoveService = (serviceId) => {
    showConfirmation(
      "Are you sure you want to remove this service?",
      async () => {
        try {
          await api.delete(`http://localhost:8000/api/contractor/services/${serviceId}/remove/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchMyServices();
        } catch (error) {
          console.error('Error removing service:', error);
        }
      },
      () => {
        console.log("Remove service cancelled");
      }
    );
  };

  const availableServicesToAdd = services.filter(
    (service) => !myServices.find((s) => s.id === service.id)
  );

  return (
    <div className="contractor-wrapper">
      <button onClick={() => navigate("/home")} className='home-button'>Home</button>

      <div className="avatar-container">
        <img
          src="https://img.icons8.com/ios-filled/100/000000/user.png"
          alt="Contractor Avatar"
          className="avatar-img"
        />
      </div>

      <h2>Profile</h2>

      {['first_name', 'last_name', 'email', 'phone_number'].map((field, idx) => (
        <div className="form-group" key={idx}>
          <label>{field.replace('_', ' ').toUpperCase()}</label>
          <input type="text" value={contractor[field] || ''} readOnly />
        </div>
      ))}
      {['address', 'city', 'state', 'experience', 'rating'].map((field, idx) => (
        <div className="form-group" key={idx}>
          <label>{field.toUpperCase()}</label>
          <input type="text" value={contractor.profile_data?.[field] || ''} readOnly />
        </div>
      ))}

      <div className="form-group">
        <h3>My Services</h3>
        {myServices.length === 0 ? (
          <p>No services added yet.</p>
        ) : (
          <ul className="service-list">
            {myServices.map(service => (
              <li key={service.id} className="service-item">
                {service.name}
                <button
                  className="delete-button"
                  onClick={() => handleRemoveService(service.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-group">
        <h4>Add New Service</h4>
        <select value={newService} onChange={e => setNewService(e.target.value)}>
          <option value="">-- Select a service --</option>
          {availableServicesToAdd.map(service => (
            <option key={service.id} value={service.id}>{service.name}</option>
          ))}
        </select>
        <button onClick={handleAddService} disabled={!newService}>
          Add Service
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmDialog.message && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{confirmDialog.message}</p>
            <div className="modal-buttons">
              <button className="ok-button" onClick={handleDialogOk}>OK</button>
              <button className="cancel-button" onClick={handleDialogCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorProfile;
