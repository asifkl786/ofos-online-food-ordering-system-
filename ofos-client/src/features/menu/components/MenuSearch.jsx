import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useMenu } from '../hooks/useMenu';

export default function MenuSearch() {
  const { setSearch, searchKeyword } = useMenu();
  const [localKeyword, setLocalKeyword] = useState(searchKeyword);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localKeyword !== searchKeyword) {
        setSearch(localKeyword);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [localKeyword]);
  
  const handleClear = () => {
    setLocalKeyword('');
    setSearch('');
  };
  
  return (
    <div className="relative mb-4">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        value={localKeyword}
        onChange={(e) => setLocalKeyword(e.target.value)}
        placeholder="Search in menu (e.g., Pizza, Burger)..."
        className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
      {localKeyword && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <FiX className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}