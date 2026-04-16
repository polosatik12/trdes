import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const cmsApi = axios.create({
  baseURL: `${API_URL}/cms`,
  headers: { 'Content-Type': 'application/json' },
});

// Auth interceptor
cmsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('cms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect on 401
cmsApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cms_token');
      localStorage.removeItem('cms_user');
      window.location.href = '/cms/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const cmsAuthAPI = {
  login: (username: string, password: string) =>
    cmsApi.post('/auth/login', { username, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    cmsApi.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword }),
};

// Pages (admin)
export const cmsPagesAPI = {
  getAll: () => cmsApi.get('/admin/pages'),
  getById: (id: string) => cmsApi.get(`/admin/pages/${id}`),
  create: (data: { slug: string; title: string; is_published?: boolean }) =>
    cmsApi.post('/admin/pages', data),
  update: (id: string, data: Partial<{ slug: string; title: string; is_published: boolean }>) =>
    cmsApi.put(`/admin/pages/${id}`, data),
  delete: (id: string) => cmsApi.delete(`/admin/pages/${id}`),
};

// Blocks
export const cmsBlocksAPI = {
  create: (data: { page_id: string; block_type: string; sort_order?: number; data?: Record<string, unknown>; is_visible?: boolean }) =>
    cmsApi.post('/admin/blocks', data),
  update: (id: string, data: Record<string, unknown>) =>
    cmsApi.put(`/admin/blocks/${id}`, data),
  delete: (id: string) => cmsApi.delete(`/admin/blocks/${id}`),
  reorder: (blockIds: string[]) =>
    cmsApi.post('/admin/blocks/reorder', { block_ids: blockIds }),
};

// News
export const cmsNewsAPI = {
  getAll: () => cmsApi.get('/admin/news'),
  getById: (id: string) => cmsApi.get(`/admin/news/${id}`),
  create: (data: { title: string; slug: string; is_published?: boolean }) =>
    cmsApi.post('/admin/news', data),
  update: (id: string, data: Record<string, unknown>) =>
    cmsApi.put(`/admin/news/${id}`, data),
  delete: (id: string) => cmsApi.delete(`/admin/news/${id}`),
};

// Assets
export const cmsAssetsAPI = {
  getAll: () => cmsApi.get('/admin/assets'),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return cmsApi.post('/admin/assets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: string) => cmsApi.delete(`/admin/assets/${id}`),
};

// Public
export const cmsPublicAPI = {
  getPage: (slug: string) => cmsApi.get(`/page/${slug}`),
};

export default cmsApi;
