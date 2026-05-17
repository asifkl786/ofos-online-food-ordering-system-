import RestaurantCard from './RestaurantCard';
import RestaurantCardSkeleton from './RestaurantCardSkeleton';

const gridColumns = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

export default function RestaurantGrid({ restaurants, isLoading, columns = 3 }) {
  const gridClass = gridColumns[columns] || gridColumns[3];
  if (isLoading) {
    return (
      <div className={`grid ${gridClass} gap-6`}>
        {[...Array(6)].map((_, i) => (
          <RestaurantCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-xl font-semibold text-gray-700">No restaurants found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
      </div>
    );
  }
  
  return (
    <div className={`grid ${gridClass} gap-6`}>
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  );
}
