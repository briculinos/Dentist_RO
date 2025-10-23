import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Patients API
export const patientsAPI = {
  getAll: (params) => api.get('/patients', { params }),
  getOne: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  archive: (id) => api.post(`/patients/${id}/archive`),
  unarchive: (id) => api.post(`/patients/${id}/unarchive`),
};

// Evaluations API
export const evaluationsAPI = {
  getAll: (params) => api.get('/evaluations', { params }),
  getOne: (id) => api.get(`/evaluations/${id}`),
  create: (data) => api.post('/evaluations', data),
  update: (id, data) => api.put(`/evaluations/${id}`, data),
  archive: (id) => api.post(`/evaluations/${id}/archive`),
};

// Search API
export const searchAPI = {
  search: (params) => api.get('/search', { params }),
};

// Clinic API
export const clinicAPI = {
  getCurrent: () => api.get('/clinics/current'),
  update: (data) => api.put('/clinics/current', data),
};

export default api;
