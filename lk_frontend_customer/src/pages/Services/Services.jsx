// pages/ServicesPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ServiceCard from "../../components/common/ServiceCard";
import './Services.css'; // Add a CSS file for the layout
import { getservices } from "../../getservices"
const ServicesPage = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getservices();
        console.log("Success fetching services");
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="services-container">
      {services.map(service => (
        <ServiceCard
          key={service.id}
          name={service.name}
          description={service.description}
          image={service.image}
        />
      ))}
    </div>
  );
};

export default ServicesPage;
