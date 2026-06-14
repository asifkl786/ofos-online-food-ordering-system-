import { useEffect, useState } from 'react';
import { useRestaurant } from '../hooks/useRestaurant';
import RestaurantGrid from '../components/RestaurantGrid';
import RestaurantSearch from '../components/RestaurantSearch';
import RestaurantFilters from '../components/RestaurantFilters';
import EmptyState from '../components/EmptyState';
import Loader from '../../../components/common/Loader';

export default function RestaurantList() {
  const { 
    restaurants, 
    isLoading, 
    pagination, 
    filters,
    getAllRestaurants, 
    search, 
    filter,
    updateFilters,
    clearFilters,
    updateSort,
    sort
  } = useRestaurant();
  
  const [searchKeyword, setSearchKeyword] = useState('');
  
  useEffect(() => {
    if (searchKeyword) {
      search(searchKeyword, 0, 10);
    } else if (Object.values(filters).some(v => v !== null && v !== '')) {
      filter({ ...filters, page: 0, size: 10, sortBy: sort.sortBy, sortDirection: sort.sortDirection });
    } else {
      getAllRestaurants(0, 10, sort.sortBy, sort.sortDirection);
    }
  }, [searchKeyword, filters, sort]);
  
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword) {
      getAllRestaurants();
    }
  };
  
  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };
  
  const handleSortChange = (sortBy, sortDirection) => {
    updateSort(sortBy, sortDirection);
  };
  
  const handleClearFilters = () => {
    clearFilters();
    setSearchKeyword('');
    getAllRestaurants(0, 10, sort.sortBy, sort.sortDirection);
  };

  const handleLoadMore = () => {
    const nextPage = pagination.currentPage + 1;
    if (searchKeyword) {
      search(searchKeyword, nextPage, pagination.pageSize);
      return;
    }
    if (hasActiveFilters) {
      filter({ ...filters, page: nextPage, size: pagination.pageSize, sortBy: sort.sortBy, sortDirection: sort.sortDirection });
      return;
    }
    getAllRestaurants(nextPage, pagination.pageSize, sort.sortBy, sort.sortDirection);
  };
  
  const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== '');
  const showEmptyState = !isLoading && restaurants.length === 0;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Discover Delicious Food 🍕
          </h1>
          <p className="text-gray-500">
            Find the best restaurants and order your favorite meals
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <RestaurantSearch onSearch={handleSearch} initialKeyword={searchKeyword} />
        </div>
        
        {/* Filters */}
        <div className="mb-6">
          <RestaurantFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
          />
        </div>
        
        {/* Results Info */}
        {!isLoading && restaurants.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              Showing {restaurants.length} of {pagination.totalElements} restaurants
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-orange-500 hover:text-orange-600"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
        
        {/* Restaurant Grid */}
        <RestaurantGrid restaurants={restaurants} isLoading={isLoading} columns={3} />
        
        {/* Empty State */}
        {showEmptyState && (
          <EmptyState 
            type={searchKeyword || hasActiveFilters ? 'search' : 'default'}
            onClearFilters={handleClearFilters}
          />
        )}
        
        {/* Load More Button */}
        {!isLoading && restaurants.length > 0 && pagination.currentPage + 1 < pagination.totalPages && (
          <div className="text-center mt-8">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
            >
              Load More
            </button>
          </div>
        )}
        
        {/* Loading More */}
        {isLoading && restaurants.length > 0 && (
          <div className="text-center mt-8">
            <Loader size="sm" className="mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
