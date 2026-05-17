import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import RestaurantForm from './RestaurantForm';

export default function RestaurantModal({ isOpen, onClose, title, initialValues, onSubmit, isSubmitting }) {
  if (!isOpen) return null;

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-md sm:p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.96, y: 18 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 18 }}
          transition={{ duration: 0.18 }}
          className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-rose-50 px-5 py-4 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">Restaurant setup</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">Fill the details carefully so customers can discover and order easily.</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:border-orange-200 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close restaurant form"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-y-auto">
            <RestaurantForm
              initialValues={initialValues}
              isSubmitting={isSubmitting}
              onSubmit={onSubmit}
              onCancel={handleClose}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
