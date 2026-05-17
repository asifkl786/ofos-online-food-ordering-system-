import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAddresses, 
  fetchDefaultAddress,
  addAddress, 
  updateAddress, 
  setDefaultAddress, 
  deleteAddress,
  clearAddresses 
} from '../slices/addressSlice';

export const useAddress = () => {
  const dispatch = useDispatch();
  const { addresses, defaultAddress, isLoading, error } = useSelector((state) => state.address);

  const getAddresses = () => {
    return dispatch(fetchAddresses()).unwrap();
  };

  const getDefaultAddress = () => {
    return dispatch(fetchDefaultAddress()).unwrap();
  };

  const addNewAddress = (addressData) => {
    return dispatch(addAddress(addressData)).unwrap();
  };

  const editAddress = (id, addressData) => {
    return dispatch(updateAddress({ id, addressData })).unwrap();
  };

  const setAsDefault = (id) => {
    return dispatch(setDefaultAddress(id)).unwrap();
  };

  const removeAddress = (id) => {
    return dispatch(deleteAddress(id)).unwrap();
  };

  const clearAllAddresses = () => {
    dispatch(clearAddresses());
  };

  return {
    // State
    addresses,
    defaultAddress,
    isLoading,
    error,
    
    // Actions
    getAddresses,
    getDefaultAddress,
    addNewAddress,
    editAddress,
    setAsDefault,
    removeAddress,
    clearAllAddresses,
  };
};
