import { useState, useEffect } from "react";
import api from "../api";
import { API_ENDPOINTS } from "../constants";
import "../styles/Services.css";

const Services = () => {
  const [supervisorServices, setSupervisorServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    service: "",
    hourly_rate: "",
    physical_visit_fee: "",
    available_from: "09:00",
    available_to: "18:00",
    expertise_level: "junior",
    years_experience: 0,
    is_active: true,
    available_days: [],
    specializations: "",
    languages: "",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching services...");
      const [supervisorServicesRes, allServicesRes] = await Promise.all([
        api.get(API_ENDPOINTS.SUPERVISOR_SERVICES).catch((err) => {
          console.error("Error fetching supervisor services:", err);
          return { data: [] };
        }),
        api.get(API_ENDPOINTS.SERVICES).catch((err) => {
          console.error("Error fetching all services:", err);
          return { data: [] };
        }),
      ]);

      console.log("Supervisor Services Response:", supervisorServicesRes.data);
      console.log("All Services Response:", allServicesRes.data);

      const supervisorServices = Array.isArray(supervisorServicesRes.data)
        ? supervisorServicesRes.data
        : supervisorServicesRes.data?.results || [];

      const allServices = Array.isArray(allServicesRes.data)
        ? allServicesRes.data
        : allServicesRes.data?.results || [];

      setSupervisorServices(supervisorServices);
      setAllServices(allServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      setError(
        `Failed to load services: ${error.friendlyMessage || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter((d) => d !== day)
        : [...prev.available_days, day],
    }));
  };

  const resetForm = () => {
    setFormData({
      service: "",
      hourly_rate: "",
      physical_visit_fee: "",
      available_from: "09:00",
      available_to: "18:00",
      expertise_level: "junior",
      years_experience: 0,
      is_active: true,
      available_days: [],
      specializations: "",
      languages: "",
    });
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(API_ENDPOINTS.SUPERVISOR_SERVICES, {
        ...formData,
        available_days: formData.available_days.join(","),
        specializations: formData.specializations
          ? formData.specializations.split(",").map((s) => s.trim())
          : [],
        languages: formData.languages
          ? formData.languages.split(",").map((l) => l.trim())
          : [],
      });

      setSupervisorServices((prev) => [...prev, response.data]);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("Error adding service:", error);
      alert("Failed to add service. Please try again.");
    }
  };

  const handleEditService = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(
        `${API_ENDPOINTS.SUPERVISOR_SERVICES}${editingService.id}/`,
        {
          ...formData,
          available_days: formData.available_days.join(","),
          specializations: formData.specializations
            ? formData.specializations.split(",").map((s) => s.trim())
            : [],
          languages: formData.languages
            ? formData.languages.split(",").map((l) => l.trim())
            : [],
        }
      );

      setSupervisorServices((prev) =>
        prev.map((service) =>
          service.id === editingService.id ? response.data : service
        )
      );

      setEditingService(null);
      resetForm();
    } catch (error) {
      console.error("Error updating service:", error);
      alert("Failed to update service. Please try again.");
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm("Are you sure you want to remove this service?")) return;

    try {
      await api.delete(`${API_ENDPOINTS.SUPERVISOR_SERVICES}${serviceId}/`);
      setSupervisorServices((prev) =>
        prev.filter((service) => service.id !== serviceId)
      );
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to remove service. Please try again.");
    }
  };

  const startEditService = (service) => {
    setEditingService(service);
    setFormData({
      service: service.service,
      hourly_rate: service.hourly_rate,
      physical_visit_fee: service.physical_visit_fee,
      available_from: service.available_from,
      available_to: service.available_to,
      expertise_level: service.expertise_level,
      years_experience: service.years_experience,
      is_active: service.is_active,
      available_days:
        typeof service.available_days === "string"
          ? service.available_days.split(",")
          : service.available_days || [],
      specializations: Array.isArray(service.specializations)
        ? service.specializations.join(", ")
        : service.specializations || "",
      languages: Array.isArray(service.languages)
        ? service.languages.join(", ")
        : service.languages || "",
    });
  };

  const getExpertiseBadgeClass = (level) => {
    return `expertise-badge ${level}`;
  };

  const getServiceName = (serviceId) => {
    const service = allServices.find((s) => s.id === parseInt(serviceId));
    return service ? service.name : "Unknown Service";
  };

  if (loading) {
    return (
      <div className="services">
        <div className="loading">
          <div className="loading-spinner">⏳</div>
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="services">
      <div className="services-header">
        <h1>My Services</h1>
        <button
          className="add-service-btn"
          onClick={() => setShowAddModal(true)}
        >
          <span>➕</span>
          Add Service
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {supervisorServices.length === 0 ? (
        <div className="no-services">
          <div className="no-services-icon">🔧</div>
          <p>You haven't added any services yet.</p>
          <button
            className="add-service-btn"
            onClick={() => setShowAddModal(true)}
          >
            Add Your First Service
          </button>
        </div>
      ) : (
        <div className="services-grid">
          {supervisorServices.map((service) => (
            <div
              key={service.id}
              className={`service-card ${!service.is_active ? "inactive" : ""}`}
            >
              <div className="status-indicator active"></div>

              <div className="service-header">
                <h3 className="service-title">
                  {getServiceName(service.service)}
                </h3>
                <div className="service-actions">
                  <button
                    className="edit-btn"
                    onClick={() => startEditService(service)}
                    title="Edit Service"
                  >
                    ✏️
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteService(service.id)}
                    title="Remove Service"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="service-details">
                <div className="service-info">
                  <span className="service-info-label">Hourly Rate</span>
                  <span className="service-info-value price-highlight">
                    ₹{service.hourly_rate}
                  </span>
                </div>

                <div className="service-info">
                  <span className="service-info-label">Visit Fee</span>
                  <span className="service-info-value price-highlight">
                    ₹{service.physical_visit_fee}
                  </span>
                </div>

                <div className="service-info">
                  <span className="service-info-label">Experience</span>
                  <span className="service-info-value">
                    {service.years_experience} years
                  </span>
                </div>

                <div className="service-info">
                  <span className="service-info-label">Expertise</span>
                  <span
                    className={getExpertiseBadgeClass(service.expertise_level)}
                  >
                    {service.expertise_level}
                  </span>
                </div>

                <div className="availability-info">
                  <strong>Available:</strong> {service.available_from} -{" "}
                  {service.available_to}
                  {service.available_days &&
                    service.available_days.length > 0 && (
                      <div className="service-tags">
                        {(typeof service.available_days === "string"
                          ? service.available_days.split(",").filter(day => isNaN(day))
                          : service.available_days.filter(day => isNaN(day))
                        ).map((day, index) => (
                          <span key={index} className="service-tag day">
                            {day.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                </div>
                {service.specializations && (
                  <div className="service-info">
                    <span className="service-info-label">Specializations</span>
                    <div className="service-tags">
                      {(Array.isArray(service.specializations)
                        ? service.specializations
                        : typeof service.specializations === "string"
                        ? service.specializations.split(",")
                        : []
                      ).map((item, idx) => (
                        <span key={idx} className="service-tag specialization">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {service.languages && (
                  <div className="service-info">
                    <span className="service-info-label">Languages</span>
                    <div className="service-tags">
                      {(Array.isArray(service.languages)
                        ? service.languages
                        : typeof service.languages === "string"
                        ? service.languages.split(",")
                        : []
                      ).map((lang, idx) => (
                        <span key={idx} className="service-tag language">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(showAddModal || editingService) && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowAddModal(false);
            setEditingService(null);
            resetForm();
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingService ? "Edit Service" : "Add New Service"}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingService(null);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={editingService ? handleEditService : handleAddService}
            >
              <div className="modal-body">
                <div className="form-group">
                  <label>Service *</label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a service</option>
                    {allServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Hourly Rate (₹) *</label>
                    <input
                      type="number"
                      name="hourly_rate"
                      value={formData.hourly_rate}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Physical Visit Fee (₹) *</label>
                    <input
                      type="number"
                      name="physical_visit_fee"
                      value={formData.physical_visit_fee}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Available From</label>
                    <input
                      type="time"
                      name="available_from"
                      value={formData.available_from}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Available To</label>
                    <input
                      type="time"
                      name="available_to"
                      value={formData.available_to}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Available Days</label>
                  <div className="checkbox-group">
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => (
                      <div key={day} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={day}
                          checked={formData.available_days.includes(day)}
                          onChange={() => handleDayToggle(day)}
                        />
                        <label htmlFor={day}>{day}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Specializations (comma-separated)</label>
                  <textarea
                    name="specializations"
                    value={formData.specializations}
                    onChange={handleInputChange}
                    placeholder="e.g., Residential, Commercial, Industrial"
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>Languages (comma-separated)</label>
                  <input
                    type="text"
                    name="languages"
                    value={formData.languages}
                    onChange={handleInputChange}
                    placeholder="e.g., English, Hindi, Tamil"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingService(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingService ? "Update Service" : "Add Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
