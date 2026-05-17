import { useMemo } from 'react';
import { useMenu } from '../hooks/useMenu';

const categoryIcon = (name = '') => {
  const normalized = name.toLowerCase();
  if (normalized.includes('dessert') || normalized.includes('sweet')) return '??';
  if (normalized.includes('drink') || normalized.includes('beverage')) return '??';
  if (normalized.includes('rice') || normalized.includes('biryani')) return '??';
  if (normalized.includes('starter') || normalized.includes('snack')) return '??';
  if (normalized.includes('veg')) return '??';
  return '???';
};

export default function CategoryTabs() {
  const { items, selectedCategory, selectCategory } = useMenu();
  const categories = useMemo(() => {
    const mapped = new Map();
    items.forEach((item) => {
      if (item.categoryId && item.categoryName) {
        mapped.set(item.categoryId, { id: item.categoryId, name: item.categoryName, icon: categoryIcon(item.categoryName) });
      }
    });
    return [{ id: null, name: 'All', icon: '???' }, ...Array.from(mapped.values())];
  }, [items]);

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id || 'all'}
            type="button"
            onClick={() => selectCategory(category.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${selectedCategory === category.id
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <span className="text-base">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
