import React, { useEffect, useState, useMemo } from "react";
import api from "../../api";
import { useLocation, useNavigate } from "react-router-dom";
import "./SelectContractorsPage.css";
import ContractorCard from "../Contractors/ContractorComp/ContractorCard.jsx";

function SelectContractorsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const serviceId = location.state?.serviceId;
  const service = location.state?.service;
  const preSelected = location.state?.selectedContractors || [];

  const [contractors, setContractors] = useState([]);
  const [selected, setSelected] = useState(preSelected);
  const [filters, setFilters] = useState({
    state: "",
    rating: "",
    experience: "",
  });

  const [states, setStates] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    if (serviceId) {
      api.get(`api/services/${serviceId}/contractors/`).then((res) => {
        const contractorsData = res.data.contractors || [];
        setContractors(contractorsData);
        console.log(contractorsData);

        const uniqueStates = [
          ...new Set(contractorsData.map((c) => c.state).filter(Boolean)),
        ].sort();

        const uniqueRatings = [
          ...new Set(contractorsData.map((c) => c.rating).filter(Boolean)),
        ].sort((a, b) => a - b);

        const uniqueExperiences = [
          ...new Set(contractorsData.map((c) => c.experience).filter(Boolean)),
        ].sort((a, b) => a - b);

        setStates(uniqueStates);
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

  const filteredContractors = useMemo(() => {
    return contractors.filter(({ state, rating, experience }) => {
      return (
        (!filters.state ||
          state.toLowerCase() === filters.state.toLowerCase()) &&
        (!filters.rating || parseFloat(rating) >= parseFloat(filters.rating)) &&
        (!filters.experience ||
          parseInt(experience) >= parseInt(filters.experience))
      );
    });
  }, [contractors, filters]);

  const selectAll = () => {
    const all = filteredContractors.map((c) => c.id);
    setSelected(all);
  };

  const finishSelection = () => {
    if (window.confirm("Are you sure selection is complete?")) {
      navigate("/make-tender", {
        state: {
          selectedContractors: selected,
          service: service,
        },
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
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
        >
          <option value="">All States</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        <select
          value={filters.rating}
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
        >
          <option value="">Min Rating</option>
          {ratings.map((r) => (
            <option key={r} value={r}>
              {r}+
            </option>
          ))}
        </select>

        <select
          value={filters.experience}
          onChange={(e) =>
            setFilters({ ...filters, experience: e.target.value })
          }
        >
          <option value="">Min Experience</option>
          {experiences.map((exp) => (
            <option key={exp} value={exp}>
              {exp}+ years
            </option>
          ))}
        </select>
      </div>

      <button onClick={selectAll} className="select-all-btn">
        Select All
      </button>

      <div className="contractor-grid">
        {filteredContractors.map((contractor) => (
          <div
            key={contractor.id}
            className={`contractor-wrapper ${
              selected.includes(contractor.id) ? "selected" : ""
            }`}
            onClick={() => toggleContractor(contractor.id)}
          >
            <ContractorCard
              contractor={contractor}
              serviceName={service?.name}
            />
          </div>
        ))}
      </div>

      <button onClick={finishSelection} className="finish-btn">
        Finish Selection
      </button>
    </div>
  );
}

export default SelectContractorsPage;
