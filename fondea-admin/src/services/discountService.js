import api from '../config/api';

export const discountDefinitionService = {
  getAll: () => api.get('/v1/discount-definitions'),
  getById: (code) => api.get(`/v1/discount-definitions/${code}`),
  create: (data) => api.post('/v1/discount-definitions', data),
  update: (code, data) => api.put(`/v1/discount-definitions/${code}`, data),
  delete: (code) => api.delete(`/v1/discount-definitions/${code}`),
};

export const productDiscountConfigService = {
  getAll: () => api.get('/v1/product-discount-configs'),
  getById: (id) => api.get(`/v1/product-discount-configs/${id}`),
  create: (data) => api.post('/v1/product-discount-configs', data),
  update: (id, data) => api.put(`/v1/product-discount-configs/${id}`, data),
  delete: (id) => api.delete(`/v1/product-discount-configs/${id}`),
};
