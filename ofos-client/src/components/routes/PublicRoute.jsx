import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiInfo, FiUserCheck, FiArrowRight } from 'react-icons/fi';

const PublicRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const [showMessage, setShowMessage] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');

  // Get the page user was trying to access
  const from = location.state?.from?.pathname || '/';
  
  // Set redirect message based on the page
  useEffect(() => {
    if (isAuthenticated && from !== '/') {
      setRedirectMessage(`You are already logged in. Redirecting to ${from === '/' ? 'home' : 'the requested page'}...`);
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, from]);

  // If user is already logged in and trying to access auth pages
  if (isAuthenticated) {
    // Don't redirect if already on home page
    if (from === '/') {
      return <Outlet />;
    }
    
    return (
      <>
        {/* Info Toast */}
        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-lg p-4 min-w-[320px]">
                <div className="flex items-start space-x-3">
                  <div className="shrink-0">
                    <FiUserCheck className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">Already Logged In</p>
                    <p className="text-sm text-blue-600 mt-1">{redirectMessage}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Navigate to={from === '/' ? '/' : from} replace />
      </>
    );
  }

  // For public routes, render the child routes
  return <Outlet />;
};

// Component for showing login/signup prompt on public pages
export const AuthPrompt = ({ message, show = true }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isAuthenticated || !show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-linear-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6 border border-orange-200"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <FiInfo className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-gray-700">{message || 'Sign in to unlock more features!'}</p>
            <p className="text-sm text-gray-500">Get personalized recommendations and track your orders</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <a
            href="/login"
            state={{ from: location.pathname }}
            className="px-4 py-2 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium inline-flex items-center space-x-2"
          >
            <span>Login</span>
            <FiArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/register"
            className="px-4 py-2 border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-all text-sm font-medium"
          >
            Sign Up
          </a>
        </div>
      </div>
    </motion.div>
  );
};

// Component for role-based public content
export const PublicContent = ({ children, requireAuth = false, fallback }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (requireAuth && !isAuthenticated) {
    return fallback || <AuthPrompt message="This content is only available to logged-in users" />;
  }

  return children;
};

export default PublicRoute;