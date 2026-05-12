import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://kazi-linda.onrender.com/api';

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

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile/me'),
  updateProfile: (data) => api.put('/profile/me', data),
  getPublicProfile: (userId) => api.get(`/profile/${userId}`),
  addEducation: (data) => api.post('/profile/education', data),
  addCertification: (data) => api.post('/profile/certification', data),
  addLanguage: (data) => api.post('/profile/language', data),
  updateLocation: (data) => api.post('/profile/location', data),
  getUserStats: () => api.get('/profile/stats'),
};

// Job API
export const jobAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/my-jobs'),
  getEmployerJobs: (employerId) => api.get(`/jobs/employer/${employerId}`),
};

// Application API
export const applicationAPI = {
  create: (data) => api.post('/applications', data),
  getMy: () => api.get('/applications/my-applications'),
  getByJob: (jobId) => api.get(`/applications/job/${jobId}`),
  updateStatus: (id, status, feedback) => api.put(`/applications/${id}/status`, { status, feedback }),
  getEmployerApplications: () => api.get('/applications/employer'),
};

// Employer API (for verification and blacklist)
export const employerAPI = {
  verify: (data) => api.post('/employers/verify', data),
  getBlacklist: () => api.get('/employers/blacklist'),
  getEmployer: (id) => api.get(`/employers/${id}`),
  rateEmployer: (id, data) => api.post(`/employers/${id}/rate`, data),
  reportEmployer: (id, data) => api.post(`/employers/${id}/report`, data),
  getStats: (id) => api.get(`/employers/${id}/stats`),
  createProfile: (data) => api.post('/employers/profile', data),
};

// Message API
export const messageAPI = {
  sendMessage: (data) => api.post('/messages', data),
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId, page = 1) => api.get(`/messages/${userId}?page=${page}`),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  getUnreadCount: () => api.get('/messages/unread/count'),
  getUserProfile: (userId) => api.get(`/messages/user/${userId}`),
};

// Check-in/Emergency API
export const checkinAPI = {
  create: (data) => api.post('/checkins', data),
  getMy: () => api.get('/checkins/my-checkins'),
  getLatest: () => api.get('/checkins/latest'),
};

export const emergencyAPI = {
  create: (data) => api.post('/emergencies', data),
  getMy: () => api.get('/emergencies/my-emergencies'),
  getActive: () => api.get('/emergencies/active'),
  updateStatus: (id, status) => api.put(`/emergencies/${id}/status`, { status }),
};

// Admin API
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  updateUserStatus: (userId, status) => api.put(`/admin/users/${userId}/status`, { status }),
  getAllJobs: () => api.get('/admin/jobs'),
  verifyJob: (jobId) => api.put(`/admin/jobs/${jobId}/verify`),
  deleteJob: (jobId) => api.delete(`/admin/jobs/${jobId}`),
  addToBlacklist: (data) => api.post('/admin/blacklist', data),
  removeFromBlacklist: (id) => api.delete(`/admin/blacklist/${id}`),
  getStats: () => api.get('/admin/stats'),
};

// Install moment if not already installed
// npm install moment

export default api;

// Add public profile endpoint
export const getPublicProfile = (userId) => {
  return fetch(`https://kazi-linda.onrender.com/api/profile/public/${userId}`)
    .then(res => res.json());
};
