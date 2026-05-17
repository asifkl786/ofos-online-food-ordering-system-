import { useDispatch, useSelector } from 'react-redux';
import { 
  initiatePayment, 
  processMockPayment, 
  clearPayment,
  setPaymentStatus
} from '../slices/paymentSlice';

export const usePayment = () => {
  const dispatch = useDispatch();
  const { currentPayment, paymentStatus, isLoading, error } = useSelector((state) => state.payment);

  const startPayment = (orderId, paymentMethod) => {
    return dispatch(initiatePayment({ orderId, paymentMethod }));
  };

  const processPayment = (orderId, paymentDetails) => {
    return dispatch(processMockPayment({ orderId, paymentDetails }));
  };

  const resetPayment = () => {
    dispatch(clearPayment());
  };

  const updateStatus = (status) => {
    dispatch(setPaymentStatus(status));
  };

  return {
    currentPayment,
    paymentStatus,
    isLoading,
    error,
    startPayment,
    processPayment,
    resetPayment,
    updateStatus,
  };
};