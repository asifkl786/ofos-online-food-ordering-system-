import { useEffect , useState} from 'react';
import { useParams, useNavigate,Link } from 'react-router-dom';
import { useOrder } from '../hooks/useOrder';
import { useDelivery } from '../../delivery/hooks/useDelivery';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import OrderStatusBadge from '../components/OrderStatusBadge';
import OrderTimeline from '../components/OrderTimeline';
import { formatCurrency, formatDate } from '../utils/orderHelpers';
import { FiArrowLeft, FiTruck, FiMapPin, FiPhone, FiClock } from 'react-icons/fi';
import DeliveryAssignmentModal from '../../delivery/components/DeliveryAssignmentModal';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { assign } = useDelivery();
  const { currentOrder, isLoading, getOrderById, cancelUserOrder } = useOrder();
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    if (id) {
      getOrderById(id);
    }
  }, [id]);

  // Handle Assign function
  const handleAssignPartner = async (orderId, partnerId) => {  // ✅ NEW FUNCTION
    await assign(orderId, partnerId);
    getOrderById(id);
  };
 
  // Handle cancel order
  const handleCancelOrder = async () => {
    const reason = prompt('Please tell us why you want to cancel this order:');
    if (reason) {
      await cancelUserOrder(id, reason);
      getOrderById(id);
    }
  };
   
  // ============================================================
  // CHANGE 6: ADD USER ROLE VARIABLE (After loading checks)
  // ============================================================
   const userRole = user?.role;
  // ✅ SHOW LOADING STATE - Jab data load ho raha ho
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  // ✅ SHOW NOT FOUND STATE - Agar order exist nahi karta
  if (!currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-700">Order not found</h2>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 text-orange-500"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // ✅ Ab currentOrder safely use kar sakte hain (data available hai)
  const canCancel = ['PENDING', 'CONFIRMED'].includes(currentOrder.status);
  const canAssign = userRole === 'RESTAURANT_OWNER' && currentOrder.status === 'READY_FOR_PICKUP';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
        <div className="mb-6">
          <Link
            to={`/tracking/${currentOrder.id}`}
            className="flex-1 bg-orange-500 text-white py-2 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <FiMapPin className="w-4 h-4" /> Track Order
          </Link>
           {/* ✅ NEW - Assign Delivery Partner Button */}
              {canAssign && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="w-full bg-purple-500 text-white py-3 rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FiTruck className="w-5 h-5" /> Assign Delivery Partner
                </button>
              )}
        </div>
        {/* Order Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-800">Order #{currentOrder.orderNumber}</h1>
                <OrderStatusBadge status={currentOrder.status} size="lg" />
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Placed on {formatDate(currentOrder.createdAt)}
              </p>
            </div>
            {canCancel && (
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timeline & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <OrderTimeline order={currentOrder} />
            
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
              <div className="space-y-3">
                {currentOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{item.itemName}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-orange-500">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-500">{formatCurrency(currentOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <FiMapPin className="text-orange-500" /> Delivery Address
              </h3>
              <p className="text-gray-600">
                {currentOrder.deliveryAddress?.streetAddress}, {currentOrder.deliveryAddress?.city}<br />
                {currentOrder.deliveryAddress?.state} - {currentOrder.deliveryAddress?.zipCode}<br />
                {currentOrder.deliveryAddress?.country}
              </p>
              {currentOrder.deliveryAddress?.phoneNumber && (
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                  <FiPhone className="w-3 h-3" /> {currentOrder.deliveryAddress.phoneNumber}
                </p>
              )}
            </div>
            
            {/* Payment Info */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Payment Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="text-gray-700">{currentOrder.paymentMethod || 'Cash on Delivery'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment Status</span>
                  <span className={`font-medium ${
                    currentOrder.paymentStatus === 'SUCCESS' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {currentOrder.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Restaurant Info */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Restaurant Information</h3>
              <p className="font-medium text-gray-800">{currentOrder.restaurant?.name}</p>
              <p className="text-sm text-gray-500 mt-1">{currentOrder.restaurant?.cuisineType}</p>
              {currentOrder.restaurant?.contactPhone && (
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                  <FiPhone className="w-3 h-3" /> {currentOrder.restaurant.contactPhone}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ============================================================ */}
      {/* CHANGE 9: ADD MODAL AT THE BOTTOM */}
      {/* ============================================================ */}
      <DeliveryAssignmentModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        orderId={currentOrder.id}
        onAssign={handleAssignPartner}
      />
    </div>
  );
}