import { useEffect } from 'react';
import { useMenu } from '../hooks/useMenu';
import MenuItemCard from './MenuItemCard';
import MenuItemCardSkeleton from './MenuItemCardSkeleton';
import { FiSearch } from 'react-icons/fi';

export default function MenuList({ restaurantId, onAddToCart, onViewDetails }) {
  const { 
    filteredItems, 
    isLoading, 
    getMenuItems, 
    clearMenuData,
    searchKeyword,
    selectedCategory,
    isVegFilter
  } = useMenu();
  
  useEffect(() => {
    if (restaurantId) {
      getMenuItems(restaurantId);
    }
    return () => clearMenuData();
  }, [restaurantId]);
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <MenuItemCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-lg font-medium text-gray-700">No items found</h3>
        <p className="text-gray-500 mt-1">
          {searchKeyword || selectedCategory || isVegFilter 
            ? "Try changing your filters" 
            : "Menu items will appear here"}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {filteredItems.map((item) => (
        <MenuItemCard 
          key={item.id} 
          item={item} 
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}