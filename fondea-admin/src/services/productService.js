import api from '../config/api';

export const productService = {
  getAll: () => api.get('/v1/products'),
  getById: (id) => api.get(`/v1/products/${id}`),
  create: (data) => api.post('/v1/products', data),
  update: (id, data) => api.put(`/v1/products/${id}`, data),
  delete: (id) => api.delete(`/v1/products/${id}`),
  getOptions: (productId) => api.get(`/products/${productId}/options`),
};

export const productAmountService = {
  getAll: () => api.get('/v1/product-amounts'),
  getById: (id) => api.get(`/v1/product-amounts/${id}`),
  getByProduct: (productId) => api.get(`/v1/product-amounts/by-product/${productId}`),
  create: (data) => api.post('/v1/product-amounts', data),
  update: (id, data) => api.put(`/v1/product-amounts/${id}`, data),
  delete: (id) => api.delete(`/v1/product-amounts/${id}`),
};

export const productTermService = {
  getAll: () => api.get('/v1/product-terms'),
  getById: (id) => api.get(`/v1/product-terms/${id}`),
  getByProduct: (productId) => api.get(`/v1/product-terms/by-product/${productId}`),
  create: (data) => api.post('/v1/product-terms', data),
  update: (id, data) => api.put(`/v1/product-terms/${id}`, data),
  delete: (id) => api.delete(`/v1/product-terms/${id}`),
};

export const productInstallmentOptionService = {
  getAll: () => api.get('/v1/product-installment-options'),
  getById: (id) => api.get(`/v1/product-installment-options/${id}`),
  getByProduct: (productId) => api.get(`/v1/product-installment-options/by-product/${productId}`),
  create: (data) => api.post('/v1/product-installment-options', data),
  update: (id, data) => api.put(`/v1/product-installment-options/${id}`, data),
  delete: (id) => api.delete(`/v1/product-installment-options/${id}`),
};

export const creditScoreRangeService = {
  getAll: () => api.get('/v1/credit-score-ranges'),
  getById: (id) => api.get(`/v1/credit-score-ranges/${id}`),
  getByProduct: (productId) => api.get(`/v1/credit-score-ranges/by-product/${productId}`),
  create: (data) => api.post('/v1/credit-score-ranges', data),
  update: (id, data) => api.put(`/v1/credit-score-ranges/${id}`, data),
  delete: (id) => api.delete(`/v1/credit-score-ranges/${id}`),
};
