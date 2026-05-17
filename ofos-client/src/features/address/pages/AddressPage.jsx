import { useEffect, useState } from 'react';
import { useAddress } from '../hooks/useAddress';
import AddressList from '../components/AddressList';
import AddressForm from '../components/AddressForm';
import { formatFullAddress, getAddressTypeConfig } from '../utils/addressHelpers';
import { FiPlus, FiMapPin, FiX, FiPhone, FiHome, FiUser, FiMap } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddressPage() {
  const { 
    addresses, 
    isLoading, 
    getAddresses, 
    addNewAddress, 
    editAddress, 
    setAsDefault, 
    removeAddress 
  } = useAddress();

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [viewingAddress, setViewingAddress] = useState(null);

  useEffect(() => {
    getAddresses().catch(() => {});
  }, []);

  const handleAddAddress = async (addressData) => {
    await addNewAddress(addressData);
    setShowForm(false);
  };

  const handleEditAddress = async (addressData) => {
    await editAddress(editingAddress.id, addressData);
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      await removeAddress(id).catch(() => {});
    }
  };

  const handleSetDefault = async (id) => {
    await setAsDefault(id).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FiMapPin className="text-orange-500" />
              My Addresses
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your delivery addresses
            </p>
          </div>
          <button
            onClick={() => {
              setEditingAddress(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            Add New Address
          </button>
        </div>

        {/* Address List */}
        <AddressList
          addresses={addresses}
          isLoading={isLoading}
          onEdit={(address) => {
            setEditingAddress(address);
            setShowForm(true);
          }}
          onView={setViewingAddress}
          onDelete={handleDeleteAddress}
          onSetDefault={handleSetDefault}
        />

        {/* Add/Edit Form Modal */}
        <AnimatePresence>
          {showForm && (
            <AddressForm
              initialData={editingAddress}
              onSubmit={editingAddress ? handleEditAddress : handleAddAddress}
              onClose={() => {
                setShowForm(false);
                setEditingAddress(null);
              }}
              isEditing={!!editingAddress}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {viewingAddress && (
            <AddressDetailModal
              address={viewingAddress}
              onClose={() => setViewingAddress(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AddressDetailModal({ address, onClose }) {
  const typeConfig = getAddressTypeConfig(address.addressType);
  const detailRows = [
    { label: 'Receiver', value: address.receiverName || address.userName || 'Delivery Address', icon: FiUser },
    { label: 'Phone', value: address.phoneNumber || 'Not available', icon: FiPhone },
    { label: 'Address', value: formatFullAddress(address) || 'Not available', icon: FiMapPin },
    { label: 'City / State', value: [address.city, address.state].filter(Boolean).join(', ') || 'Not available', icon: FiMap },
    { label: 'Pincode', value: address.zipCode || 'Not available', icon: FiHome },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 20 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white px-6 py-5">
          <div>
            <div className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${typeConfig.color}`}>
              <span>{typeConfig.icon}</span>
              <span className="text-sm font-semibold">{typeConfig.label}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Address Details</h2>
            <p className="mt-1 text-sm text-gray-500">Complete delivery address information</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-white hover:text-gray-800 cursor-pointer"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-6">
          {address.isDefault && (
            <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              Default delivery address
            </div>
          )}
          {detailRows.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-gray-800">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

