import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export default function RestaurantSearch({ onSearch, initialKeyword = '' }) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword !== initialKeyword) {
        onSearch(keyword);
      }
      setIsTyping(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [keyword, initialKeyword, onSearch]);
  
  const handleClear = () => {
    setKeyword('');
    onSearch('');
  };
  
  return (
    <div className="relative">
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setIsTyping(true);
          }}
          placeholder="Search by restaurant name, cuisine..."
          className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
        />
        {keyword && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>
      {isTyping && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}