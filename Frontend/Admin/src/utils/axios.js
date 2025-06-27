// src/utils/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // e.g. https://salescrm-6hq8.onrender.com
});

export default API;
