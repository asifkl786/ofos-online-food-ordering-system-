import { useState } from 'react';
import { FiEdit2, FiEye, FiTrash2, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { getAddressTypeConfig, formatFullAddress, truncateAddress } from '../utils/addressHelpers';

export default function AddressCard({ address, isDefault, onEdit, onView, onDelete, onSetDefault, isSelected, onSelect }) {
  const [isHovered, setIsHovered] = useState(false);
  const typeConfig = getAddressTypeConfig(address.addressType);

  const fullAddress = formatFullAddress(address);
  const truncatedAddress = truncateAddress(fullAddress, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        relative bg-white rounded-2xl p-5 transition-all duration-300 cursor-pointer
        border-2 ${isSelected ? 'border-orange-500 shadow-lg' : 'border-gray-100 hover:border-orange-200 hover:shadow-md'}
      `}
      onClick={() => onSelect?.(address)}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      )}

      {/* Address Type Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${typeConfig.color}`}>
          <span className="text-base">{typeConfig.icon}</span>
          <span className="text-sm font-medium">{typeConfig.label}</span>
        </div>
        
        {isDefault && (
          <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
            <FiStar className="w-3 h-3 fill-green-500" />
            Default
          </div>
        )}
      </div>

      {/* Address Details */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800">
          {address.receiverName || `${address.userName || 'Delivery Address'}`}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {truncatedAddress}
        </p>
        {address.phoneNumber && (
          <p className="text-gray-500 text-sm flex items-center gap-1">
            📞 {address.phoneNumber}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {(isHovered || isSelected || true) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100"
        >
          {!isDefault && (
            <button
              onClick={(e) => { e.stopPropagation(); onSetDefault(address.id); }}
              className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors"
            >
              <FiStar className="w-3 h-3" /> Set as Default
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onView?.(address); }}
            className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <FiEye className="w-3 h-3" /> View
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(address); }}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <FiEdit2 className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(address.id); }}
            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          >
            <FiTrash2 className="w-3 h-3" /> Delete
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

