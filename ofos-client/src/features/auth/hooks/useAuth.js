import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  clearError,
} from '../slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const handleRegister = useCallback(
    async (userData) => {
      const result = await dispatch(register(userData));
      return result;
    },
    [dispatch]
  );

  const handleLogin = useCallback(
    async (credentials) => {
      const result = await dispatch(login(credentials));
      return result;
    },
    [dispatch]
  );

  const handleGetProfile = useCallback(async () => {
    const result = await dispatch(getProfile());
    return result;
  }, [dispatch]);

  const handleUpdateProfile = useCallback(
    async (userId, userData) => {
      const result = await dispatch(updateProfile({ userId, userData }));
      return result;
    },
    [dispatch]
  );

  const handleChangePassword = useCallback(
    async (userId, passwordData) => {
      const result = await dispatch(changePassword({ userId, passwordData }));
      return result;
    },
    [dispatch]
  );

  const handleLogout = useCallback(async () => {
    const result = await dispatch(logout());
    return result;
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    register: handleRegister,
    login: handleLogin,
    getProfile: handleGetProfile,
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    logout: handleLogout,
    clearError: handleClearError,
  };
};