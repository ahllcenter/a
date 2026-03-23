import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('anbar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('anbar_token');
      localStorage.removeItem('anbar_user');
      window.location.href = '/register';
    }
    return Promise.reject(err);
  }
);

// Auth
export const registerUser = (data: { name: string; phone: string; city: string; password: string; lat?: number; lng?: number }) =>
  api.post('/auth/register', data);

export const verifyOTP = (data: { phone: string; code: string }) =>
  api.post('/auth/verify-otp', data);

export const loginUser = (data: { phone: string; password: string }) =>
  api.post('/auth/login', data);

export const sendResetCode = (data: { phone: string }) =>
  api.post('/auth/send-reset-code', data);

export const resetPassword = (data: { phone: string; code: string; newPassword: string }) =>
  api.post('/auth/reset-password', data);

export const getMe = () =>
  api.get('/auth/me');

// Location
export const updateLocation = (data: { lat: number; lng: number }) =>
  api.post('/location/update', data);

// Alerts
export const getAlerts = () =>
  api.get('/alerts');

export const getAllAlerts = () =>
  api.get('/alerts/all');

export const createAlert = (data: {
  title: string;
  description: string;
  category: string;
  severity: string;
  alert_type: 'geo' | 'city' | 'broadcast';
  target_lat?: number;
  target_lng?: number;
  target_radius_km?: number;
  target_cities?: string[];
  location_label?: string;
}) => api.post('/alerts', data);

export const deleteAlert = (id: number) =>
  api.delete(`/alerts/${id}`);

// Admin
export const adminLogin = (data: { username: string; password: string }) =>
  api.post('/admin/login', data);

export const adminVerify = () => {
  const adminToken = localStorage.getItem('anbar_admin_token');
  return api.get('/admin/verify', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
};

export const getAdminStats = () => {
  const adminToken = localStorage.getItem('anbar_admin_token');
  return api.get('/admin/stats', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
};

export const getAdminUsers = () => {
  const adminToken = localStorage.getItem('anbar_admin_token');
  return api.get('/admin/users', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
};

export const adminCreateAlert = (data: {
  title: string;
  description: string;
  category: string;
  severity: string;
  alert_type: 'geo' | 'city' | 'broadcast';
  target_lat?: number;
  target_lng?: number;
  target_radius_km?: number;
  target_cities?: string[];
  location_label?: string;
}) => {
  const adminToken = localStorage.getItem('anbar_admin_token');
  return api.post('/alerts', data, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
};

export const adminDeleteAlert = (id: number) => {
  const adminToken = localStorage.getItem('anbar_admin_token');
  return api.delete(`/alerts/${id}`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
};

export const adminGetAllAlerts = () => {
  const adminToken = localStorage.getItem('anbar_admin_token');
  return api.get('/alerts/all', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
};

// Inquiries (user)
export const submitInquiry = (data: { subject: string; message: string }) =>
  api.post('/inquiries', data);

export const getMyInquiries = () =>
  api.get('/inquiries');

// Reports (user)
export const submitReport = (data: {
  report_type: string;
  title: string;
  description: string;
  lat?: number;
  lng?: number;
  location_label?: string;
}) => api.post('/reports', data);

export const getMyReports = () =>
  api.get('/reports');

// Messages (user)
export const getMyMessages = () =>
  api.get('/messages');

// Admin: Inquiries
export const adminGetInquiries = () => {
  const adminToken = localStorage.getItem('anbar_admin_token');
  return api.get('/inquiries/all', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
};

export const adminReplyInquiry = (id: number, reply: string) => {
  const adminToken = localStorage.getItem('anbar_admin_token');
  return api.put(`/inquiries/${id}/reply`, { reply }, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
};

// Admin: Reports
export const adminGetReports = () => {
  const adminToken = localStorage.getItem('anbar_admin_token');
  return api.get('/reports/all', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
};

export const adminUpdateReportStatus = (id: number, status: string, admin_notes?: string) => {
  const adminToken = localStorage.getItem('anbar_admin_token');
  return api.put(`/reports/${id}/status`, { status, admin_notes }, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
};

// Admin: Messages
export const adminSendMessage = (data: {
  target_type: 'all' | 'user' | 'city';
  target_user_id?: number;
  target_city?: string;
  title: string;
  content: string;
}) => {
  const adminToken = localStorage.getItem('anbar_admin_token');
  return api.post('/messages', data, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
};

export const adminGetMessages = () => {
  const adminToken = localStorage.getItem('anbar_admin_token');
  return api.get('/messages/all', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
};

export default api;
