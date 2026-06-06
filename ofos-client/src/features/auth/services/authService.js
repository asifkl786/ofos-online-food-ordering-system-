import { authEndpoints } from '../../../api/endpoints/authEndpoints';

export const authService = {
  register: async (userData) => {
    const response = await authEndpoints.register(userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await authEndpoints.login(credentials);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await authEndpoints.forgotPassword({ email });
    return response.data;
  },

  resetPassword: async (resetData) => {
    const response = await authEndpoints.resetPassword(resetData);
    return response.data;
  },

  getProfile: async () => {
    const response = await authEndpoints.getProfile();
    return response.data;
  },

  updateProfile: async (userId, userData) => {
    const response = await authEndpoints.updateProfile(userId, userData);
    return response.data;
  },

  changePassword: async (userId, passwordData) => {
    const response = await authEndpoints.changePassword(userId, passwordData);
    return response.data;
  },

  logout: async (accessToken) => {
    const response = await authEndpoints.logout(accessToken);
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await authEndpoints.refreshToken(refreshToken);
    return response.data;
  },
};
