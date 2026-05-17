import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  //=================== outside click popup close function start=================== 

      //  Refs for outside click detection
      const profileMenuRef = useRef(null);
      const profileButtonRef = useRef(null);

     
        // Ã¢Å“â€¦ FIX: Outside click handler - IMPROVED
        useEffect(() => {
          const handleClickOutside = (event) => {
            // Check if profile is open
            if (!isProfileOpen) return;
            
            // Check if click target is inside profile menu
            const isClickInsideMenu = profileMenuRef.current?.contains(event.target);
            
            // Check if click target is the profile button
            const isClickOnButton = profileButtonRef.current?.contains(event.target);
            
            // If click is outside both menu AND button, close the popup
            if (!isClickInsideMenu && !isClickOnButton) {
              setIsProfileOpen(false);
            }
          };

          // Add event listener
          document.addEventListener('mousedown', handleClickOutside);
          
          // Cleanup
          return () => {
            document.removeEventListener('mousedown', handleClickOutside);
          };
        }, [isProfileOpen]);

      //------------------useEffect for ESC key handler-  Start--------------------------
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
      //------------------useEffect for ESC key   End---------------------------

  //==================== outside click popup close function end-================ 

  //----------------------logout method--------------------------
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-linear-to-r from-orange-500 to-red-500 rounded-lg"></div>
            <span className="text-xl font-bold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              OFOS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-orange-500 transition-colors">
              Home
            </Link>
            <Link to="/orders" className="text-gray-700 hover:text-orange-500 transition-colors">
              My Orders
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/cart" className="relative">
                  <FiShoppingCart className="text-xl text-gray-600 hover:text-orange-500" />
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    0
                  </span>
                </Link>

                <div className="relative">
                  <button
                    ref={profileButtonRef}
                    onClick={() =>setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <span className="text-gray-700">{user?.firstName}</span>
                  </button>

                  {isProfileOpen && (
                    <div 
                     ref={profileMenuRef}
                     className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiUser className="mr-2" /> Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        <FiLogOut className="mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-linear-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/orders"
                className="px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Orders
              </Link>
              <Link
                to="/cart"
                className="px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cart
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-left px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-2 py-2 text-orange-600 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}