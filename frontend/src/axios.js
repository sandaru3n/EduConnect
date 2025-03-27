// src/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure Content-Type is not overridden unless explicitly set
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      delete config.headers['Content-Type']; // Let FormData set it automatically
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
