import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiBell, FiBriefcase, FiCalendar, FiChevronRight, FiCreditCard, FiEdit2, FiMail, FiMapPin, FiPhone, FiShield, FiShoppingBag, FiTruck, FiUser } from 'react-icons/fi';
import UpdateProfile from './UpdateProfile';
import ChangePassword from './ChangePassword';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';

export default function Profile() {
  const { user, getProfile, isLoading } = useAuth();
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    getProfile();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleBadge = (role) => {
    const badges = {
      CUSTOMER: 'bg-blue-100 text-blue-800',
      RESTAURANT_OWNER: 'bg-purple-100 text-purple-800',
      DELIVERY_PARTNER: 'bg-green-100 text-green-800',
      ADMIN: 'bg-red-100 text-red-800',
    };
    return badges[role] || 'bg-gray-100 text-gray-800';
  };

  const accountLinksByRole = {
    CUSTOMER: [
      { label: 'My Orders', description: 'View order history and track active orders.', path: '/orders', icon: FiShoppingBag },
      { label: 'Addresses', description: 'Manage delivery addresses and defaults.', path: '/addresses', icon: FiMapPin },
      { label: 'Wallet', description: 'Check balance and wallet transactions.', path: '/wallet', icon: FiBriefcase },
      { label: 'Notifications', description: 'Read updates, order alerts, and messages.', path: '/notifications', icon: FiBell },
      { label: 'Become a Delivery Partner', description: 'Register to start accepting deliveries.', path: '/delivery/register', icon: FiTruck },
    ],
    RESTAURANT_OWNER: [
      { label: 'My Restaurants', description: 'Manage restaurant details and menus.', path: '/owner/restaurants', icon: FiUser },
      { label: 'Restaurant Orders', description: 'Review and update incoming orders.', path: '/owner/orders', icon: FiShoppingBag },
      { label: 'Wallet', description: 'Check payouts and wallet transactions.', path: '/wallet', icon: FiBriefcase },
      { label: 'Notifications', description: 'Read important restaurant updates.', path: '/notifications', icon: FiBell },
    ],
    DELIVERY_PARTNER: [
      { label: 'Delivery Dashboard', description: 'Manage active deliveries and earnings.', path: '/delivery/dashboard', icon: FiTruck },
      { label: 'My Orders', description: 'Review completed delivery orders.', path: '/orders', icon: FiShoppingBag },
      { label: 'Wallet', description: 'Check earnings and wallet transactions.', path: '/wallet', icon: FiBriefcase },
      { label: 'Notifications', description: 'Read delivery alerts and account updates.', path: '/notifications', icon: FiBell },
    ],
    ADMIN: [
      { label: 'Admin Dashboard', description: 'Open admin controls and reporting.', path: '/admin/dashboard', icon: FiShield },
      { label: 'Notifications', description: 'Read system and account notifications.', path: '/notifications', icon: FiBell },
    ],
  };

  const accountLinks = accountLinksByRole[user?.role] || accountLinksByRole.CUSTOMER;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-linear-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-orange-500">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
            <p className="text-orange-100">{user?.email}</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getRoleBadge(user?.role)}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'profile'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'security'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'account'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Account Links
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'payment'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Payment Methods
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpdateProfile(true)}
              icon={<FiEdit2 />}
            >
              Edit Profile
            </Button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <FiUser className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FiMail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium text-gray-900">{user?.phoneNumber || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FiCalendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">{formatDate(user?.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Links Tab */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Account Links</h2>
            <p className="text-sm text-gray-500 mt-1">Your common account pages are grouped here so the header menu stays simple.</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {accountLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="group flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:border-orange-200 hover:bg-orange-50/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 rounded-lg bg-orange-100 p-2 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <link.icon className="w-5 h-5" />
                  </span>
                  <span>
                    <span className="block font-semibold text-gray-900">{link.label}</span>
                    <span className="block text-sm text-gray-500 mt-1">{link.description}</span>
                  </span>
                </div>
                <FiChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <FiShield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-500">Update your password regularly to keep your account secure</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangePassword(true)}
              >
                Change
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
          </div>
          <div className="p-6 text-center py-12">
            <FiCreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No payment methods added yet</p>
            <Button variant="outline" className="mt-4">
              Add Payment Method
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showUpdateProfile && (
        <UpdateProfile onClose={() => setShowUpdateProfile(false)} />
      )}
      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}
