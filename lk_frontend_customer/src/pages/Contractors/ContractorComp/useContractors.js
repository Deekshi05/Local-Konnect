import { useState, useEffect } from "react";
import api from "../../../api";

const useContractors = (serviceId) => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContractors = async () => {
      // Start by setting loading to true
      setLoading(true);

      if (!serviceId) {
        setContractors([]);
        setLoading(false); // ✅ Must reset loading here too
        return;
      }

      try {
        const res = await api.get(`api/services/${serviceId}/contractors/`);
        console.log("Fetched contractors:", res.data.contractors);
        setContractors(res.data.contractors || []);
      } catch (err) {
        console.error("Failed to fetch contractors", err);
        setContractors([]); // Optional: clear list on failure
      } finally {
        setLoading(false); // ✅ Always turn off loading
      }
    };

    fetchContractors();
  }, [serviceId]);

  return { contractors, loading };
};

export default useContractors;
