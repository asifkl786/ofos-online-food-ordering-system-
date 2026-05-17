import { FiCheck, FiMapPin, FiPhone, FiStar, FiX } from 'react-icons/fi';
import { formatCurrency, getVehicleIcon } from '../utils/deliveryHelpers';

export default function DeliveryPartnerCard({ partner, onSelect, isSelected }) {
  const vehicleType = partner.vehicleType || partner.vehicle || 'Vehicle';
  const vehicleIcon = getVehicleIcon(vehicleType);
  const normalizedStatus = String(partner.status || '').toUpperCase();
  const isAssignable = Boolean(partner.isAvailable ?? partner.available) && normalizedStatus === 'ONLINE';
  const rating = partner.averageRating ?? partner.rating ?? 'New';
  const deliveries = partner.totalDeliveries ?? partner.deliveries ?? 0;
  const phone = partner.phoneNumber || partner.phone;
  const earnings = partner.totalEarnings ?? partner.earnings ?? 0;

  return (
    <div
      className={`overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 ${
        isSelected ? 'ring-2 ring-orange-500 shadow-lg' : 'hover:shadow-lg'
      } ${isAssignable ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
      onClick={() => isAssignable && onSelect?.(partner)}
    >
      <div className="p-4 min-h-[88px]">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-orange-500 to-red-500 text-xl font-bold text-white">
            {partner.name?.charAt(0) || 'D'}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-800">{partner.name || 'Delivery Partner'}</h3>
              {isAssignable ? (
                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                  Available
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  <FiX className="h-3 w-3" /> {normalizedStatus || 'OFFLINE'}
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FiStar className="h-3 w-3 text-yellow-500" />
                {rating}
              </span>
              <span>{vehicleIcon} {vehicleType}</span>
              <span>{deliveries} deliveries</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FiPhone className="h-3 w-3" /> {phone || 'No phone'}
              </span>
              <span className="flex items-center gap-1">
                <FiMapPin className="h-3 w-3" /> Zone: {partner.zone || 'All'}
              </span>
              <span>
                Earnings: {formatCurrency(earnings)}
              </span>
              </div>
          </div>

          {isSelected && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500">
              <FiCheck className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
