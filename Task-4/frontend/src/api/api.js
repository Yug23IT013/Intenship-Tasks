import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Interceptor to attach Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('localchat_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ── Auth API ──────────────────────────────────────────────────────────────────
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const searchUsers = (search) => api.get(`/auth/users?search=${encodeURIComponent(search)}`);

// ── Chats API ─────────────────────────────────────────────────────────────────
export const getChats = () => api.get('/chats');
export const createChat = (userId) => api.post('/chats', { userId });
export const createGroupChat = (data) => api.post('/chats/group', data);
export const addToGroup = (chatId, userId) => api.put('/chats/group/add', { chatId, userId });
export const removeFromGroup = (chatId, userId) => api.put('/chats/group/remove', { chatId, userId });

// ── Messages API ──────────────────────────────────────────────────────────────
export const getMessages = (chatId) => api.get(`/messages/${chatId}`);
export const sendMessage = (data) => api.post('/messages', data);

export default api;
