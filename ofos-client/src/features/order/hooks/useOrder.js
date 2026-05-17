import { useDispatch, useSelector } from 'react-redux';
import { 
  createOrder,
  fetchUserOrders,
  fetchOrderById,
  cancelOrder,
  fetchActiveOrdersCount,
  clearCurrentOrder,
  clearOrders
} from '../slices/orderSlice';

export const useOrder = () => {
  const dispatch = useDispatch();
  const { orders, currentOrder, activeOrdersCount, isLoading, error, pagination } = useSelector((state) => state.order);

  const placeOrder = (orderData) => {
    return dispatch(createOrder(orderData));
  };

  const getUserOrders = (page = 0, size = 10) => {
    dispatch(fetchUserOrders({ page, size }));
  };

  const getOrderById = (orderId) => {
    dispatch(fetchOrderById(orderId));
  };

  const cancelUserOrder = (orderId, reason) => {
    return dispatch(cancelOrder({ orderId, reason }));
  };

  const getActiveOrdersCount = () => {
    dispatch(fetchActiveOrdersCount());
  };

  const resetCurrentOrder = () => {
    dispatch(clearCurrentOrder());
  };

  const clearAllOrders = () => {
    dispatch(clearOrders());
  };

  return {
    // State
    orders,
    currentOrder,
    activeOrdersCount,
    isLoading,
    error,
    pagination,
    
    // Actions
    placeOrder,
    getUserOrders,
    getOrderById,
    cancelUserOrder,
    getActiveOrdersCount,
    resetCurrentOrder,
    clearAllOrders,
  };
};