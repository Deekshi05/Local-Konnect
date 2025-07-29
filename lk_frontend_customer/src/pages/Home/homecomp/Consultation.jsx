import { useState, useEffect } from "react";
import { getservices } from "../../../getservices";
import "../../../styles/page_styles/home_styles/consultation.css";

function Signin() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    serviceId: "",
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getservices();
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const { firstName, lastName, address, city, phone, email, serviceId } = formData;
    if (!firstName || !lastName || !address || !city || !phone || !email || !serviceId) {
      alert("Please fill all required fields.");
      return;
    }
    alert("We will call you soon!");
  };

  return (
    <div className="page-container">
      <div className="intro">
        <h1>Find the best contractor for your work</h1>
        <h3>
          With guidance provided by the experienced supervisor, with materials
          at the best suitable cost
        </h3>
        <button className="explore-button">Explore the Services</button>
      </div>

      <div className="signin-form">
        <div className="heading">
          <h2>Get a Consultation</h2>
          <h4>Contact us</h4>
        </div>

        <div className="cred">
          <div className="row">
            <div className="input-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row">
            <div className="input-group">
              <label>Address *</label>
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>City *</label>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row">
            <div className="input-group">
              <label>Phone *</label>
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row">
            <div className="input-group full-width">
              <label>Choose Your Service *</label>
              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
              >
                <option value="">Select your service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row center">
            <button className="submit-btn" onClick={handleSubmit}>
              Call me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;
