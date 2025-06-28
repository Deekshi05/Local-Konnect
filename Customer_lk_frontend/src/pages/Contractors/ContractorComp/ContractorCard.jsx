import React from "react";
import { FaStar, FaMapMarkerAlt, FaBriefcase, FaPhone } from "react-icons/fa";
import "./ContractorCard.css";

const ContractorCard = ({ contractor }) => {
  const name = `${contractor?.user?.first_name || ""} ${contractor?.user?.last_name || ""}`;
  const region = contractor?.user?.city || contractor?.region || "N/A";
  const image = contractor?.image || "/placeholder.jpg";
  return (
    <div className="contractor-card">
      <img src={image} alt={name} className="contractor-image" />
      <div className="contractor-info">
        <h4>{name}</h4>
        <p><FaBriefcase /> {contractor?.service || "N/A"}</p>
        <p><FaMapMarkerAlt /> {region}</p>
        <p><FaStar color="#f4b400" /> {contractor?.rating || "N/A"} / 5</p>
        <p>Experience: {contractor?.experience || "N/A"} yrs</p>
        <button className="contact-btn"><FaPhone /> Contact</button>
      </div>
    </div>
  );
};

export default ContractorCard;
