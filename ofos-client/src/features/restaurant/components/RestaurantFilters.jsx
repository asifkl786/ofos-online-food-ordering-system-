import { useState } from 'react';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const cuisineOptions = [
  'All', 'North Indian', 'South Indian', 'Chinese', 'Italian', 
  'Fast Food', 'Street Food', 'Biryani', 'Desserts', 'Beverages'
];

const sortOptions = [
  { value: 'averageRating', label: 'Rating: High to Low', direction: 'DESC' },
  { value: 'averageRating', label: 'Rating: Low to High', direction: 'ASC' },
  { value: 'deliveryFee', label: 'Delivery Fee: Low to High', direction: 'ASC' },
  { value: 'deliveryFee', label: 'Delivery Fee: High to Low', direction: 'DESC' },
  { value: 'minimumOrderAmount', label: 'Min Order: Low to High', direction: 'ASC' },
];

const ratingOptions = [
  { value: null, label: 'All Ratings' },
  { value: 4.5, label: '4.5+ Stars' },
  { value: 4.0, label: '4.0+ Stars' },
  { value: 3.5, label: '3.5+ Stars' },
  { value: 3.0, label: '3.0+ Stars' },
];

export default function RestaurantFilters({ filters, onFilterChange, onSortChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleCuisineChange = (cuisine) => {
    onFilterChange({ 
      ...filters, 
      cuisineType: cuisine === 'All' ? null : cuisine 
    });
  };
  
  const handleRatingChange = (rating) => {
    onFilterChange({ ...filters, minRating: rating });
  };
  
  const handleOpenStatusChange = (isOpen) => {
    onFilterChange({ ...filters, isOpen: isOpen === 'open' ? true : isOpen === 'closed' ? false : null });
  };
  
  const handleSortChange = (e) => {
    const selected = sortOptions.find(opt => opt.label === e.target.value);
    if (selected) {
      onSortChange(selected.value, selected.direction);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Filter Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <FiFilter className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-700">Filters & Sort</span>
        </div>
        {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
      </button>
      
      {/* Filter Content */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-5">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              onChange={handleSortChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {sortOptions.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Cuisine Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
            <div className="flex flex-wrap gap-2">
              {cuisineOptions.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => handleCuisineChange(cuisine)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    (cuisine === 'All' && !filters.cuisineType) || filters.cuisineType === cuisine
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
          
          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
            <div className="flex flex-wrap gap-2">
              {ratingOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleRatingChange(option.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    filters.minRating === option.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Open Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Status</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenStatusChange('all')}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  filters.isOpen === null
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleOpenStatusChange('open')}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  filters.isOpen === true
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Open Now
              </button>
              <button
                onClick={() => handleOpenStatusChange('closed')}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  filters.isOpen === false
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Closed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}