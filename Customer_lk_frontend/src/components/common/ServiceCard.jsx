// components/ServiceCard.jsx
import React from 'react';
import './ServiceCard.css'; // We'll create this CSS file next

const ServiceCard = ({ name, description, image }) => {
  return (
    <div className="service-card">
      <img src={image} alt={name} className="service-image" />
      <h2 className="service-name">{name}</h2>
      <p className="service-description">{description}</p>
    </div>
  );
};

export default ServiceCard;
