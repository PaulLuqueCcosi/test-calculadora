import api from '../config/api';

const LANDING_CONTACT_ENDPOINT = import.meta.env.VITE_LANDING_CONTACT_ENDPOINT || '/v1/landing/contact';

export const landingContactService = {
  getAll: () => api.get(LANDING_CONTACT_ENDPOINT),
};
