import { useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import EmptyCart from '../components/EmptyCart';
import { FiTrash2 } from 'react-icons/fi';
import toast from "react-hot-toast";
import Loader from '../../../components/common/Loader';

export default function CartPage() {
  const { 
    items, 
    totalItems, 
    totalAmount,
    deliveryFee,
    tax,
    grandTotal,
    restaurantName,
    isEmpty,
    isLoading,
    getCart,
    updateItemQuantity,
    removeItemFromCart,
    clearAllCart  // ✅ Add this from useCart
  } = useCart();

  useEffect(() => {
    getCart();
  }, []);

  const handleUpdateQuantity = async (cartItemId, quantity) => {
    await updateItemQuantity(cartItemId, quantity);
  };

  const handleRemoveItem = async (cartItemId) => {
    await removeItemFromCart(cartItemId);
  };

    // ✅ FIX: Clear All Items - Remove one by one
  const handleClearAll = async () => {
    if (items.length === 0) return;
    
    // Confirmation dialog
    const confirmed = window.confirm('Are you sure you want to remove all items from your cart?');
    if (!confirmed) return;
    
    // Show loading toast
    toast.loading('Clearing cart...', { id: 'clear-cart' });
    
    try {
      // Remove items one by one
      for (const item of items) {
        await removeItemFromCart(item.id);
      }
      toast.success('Cart cleared successfully!', { id: 'clear-cart' });
    } catch (error) {
      toast.error('Failed to clear cart', { id: 'clear-cart' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center cursor-pointer">
        <Loader size="lg" />
      </div>
    );
  }

  if (isEmpty || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">My Cart</h1>
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h2 className="font-semibold text-gray-700">Items ({totalItems})</h2>
                {/* ✅ FIX: Clear All button with proper handler */}
                {/* <button 
                  onClick={() => handleRemoveItem('all')}
                  className="text-red-500 text-sm hover:text-red-600"
                > */}
                <button 
                  onClick={handleClearAll}
                  className="flex items-center gap-1 text-red-500 text-sm hover:text-red-600 transition-colors cursor-pointer"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
              
              <div>
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <CartSummary
              subtotal={totalAmount}
              deliveryFee={deliveryFee}
              tax={tax}
              total={grandTotal}
              itemCount={totalItems}
              restaurantName={restaurantName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
