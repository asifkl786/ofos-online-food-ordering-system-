import { forwardRef } from 'react';

const Card = forwardRef(({
  children,
  className = '',
  variant = 'default', // default, elevated, outlined, ghost
  padding = 'md', // none, sm, md, lg
  hover = false,
  onClick,
  ...props
}, ref) => {
  const variants = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg hover:shadow-xl transition-shadow',
    outlined: 'bg-transparent border-2 border-gray-200',
    ghost: 'bg-gray-50 hover:bg-gray-100',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const hoverClasses = hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer' : '';

  return (
    <div
      ref={ref}
      className={`
        rounded-xl overflow-hidden
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverClasses}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card Header Component
export const CardHeader = ({ children, className = '', icon, ...props }) => (
  <div className={`flex items-center justify-between pb-3 border-b border-gray-100 mb-3 ${className}`} {...props}>
    <div className="flex items-center space-x-2">
      {icon && <span className="text-orange-500">{icon}</span>}
      <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
    </div>
  </div>
);

// Card Body Component
export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

// Card Footer Component
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`pt-3 border-t border-gray-100 mt-3 ${className}`} {...props}>
    {children}
  </div>
);

// Card Image Component
export const CardImage = ({ src, alt, className = '', height = 'h-48', ...props }) => (
  <div className={`overflow-hidden ${height} ${className}`}>
    <img
      src={src || 'https://via.placeholder.com/400x200?text=No+Image'}
      alt={alt}
      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      {...props}
    />
  </div>
);

// Card Badge Component
export const CardBadge = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-orange-500 text-white',
    success: 'bg-green-500 text-white',
    danger: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
    secondary: 'bg-gray-500 text-white',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

// Card Price Component
export const CardPrice = ({ price, originalPrice, discount, className = '', ...props }) => {
  const hasDiscount = discount && discount > 0;
  const discountedPrice = hasDiscount ? price - (price * discount / 100) : price;

  return (
    <div className={`flex items-center space-x-2 ${className}`} {...props}>
      {hasDiscount ? (
        <>
          <span className="text-lg font-bold text-orange-600">₹{discountedPrice}</span>
          <span className="text-sm text-gray-400 line-through">₹{price}</span>
          <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded">-{discount}%</span>
        </>
      ) : (
        <span className="text-lg font-bold text-gray-900">₹{price}</span>
      )}
    </div>
  );
};

// Card Rating Component
export const CardRating = ({ rating, totalReviews, className = '', ...props }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center space-x-1 ${className}`} {...props}>
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-medium text-gray-600">{rating}</span>
      {totalReviews && (
        <span className="text-sm text-gray-400">({totalReviews} reviews)</span>
      )}
    </div>
  );
};

// Card Action Buttons
export const CardActions = ({ children, className = '', ...props }) => (
  <div className={`flex items-center space-x-2 mt-3 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;