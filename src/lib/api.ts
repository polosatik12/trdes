import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  sendVerificationCode: (email: string) =>
    api.post('/auth/send-verification-code', { email }),

  verifyCode: (email: string, code: string) =>
    api.post('/auth/verify-code', { email, code }),

  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  getCurrentUser: () => api.get('/auth/me'),

  changeEmail: (new_email: string, password: string) =>
    api.post('/auth/change-email', { new_email, password }),

  refreshToken: (token: string) =>
    api.post('/auth/refresh', { token }),

  sendPasswordResetCode: (email: string) =>
    api.post('/auth/send-password-reset-code', { email }),

  resetPassword: (email: string, code: string, new_password: string) =>
    api.post('/auth/reset-password', { email, code, new_password }),
};

export const profileAPI = {
  getProfile: () => api.get('/profile'),

  updateProfile: (data: any) => api.put('/profile', data),

  getEmergencyContacts: () => api.get('/profile/emergency-contacts'),

  createEmergencyContact: (data: any) =>
    api.post('/profile/emergency-contacts', data),

  updateEmergencyContact: (id: string, data: any) =>
    api.put(`/profile/emergency-contacts/${id}`, data),

  deleteEmergencyContact: (id: string) =>
    api.delete(`/profile/emergency-contacts/${id}`),
};

export const eventsAPI = {
  getEvents: (status?: string) =>
    api.get('/events', { params: { status } }),

  getEventById: (id: string) => api.get(`/events/${id}`),

  getEventDistances: (id: string) => api.get(`/events/${id}/distances`),

  getEventResults: (id: string, distanceId?: string) =>
    api.get(`/events/${id}/results`, { params: { distance_id: distanceId } }),
};

export const registrationsAPI = {
  getUserRegistrations: () => api.get('/registrations'),

  createRegistration: (data: { event_id: string; distance_id: string }) =>
    api.post('/registrations', data),

  getRegistrationById: (id: string) => api.get(`/registrations/${id}`),

  updateRegistration: (id: string, data: any) =>
    api.put(`/registrations/${id}`, data),

  createCorporateGroup: (data: { event_id: string; members: { member_id: string; distance_id: string }[] }) =>
    api.post('/registrations/corporate-group', data),
};

export const healthCertificatesAPI = {
  getUserCertificates: () => api.get('/health-certificates'),

  createCertificate: (data: any) => api.post('/health-certificates', data),

  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post('/health-certificates/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getCertificateById: (id: string) => api.get(`/health-certificates/${id}`),

  updateCertificate: (id: string, data: any) =>
    api.put(`/health-certificates/${id}`, data),

  deleteCertificate: (id: string) => api.delete(`/health-certificates/${id}`),
};

export const corporateAPI = {
  createApplication: (data: any) => api.post('/corporate/applications', data),
};

export const corporateAccountsAPI = {
  createAccount: (data: any) => api.post('/corporate-accounts', data),
  getAccount: () => api.get('/corporate-accounts'),
  updateAccount: (data: any) => api.put('/corporate-accounts', data),

  // Members
  addMember: (data: any) => api.post('/corporate-accounts/members', data),
  getMembers: () => api.get('/corporate-accounts/members'),
  getMemberById: (id: string) => api.get(`/corporate-accounts/members/${id}`),
  updateMember: (id: string, data: any) => api.put(`/corporate-accounts/members/${id}`, data),
  deleteMember: (id: string) => api.delete(`/corporate-accounts/members/${id}`),
};

export const adminAPI = {
  getAllParticipants: () => api.get('/admin/participants'),
  getParticipantById: (id: string) => api.get(`/admin/participants/${id}`),

  getAllRegistrations: (eventId?: string, paymentStatus?: string) =>
    api.get('/admin/registrations', {
      params: { event_id: eventId, payment_status: paymentStatus },
    }),
  updateRegistration: (id: string, data: any) =>
    api.put(`/admin/registrations/${id}`, data),

  getAllHealthCertificates: (status?: string) =>
    api.get('/admin/health-certificates', { params: { status } }),
  updateHealthCertificate: (id: string, data: any) =>
    api.put(`/admin/health-certificates/${id}`, data),

  getAllCorporateApplications: (status?: string) =>
    api.get('/admin/corporate-applications', { params: { status } }),
  updateCorporateApplication: (id: string, data: any) =>
    api.put(`/admin/corporate-applications/${id}`, data),

  createEvent: (data: any) => api.post('/admin/events', data),
  updateEvent: (id: string, data: any) => api.put(`/admin/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/admin/events/${id}`),

  createDistance: (eventId: string, data: any) =>
    api.post(`/admin/events/${eventId}/distances`, data),
  updateDistance: (id: string, data: any) =>
    api.put(`/admin/distances/${id}`, data),
  deleteDistance: (id: string) => api.delete(`/admin/distances/${id}`),

  createResult: (data: any) => api.post('/admin/results', data),
  updateResult: (id: string, data: any) => api.put(`/admin/results/${id}`, data),
  deleteResult: (id: string) => api.delete(`/admin/results/${id}`),

  getUserRoles: (userId: string) => api.get(`/admin/users/${userId}/roles`),
  addUserRole: (userId: string, role: string) =>
    api.post(`/admin/users/${userId}/roles`, { role }),
  removeUserRole: (userId: string, role: string) =>
    api.delete(`/admin/users/${userId}/roles/${role}`),
};

export const promoCodesAPI = {
  // Public
  validate: (code: string) =>
    api.post('/promo-codes/validate', { code }),
  use: (code: string) =>
    api.post('/promo-codes/use', { code }),

  // Admin
  getAll: () => api.get('/promo-codes'),
  create: (data: any) => api.post('/promo-codes', data),
  update: (id: string, data: any) => api.put(`/promo-codes/${id}`, data),
  delete: (id: string) => api.delete(`/promo-codes/${id}`),
};

export const paymentsAPI = {
  createPayment: (cart: any[]) =>
    api.post('/payments', { cart }),
  getUserPayments: () =>
    api.get('/payments'),
  getPaymentById: (id: string) =>
    api.get(`/payments/${id}`),
};

export const analyticsAPI = {
  getOverview:  () => api.get('/admin/analytics/overview'),
  getGeography: () => api.get('/admin/analytics/geography'),
  getActivity:  () => api.get('/admin/analytics/activity'),
  getEvents:    () => api.get('/admin/analytics/events'),
  getFinance:   () => api.get('/admin/analytics/finance'),
  exportCSV:    (eventId?: string) => {
    const params = eventId ? `?event_id=${eventId}` : '';
    window.open(
      `${import.meta.env.VITE_API_URL || '/api'}/admin/analytics/export${params}`,
      '_blank',
    );
  },
};

export default api;
