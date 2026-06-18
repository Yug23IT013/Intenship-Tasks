import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Attach auth token if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('localmart_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts = (params) => api.get('/products', { params });
export const getFeatured = () => api.get('/products/featured');
export const getDeals    = () => api.get('/products/deals');
export const getProduct  = (id) => api.get(`/products/${id}`);
export const getRelated  = (id) => api.get(`/products/related/${id}`);

// ── Reviews ───────────────────────────────────────────────────────────────────
export const getReviews    = (productId) => api.get(`/reviews/${productId}`);
export const submitReview  = (productId, data) => api.post(`/reviews/${productId}`, data);

// ── Orders ────────────────────────────────────────────────────────────────────
export const placeOrder  = (data)    => api.post('/orders', data);
export const trackOrder  = (orderId) => api.get(`/orders/track/${orderId}`);
export const getMyOrders = ()        => api.get('/orders/my');

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);
export const getMe    = ()     => api.get('/auth/me');

export default api;
