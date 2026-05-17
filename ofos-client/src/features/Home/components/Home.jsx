import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiMapPin, 
  FiClock, 
  FiStar, 
  FiTruck, 
  FiHeart, 
  FiShoppingCart,
  FiTrendingUp,
  FiAward,
  FiShield,
  FiSmile,
  FiChevronRight,
  FiArrowRight
} from 'react-icons/fi';
import { useAuth } from '../../auth/hooks/useAuth';
import toast from 'react-hot-toast';

// Sample data - Replace with actual API calls
const featuredRestaurants = [
  {
    id: 1,
    name: "Spicy Delight",
    cuisine: "North Indian, Chinese",
    rating: 4.5,
    deliveryTime: 25,
    minOrder: 199,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    isOpen: true,
    discount: 20
  },
  {
    id: 2,
    name: "Pizza Paradise",
    cuisine: "Italian, Fast Food",
    rating: 4.3,
    deliveryTime: 30,
    minOrder: 299,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
    isOpen: true,
    discount: 15
  },
  {
    id: 3,
    name: "South Indian Express",
    cuisine: "South Indian",
    rating: 4.7,
    deliveryTime: 20,
    minOrder: 149,
    image: "https://images.unsplash.com/photo-1630384060421-cf20a0d0649d?w=400",
    isOpen: true,
    discount: 10
  },
  {
    id: 4,
    name: "Burger King",
    cuisine: "American, Fast Food",
    rating: 4.2,
    deliveryTime: 25,
    minOrder: 199,
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
    isOpen: false,
    discount: 0
  },
  {
    id: 5,
    name: "The Great Kabab",
    cuisine: "Mughlai, Tandoor",
    rating: 4.6,
    deliveryTime: 35,
    minOrder: 249,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400",
    isOpen: true,
    discount: 25
  },
  {
    id: 6,
    name: "Healthy Bites",
    cuisine: "Healthy, Salad, Smoothies",
    rating: 4.4,
    deliveryTime: 20,
    minOrder: 129,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
    isOpen: true,
    discount: 5
  }
];

const categories = [
  { id: 1, name: "Pizza", icon: "🍕", color: "from-red-500 to-orange-500" },
  { id: 2, name: "Burger", icon: "🍔", color: "from-orange-500 to-yellow-500" },
  { id: 3, name: "Sushi", icon: "🍣", color: "from-green-500 to-teal-500" },
  { id: 4, name: "Chinese", icon: "🥡", color: "from-red-600 to-red-400" },
  { id: 5, name: "Indian", icon: "🍛", color: "from-orange-600 to-red-500" },
  { id: 6, name: "Desserts", icon: "🍰", color: "from-pink-500 to-rose-500" },
  { id: 7, name: "Beverages", icon: "🥤", color: "from-blue-500 to-cyan-500" },
  { id: 8, name: "Healthy", icon: "🥗", color: "from-green-600 to-emerald-500" },
];

const offers = [
  {
    id: 1,
    title: "Flat 50% OFF",
    description: "On first order above ₹299",
    code: "WELCOME50",
    bgColor: "from-purple-500 to-pink-500",
    expiry: "Limited time offer"
  },
  {
    id: 2,
    title: "Free Delivery",
    description: "On orders above ₹399",
    code: "FREEDEL",
    bgColor: "from-blue-500 to-cyan-500",
    expiry: "Valid today"
  },
  {
    id: 3,
    title: "₹100 Cashback",
    description: "On orders above ₹499",
    code: "CASH100",
    bgColor: "from-green-500 to-emerald-500",
    expiry: "Limited slots"
  }
];

