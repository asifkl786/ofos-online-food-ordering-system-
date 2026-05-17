import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTracking } from '../hooks/useTracking';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import ETACountdown from '../components/ETACountdown';
import DeliveryInfoCard from '../components/DeliveryInfoCard';
import OrderInfoCard from '../components/OrderInfoCard';
import TrackingSkeleton from '../components/TrackingSkeleton';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function TrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { order, isLoading, getTrackingDetails, resetTracking } = useTracking();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (orderId) {
      getTrackingDetails(orderId);
    }
    return () => resetTracking();
  }, [orderId]);

  // ye claude ka code h
  // const handleRefresh = async () => {
  //   setIsRefreshing(true);
  //   await getTrackingDetails(orderId);
  //   setTimeout(() => setIsRefreshing(false), 1000);
  // };
    const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchTrackingDetails(orderId)).unwrap();
    } catch (e) {
      // toast is already shown in extraReducers
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  if (isLoading) {
    return <TrackingSkeleton />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-xl font-semibold text-gray-700">Order not found</h2>
          <p className="text-gray-500 mt-2">We couldn't find tracking information for this order</p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  console.log("Fetched order Info from database:",order);
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" /> Back
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
          >
            <FiRefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>🗺️</span> Track Your Order
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Order #{order.orderNumber}
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* ETA Countdown */}
            <ETACountdown order={order} />
            
            {/* Status Timeline */}
            <OrderStatusTimeline order={order} />
          </div>
          
          {/* Right Column - Info Cards */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <DeliveryInfoCard order={order} />
            
            {/* Order Info */}
            <OrderInfoCard order={order} />
          </div>
        </div>
        
        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Need help? Contact our support team at <a href="tel:1800-123-4567" className="text-orange-500">1800-123-4567</a>
          </p>
        </div>
      </div>
    </div>
  );
}