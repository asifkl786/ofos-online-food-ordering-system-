import api from '../axiosConfig';

export const authEndpoints = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userId, data) => api.put(`/users/${userId}`, data),
  changePassword: (userId, data) => api.post(`/users/${userId}/change-password`, data),
  logout: (accessToken) => api.post('/auth/logout', { accessToken }),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};