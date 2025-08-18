import api from "../api";

// Models API for 3D model viewer integration
export const modelsAPI = {
  // Get all models
  getModels: () => api.get("/api/models/"),

  // Get single model
  getModel: (id) => api.get(`/api/models/${id}/`),

  // Upload new model
  uploadModel: (formData) =>
    api.post("/api/models/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Delete model
  deleteModel: (id) => api.delete(`/api/models/${id}/`),

  // Update model
  updateModel: (id, data) => api.patch(`/api/models/${id}/`, data),

  // Download model
  downloadModel: (id) =>
    api.get(`/api/models/${id}/download/`, {
      responseType: "blob",
    }),
};

// User preferences API for 3D viewer settings
export const preferencesAPI = {
  getPreferences: () => api.get("/api/preferences/"),
  updatePreferences: (data) => api.patch("/api/preferences/", data),
};
