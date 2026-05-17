import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { lazy, Suspense } from 'react';
import Loader from './components/common/Loader';
import PrivateRoute from './components/routes/PrivateRoute';
import { RoleBasedRoute } from './components/routes/PrivateRoute';
import PublicRoute from './components/routes/PublicRoute';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Lazy load pages
const Login = lazy(() => import('./features/auth/components/Login'));
const RegisterEnhance = lazy(() => import('./features/auth/components/RegisterEnhance'));
const ForgotPassword = lazy(() => import('./features/auth/components/ForgotPassword'));
const ResetPassword = lazy(() => import('./features/auth/components/ResetPassword'));
const Profile = lazy(() => import('./features/auth/components/Profile'));
// Cart Module Pages
const CartPage = lazy(() => import('./features/cart/pages/CartPage'));
// Address Module Pages
const AddressPage = lazy(() => import('./features/address/pages/AddressPage'));
// Order Module Pages
const CheckoutPage = lazy(() => import('./features/order/pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./features/order/pages/OrderSuccessPage'));
const OrderListPage = lazy(() => import('./features/order/pages/OrderListPage'));
const OrderDetailPage = lazy(() => import('./features/order/pages/OrderDetailPage'));
// âœ… Payment Module Pages
const PaymentSuccess = lazy(() => import('./features/payment/components/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./features/payment/components/PaymentFailed'));

// âœ… Restaurant Module Pages
const RestaurantList = lazy(() => import('./features/restaurant/pages/RestaurantList'));
const RestaurantDetail = lazy(() => import('./features/restaurant/pages/RestaurantDetail'));
// âœ… Tracking Module Pages
const TrackingPage = lazy(() => import('./features/tracking/pages/TrackingPage'));
const DeliveryPartnerRegistration = lazy(() => import('./features/delivery/pages/DeliveryPartnerRegistration'));
const DeliveryDashboard = lazy(() => import('./features/delivery/pages/DeliveryDashboard'));
// âœ… Review Module Pages 
const ReviewPage = lazy(() => import('./features/review/pages/ReviewPage'));
// âœ… Wallet Module Pages 
const WalletPage = lazy(() => import('./features/wallet/pages/WalletPage'));
// âœ… Notification Module Pages
const NotificationPage = lazy(() => import('./features/notification/pages/NotificationPage'));
// âœ… Owner Restaurant Pages
const OwnerRestaurantPage = lazy(() => import('./features/restaurant/pages/OwnerRestaurantPage'));
const OwnerOrderManagementPage = lazy(() => import('./features/order/pages/OwnerOrderManagementPage'));
const AdminDashboard = lazy(() => import('./features/admin/pages/AdminDashboard'));

function HomeRoute() {
  const { user } = useSelector((state) => state.auth);
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user?.role === 'RESTAURANT_OWNER') {
    return <Navigate to="/owner/restaurants" replace />;
  }
  if (user?.role === 'DELIVERY_PARTNER') {
    return <Navigate to="/delivery/dashboard" replace />;
  }
  return <RestaurantList />;
}


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader fullScreen />}>
        <Routes>
          {/* âœ… Public Routes - No authentication required */}
          {/* User not logged in â†’ Authentication pages dikhenge */}
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterEnhance />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Route>
          </Route>

          {/* âœ… Protected Routes - Authentication required */}
          {/* User logged in â†’ Main app dikhega */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              {/* Home page - Restaurant list */}
              <Route path="/" element={<HomeRoute />} />
              <Route path="/restaurant/:id" element={<RestaurantDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/addresses" element={<AddressPage />} />
              {/* // Order Module routes */}
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/orders" element={<OrderListPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />

               {/* // payment module routes */}
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-failed" element={<PaymentFailed />} />
                {/* // tracking module routes */}
                <Route path="/tracking/:orderId" element={<TrackingPage />} />
                {/* // Add these routes (protected, only delivery partner) */}
                <Route path="/delivery/register" element={<DeliveryPartnerRegistration />} />
                <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
                 {/* âœ… Review Module Route - ADD THIS */}
                 <Route path="/reviews/:id" element={<ReviewPage />} />
                 <Route path="/wallet" element={<WalletPage />} />
                 <Route path="/notifications" element={<NotificationPage />} />
                                  <Route
                  path="/owner/restaurants"
                  element={(
                    <RoleBasedRoute allowedRoles={['RESTAURANT_OWNER']}>
                      <OwnerRestaurantPage />
                    </RoleBasedRoute>
                  )}
                 />
                 <Route
                  path="/owner/orders"
                  element={(
                    <RoleBasedRoute allowedRoles={['RESTAURANT_OWNER']}>
                      <OwnerOrderManagementPage />
                    </RoleBasedRoute>
                  )}
                 />
                 <Route
                  path="/admin/dashboard"
                  element={(
                    <RoleBasedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </RoleBasedRoute>
                  )}
                 />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}



