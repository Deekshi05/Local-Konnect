import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import useContractors from "./useContractors";
import ContractorCard from "./ContractorCard";
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

  // Fetch all services
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

  // Update serviceId when service name is selected
  useEffect(() => {
    const selected = services.find((s) => s.name === filter.service);
    setServiceId(selected?.id || null);
  }, [filter.service, services]);

  const { contractors, loading } = useContractors(serviceId);

  // Get unique list of states from contractors
  const uniqueStates = [...new Set((contractors || []).map(c => c.state).filter(Boolean))];

  // Apply filters
  const filteredContractors = (contractors || [])
    .filter((c) => {
      return filter.region ? c.state === filter.region : true;
    })
    .filter((c) => {
      const contractorRating = parseFloat(c?.rating) || 0;
      return filter.rating.length > 0
        ? contractorRating >= filter.rating[0]
        : true;
    })
    .filter((c) => {
      const experience = parseInt(c?.experience) || 0;
      return experience <= filter.experience;
    })
    .sort((a, b) => {
      if (filter.sort === "rating-desc") {
        return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
      }
      if (filter.sort === "exp-desc") {
        return (parseInt(b.experience) || 0) - (parseInt(a.experience) || 0);
      }
      return 0;
    });

  return (
    <div className="contractor-page">
      <Sidebar
        updatefilters={setFilter}
        filter={filter}
        services={services}
        cities={uniqueStates}
      />
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
