import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';
import MenuList from '../components/MenuList';
import CategoryTabs from '../components/CategoryTabs';
import MenuSearch from '../components/MenuSearch';
import VegFilterToggle from '../components/VegFilterToggle';
import MenuItemModal from '../components/MenuItemModal';

export default function MenuPage() {
  const { id: restaurantId } = useParams();
  const { clearFilters, clearMenuData } = useMenu();
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  useEffect(() => {
    return () => {
      clearMenuData();
      clearFilters();
    };
  }, [restaurantId]);
  
  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };
  
  const handleAddToCart = (item) => {
    // This will be connected to cart module later
    console.log('Add to cart:', item);
    // Show toast or update cart state
  };
  
  return (
    <div>
      {/* Filters Bar */}
      <div className="sticky top-16 z-10 bg-white py-3 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <MenuSearch />
          </div>
          <div className="flex gap-2">
            <VegFilterToggle />
            <button 
              onClick={clearFilters}
              className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Categories */}
      <div className="mt-4">
        <CategoryTabs restaurantId={restaurantId} />
      </div>
      
      {/* Menu List */}
      <div className="mt-4">
        <MenuList 
          restaurantId={restaurantId} 
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
        />
      </div>
      
      {/* Item Detail Modal */}
      <MenuItemModal 
        item={selectedItem}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}