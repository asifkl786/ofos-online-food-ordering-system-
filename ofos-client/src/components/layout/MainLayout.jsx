import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { 
  FiHome, 
  FiShoppingBag, 
  FiShoppingCart, 
  FiUser, 
  FiLogOut, 
  FiBell, 
  FiMenu, 
  FiX,
  FiSearch,
  FiHeart,
  FiStar,
  FiTruck,
  FiShield,
  FiLogIn,
  FiMapPin,
  FiBriefcase
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import CartIcon from '../../features/cart/components/CartIcon';
import NotificationBell from '../../features/notification/components/NotificationBell';


export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ========== REFS FOR OUTSIDE CLICK DETECTION ==========
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const profileCloseTimerRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  // ========== OUTSIDE CLICK HANDLER - Profile dropdown close ==========
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if profile dropdown is open
      if (!isProfileOpen) return;
      
      // Check if click is inside profile menu
      const isClickInsideMenu = profileMenuRef.current?.contains(event.target);
      
      // Check if click is on profile button
      const isClickOnButton = profileButtonRef.current?.contains(event.target);
      
      // If click is outside both menu AND button, close the dropdown
      if (!isClickInsideMenu && !isClickOnButton) {
        setIsProfileOpen(false);
      }
    };

    // Add event listener when profile is open
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]); // ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ Re-run when isProfileOpen changes

  // ========== ESC KEY HANDLER - Close dropdown on Escape key ==========
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isProfileOpen) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isProfileOpen]);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
    navigate('/login');
  };

  const roleLabels = {
    ADMIN: 'Admin',
    CUSTOMER: 'Customer',
    RESTAURANT_OWNER: 'Restaurant Owner',
    DELIVERY_PARTNER: 'Delivery Partner',
  };

  const roleLabel = roleLabels[user?.role] || 'User';

  const navLinksByRole = {
    ADMIN: [
      { path: '/admin/dashboard', name: 'Dashboard', icon: FiShield },
    ],
    RESTAURANT_OWNER: [
      { path: '/owner/restaurants', name: 'Restaurants', icon: FiHome },
      { path: '/owner/orders', name: 'Orders', icon: FiShoppingBag },
    ],
    DELIVERY_PARTNER: [
      { path: '/delivery/dashboard', name: 'Deliveries', icon: FiTruck },
      { path: '/orders', name: 'My Orders', icon: FiShoppingBag },
    ],
    CUSTOMER: [
      { path: '/', name: 'Home', icon: FiHome },
      { path: '/orders', name: 'My Orders', icon: FiShoppingBag },
      { path: '/favorites', name: 'Favorites', icon: FiHeart },
      { path: '/offers', name: 'Offers', icon: FiStar },
    ],
  };

  const navLinks = navLinksByRole[user?.role] || navLinksByRole.CUSTOMER;

  const profileLinksByRole = {
    ADMIN: [
      { name: 'Admin Dashboard', icon: FiShield, path: '/admin/dashboard' },
      { name: 'My Profile', icon: FiUser, path: '/profile' },
      { name: 'Notifications', icon: FiBell, path: '/notifications' },
    ],
    RESTAURANT_OWNER: [
      { name: 'My Profile', icon: FiUser, path: '/profile' },
      { name: 'My Restaurants', icon: FiHome, path: '/owner/restaurants' },
      { name: 'Restaurant Orders', icon: FiShoppingBag, path: '/owner/orders' },
      { name: 'My Wallet', icon: FiBriefcase, path: '/wallet' },
      { name: 'Notifications', icon: FiBell, path: '/notifications' },
    ],
    DELIVERY_PARTNER: [
      { name: 'My Profile', icon: FiUser, path: '/profile' },
      { name: 'Delivery Dashboard', icon: FiTruck, path: '/delivery/dashboard' },
      { name: 'My Orders', icon: FiShoppingBag, path: '/orders' },
      { name: 'My Wallet', icon: FiBriefcase, path: '/wallet' },
      { name: 'Notifications', icon: FiBell, path: '/notifications' },
    ],
    CUSTOMER: [
      { name: 'My Profile', icon: FiUser, path: '/profile' },
      { name: 'My Orders', icon: FiShoppingBag, path: '/orders' },
      { name: 'My Addresses', icon: FiMapPin, path: '/addresses' },
      { name: 'My Wallet', icon: FiBriefcase, path: '/wallet' },
      { name: 'Notifications', icon: FiBell, path: '/notifications' },
    ],
  };

  const profileLinks = profileLinksByRole[user?.role] || profileLinksByRole.CUSTOMER;
  const mobileAccountLinks = profileLinks.filter((link) => link.path !== location.pathname);

  const openProfileMenu = () => {
    if (profileCloseTimerRef.current) {
      clearTimeout(profileCloseTimerRef.current);
    }
    setIsProfileOpen(true);
  };

  const closeProfileMenuWithDelay = () => {
    profileCloseTimerRef.current = setTimeout(() => setIsProfileOpen(false), 140);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-lg' 
          : 'bg-white shadow-md'
        }
      `}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 bg-linear-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-xl">OF</span>
              </motion.div>
              <span className="text-xl font-bold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Online Food
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`
                      relative px-4 py-2 rounded-lg transition-all duration-200
                      flex items-center space-x-2
                      ${isActive 
                        ? 'text-orange-600 bg-orange-50' 
                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                      }
                    `}
                  >
                    <link.icon className="w-4 h-4" />
                    <span className="font-medium">{link.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                <FiSearch className="w-5 h-5" />
              </button>

              {/* Cart Icon */}
              {/* <Link to="/cart" className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                <FiShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link> */}
               {/* Notification Bell - ADD THIS */}
               <NotificationBell />
               {/* ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ CART ICON - ADDED HERE */}
              <CartIcon />

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative" onMouseEnter={openProfileMenu} onMouseLeave={closeProfileMenuWithDelay}>
                  {/* PROFILE BUTTON - Added ref */}
                  <button
                    ref={profileButtonRef}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 focus:outline-none group"
                  >
                    <div className="w-9 h-9 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md group-hover:scale-105 transition-transform">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <span className="hidden lg:flex flex-col items-start leading-tight">
                      <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">
                        {user?.firstName}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-600">
                        {roleLabel}
                      </span>
                    </span>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      // ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ PROFILE DROPDOWN - Added ref for outside click detection
                      <motion.div
                        ref={profileMenuRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                      >
                        {/* User Info */}
                        <div className="p-4 bg-linear-to-r from-orange-500 to-red-500 text-white">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-500 font-bold text-xl">
                              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                              <p className="text-sm text-orange-100">{user?.email}</p>
                              <span className="mt-2 inline-flex rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">{roleLabel}</span>
                            </div>
                          </div>
                        </div>
                        {/* Menu Items */}
                        <div className="py-2">
                          {profileLinks.map((link, index) => (
                            <Link
                              key={link.path || link.name}
                              to={link.path}
                              className={`flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors ${index === 1 ? 'border-t border-gray-100 mt-1 pt-3' : ''}`}
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <link.icon className="w-4 h-4 mr-3" />
                              {link.name}
                            </Link>
                          ))}
                          <div className="border-t border-gray-100 my-2"></div>
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              handleLogout();
                            }}
                            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <FiLogOut className="w-4 h-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-linear-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <FiLogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`
                        flex items-center space-x-3 px-3 py-3 rounded-lg transition-all
                        ${isActive 
                          ? 'bg-orange-50 text-orange-600' 
                          : 'text-gray-600 hover:bg-gray-50'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <link.icon className="w-5 h-5" />
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  );
                })}
                <div className="border-t border-gray-100 my-2 pt-2">
                  {mobileAccountLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <link.icon className="w-5 h-5" />
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-linear-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">OF</span>
                </div>
                <span className="text-xl font-bold">Online Food</span>
              </div>
              <p className="text-gray-400 text-sm">
                Delicious food delivered to your doorstep. Order from the best restaurants in town.
              </p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.374-11.771c0-.214-.005-.427-.015-.639A10.05 10.05 0 0024 4.57z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.302 3.438 9.8 8.205 11.387.6.113.82-.26.82-.58 0-.287-.01-1.05-.015-2.06-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.082-.73.082-.73 1.205.085 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-orange-500 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-orange-500 transition-colors">Contact Us</Link></li>
                <li><Link to="/faq" className="text-gray-400 hover:text-orange-500 transition-colors">FAQ</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-orange-500 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-gray-400 hover:text-orange-500 transition-colors">Help Center</Link></li>
                <li><Link to="/track-order" className="text-gray-400 hover:text-orange-500 transition-colors">Track Order</Link></li>
                <li><Link to="/refund" className="text-gray-400 hover:text-orange-500 transition-colors">Refund Policy</Link></li>
                <li><Link to="/delivery" className="text-gray-400 hover:text-orange-500 transition-colors">Delivery Info</Link></li>
              </ul>
            </div>

            {/* Download App */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Download App</h3>
              <p className="text-gray-400 text-sm mb-4">Get the best food experience with our mobile app</p>
              <div className="flex space-x-3">
                <a href="#" className="bg-gray-800 rounded-lg px-4 py-2 flex items-center space-x-2 hover:bg-gray-700 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.523 15.3414c-.3459.6918-.7363 1.2646-1.1578 1.7182-.6386.6918-1.1645.7557-1.5423.7557-.3935 0-.8403-.0999-1.2904-.2003-.6488-.1412-1.298-.2824-1.9394-.2824-.6889 0-1.3495.1455-1.9961.2938-.456.1049-.9091.2092-1.3424.2092-.3821 0-.9145-.0624-1.5577-.7528-.4692-.5022-.8916-1.219-1.2481-2.1267-.4698-1.1944-.7475-2.5219-.7645-3.7894-.0098-.6575.1068-1.3068.3549-1.8992.3818-.9112 1.0831-1.676 1.9151-2.0934.7843-.3943 1.6674-.5252 2.449-.3943.3704.0614.7299.1949 1.0835.326.3688.1365.7375.2731 1.1145.2731.3863 0 .7755-.1408 1.1642-.2816.4282-.1555.8648-.3141 1.2938-.3141.3206 0 1.7039.0675 2.6177 1.3445-2.0164 1.211-1.2249 3.6739.1975 4.6595-.3865.6242-.8862 1.1613-1.3412 1.6071zM16.301 3.532c.7579-.9553 1.2792-2.2703 1.101-3.532-1.0844.054-2.4294.7351-3.2115 1.706-.7072.8712-1.2846 2.165-1.0631 3.4336 1.1632.061 2.347-.6006 3.1736-1.6076z"/>
                  </svg>
                  <div>
                    <p className="text-xs">Download on</p>
                    <p className="text-sm font-semibold">App Store</p>
                  </div>
                </a>
                <a href="#" className="bg-gray-800 rounded-lg px-4 py-2 flex items-center space-x-2 hover:bg-gray-700 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186c-.333-.333-.61-.849-.61-1.326V3.14c0-.478.277-.993.61-1.326zM14.5 12.5l-10 10L21 12 4.5 1.5l10 10z"/>
                  </svg>
                  <div>
                    <p className="text-xs">Get it on</p>
                    <p className="text-sm font-semibold">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Online Food Ordering System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}







