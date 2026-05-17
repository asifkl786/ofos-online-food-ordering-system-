import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/cartHelpers';
import { FiTruck, FiPercent, FiShoppingBag,FiArrowLeft } from 'react-icons/fi';

export default function CartSummary({ subtotal, deliveryFee, tax, total, itemCount, restaurantName }) {
  const navigate = useNavigate();

  const isFreeDelivery = subtotal >= 500;
  const finalDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
  const displayTotal = Number(subtotal || 0) + Number(tax || 0) + Number(finalDeliveryFee || 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span className="flex items-center gap-2">
            <FiShoppingBag className="w-4 h-4" /> Subtotal ({itemCount} items)
          </span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span className="flex items-center gap-2">
            <FiTruck className="w-4 h-4" /> Delivery Fee
          </span>
          {isFreeDelivery ? (
            <span className="text-green-600">Free</span>
          ) : (
            <span>{formatCurrency(finalDeliveryFee)}</span>
          )}
        </div>
        
        {isFreeDelivery && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg">
            🎉 Free delivery on orders above ₹500!
          </div>
        )}
        
        <div className="flex justify-between text-gray-600">
          <span className="flex items-center gap-2">
            <FiPercent className="w-4 h-4" /> GST (5%)
          </span>
          <span>{formatCurrency(tax)}</span>
        </div>
        
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-orange-500">{formatCurrency(displayTotal)}</span>
          </div>
        </div>
      </div>
      
      {restaurantName && (
        <div className="mt-4 p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-gray-600">Ordering from</p>
          <p className="font-medium text-orange-600">{restaurantName}</p>
        </div>
      )}
      
      <button
        onClick={() => navigate('/checkout')}
        className="w-full mt-6 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors cursor-pointer"
      >
        Proceed to Checkout
      </button>
      
      <button
          onClick={() => navigate(-1)}
          className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 hover:text-gray-800 transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200 cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" />
          Continue Shopping
      </button>
    </div>
  );
}
