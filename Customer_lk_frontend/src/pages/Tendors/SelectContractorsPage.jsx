import React, { useEffect, useState } from "react";
import api from "../../api";
import { useLocation, useNavigate } from "react-router-dom";
import "./SelectContractorsPage.css";

function SelectContractorsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const serviceId = location.state?.serviceId;
  const service = location.state?.service;

  const [contractors, setContractors] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({ city: "", rating: "", experience: "" });

  const [cities, setCities] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    if (serviceId) {
      api.get(`api/services/${serviceId}/contractors/`).then((res) => {
        setContractors(res.data.contractors);

        const uniqueCities = [...new Set(res.data.contractors.map(c => c.city).filter(Boolean))];
        const uniqueRatings = [...new Set(res.data.contractors.map(c => c.rating).filter(Boolean))].sort((a, b) => a - b);
        const uniqueExperiences = [...new Set(res.data.contractors.map(c => c.experience).filter(Boolean))].sort((a, b) => a - b);

        setCities(uniqueCities);
        setRatings(uniqueRatings);
        setExperiences(uniqueExperiences);
      });
    }
  }, [serviceId]);

  const toggleContractor = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const all = filteredContractors.map((c) => c.id);
    setSelected(all);
  };

  const filteredContractors = contractors.filter((c) => {
    return (
      (!filters.city || c.city === filters.city) &&
      (!filters.rating || parseFloat(c.rating) >= parseFloat(filters.rating)) &&
      (!filters.experience || parseInt(c.experience) >= parseInt(filters.experience))
    );
  });

  const finishSelection = () => {
    if (window.confirm("Are you sure selection is complete?")) {
      navigate("/make-tender", {
        state: {
          selectedContractors: selected,
          service: service || { id: serviceId }
        }
      });
    }
  };

  return (
    <div className="container">
      <h1 className="heading">
        Select Contractors for {service?.name || "Selected Service"}
      </h1>

      <div className="filters">
        <select
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        >
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select
          value={filters.rating}
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
        >
          <option value="">Min Rating</option>
          {ratings.map((rating) => (
            <option key={rating} value={rating}>{rating}+</option>
          ))}
        </select>

        <select
          value={filters.experience}
          onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
        >
          <option value="">Min Experience</option>
          {experiences.map((exp) => (
            <option key={exp} value={exp}>{exp}+ yrs</option>
          ))}
        </select>

        <button onClick={selectAll}>Select All</button>
      </div>

      <div className="contractor-grid">
        {filteredContractors.map((contractor) => (
          <div className="card" key={contractor.id}>
            <div className="card-content">
              <div className="card-info">
                <h2>
                  {contractor.user?.first_name} {contractor.user?.last_name}
                </h2>
                <p>{contractor.city}, {contractor.state}</p>
                <p>⭐ {contractor.rating} | {contractor.experience} yrs</p>
              </div>
              <input
                type="checkbox"
                checked={selected.includes(contractor.id)}
                onChange={() => toggleContractor(contractor.id)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="finish-container">
        <button onClick={finishSelection}>Finish Selection</button>
      </div>
    </div>
  );
}

export default SelectContractorsPage;
