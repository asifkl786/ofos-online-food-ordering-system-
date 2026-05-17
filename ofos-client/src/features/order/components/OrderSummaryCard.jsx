import { formatCurrency } from '../utils/orderHelpers';
import { FiTruck, FiPercent, FiShoppingBag, FiGift } from 'react-icons/fi';
import { useState } from 'react';

export default function OrderSummaryCard({ 
  subtotal, 
  deliveryFee, 
  tax, 
  total, 
  itemCount, 
  restaurantName,
  onApplyCoupon 
}) {
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  const isFreeDelivery = subtotal >= 500;
  const finalDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
  const payableTotal = Number(subtotal || 0) + Number(tax || 0) + Number(finalDeliveryFee || 0);

  const handleApplyCoupon = () => {
    if (couponCode === 'WELCOME10' && !isCouponApplied) {
      const discountAmount = subtotal * 0.1;
      setDiscount(discountAmount);
      setIsCouponApplied(true);
      onApplyCoupon?.(discountAmount);
    } else if (couponCode === 'SAVE20' && !isCouponApplied) {
      const discountAmount = subtotal * 0.2;
      setDiscount(discountAmount);
      setIsCouponApplied(true);
      onApplyCoupon?.(discountAmount);
    }
  };

  const finalTotal = payableTotal - discount;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
        Order Summary
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span className="flex items-center gap-2">
            <FiShoppingBag className="w-4 h-4" /> Subtotal ({itemCount} items)
          </span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span className="flex items-center gap-2">
            <FiTruck className="w-4 h-4" /> Delivery Fee
          </span>
          {isFreeDelivery ? (
            <span className="text-green-600 font-medium">Free</span>
          ) : (
            <span>{formatCurrency(finalDeliveryFee)}</span>
          )}
        </div>
        
        {isFreeDelivery && (
          <div className="bg-green-50 text-green-700 text-xs p-2 rounded-lg flex items-center gap-1">
            🎉 Free delivery on orders above ₹500!
          </div>
        )}
        
        <div className="flex justify-between text-gray-600">
          <span className="flex items-center gap-2">
            <FiPercent className="w-4 h-4" /> GST (5%)
          </span>
          <span>{formatCurrency(tax)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span className="flex items-center gap-2">
              <FiGift className="w-4 h-4" /> Discount
            </span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-orange-500">{formatCurrency(finalTotal)}</span>
          </div>
        </div>
      </div>
      
      {/* Coupon Section */}
      <div className="mt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={isCouponApplied}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={isCouponApplied || !couponCode}
            className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
        {!isCouponApplied && (
          <p className="text-xs text-gray-400 mt-2">
            Try: WELCOME10 (10% off) or SAVE20 (20% off)
          </p>
        )}
        {isCouponApplied && (
          <p className="text-xs text-green-600 mt-2">
            ✓ Coupon applied! You saved {formatCurrency(discount)}
          </p>
        )}
      </div>
      
      {restaurantName && (
        <div className="mt-4 p-3 bg-orange-50 rounded-lg">
          <p className="text-xs text-gray-500">Ordering from</p>
          <p className="font-medium text-orange-600">{restaurantName}</p>
        </div>
      )}
    </div>
  );
}
