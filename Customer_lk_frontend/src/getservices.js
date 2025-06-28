import api from "./api";

export const getservices = async () => {
  try {
    const res = await api.get("api/services/");
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error("Error in getservices:", err);
    return [];
  }
};