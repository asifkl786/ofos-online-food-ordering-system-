import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiHeart, FiStar, FiTruck, FiShield, FiArrowLeft } from 'react-icons/fi';
import { useSelector } from 'react-redux';

const features = [
  {
    icon: FiTruck,
    title: 'Fast Delivery',
    description: 'Get your food delivered within 30 minutes',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: FiHeart,
    title: 'Best Quality',
    description: 'Premium quality food from top restaurants',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: FiStar,
    title: 'Best Offers',
    description: 'Exclusive deals and discounts daily',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: FiShield,
    title: 'Secure Payment',
    description: '100% secure payment gateway',
    color: 'from-green-500 to-teal-500',
  },
];

const testimonials = [
  {
    name: 'Rahul Sharma',
    role: 'Regular Customer',
    content: 'Best food delivery platform! The food quality is amazing and delivery is always on time.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    name: 'Priya Patel',
    role: 'Food Lover',
    content: 'Love the variety of restaurants. The app is very user-friendly and customer support is great.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    name: 'Amit Kumar',
    role: 'Restaurant Owner',
    content: 'Partnering with OFOS has increased our business significantly. Highly recommended!',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
];

export default function AuthLayout() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Get page title and subtitle
  const getPageInfo = () => {
    if (isLoginPage) {
      return {
        title: 'Welcome Back!',
        subtitle: 'Sign in to continue your food journey',
      };
    }
    if (isRegisterPage) {
      return {
        title: 'Create Account',
        subtitle: 'Join us and start ordering delicious food',
      };
    }
    return {
      title: 'Authentication',
      subtitle: 'Please login or register to continue',
    };
  };

  const pageInfo = getPageInfo();

  if (isRegisterPage) {
    return (
      <div
        className="h-screen overflow-hidden bg-cover bg-center px-4 py-4"
        style={{
          backgroundImage: 'linear-gradient(115deg, rgba(15, 23, 42, 0.88), rgba(124, 45, 18, 0.66)), url(https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1800&q=85)',
        }}
      >
        <div className="mx-auto flex h-full max-w-6xl items-center justify-center">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: 'linear-gradient(115deg, rgba(15, 23, 42, 0.90), rgba(31, 41, 55, 0.76)), url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=85)',
      }}
    >
      <div className="container mx-auto h-full px-4 py-4">
        <div className="flex h-full flex-col lg:flex-row">
          {/* Left Side - Brand Section */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-5 lg:p-8">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5"
            >
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-linear-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-2xl">OF</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">Online Food</span>
                  <p className="text-sm text-gray-400">Ordering System</p>
                </div>
              </Link>
            </motion.div>

            {/* Page Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-5"
            >
              <h1 className="mb-3 text-3xl font-bold text-white lg:text-4xl">
                {pageInfo.title}
              </h1>
              <p className="text-base text-gray-300">{pageInfo.subtitle}</p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-5 grid grid-cols-2 gap-3"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm"
                  >
                    <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-r ${feature.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-white">{feature.title}</h3>
                    <p className="text-xs text-gray-400">{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Testimonials */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
            >
              <div className="mb-3 flex items-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="mb-3 text-sm italic text-gray-300">"{testimonials[currentTestimonial].content}"</p>
              <div className="flex items-center space-x-3">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-white font-semibold">{testimonials[currentTestimonial].name}</p>
                  <p className="text-gray-400 text-sm">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>

              {/* Dots */}
              <div className="flex justify-center space-x-2 mt-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentTestimonial === index
                        ? 'w-8 bg-orange-500'
                        : 'w-2 bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-5 flex justify-between border-t border-white/10 pt-5"
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-gray-400 text-sm">Restaurants</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">10k+</p>
                <p className="text-gray-400 text-sm">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">30min</p>
                <p className="text-gray-400 text-sm">Avg Delivery</p>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center p-3 lg:w-1/2 lg:p-5"
          >
            <div className="w-full max-w-[420px]">
              {/* Form Container */}
              <div className="rounded-2xl border border-white/25 bg-white/15 p-5 shadow-2xl backdrop-blur-xl lg:p-6">
                <Outlet />
              </div>

              {/* Back to Home Link */}
              <div className="mt-3 space-y-2 text-center">
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Particles Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}




