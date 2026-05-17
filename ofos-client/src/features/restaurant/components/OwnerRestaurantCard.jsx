import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiDollarSign, FiEdit2, FiEye, FiMapPin, FiPackage, FiStar, FiTrash2, FiTruck, FiXCircle } from 'react-icons/fi';

export default function OwnerRestaurantCard({ restaurant, onEdit, onDelete, onStatusToggle, onManageMenu, isStatusLoading }) {
  const canManageMenu = typeof onManageMenu === 'function';
  const handleManageMenu = () => {
    if (canManageMenu) onManageMenu(restaurant);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-lg"
    >
      <div className="relative h-36 bg-linear-to-r from-orange-500 to-red-500">
        {restaurant.coverImageUrl ? (
          <img src={restaurant.coverImageUrl} alt={restaurant.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-black text-white/90">OF</div>
        )}
        
        <div className="absolute right-3 top-3 flex gap-2">
          <button
            type="button"
            onClick={handleManageMenu}
            disabled={!canManageMenu}
            className="rounded-lg bg-white p-2 shadow-md transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
            title="Manage menu"
            aria-label="Manage menu"
          >
            <FiPackage className="h-4 w-4 text-orange-600" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(restaurant)}
            className="rounded-lg bg-white p-2 shadow-md transition-colors hover:bg-gray-100"
            title="Edit restaurant"
            aria-label="Edit restaurant"
          >
            <FiEdit2 className="h-4 w-4 text-gray-600" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(restaurant.id)}
            className="rounded-lg bg-white p-2 shadow-md transition-colors hover:bg-red-50"
            title="Delete restaurant"
            aria-label="Delete restaurant"
          >
            <FiTrash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
        
        <div className="absolute bottom-3 left-3">
          <button
            type="button"
            onClick={() => onStatusToggle(restaurant.id, restaurant.isOpen)}
            disabled={isStatusLoading}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${
              restaurant.isOpen ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'
            }`}
          >
            {isStatusLoading ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : restaurant.isOpen ? (
              <><FiCheckCircle className="h-3 w-3" /> Open</>
            ) : (
              <><FiXCircle className="h-3 w-3" /> Closed</>
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{restaurant.name}</h3>
            <p className="mt-0.5 text-xs text-gray-500">{restaurant.cuisineType}</p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-yellow-50 px-2 py-1">
            <FiStar className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-medium">{restaurant.averageRating?.toFixed(1) || 'New'}</span>
          </div>
        </div>
        
        <p className="mt-2 line-clamp-2 text-sm text-gray-500">{restaurant.description}</p>
        
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FiClock className="h-3 w-3" /> {restaurant.openingTime || '--'} - {restaurant.closingTime || '--'}
          </span>
          <span className="flex items-center gap-1">
            <FiMapPin className="h-3 w-3" /> {restaurant.addresses?.[0]?.city || 'Location'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
          <div className="flex gap-3 text-sm">
            <span className="flex items-center gap-1">
              <FiTruck className="h-3 w-3" /> Rs. {restaurant.deliveryFee || 0}
            </span>
            <span className="flex items-center gap-1">
              <FiDollarSign className="h-3 w-3" /> Min Rs. {restaurant.minimumOrderAmount || 199}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleManageMenu}
              disabled={!canManageMenu}
              className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiPackage className="h-4 w-4" /> Menu
            </button>
            <button
              type="button"
              onClick={() => window.location.href = `/restaurant/${restaurant.id}`}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-orange-500 transition-colors hover:text-orange-600"
            >
              <FiEye className="h-4 w-4" /> Details
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


