import { useState } from 'react';
import { FiClock, FiPlus, FiMinus, FiInfo } from 'react-icons/fi';
import { formatCurrency, getDiscountedPrice, getPrepTimeText, getDietaryBadge, getSpiceLevel } from '../utils/menuHelpers';
import { useCart } from '../../cart/hooks/useCart';

export default function MenuItemCard({ item, onAddToCart, onViewDetails }) {
  const [quantity, setQuantity] = useState(1);
  const [showActions, setShowActions] = useState(false);
  
  const discountedPrice = getDiscountedPrice(item.price, item.discountPercentage);
  const dietary = getDietaryBadge(item);
  const spiceLevel = getSpiceLevel(item.isSpicy);
  const prepTime = getPrepTimeText(item.preparationTime);
  const { addItemToCart } = useCart();
  
  // Replace the handleAddToCart function:
  const handleAddToCart = async () => {
    await addItemToCart(item.id, quantity);
    setShowActions(false);
    setQuantity(1);
  };
  
  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex p-4 gap-4">
        {/* Left - Image */}
        <div className="shrink-0">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-liner-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
              <span className="text-4xl">ðŸ•</span>
            </div>
          )}
        </div>
        
        {/* Right - Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
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
                {item.discountPercentage > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {item.discountPercentage}% OFF
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {item.description}
              </p>
            </div>
            
            {/* View Details Button */}
            <button 
              onClick={() => onViewDetails(item)}
              className="text-gray-400 hover:text-orange-500 transition-colors"
            >
              <FiInfo className="w-5 h-5" />
            </button>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-orange-500">
                  {formatCurrency(discountedPrice)}
                </span>
                {item.discountPercentage > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatCurrency(item.price)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <FiClock className="w-3 h-3" /> {prepTime}
                </span>
                {item.calories && (
                  <span>ðŸ”¥ {item.calories} cal</span>
                )}
              </div>
            </div>
            
            {/* Add to Cart Button */}
            {showActions ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(item.maxOrderQuantity || 10, quantity + 1))}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleAddToCart}
                  className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  <FiPlus className="w-4 h-4" /> Add
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowActions(true)}
                className="text-orange-500 text-sm font-medium hover:text-orange-600"
              >
                Customize
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}