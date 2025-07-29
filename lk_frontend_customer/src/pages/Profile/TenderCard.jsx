import React from 'react';
// import './TenderCard.css';

function TenderCard({ title, description, budget, deadline }) {
  return (
    <div className="tender-card">
      <h3 className="tender-title">{title}</h3>
      <p className="tender-description">{description}</p>
      <div className="tender-meta">
        <p><strong>Budget:</strong> {budget}</p>
        <p><strong>Deadline:</strong> {deadline}</p>
      </div>
    </div>
  );
}

export default TenderCard;
