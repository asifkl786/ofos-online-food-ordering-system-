// Helper functions for menu module

// Format currency
export const formatCurrency = (amount) => {
  if (!amount) return 'â‚¹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate discounted price
export const getDiscountedPrice = (price, discountPercentage) => {
  if (!discountPercentage || discountPercentage === 0) return price;
  const discount = (price * discountPercentage) / 100;
  return price - discount;
};

// Get preparation time text
export const getPrepTimeText = (minutes) => {
  if (!minutes) return 'Ready in 15-20 min';
  if (minutes < 60) return `Ready in ${minutes} min`;
  return `Ready in ${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
};

const nonVegKeywords = [
  'non veg', 'non-veg', 'nonveg', 'chicken', 'mutton', 'meat', 'fish', 'egg',
  'prawn', 'shrimp', 'keema', 'kebab', 'kabeb', 'tikka non veg', 'biryani non veg'
];

const hasNonVegSignal = (item) => {
  const searchableText = [
    item?.categoryName,
    item?.category,
    item?.name,
    item?.description,
  ].filter(Boolean).join(' ').toLowerCase();

  return nonVegKeywords.some((keyword) => searchableText.includes(keyword));
};

// Get dietary badge
export const getDietaryBadge = (item) => {
  if (item.isVegan === true) return { label: 'Vegan', color: 'bg-green-100 text-green-700', icon: 'VG' };
  if (item.isVegetarian === true) return { label: 'Veg', color: 'bg-green-100 text-green-700', icon: 'V' };
  if (item.isGlutenFree === true) return { label: 'Gluten Free', color: 'bg-blue-100 text-blue-700', icon: 'GF' };
  if (hasNonVegSignal(item)) return { label: 'Non-Veg', color: 'bg-red-100 text-red-700', icon: 'NV' };

  // Unclassified items should not be shown as Non-Veg by default.
  return null;
};

// Get spice level
export const getSpiceLevel = (isSpicy) => {
  if (!isSpicy) return null;
  return { label: 'Spicy', color: 'bg-red-100 text-red-700', icon: 'ðŸŒ¶ï¸' };
};

// Truncate text
export const truncateText = (text, maxLength = 80) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};