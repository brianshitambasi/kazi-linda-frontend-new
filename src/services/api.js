import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Job APIs
export const jobAPI = {
  getAll: () => api.get('/jobs'),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/employer/my'),
};

// Application APIs
export const applicationAPI = {
  create: (data) => api.post('/applications', data),
  getMy: () => api.get('/applications/my'),
  updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
};

// Employer APIs (Single declaration with all methods)
export const employerAPI = {
  verify: (data) => api.post('/employers/verify', data),
  getStats: (id) => api.get(`/employers/${id}/stats`),
  getBlacklist: () => api.get('/employers/blacklist/all'),
  createProfile: (data) => api.post('/employers/create-profile', data),
  rate: (id, data) => api.post(`/employers/${id}/rate`, data),
  report: (id, data) => api.post(`/employers/${id}/report`, data),
};

// Message APIs
export const messageAPI = {
  sendMessage: (data) => api.post('/messages', data),
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId) => api.get(`/messages/${userId}`),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  getUnreadCount: () => api.get('/messages/unread/count'),
};

// Emergency APIs
export const emergencyAPI = {
  trigger: (data) => api.post('/emergency/trigger', data),
  checkIn: (data) => api.post('/emergency/check-in', data),
};

export default api;