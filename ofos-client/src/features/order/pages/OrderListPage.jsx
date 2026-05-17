import { useEffect, useState } from 'react';
import { useOrder } from '../hooks/useOrder';
import OrderCard from '../components/OrderCard';
import OrderSkeleton from '../components/OrderSkeleton';
import { FiMapPin, FiPackage, FiPhone } from 'react-icons/fi';
import ReviewForm from '../../review/components/ReviewForm';
import { useReview } from '../../review/hooks/useReview';
import { useAuth } from '../../auth/hooks/useAuth';
import { useDelivery } from '../../delivery/hooks/useDelivery';
import DeliveryStatusBadge from '../../delivery/components/DeliveryStatusBadge';

export default function OrderListPage() {
  const { orders, isLoading, pagination, getUserOrders, cancelUserOrder } = useOrder();
  const { submitReview } = useReview();
  const { user } = useAuth();
  const {
    assignments,
    isLoading: isDeliveryLoading,
    fetchAssignments,
    updateStatus,
  } = useDelivery();
  const [filter, setFilter] = useState('all');
  const [reviewOrder, setReviewOrder] = useState(null);
  const isDeliveryPartner = user?.role === 'DELIVERY_PARTNER';

  useEffect(() => {
    if (isDeliveryPartner) {
      fetchAssignments();
      return;
    }

    getUserOrders(0, 10);
  }, [isDeliveryPartner]);

  const handleDeliveryStatusUpdate = async (assignment) => {
    const nextStatusByCurrent = {
      PENDING: 'ACCEPTED',
      ACCEPTED: 'PICKED_UP',
      PICKED_UP: 'DELIVERED',
    };
    const nextStatus = nextStatusByCurrent[assignment.assignmentStatus];

    if (nextStatus) {
      await updateStatus(assignment.id, nextStatus);
      fetchAssignments();
    }
  };

  const deliveryTabs = [
    { id: 'all', label: 'All Deliveries', count: assignments?.length || 0 },
    { id: 'active', label: 'Active', count: assignments?.filter(a => ['PENDING', 'ACCEPTED', 'PICKED_UP'].includes(a.assignmentStatus)).length || 0 },
    { id: 'delivered', label: 'Delivered', count: assignments?.filter(a => a.assignmentStatus === 'DELIVERED').length || 0 },
    { id: 'cancelled', label: 'Cancelled', count: assignments?.filter(a => ['CANCELLED', 'REJECTED'].includes(a.assignmentStatus)).length || 0 },
  ];

  const filteredAssignments = (assignments || []).filter((assignment) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['PENDING', 'ACCEPTED', 'PICKED_UP'].includes(assignment.assignmentStatus);
    if (filter === 'cancelled') return ['CANCELLED', 'REJECTED'].includes(assignment.assignmentStatus);
    return assignment.assignmentStatus === filter.toUpperCase();
  });

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') {
      return !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status);
    }
    return order.status === filter.toUpperCase();
  });

  const handleRateOrder = (order) => {
    if (order.status !== 'DELIVERED') return;
    setReviewOrder(order);
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Reason for cancellation:');
    if (reason) {
      await cancelUserOrder(orderId, reason);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Orders', count: pagination.totalElements },
    { id: 'active', label: 'Active', count: orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length },
    { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'DELIVERED').length },
    { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'CANCELLED').length },
  ];

  if (isDeliveryPartner) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <FiPackage className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Deliveries</h1>
              <p className="text-sm text-gray-500">Assigned orders aur delivery status manage karein</p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
            {deliveryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`relative cursor-pointer px-4 py-2 text-sm font-medium transition-colors ${
                  filter === tab.id ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
                {filter === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-orange-500" />}
              </button>
            ))}
          </div>

          {isDeliveryLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <OrderSkeleton key={i} />)}
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
              <div className="mb-4 text-5xl">🚚</div>
              <h3 className="text-lg font-semibold text-gray-700">No deliveries found</h3>
              <p className="mt-2 text-gray-500">Restaurant owner assign karega to orders yahan show honge.</p>
              <button
                onClick={() => window.location.href = '/delivery/dashboard'}
                className="mt-4 cursor-pointer rounded-lg bg-orange-500 px-6 py-2 text-white"
              >
                Delivery Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <div key={assignment.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-gray-800">Order #{assignment.orderNumber}</p>
                      <p className="mt-1 text-sm text-gray-500">{assignment.restaurantName}</p>
                    </div>
                    <DeliveryStatusBadge status={assignment.assignmentStatus} />
                  </div>

                  <div className="mt-4 grid gap-3 border-t border-gray-100 pt-4 text-sm text-gray-600 sm:grid-cols-2">
                    <span className="flex items-center gap-2">
                      <FiMapPin className="h-4 w-4 text-orange-500" />
                      {assignment.customerAddress || 'Customer address not available'}
                    </span>
                    <span className="flex items-center gap-2">
                      <FiPhone className="h-4 w-4 text-orange-500" />
                      {assignment.customerPhone || 'Phone not available'}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-gray-500">
                      {assignment.distanceInKm ? `${Number(assignment.distanceInKm).toFixed(1)} km` : 'Distance pending'}
                      {assignment.deliveryFee ? ` • ₹${assignment.deliveryFee} delivery fee` : ''}
                    </div>
                    {['PENDING', 'ACCEPTED', 'PICKED_UP'].includes(assignment.assignmentStatus) && (
                      <button
                        type="button"
                        onClick={() => handleDeliveryStatusUpdate(assignment)}
                        className="cursor-pointer rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                      >
                        {assignment.assignmentStatus === 'PENDING' ? 'Accept Delivery'
                          : assignment.assignmentStatus === 'ACCEPTED' ? 'Mark Picked Up'
                            : 'Mark Delivered'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <FiPackage className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-500 text-sm">Track and manage your orders</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                filter === tab.id 
                  ? 'text-orange-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
              {filter === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
        
        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">ðŸ“¦</div>
            <h3 className="text-lg font-semibold text-gray-700">No orders found</h3>
            <p className="text-gray-500 mt-2">You haven't placed any orders yet</p>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={handleCancelOrder}
                onRate={handleRateOrder}
              />
            ))}
          </div>
        )}
        
        {reviewOrder && (
          <ReviewForm
            orderId={reviewOrder.id}
            restaurantId={reviewOrder.restaurant?.id}
            restaurantName={reviewOrder.restaurant?.name}
            onSubmit={submitReview}
            onClose={() => setReviewOrder(null)}
          />
        )}
        
        {/* Load More */}
        {!isLoading && pagination.currentPage + 1 < pagination.totalPages && (
          <div className="text-center mt-8">
            <button
              onClick={() => getUserOrders(pagination.currentPage + 1, pagination.pageSize)}
              className="px-6 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
