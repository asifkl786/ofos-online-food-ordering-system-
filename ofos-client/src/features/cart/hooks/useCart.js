import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart,
  getCartCount,
  resetCart
} from '../slices/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const { 
    items, 
    restaurantId,
    restaurantName,
    totalItems, 
    totalAmount,
    deliveryFee,
    tax,
    grandTotal,
    isEmpty, 
    isLoading, 
    error 
  } = useSelector((state) => state.cart);

  const getCart = () => {
    dispatch(fetchCart());
  };

  const addItemToCart = (menuItemId, quantity, specialInstructions = '') => {
    return dispatch(addToCart({ menuItemId, quantity, specialInstructions }));
  };

  const updateItemQuantity = (cartItemId, quantity) => {
    return dispatch(updateCartItem({ cartItemId, quantity }));
  };

  const removeItemFromCart = (cartItemId) => {
    return dispatch(removeFromCart(cartItemId));
  };

  const clearAllCart = () => {
    return dispatch(clearCart());
  };

  const resetCartState = () => {
    dispatch(resetCart());
  };

  const fetchCartCount = () => {
    dispatch(getCartCount());
  };

  return {
    // State
    items,
    restaurantId,
    restaurantName,
    totalItems,
    totalAmount,
    deliveryFee,
    tax,
    grandTotal,
    isEmpty,
    isLoading,
    error,
    
    // Actions
    getCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearAllCart,
    resetCartState,
    fetchCartCount,
  };
};