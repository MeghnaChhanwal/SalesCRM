// src/utils/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true, 
});

// Optional: Global response error interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🔴 API Error:", error?.response || error.message);
    return Promise.reject(error);
  }
);

export default API;
