import { FiMapPin, FiPhone, FiStar } from 'react-icons/fi';

export default function DeliveryInfoCard({ order }) {
  const deliveryInfo = order?.deliveryInfo;
  const showDeliveryInfo = ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order?.status);

  if (!showDeliveryInfo || !deliveryInfo?.deliveryPartnerId) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <div className="py-8 text-center">
          <div className="mb-3 text-5xl">⏳</div>
          <h3 className="text-lg font-semibold text-gray-700">Delivery Partner Assigned Soon</h3>
          <p className="mt-2 text-sm text-gray-500">
            Restaurant order ready karega, phir rider assign hote hi yahan details show hongi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
        <span>🚴</span> Delivery Partner
      </h3>

      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600">
          {deliveryInfo.deliveryPartnerName?.charAt(0) || 'D'}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{deliveryInfo.deliveryPartnerName}</h4>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <FiStar className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              Assigned
            </span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
              {deliveryInfo.deliveryStatus}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <FiPhone className="h-4 w-4 text-gray-400" />
            <a href={`tel:${deliveryInfo.deliveryPartnerPhone || ''}`} className="text-sm text-orange-500 hover:text-orange-600">
              {deliveryInfo.deliveryPartnerPhone || 'Phone not available'}
            </a>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <FiMapPin className="mt-0.5 h-4 w-4 text-orange-500" />
          <div>
            <p className="font-medium">Delivery Address</p>
            <p className="mt-1 text-xs text-gray-500">
              {order?.deliveryAddress?.streetAddress}, {order?.deliveryAddress?.city}
              {order?.deliveryAddress?.state ? `, ${order.deliveryAddress.state}` : ''}
              {order?.deliveryAddress?.zipCode ? ` - ${order.deliveryAddress.zipCode}` : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
