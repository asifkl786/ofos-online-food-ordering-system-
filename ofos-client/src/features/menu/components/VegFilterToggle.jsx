import { useMenu } from '../hooks/useMenu';
import { FiCheck } from 'react-icons/fi';

export default function VegFilterToggle() {
  const { isVegFilter, toggleVegFilter } = useMenu();
  
  return (
    <button
      onClick={toggleVegFilter}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
        ${isVegFilter 
          ? 'bg-green-500 text-white' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
      `}
    >
      <span>🥬</span>
      {isVegFilter && <FiCheck className="w-3 h-3" />}
      Veg Only
    </button>
  );
}