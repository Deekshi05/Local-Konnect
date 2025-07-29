import React from "react";
import { FaStar, FaMapMarkerAlt, FaBriefcase, FaPhone } from "react-icons/fa";
import "./ContractorCard.css";

const ContractorCard = ({ contractor, serviceName }) => {
  const name = `${contractor?.user?.first_name || ""} ${contractor?.user?.last_name || ""}`;
  const city = contractor?.user?.city;
  const state = contractor?.state;
  const region = city && state ? `${city}, ${state}` : state || city || "N/A";
  const image = contractor?.image || "/placeholder.jpg";

  return (
    <div className="contractor-card">
      <img src={image} alt={name} className="contractor-image" />
      <div className="contractor-info">
        <h4>{name}</h4>
        <p><FaBriefcase /> {serviceName || "N/A"}</p>
        <p><FaMapMarkerAlt /> {region}</p>
        <p><FaStar color="#f4b400" /> {contractor?.rating || "N/A"} / 5</p>
        <p>Experience: {contractor?.experience || "N/A"} yrs</p>
        <button className="contact-btn"><FaPhone /> Contact</button>
      </div>
    </div>
  );
};

export default ContractorCard;
