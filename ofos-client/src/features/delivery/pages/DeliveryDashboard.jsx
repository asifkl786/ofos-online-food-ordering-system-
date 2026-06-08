import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../hooks/useDelivery';
import DeliveryStatusBadge from '../components/DeliveryStatusBadge';
import EarningsCard from '../components/EarningsCard';
import { FiArrowLeft, FiLoader, FiMapPin, FiPhone, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { formatDate } from '../utils/deliveryHelpers';

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false);
  const authUser = useSelector((state) => state.auth.user);
  const { 
    profile, 
    assignments, 
    earnings,
    isLoading, 
    getProfile, 
    fetchAssignments, 
    fetchEarnings,
    setAvailability,
    updateStatus 
  } = useDelivery();

  useEffect(() => {
    getProfile();
    fetchAssignments();
    fetchEarnings();
  }, []);

  const handleStatusUpdate = async (assignmentId, currentStatus) => {
    let nextStatus = '';
    if (currentStatus === 'PENDING') nextStatus = 'ACCEPTED';
    else if (currentStatus === 'ACCEPTED') nextStatus = 'PICKED_UP';
    else if (currentStatus === 'PICKED_UP') nextStatus = 'DELIVERED';
    
    if (nextStatus) {
      await updateStatus(assignmentId, nextStatus);
      fetchAssignments();
      fetchEarnings();
      getProfile();
    }
  };

  const isOnline = profile?.isAvailable || String(profile?.status || '').toUpperCase() === 'ONLINE';

  const handleBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
      return;
    }

    navigate('/orders');
  };

  const handleAvailabilityToggle = async () => {
    if (availabilityUpdating) return;

    setAvailabilityUpdating(true);
    try {
      await setAvailability(!isOnline).unwrap();
      getProfile();
    } finally {
      setAvailabilityUpdating(false);
    }
  };

  const activeAssignments = assignments?.filter(a =>
    ['PENDING', 'ACCEPTED', 'PICKED_UP'].includes(String(a.assignmentStatus || a.status || '').toUpperCase())
  ) || [];

  const completedAssignments = assignments?.filter(a =>
    ['DELIVERED', 'CANCELLED'].includes(String(a.assignmentStatus || a.status || '').toUpperCase())
  ) || [];

  const authUserName = [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ');
  const nestedProfileName = [profile?.user?.firstName, profile?.user?.lastName].filter(Boolean).join(' ');
  const profileName = profile?.name || nestedProfileName || authUserName || 'Delivery Partner';
  const profilePhone = profile?.phoneNumber || profile?.user?.phoneNumber || authUser?.phoneNumber || 'Not available';
  const profileRating = profile?.averageRating ?? profile?.rating ?? 4.8;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚚</div>
          <h2 className="text-xl font-semibold text-gray-700">Not Registered</h2>
          <p className="text-gray-500 mt-2">You are not registered as a delivery partner</p>
          <button
            onClick={() => window.location.href = '/delivery/register'}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg"
          >
            Register Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-orange-100 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="bg-linear-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
              <p className="text-orange-100 mt-1">Welcome back, {profileName}!</p>
            </div>
            <button
              onClick={handleAvailabilityToggle}
              disabled={availabilityUpdating}
              className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl font-medium transition disabled:cursor-not-allowed disabled:opacity-80 ${
                isOnline ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              {availabilityUpdating ? (
                <><FiLoader className="w-5 h-5 animate-spin" /> Updating...</>
              ) : isOnline ? (
                <><FiToggleRight className="w-5 h-5" /> Online</>
              ) : (
                <><FiToggleLeft className="w-5 h-5" /> Offline</>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Active Deliveries */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Deliveries</h2>
              {activeAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🛵</div>
                  <p className="text-gray-500">No active deliveries</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAssignments.map((assignment) => (
                    <div key={assignment.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Order #{assignment.orderNumber}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {assignment.restaurantName} → {assignment.customerAddress || 'Customer address'}
                          </p>
                        </div>
                        <DeliveryStatusBadge status={assignment.assignmentStatus} />
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiMapPin className="w-3 h-3" /> {assignment.distanceInKm?.toFixed(1)} km
                          </span>
                          <span className="flex items-center gap-1">
                            <FiPhone className="w-3 h-3" /> {assignment.customerPhone}
                          </span>
                        </div>
                        {assignment.assignmentStatus !== 'DELIVERED' && (
                          <button
                            onClick={() => handleStatusUpdate(assignment.id, assignment.assignmentStatus)}
                            className="cursor-pointer px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
                          >
                            {assignment.assignmentStatus === 'PENDING' ? 'Accept Delivery' :
                             assignment.assignmentStatus === 'ACCEPTED' ? 'Mark Picked Up' : 
                             assignment.assignmentStatus === 'PICKED_UP' ? 'Mark Delivered' : 'Accept'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Deliveries */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Completed Deliveries</h2>
              {completedAssignments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No completed deliveries yet</p>
              ) : (
                <div className="space-y-3">
                  {completedAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-sm">Order #{assignment.orderNumber}</p>
                        <p className="text-xs text-gray-500">{formatDate(assignment.deliveredAt)}</p>
                      </div>
                      <span className="text-green-600 font-medium">+₹{assignment.deliveryFee}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Profile & Earnings */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Profile</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="text-right font-medium text-gray-700">{profileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-right font-medium text-gray-700">{profilePhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="text-gray-700">{profile.vehicleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicle No</span>
                  <span className="text-gray-700">{profile.vehicleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rating</span>
                  <span className="text-yellow-500">⭐ {profileRating}</span>
                </div>
              </div>
            </div>

            {/* Earnings */}
            <EarningsCard earnings={earnings} />
          </div>
        </div>
      </div>
    </div>
  );
}
