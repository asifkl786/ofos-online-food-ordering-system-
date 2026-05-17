import { motion, AnimatePresence } from 'framer-motion';
import AddressCard from './AddressCard';
import AddressSkeleton from './AddressSkeleton';
import EmptyAddress from './EmptyAddress';

export default function AddressList({ 
  addresses, 
  isLoading, 
  onEdit, 
  onView,
  onDelete, 
  onSetDefault, 
  selectedAddressId,
  onSelectAddress,
  selectable = false 
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <AddressSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!addresses || addresses.length === 0) {
    return <EmptyAddress />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AnimatePresence>
        {addresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            isDefault={address.isDefault}
            onEdit={() => onEdit(address)}
            onView={onView}
            onDelete={onDelete}
            onSetDefault={onSetDefault}
            isSelected={selectable && selectedAddressId === address.id}
            onSelect={selectable ? onSelectAddress : null}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
