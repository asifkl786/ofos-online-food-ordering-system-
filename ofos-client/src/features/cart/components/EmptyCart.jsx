import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';

export default function EmptyCart() {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiShoppingCart className="w-12 h-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
      <Link
        to="/"
        className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
      >
        Browse Restaurants
      </Link>
    </div>
  );
}