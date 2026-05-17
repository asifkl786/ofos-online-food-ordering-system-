import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../../auth/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';


export default function CartIcon() {
  const { totalItems, getCart } = useCart();
  const { user } = useAuth();
  const canUseCart = ['CUSTOMER', 'ADMIN'].includes(user?.role);

  useEffect(() => {
    if (canUseCart) {
      getCart();
    }
  }, [canUseCart]);

  if (!canUseCart) return null;

  return (
    <Link to="/cart" className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
      <FiShoppingCart className="w-5 h-5" />
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {totalItems > 9 ? '9+' : totalItems}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
