import { useEffect, useState } from 'react';
import { FiBriefcase, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useRestaurant } from '../hooks/useRestaurant';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import RestaurantStats from '../components/RestaurantStats';
import OwnerRestaurantCard from '../components/OwnerRestaurantCard';
import RestaurantModal from '../components/RestaurantModal';
import OwnerMenuManager from '../../menu/components/OwnerMenuManager';

export default function OwnerRestaurantPage() {
  const { user } = useAuth();
  const {
    ownerRestaurants,
    isLoading,
    getRestaurantsByOwner,
    createNewRestaurant,
    updateExistingRestaurant,
    deleteExistingRestaurant,
    toggleRestaurantStatus,
  } = useRestaurant();

  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuRestaurant, setMenuRestaurant] = useState(null);

  useEffect(() => {
    if (user?.id) {
      getRestaurantsByOwner(user.id, 0, 10);
    }
  }, [user?.id]);

  const closeModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
    setEditingRestaurant(null);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);

    try {
      if (editingRestaurant) {
        await updateExistingRestaurant(editingRestaurant.id, values).unwrap();
        toast.success('Restaurant updated successfully!');
      } else {
        await createNewRestaurant(values).unwrap();
        toast.success('Restaurant created successfully!');
      }

      resetForm();
      setShowModal(false);
      setEditingRestaurant(null);

      if (user?.id) {
        await getRestaurantsByOwner(user.id, 0, 10).unwrap();
      }
    } catch (error) {
      toast.error(typeof error === 'string' ? error : error.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      try {
        await deleteExistingRestaurant(id).unwrap();
        await getRestaurantsByOwner(user.id, 0, 10).unwrap();
        toast.success('Restaurant deleted successfully!');
      } catch (error) {
        toast.error(typeof error === 'string' ? error : error.message || 'Unable to delete restaurant');
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    setStatusLoading(prev => ({ ...prev, [id]: true }));

    try {
      await toggleRestaurantStatus(id, !currentStatus).unwrap();
      await getRestaurantsByOwner(user.id, 0, 10).unwrap();
    } catch (error) {
      toast.error(typeof error === 'string' ? error : error.message || 'Unable to update restaurant status');
    } finally {
      setStatusLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const openEditModal = (restaurant) => {
    setEditingRestaurant(restaurant);
    setShowModal(true);
  };

  const getInitialFormValues = () => ({
    name: editingRestaurant?.name || '',
    description: editingRestaurant?.description || '',
    cuisineType: editingRestaurant?.cuisineType || '',
    minimumOrderAmount: editingRestaurant?.minimumOrderAmount || '',
    deliveryFee: editingRestaurant?.deliveryFee || '',
    openingTime: editingRestaurant?.openingTime || '09:00:00',
    closingTime: editingRestaurant?.closingTime || '23:00:00',
    contactPhone: editingRestaurant?.contactPhone || '',
    contactEmail: editingRestaurant?.contactEmail || '',
    website: editingRestaurant?.website || '',
    address: {
      streetAddress: editingRestaurant?.addresses?.[0]?.streetAddress || '',
      landmark: editingRestaurant?.addresses?.[0]?.landmark || '',
      city: editingRestaurant?.addresses?.[0]?.city || '',
      state: editingRestaurant?.addresses?.[0]?.state || '',
      zipCode: editingRestaurant?.addresses?.[0]?.zipCode || '',
      country: editingRestaurant?.addresses?.[0]?.country || 'India',
      latitude: editingRestaurant?.addresses?.[0]?.latitude || null,
      longitude: editingRestaurant?.addresses?.[0]?.longitude || null,
    },
  });

  if (isLoading && !ownerRestaurants.length) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
              <FiBriefcase className="text-orange-500" /> My Restaurants
            </h1>
            <p className="mt-1 text-sm text-gray-500">Manage your restaurants and track performance</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingRestaurant(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-red-500 px-5 py-2.5 font-medium text-white transition-all hover:shadow-lg"
          >
            <FiPlus className="h-5 w-5" /> Add New Restaurant
          </button>
        </div>

        <RestaurantStats restaurants={ownerRestaurants} />

        {ownerRestaurants.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-md">
            <div className="mb-4 text-6xl">OF</div>
            <h3 className="text-lg font-semibold text-gray-700">No Restaurants Yet</h3>
            <p className="mt-2 text-gray-500">Click "Add New Restaurant" to create your first restaurant</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {ownerRestaurants.map((restaurant) => (
              <OwnerRestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onStatusToggle={handleStatusToggle}
                onManageMenu={setMenuRestaurant}
                isStatusLoading={statusLoading[restaurant.id]}
              />
            ))}
          </div>
        )}
      </div>

      <OwnerMenuManager
        restaurant={menuRestaurant}
        isOpen={Boolean(menuRestaurant)}
        onClose={() => setMenuRestaurant(null)}
      />

      <RestaurantModal
        isOpen={showModal}
        onClose={closeModal}
        title={editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
        initialValues={getInitialFormValues()}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}


