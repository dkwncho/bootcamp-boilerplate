import axios from "axios";

// Respect Vite environment variable if provided, otherwise fallback
const baseURL = (import.meta as any).env?.VITE_API_BASE || "http://localhost:3000";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Simple interceptor to normalize errors and log responses
api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Attach a friendly message and log
    console.error("API error:", err?.response?.status, err?.message);
    if (!err.response) {
      err.friendlyMessage = "Network error or server is unreachable";
    } else if (err.response.data && err.response.data.message) {
      err.friendlyMessage = err.response.data.message;
    } else {
      err.friendlyMessage = err.message || "Unexpected error";
    }
    return Promise.reject(err);
  }
);

export async function getPets() {
  const response = await api.get(`/pets`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}

export async function getPet(id: any) {
  const response = await api.get(`/pets/${id}`);
  if (response.status === 200) {
    return response.data;
  } else {
    return;
  }
}

export async function createPet(pet: any) {
  const response = await api.post(`/pets`, pet);
  return response;
}

export async function updatePet(id: any, pet: any) {
  const response = await api.put(`/pets/${id}`, pet);
  return response;
}

export async function deletePet(id: any) {
  const response = await api.delete(`/pets/${id}`);
  return response;
}
