import { useState } from 'react';
import { FiX, FiClock, FiMinus, FiPlus, FiCheck } from 'react-icons/fi';
import { formatCurrency, getDiscountedPrice, getPrepTimeText, getDietaryBadge, getSpiceLevel } from '../utils/menuHelpers';

export default function MenuItemModal({ item, isOpen, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  
  if (!isOpen || !item) return null;
  
  const discountedPrice = getDiscountedPrice(item.price, item.discountPercentage);
  const dietary = getDietaryBadge(item);
  const spiceLevel = getSpiceLevel(item.isSpicy);
  const prepTime = getPrepTimeText(item.preparationTime);
  
  const handleAddToCart = () => {
    onAddToCart({ ...item, quantity });
    setQuantity(1);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative h-48 bg-linear-to-r from-orange-500 to-red-500">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">ðŸ•</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h2 className="text-2xl font-bold text-gray-800">{item.name}</h2>
            {dietary && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${dietary.color}`}>
                {dietary.icon} {dietary.label}
              </span>
            )}
            {spiceLevel && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${spiceLevel.color}`}>
                {spiceLevel.icon} {spiceLevel.label}
              </span>
            )}
          </div>
          
          <p className="text-gray-600 leading-relaxed">{item.description}</p>
          
          {/* Details */}
          <div className="grid grid-cols-2 gap-3 mt-4 p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiClock className="w-4 h-4" /> {prepTime}
            </div>
            {item.calories && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                ðŸ”¥ {item.calories} calories
              </div>
            )}
            {item.maxOrderQuantity && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                ðŸ“¦ Max {item.maxOrderQuantity} per order
              </div>
            )}
            {item.isAvailable === false && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                âš ï¸ Currently unavailable
              </div>
            )}
          </div>
          
          {/* Price & Add to Cart */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-orange-500">
                    {formatCurrency(discountedPrice)}
                  </span>
                  {item.discountPercentage > 0 && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatCurrency(item.price)}
                    </span>
                  )}
                </div>
                {item.discountPercentage > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    You save {formatCurrency(item.price - discountedPrice)} ({item.discountPercentage}% OFF)
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                >
                  <FiMinus className="w-5 h-5" />
                </button>
                <span className="w-10 text-center text-xl font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(item.maxOrderQuantity || 10, quantity + 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                >
                  <FiPlus className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleAddToCart}
                  disabled={item.isAvailable === false}
                  className="bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart â€¢ {formatCurrency(discountedPrice * quantity)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}