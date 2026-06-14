import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch } from 'react-icons/fi';
import DeliveryPartnerCard from './DeliveryPartnerCard';
import { useDelivery } from '../hooks/useDelivery';
import Loader, { ButtonLoader } from '../../../components/common/Loader';

export default function DeliveryAssignmentModal({ isOpen, onClose, orderId, onAssign }) {
  const { availablePartners, fetchAvailablePartners, isLoading } = useDelivery();
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchAvailablePartners(orderId);
    }
  }, [isOpen, orderId]);

  const filteredPartners = availablePartners.filter((partner) => {
    const searchable = `${partner.name || ''} ${partner.vehicleType || partner.vehicle || ''} ${partner.zone || ''}`;
    return searchable.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const assignableCount = filteredPartners.filter((partner) => (partner.isAvailable ?? partner.available) && partner.status === 'ONLINE').length;

  const handleAssign = async () => {
    if (!selectedPartner || isAssigning) return;

    setIsAssigning(true);
    try {
      await onAssign(orderId, selectedPartner.id);
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">🚚 Assign Delivery Partner</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {filteredPartners.length} partners found, {assignableCount} online available. Offline/busy partners sirf reference ke liye dikh rahe hain.
            </p>
          </div>

          {/* Partners List */}
          <div className="p-4 space-y-3 max-h-100 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader size="md" className="mx-auto" />
                <p className="text-gray-500 mt-2">Loading partners...</p>
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🚚</div>
                <p className="text-gray-500">No delivery partners available</p>
              </div>
            ) : (
              filteredPartners.map((partner) => (
                <DeliveryPartnerCard
                  key={partner.id}
                  partner={partner}
                  isSelected={selectedPartner?.id === partner.id}
                  onSelect={setSelectedPartner}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedPartner || isAssigning}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-500 text-white py-2 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAssigning && <ButtonLoader />}
              {isAssigning ? 'Assigning...' : 'Assign Partner'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
