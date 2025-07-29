import React from "react";
import "../../../styles/page_styles/contractor_styles/sidebar.css";
// import cities from "../../Tendors/cities.js";

const Sidebar = ({ updatefilters, filter, services, cities }) => {
  const handleSingleChange = (category, value) => {
    updatefilters({ ...filter, [category]: value });
  };

  const handleRatingChange = (value) => {
    // Only allow one selected rating, stored as an array
    updatefilters({ ...filter, rating: [parseFloat(value)] });
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

      {/* Region Filter (City only) */}
      <div className="filter">
        <h4>State</h4>
        <select
          value={filter.region || ""}
          onChange={(e) => handleSingleChange("region", e.target.value)}
        >
          <option value="">-- Select State --</option>
          {(cities || []).map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* Rating Filter (1★ and above, using float) */}
      <div className="filter">
        <h4>Customer Ratings</h4>
        <select
          value={filter.rating?.[0] || ""}
          onChange={(e) => handleRatingChange(e.target.value)}
        >
          <option value="">Select Rating</option>
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating}★ & above
            </option>
          ))}
        </select>
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
