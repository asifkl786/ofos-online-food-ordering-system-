import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiAlertCircle, FiLock, FiLogIn, FiHome } from 'react-icons/fi';

const PrivateRoute = () => {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      setShowWarning(true);
      const timer = setTimeout(() => setShowWarning(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-pulse"></div>
          {/* Inner spinner */}
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Verifying your access...</p>
        <p className="mt-2 text-sm text-gray-400">Please wait while we check your credentials</p>
      </div>
    );
  }

  // If not authenticated, show warning and redirect to login
  if (!isAuthenticated) {
    return (
      <>
        {/* Warning Toast */}
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-4 min-w-[320px]">
                <div className="flex items-start space-x-3">
                  <div className="shrink-0">
                    <FiAlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Authentication Required</p>
                    <p className="text-sm text-red-600 mt-1">
                      Please log in to access this page
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Redirect to login with return URL */}
        <Navigate to="/login" state={{ from: location.pathname }} replace />
      </>
    );
  }

  // Optional: Role-based access control
  const allowedRoles = ['CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER', 'ADMIN'];
  const userRole = user?.role;

  if (userRole && !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. This area is restricted to specific user roles.
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
            <a
              href="/"
              className="px-6 py-2 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all inline-flex items-center justify-center space-x-2"
            >
              <FiHome className="w-4 h-4" />
              <span>Return to Home</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

// Higher-order component for role-based access
export const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            This page requires {allowedRoles.join(' or ')} role privileges.
          </p>
          <a
            href="/"
            className="inline-flex items-center space-x-2 px-6 py-2 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <FiHome className="w-4 h-4" />
            <span>Go to Home</span>
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;