const stats = [
  { icon: FiTruck, value: "30 min", label: "Average Delivery", color: "text-orange-500" },
  { icon: FiStar, value: "500+", label: "Restaurants", color: "text-yellow-500" },
  { icon: FiSmile, value: "10k+", label: "Happy Customers", color: "text-green-500" },
  { icon: FiAward, value: "100%", label: "Quality Guarantee", color: "text-blue-500" },
];

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredRestaurants, setFilteredRestaurants] = useState(featuredRestaurants);

  useEffect(() => {
    let filtered = featuredRestaurants;
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      const categoryMap = {
        "Pizza": ["Pizza Paradise"],
        "Burger": ["Burger King"],
        "Indian": ["Spicy Delight", "The Great Kabab"],
        "South Indian": ["South Indian Express"],
        "Chinese": ["Spicy Delight"],
        "Healthy": ["Healthy Bites"]
      };
      const restaurantNames = categoryMap[selectedCategory] || [];
      filtered = filtered.filter(r => restaurantNames.includes(r.name));
    }
    
    setFilteredRestaurants(filtered);
  }, [searchTerm, selectedCategory]);

  const handleAddToCart = (restaurantId) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }
    toast.success("Item added to cart!");
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon ${code} copied!`);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-linear-to-r from-orange-500 to-red-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-6xl font-bold mb-4"
            >
              Delicious Food
              <span className="block">Delivered to Your Doorstep</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 20 }}
              transition={{ delay: 0.1 }}
              className="text-lg lg:text-xl text-orange-100 mb-8"
            >
              Order from the best restaurants in town and get it delivered fast
            </motion.p>
            
            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative max-w-2xl mx-auto"
            >
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for restaurants or cuisines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
                />
              </div>
              
              {/* Location Button */}
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors">
                <FiMapPin className="w-4 h-4" />
                <span>Mumbai</span>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center space-x-8 mt-12"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="font-bold text-2xl">{stat.value}</div>
                  <div className="text-sm text-orange-100">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Shop by Category</h2>
              <p className="text-gray-500 mt-2">Explore your favorite food categories</p>
            </div>
            <Link to="/categories" className="text-orange-500 hover:text-orange-600 font-medium flex items-center">
              View All <FiChevronRight className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                className={`
                  flex flex-col items-center p-4 rounded-2xl transition-all duration-300
                  ${selectedCategory === category.name 
                    ? `bg-linear-to-r ${category.color} text-white shadow-lg scale-105` 
                    : 'bg-white border border-gray-200 text-gray-700 hover:shadow-md hover:scale-105'
                  }
                `}
              >
                <span className="text-3xl mb-2">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="py-16 bg-linear-to-r from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Exclusive Offers</h2>
            <p className="text-gray-500 mt-2">Grab these amazing deals before they're gone</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-linear-to-r ${offer.bgColor} rounded-2xl p-6 text-white relative overflow-hidden group cursor-pointer`}
                onClick={() => handleCopyCoupon(offer.code)}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
                
                <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                <p className="text-white/90 mb-4">{offer.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Use code:</p>
                    <p className="font-mono font-bold text-lg">{offer.code}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
                    {offer.expiry}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Featured Restaurants</h2>
              <p className="text-gray-500 mt-2">Handpicked restaurants just for you</p>
            </div>
            <Link to="/restaurants" className="text-orange-500 hover:text-orange-600 font-medium flex items-center">
              View All <FiChevronRight className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Link to={`/restaurant/${restaurant.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={restaurant.image} 
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {restaurant.discount > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                          {restaurant.discount}% OFF
                        </div>
                      )}
                      {!restaurant.isOpen && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-semibold px-3 py-1 bg-red-500 rounded-lg">Closed</span>
                        </div>
                      )}
                      <button 
                        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          toast.success("Added to favorites!");
                        }}
                      >
                        <FiHeart className="w-4 h-4 text-gray-500 hover:text-red-500" />
                      </button>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{restaurant.name}</h3>
                        <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-lg">
                          <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-sm font-semibold text-gray-700">{restaurant.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm mb-2">{restaurant.cuisine}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-500">
                          <FiClock className="w-4 h-4 mr-1" />
                          <span>{restaurant.deliveryTime} min</span>
                        </div>
                        <div className="text-gray-500">
                          ₹{restaurant.minOrder} min order
                        </div>
                      </div>
                      
                      <button 
                        className={`w-full mt-4 py-2 rounded-lg font-medium transition-colors ${
                          restaurant.isOpen 
                            ? 'bg-orange-500 text-white hover:bg-orange-600' 
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (restaurant.isOpen) {
                            handleAddToCart(restaurant.id);
                          }
                        }}
                        disabled={!restaurant.isOpen}
                      >
                        {restaurant.isOpen ? 'View Menu' : 'Currently Closed'}
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          {filteredRestaurants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No restaurants found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory(null);
                }}
                className="mt-4 text-orange-500 hover:text-orange-600 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-2">Order food in three simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="font-bold text-lg mb-2">1. Choose Restaurant</h3>
              <p className="text-gray-500">Browse through 500+ restaurants and select your favorite dishes</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛒</span>
              </div>
              <h3 className="font-bold text-lg mb-2">2. Place Order</h3>
              <p className="text-gray-500">Add items to cart and proceed to checkout with secure payment</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="font-bold text-lg mb-2">3. Get Delivery</h3>
              <p className="text-gray-500">Track your order in real-time and enjoy hot, fresh food</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Download Banner */}
      <section className="py-16 bg-linear-to-r from-orange-500 to-red-500">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-white text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Download Our App</h2>
              <p className="text-orange-100 text-lg mb-6">Get exclusive offers and faster delivery on our mobile app</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="bg-black text-white px-6 py-3 rounded-xl flex items-center space-x-3 hover:bg-gray-900 transition-colors">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.523 15.3414c-.3459.6918-.7363 1.2646-1.1578 1.7182-.6386.6918-1.1645.7557-1.5423.7557-.3935 0-.8403-.0999-1.2904-.2003-.6488-.1412-1.298-.2824-1.9394-.2824-.6889 0-1.3495.1455-1.9961.2938-.456.1049-.9091.2092-1.3424.2092-.3821 0-.9145-.0624-1.5577-.7528-.4692-.5022-.8916-1.219-1.2481-2.1267-.4698-1.1944-.7475-2.5219-.7645-3.7894-.0098-.6575.1068-1.3068.3549-1.8992.3818-.9112 1.0831-1.676 1.9151-2.0934.7843-.3943 1.6674-.5252 2.449-.3943.3704.0614.7299.1949 1.0835.326.3688.1365.7375.2731 1.1145.2731.3863 0 .7755-.1408 1.1642-.2816.4282-.1555.8648-.3141 1.2938-.3141.3206 0 1.7039.0675 2.6177 1.3445-2.0164 1.211-1.2249 3.6739.1975 4.6595-.3865.6242-.8862 1.1613-1.3412 1.6071zM16.301 3.532c.7579-.9553 1.2792-2.2703 1.101-3.532-1.0844.054-2.4294.7351-3.2115 1.706-.7072.8712-1.2846 2.165-1.0631 3.4336 1.1632.061 2.347-.6006 3.1736-1.6076z"/>
                  </svg>
                  <div>
                    <p className="text-xs">Download on</p>
                    <p className="text-sm font-semibold">App Store</p>
                  </div>
                </button>
                <button className="bg-black text-white px-6 py-3 rounded-xl flex items-center space-x-3 hover:bg-gray-900 transition-colors">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186c-.333-.333-.61-.849-.61-1.326V3.14c0-.478.277-.993.61-1.326zM14.5 12.5l-10 10L21 12 4.5 1.5l10 10z"/>
                  </svg>
                  <div>
                    <p className="text-xs">Get it on</p>
                    <p className="text-sm font-semibold">Google Play</p>
                  </div>
                </button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300" 
                alt="App Preview"
                className="rounded-3xl shadow-2xl w-64"
              />
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-2xl">📱</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-500 mb-6">Get the latest offers and updates straight to your inbox</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="bg-linear-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-shadow">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}