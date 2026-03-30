import api from '../config/api';

export const simulatorService = {
  simulate: (data) => api.post('/simulate', data),
  getProducts: () => api.get('/products'),
  getProduct: (productId) => api.get(`/products/${productId}`),
  getProductOptions: (productId) => api.get(`/products/${productId}/options`),
};
