import { forwardRef, useState } from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const Input = forwardRef(({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  icon,
  rightIcon,
  required = false,
  disabled = false,
  showSuccess = true,
  helperText = '',
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const isValid = !error && touched && value && value.toString().trim().length > 0;
  const showError = error && touched;
  const showSuccessIcon = showSuccess && isValid && !showError;

  return (
    <div className="space-y-1.5">
      {/* Label with Required Star */}
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={`transition-colors duration-200 ${
              showError ? 'text-red-400' : isFocused ? 'text-orange-500' : 'text-gray-400'
            }`}>
              {icon}
            </span>
          </div>
        )}
        
        {/* Input Field */}
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          onFocus={() => setIsFocused(true)}
          disabled={disabled}
          className={`
            w-full px-3 py-2.5 border rounded-xl shadow-sm 
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
            transition-all duration-200 ease-in-out
            ${icon ? 'pl-10' : 'pl-4'}
            ${rightIcon || showSuccessIcon ? 'pr-10' : 'pr-4'}
            ${showError 
              ? 'border-red-500 bg-red-50 focus:ring-red-500' 
              : isValid 
                ? 'border-green-500 bg-green-50' 
                : isFocused 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
            ${className}
          `}
          {...props}
        />
        
        {/* Right Icons */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
          {/* Success Icon */}
          {showSuccessIcon && (
            <FiCheckCircle className="w-5 h-5 text-green-500 animate-pulse" />
          )}
          
          {/* Custom Right Icon */}
          {rightIcon && !showSuccessIcon && (
            <span className="text-gray-400">
              {rightIcon}
            </span>
          )}
        </div>
      </div>
      
      {/* Helper Text */}
      {helperText && !showError && !isValid && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <span>💡</span> {helperText}
        </p>
      )}
      
      {/* Error Message */}
      {showError && (
        <div className="mt-1.5 flex items-start gap-1.5 animate-shake">
          <FiAlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}
      
      {/* Success Message */}
      {showSuccess && isValid && !showError && (
        <div className="mt-1.5 flex items-start gap-1.5">
          <FiCheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
          <p className="text-xs text-green-600">
            ✓ Looks good!
          </p>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
