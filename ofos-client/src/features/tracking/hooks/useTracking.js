import { useDispatch, useSelector } from 'react-redux';
import { fetchTrackingDetails, clearTracking, updateStatus } from '../slices/trackingSlice';

export const useTracking = () => {
  const dispatch = useDispatch();
  const { order,isLoading, error } = useSelector((state) => state.tracking);

  const getTrackingDetails = (orderId) => {
    dispatch(fetchTrackingDetails(orderId));
  };

  const resetTracking = () => {
    dispatch(clearTracking());
  };

  const changeStatus = (status) => {
    dispatch(updateStatus(status));
  };

  return {
    order,
    isLoading,
    error,
    getTrackingDetails,
    resetTracking,
    changeStatus,
  };
};