// src/pages/Contractor.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import useContractors from "./useContractors";
import ContractorCard from "./ContractorCard"; // fixed double-slash path
import api from "../../../api";
import "./Contractors.css";
const Contractors = () => {
  const [filter, setFilter] = useState({
    service: "",
    region: "",
    rating: [],
    experience: 30,
    sort: "",
  });

  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get("api/services/");
        setServices(res.data);
      } catch (err) {
        console.error("Failed to load services:", err);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const selected = services.find((s) => s.name === filter.service);
    setServiceId(selected?.id || null);
  }, [filter.service, services]);

  const { contractors, loading } = useContractors(serviceId);

  const filteredContractors = (contractors || [])
  .filter((c) =>
    filter.region
      ? (typeof c?.region === "string" && c.region.toLowerCase().includes(filter.region.toLowerCase()))
      : true
  )
  .filter((c) =>
    filter.rating.length > 0
      ? filter.rating.some((r) => (c?.rating || 0) >= r)
      : true
  )
  .filter((c) => (c?.experience || 0) <= filter.experience)
  .sort((a, b) => {
    if (filter.sort === "rating-desc") return (b?.rating || 0) - (a?.rating || 0);
    if (filter.sort === "exp-desc") return (b?.experience || 0) - (a?.experience || 0);
    return 0;
  });


  return (
    <div className="contractor-page">
      <Sidebar updatefilters={setFilter} filter={filter} services={services} />
      <div className="contractor-list">
        {loading ? (
          <p>Loading contractors...</p>
        ) : filteredContractors.length > 0 ? (
          filteredContractors.map((c) => (
            <ContractorCard key={c.id} contractor={c} />
          ))
        ) : (
          <p>No contractors found for selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default Contractors;
