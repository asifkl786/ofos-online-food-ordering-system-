import { forwardRef } from 'react';

const Loader = forwardRef(({
  size = 'md', // sm, md, lg, xl
  variant = 'primary', // primary, white, secondary
  fullScreen = false,
  text = '',
  className = '',
  ...props
}, ref) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const variants = {
    primary: 'border-orange-200 border-t-orange-500',
    white: 'border-white/30 border-t-white',
    secondary: 'border-gray-200 border-t-gray-600',
  };

  const LoaderSpinner = () => (
    <div
      ref={ref}
      className={`
        inline-block rounded-full animate-spin
        ${sizes[size]}
        ${variants[variant]}
        ${className}
      `}
      {...props}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center space-y-4 shadow-xl">
          <LoaderSpinner />
          {text && <p className="text-gray-600">{text}</p>}
        </div>
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-8">
        <LoaderSpinner />
        <p className="text-gray-500 text-sm">{text}</p>
      </div>
    );
  }

  return <LoaderSpinner />;
});

Loader.displayName = 'Loader';

// Skeleton Loader for Cards
export const CardSkeleton = ({ count = 1, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-48 bg-gray-200 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="flex items-center space-x-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
              <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton Loader for Restaurant Detail
export const RestaurantDetailSkeleton = () => (
  <div className="max-w-6xl mx-auto">
    <div className="h-64 bg-gray-200 animate-pulse rounded-2xl" />
    <div className="mt-6 space-y-4">
      <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3" />
      <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
      <div className="flex space-x-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded w-24" />
        <div className="h-10 bg-gray-200 animate-pulse rounded w-24" />
      </div>
    </div>
  </div>
);

// Skeleton Loader for Order History
export const OrderSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-200 animate-pulse rounded w-32" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-48" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-40" />
          </div>
          <div className="h-6 bg-gray-200 animate-pulse rounded w-20" />
        </div>
      </div>
    ))}
  </div>
);

// Page Loader
export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <Loader size="lg" />
    <p className="mt-4 text-gray-500">Loading...</p>
  </div>
);

// Button Loader
export const ButtonLoader = () => (
  <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default Loader;