import { FiSearch, FiXCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function EmptyState({ type, onClearFilters }) {
  const config = {
    search: {
      icon: <FiSearch className="w-16 h-16 text-gray-300" />,
      title: 'No restaurants found',
      message: "We couldn't find any restaurants matching your search.",
      buttonText: 'Clear Search',
    },
    filter: {
      icon: <FiXCircle className="w-16 h-16 text-gray-300" />,
      title: 'No results with current filters',
      message: 'Try adjusting your filters to see more restaurants.',
      buttonText: 'Clear Filters',
    },
    default: {
      icon: <FiSearch className="w-16 h-16 text-gray-300" />,
      title: 'No restaurants available',
      message: 'Please check back later for restaurants in your area.',
      buttonText: 'Refresh',
    },
  };
  
  const current = config[type] || config.default;
  
  return (
    <div className="text-center py-16">
      <div className="mb-4">{current.icon}</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{current.title}</h3>
      <p className="text-gray-500 mb-6">{current.message}</p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          {current.buttonText}
        </button>
      )}
      <Link to="/" className="inline-block ml-3 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
        Go Home
      </Link>
    </div>
  );
}