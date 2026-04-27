import axios from 'axios';

const API = axios.create({
  baseURL: "https://border-management-hybrid-system-1.onrender.com/api",
  headers: {
    "Content-Type": "application/json" // ✅ Forces JSON format
  }
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;