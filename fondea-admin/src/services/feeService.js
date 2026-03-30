import api from '../config/api';

export const feeDefinitionService = {
  getAll: () => api.get('/v1/fee-definitions'),
  getById: (code) => api.get(`/v1/fee-definitions/${code}`),
  create: (data) => api.post('/v1/fee-definitions', data),
  update: (code, data) => api.put(`/v1/fee-definitions/${code}`, data),
  delete: (code) => api.delete(`/v1/fee-definitions/${code}`),
};

export const productFeeConfigService = {
  getAll: () => api.get('/v1/product-fee-configs'),
  getById: (id) => api.get(`/v1/product-fee-configs/${id}`),
  create: (data) => api.post('/v1/product-fee-configs', data),
  update: (id, data) => api.put(`/v1/product-fee-configs/${id}`, data),
  delete: (id) => api.delete(`/v1/product-fee-configs/${id}`),
};
