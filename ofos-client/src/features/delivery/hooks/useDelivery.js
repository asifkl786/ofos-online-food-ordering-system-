import { useDispatch, useSelector } from 'react-redux';
import {
  registerPartner,
  getPartnerProfile,
  updateAvailability,
  getAvailablePartners,
  assignPartner,
  updateAssignmentStatus,
  getPartnerAssignments,
  getEarnings,
  clearDelivery,
} from '../slices/deliverySlice';

export const useDelivery = () => {
  const dispatch = useDispatch();
  const { profile, assignments, availablePartners, earnings, isLoading, error } = useSelector(
    (state) => state.delivery
  );

  const register = (partnerData) => {
    return dispatch(registerPartner(partnerData));
  };

  const getProfile = () => {
    dispatch(getPartnerProfile());
  };

  const setAvailability = (isAvailable) => {
    return dispatch(updateAvailability(isAvailable));
  };

  const fetchAvailablePartners = (orderId) => {
    dispatch(getAvailablePartners(orderId));
  };

  const assign = (orderId, partnerId) => {
    return dispatch(assignPartner({ orderId, partnerId }));
  };

  const updateStatus = (assignmentId, status, reason = null) => {
    return dispatch(updateAssignmentStatus({ assignmentId, status, reason }));
  };

  const fetchAssignments = () => {
    dispatch(getPartnerAssignments());
  };

  const fetchEarnings = () => {
    dispatch(getEarnings());
  };

  const clear = () => {
    dispatch(clearDelivery());
  };

  return {
    // State
    profile,
    assignments,
    availablePartners,
    earnings,
    isLoading,
    error,
    // Actions
    register,
    getProfile,
    setAvailability,
    fetchAvailablePartners,
    assign,
    updateStatus,
    fetchAssignments,
    fetchEarnings,
    clear,
  };
};