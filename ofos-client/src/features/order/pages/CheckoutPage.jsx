import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../cart/hooks/useCart';
import { useAddress } from '../../address/hooks/useAddress';
import { useOrder } from '../hooks/useOrder';
import CheckoutStepper from '../components/CheckoutStepper';
import OrderSummaryCard from '../components/OrderSummaryCard';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import AddressCard from '../../address/components/AddressCard';
import { formatCurrency } from '../utils/orderHelpers';
import { FiMapPin, FiShoppingBag } from 'react-icons/fi';
import { usePayment } from '../../payment/hooks/usePayment';
import MockPaymentModal from '../../payment/components/MockPaymentModal';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalAmount, deliveryFee, tax, grandTotal, restaurantId, restaurantName, getCart, clearAllCart } = useCart();
  const { addresses, defaultAddress, getAddresses } = useAddress();
  const { placeOrder, isLoading } = useOrder();
  
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [discount, setDiscount] = useState(0);

  // ✅ Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const { processPayment, isLoading: paymentLoading } = usePayment();

  useEffect(() => {
    getCart();
    getAddresses();
  }, []);

  useEffect(() => {
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [defaultAddress]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-700">Your cart is empty</h2>
          <p className="text-gray-500 mt-2">Add some items to proceed to checkout</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  // ✅ Updated: Handle place order with payment modal
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }

    const orderData = {
      addressId: selectedAddress.id,
      restaurantId: restaurantId,
      items: items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity
      })), 
      specialInstructions,
      paymentMethod: selectedPaymentMethod,
      couponCode: discount > 0 ? 'APPLIED' : '',
    };
    
    console.log('📦 Placing order with data:', orderData);
    
    const result = await placeOrder(orderData);
    
    if (result.meta?.requestStatus === 'fulfilled') {
      const newOrder = result.payload;
      
      // ✅ COD: Direct success, no payment modal
      if (selectedPaymentMethod === 'CASH_ON_DELIVERY') {
        await clearAllCart();
        navigate('/order-success', { state: { order: newOrder } });
      } 
      // ✅ Online Payment: Open payment modal
      else {
        setCurrentOrder(newOrder);
        setShowPaymentModal(true);
      }
    }
  };

  // ✅ Handle payment completion from modal
  const handlePaymentComplete = async (orderId, paymentDetails) => {
    console.log('💳 Processing payment for order:', orderId, paymentDetails);
    
    const result = await processPayment(orderId, paymentDetails);
    
    if (result.meta?.requestStatus === 'fulfilled') {
      await clearAllCart();
      navigate('/payment-success', { state: { order: currentOrder } });
    } else {
      navigate('/payment-failed', { state: { order: currentOrder } });
    }
  };

  // ✅ Handle payment modal close
  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setCurrentOrder(null);
  };

  const checkoutDeliveryFee = Number(totalAmount || 0) >= 500 ? 0 : Number(deliveryFee || 0);
  const finalTotal = Number(totalAmount || 0) + Number(tax || 0) + checkoutDeliveryFee - Number(discount || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>
        
        <CheckoutStepper currentStep={2} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Section */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FiMapPin className="text-orange-500" /> Delivery Address
                </h2>
                <button
                  onClick={() => navigate('/addresses')}
                  className="text-sm text-orange-500 hover:text-orange-600 cursor-pointer"
                >
                  + Add New
                </button>
              </div>
              
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No addresses found</p>
                  <button
                    onClick={() => navigate('/addresses')}
                    className="mt-2 text-orange-500"
                  >
                    Add delivery address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddress(address)}
                      className={`cursor-pointer transition-all rounded-xl border-2 ${
                        selectedAddress?.id === address.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-100 hover:border-orange-200'
                      }`}
                    >
                      <AddressCard
                        address={address}
                        isDefault={address.isDefault}
                        isSelected={selectedAddress?.id === address.id}
                        onSelect={() => setSelectedAddress(address)}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onSetDefault={() => {}}
                        selectable={true}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Order Items Section */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FiShoppingBag className="text-orange-500" /> Order Items
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{item.itemName}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-orange-500">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>
              
              {/* Special Instructions */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests for the restaurant?"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="2"
                />
              </div>
            </div>
          </div>
          
          {/* Right Column - Summary */}
          <div className="lg:col-span-1 space-y-6">
            <OrderSummaryCard
              subtotal={totalAmount}
              deliveryFee={deliveryFee}
              tax={tax}
              total={grandTotal}
              itemCount={items.length}
              restaurantName={restaurantName}
              onApplyCoupon={(amount) => setDiscount(amount)}
            />
            
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onSelect={setSelectedPaymentMethod}
            />
            
            <button
              onClick={handlePlaceOrder}
              disabled={isLoading || paymentLoading || !selectedAddress}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading || paymentLoading ? 'Processing...' : `Place Order • ${formatCurrency(finalTotal)}`}
            </button>
            
            <p className="text-xs text-gray-400 text-center">
              By placing this order, you agree to our Terms & Conditions
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Payment Modal */}
      <MockPaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentModalClose}
        amount={finalTotal}
        orderId={currentOrder?.id}
        initialPaymentMethod={selectedPaymentMethod}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}
