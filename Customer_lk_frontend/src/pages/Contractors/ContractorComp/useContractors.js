import { useState, useEffect } from "react";
import api from "../../../api";

const useContractors = (serviceId) => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContractors = async () => {
      if (!serviceId) {
        setContractors([]);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get(`api/services/${serviceId}/contractors/`);
        setContractors(res.data.contractors || []);
      } catch (err) {
        console.error("Failed to fetch contractors", err);
        setContractors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContractors();
  }, [serviceId]);

  return { contractors, loading };
};

export default useContractors;
