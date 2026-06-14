import { useState } from 'react';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { formatCurrency } from '../utils/cartHelpers';
import { ButtonLoader } from '../../../components/common/Loader';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);
    await onUpdateQuantity(item.id, newQuantity);
    setIsUpdating(false);
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100">
      {/* Image */}
      <div className="w-20 h-20 shrink-0">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.itemName}
            className="w-full h-full rounded-lg object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">{item.isVegetarian ? '🥬' : '🍗'}</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-800">{item.itemName}</h3>
          {item.isVegetarian ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Veg</span>
          ) : (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Non-Veg</span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {formatCurrency(item.unitPrice)} each
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={isUpdating}
          className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
        >
          <FiMinus className="w-4 h-4" />
        </button>
        <span className="flex w-8 items-center justify-center text-center font-medium">
          {isUpdating ? <ButtonLoader /> : item.quantity}
        </span>
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={isUpdating}
          className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
        >
          <FiPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Price & Remove */}
      <div className="text-right min-w-25">
        <div className="font-bold text-orange-500">
          {formatCurrency(item.subtotal)}
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-600 text-sm mt-1 flex items-center gap-1 cursor-pointer"
        >
          <FiTrash2 className="w-3 h-3" /> Remove
        </button>
      </div>
    </div>
  );
}
