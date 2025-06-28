// src/pages/Sidebar.jsx
import React from "react";
import "../../../styles/page_styles/contractor_styles/sidebar.css";
const Sidebar = ({ updatefilters, filter, services }) => {
  const handleMultiChange = (category, value) => {
    const updatedCategory = filter[category]?.includes(value)
      ? filter[category].filter((item) => item !== value)
      : [...(filter[category] || []), value];

    updatefilters({ ...filter, [category]: updatedCategory });
  };

  const handleSingleChange = (category, value) => {
    updatefilters({ ...filter, [category]: value });
  };

  const handleClearAll = () => {
    updatefilters({
      service: "",
      region: "",
      rating: [],
      experience: 30,
      sort: "",
    });
  };

  return (
    <div className="sidebar">
      <h3>Filters</h3>

      {/* Service Filter */}
      <div className="filter">
        <h4>Service</h4>
        <select
          value={filter.service || ""}
          onChange={(e) => handleSingleChange("service", e.target.value)}
        >
          <option value="">-- Select Service --</option>
          {(services || []).map((service) => (
            <option key={service.id} value={service.name}>
              {service.name}
            </option>
          ))}
        </select>
      </div>

      {/* Region Filter */}
      <div className="filter">
        <h4>Region</h4>
        <select
          value={filter.region || ""}
          onChange={(e) => handleSingleChange("region", e.target.value)}
        >
          <option value="">-- Select Region --</option>
          {["Delhi", "Mumbai", "Chennai", "Bangalore", "Kolkata"].map(
            (region) => (
              <option key={region} value={region}>
                {region}
              </option>
            )
          )}
        </select>
      </div>

      {/* Rating Filter */}
      <div className="filter">
        <h4>Customer Ratings</h4>
        {[5, 4, 3, 2, 1].map((rating) => (
          <label key={rating} className="rating-option">
            <input
              type="checkbox"
              checked={filter.rating?.includes(rating) || false}
              onChange={() => handleMultiChange("rating", rating)}
            />
            <h3>{rating}★ & above</h3>
          </label>
        ))}
      </div>

      {/* Experience Filter */}
      <div className="filter">
        <h4>Experience (years)</h4>
        <input
          type="range"
          min="0"
          max="30"
          value={filter.experience}
          onChange={(e) =>
            handleSingleChange("experience", Number(e.target.value))
          }
        />
        <p style={{ color: "black" }}>0 - {filter.experience} yrs</p>
      </div>

      {/* Sorting Filter */}
      <div className="filter">
        <h4>Sort By</h4>
        <select
          value={filter.sort || ""}
          onChange={(e) => handleSingleChange("sort", e.target.value)}
        >
          <option value="">-- No Sorting --</option>
          <option value="rating-desc">Highest Rated</option>
          <option value="exp-desc">Most Experienced</option>
        </select>
      </div>

      {/* Clear All Filters */}
      <div className="filter">
        <button onClick={handleClearAll} className="clear-btn">
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
