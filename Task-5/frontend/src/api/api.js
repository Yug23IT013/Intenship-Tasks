import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Interceptor to attach Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vibegrid_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ── Auth & Profile API ────────────────────────────────────────────────────────
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const getUserDetails = (userId) => api.get(`/auth/user/${userId}`);
export const followUser = (userId) => api.put(`/auth/user/follow/${userId}`);
export const searchUsers = (search) => api.get(`/auth/search?search=${encodeURIComponent(search)}`);

// ── Posts API ─────────────────────────────────────────────────────────────────
export const createPost = (data) => api.post('/posts', data);
export const getTimelinePosts = () => api.get('/posts');
export const getExplorePosts = (params) => api.get('/posts/explore', { params });
export const getUserPosts = (userId) => api.get(`/posts/user/${userId}`);
export const likePost = (postId) => api.put(`/posts/like/${postId}`);
export const commentPost = (postId, data) => api.post(`/posts/comment/${postId}`, data);
export const getComments = (postId) => api.get(`/posts/comments/${postId}`);
export const getTrendingTags = () => api.get('/posts/trending');

// ── Notifications API ──────────────────────────────────────────────────────────
export const getNotifications = () => api.get('/notifications');
export const markNotificationsRead = () => api.put('/notifications/read');

// ── Upload API ────────────────────────────────────────────────────────────────
export const uploadPhoto = (formData) => api.post('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

export default api;
