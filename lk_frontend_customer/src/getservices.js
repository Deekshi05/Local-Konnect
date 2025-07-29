import api from "./api";
export const getservices = async () => {
  try {
    const res = await api.get("api/services/");
    const services=res.data;
    console.log(services);
    return services;
  } catch (err) {
    console.error("Error in getservices:", err);
    return [];
  }
};