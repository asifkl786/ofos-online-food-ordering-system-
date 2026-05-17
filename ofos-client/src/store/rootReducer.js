import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slices/authSlice';
import restaurantReducer from '../features/restaurant/slices/restaurantSlice';
import menuReducer from '../features/menu/slices/menuSlice';
import cartReducer from '../features/cart/slices/cartSlice';
import addressReducer from '../features/address/slices/addressSlice';
import orderReducer from '../features/order/slices/orderSlice'; 
import paymentReducer from '../features/payment/slices/paymentSlice';
import trackingReducer from '../features/tracking/slices/trackingSlice';
import deliveryReducer from '../features/delivery/slices/deliverySlice';
import reviewReducer from '../features/review/slices/reviewSlice';
import walletReducer from '../features/wallet/slices/walletSlice';
import notificationReducer from '../features/notification/slices/notificationSlice';

// ✅ Combine all reducers here
const rootReducer = combineReducers({
  auth: authReducer,              // Auth module reducer
  restaurant: restaurantReducer, // ✅ ADD Restaurant module reducer
  menu: menuReducer,
  cart: cartReducer,
  address: addressReducer,
  order: orderReducer,
  payment: paymentReducer, 
  tracking: trackingReducer,
  delivery: deliveryReducer,
  review: reviewReducer,
  wallet: walletReducer,
  notification: notificationReducer,
  // Add other reducers as we create them
  // cart: cartReducer,
  // restaurant: restaurantReducer,
  // etc.
});

export default rootReducer;