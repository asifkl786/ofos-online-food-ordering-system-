import { motion } from 'framer-motion';

export default function RestaurantStats({ restaurants }) {
  const stats = [
    {
      label: 'Total Restaurants',
      value: restaurants.length,
      color: 'text-orange-500',
      icon: '🏪',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Open Now',
      value: restaurants.filter(r => r.isOpen).length,
      color: 'text-green-500',
      icon: '🟢',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Total Orders',
      value: restaurants.reduce((sum, r) => sum + (r.totalOrders || 0), 0),
      color: 'text-blue-500',
      icon: '📦',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Avg Rating',
      value: (restaurants.reduce((sum, r) => sum + (r.averageRating || 0), 0) / (restaurants.length || 1)).toFixed(1),
      color: 'text-purple-500',
      icon: '⭐',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`${stat.bgColor} rounded-xl p-4 shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <span className="text-2xl">{stat.icon}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}