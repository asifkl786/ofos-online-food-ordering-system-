import * as yup from 'yup';

// ============================================
// REGEX PATTERNS
// ============================================
const phoneRegex = /^[0-9]{10}$/;
const nameRegex = /^[A-Za-z\s]{2,50}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;

// ============================================
// ERROR MESSAGES
// ============================================
const errorMessages = {
  firstName: {
    required: '✨ First name is required',
    min: '📝 First name must be at least 2 characters',
    max: '📝 First name cannot exceed 50 characters',
    pattern: '🔤 First name can only contain letters',
  },
  lastName: {
    required: '✨ Last name is required',
    min: '📝 Last name must be at least 2 characters',
    max: '📝 Last name cannot exceed 50 characters',
    pattern: '🔤 Last name can only contain letters',
  },
  email: {
    required: '📧 Email address is required',
    email: '📧 Please enter a valid email address (e.g., name@example.com)',
  },
  phoneNumber: {
    required: '📱 Phone number is required',
    pattern: '📱 Please enter a valid 10-digit mobile number',
    min: '📱 Phone number must be exactly 10 digits',
    max: '📱 Phone number must be exactly 10 digits',
  },
  password: {
    required: '🔒 Password is required',
    min: '🔒 Password must be at least 6 characters',
    max: '🔒 Password cannot exceed 20 characters',
    uppercase: '🔠 Password must contain at least one uppercase letter (A-Z)',
    lowercase: '🔡 Password must contain at least one lowercase letter (a-z)',
    number: '🔢 Password must contain at least one number (0-9)',
    special: '✨ Password must contain at least one special character (!@#$%^&*)',
  },
  confirmPassword: {
    required: '✓ Please confirm your password',
    oneOf: '⚠️ Passwords do not match. Please re-enter.',
  },
};

// ============================================
// MAIN VALIDATION SCHEMA
// ============================================
export const registerSchema = yup.object().shape({
  // First Name Validation
  firstName: yup
    .string()
    .required(errorMessages.firstName.required)
    .min(2, errorMessages.firstName.min)
    .max(50, errorMessages.firstName.max)
    .matches(/^[A-Za-z\s]+$/, errorMessages.firstName.pattern)
    .trim(),
  
  // Last Name Validation
  lastName: yup
    .string()
    .required(errorMessages.lastName.required)
    .min(2, errorMessages.lastName.min)
    .max(50, errorMessages.lastName.max)
    .matches(/^[A-Za-z\s]+$/, errorMessages.lastName.pattern)
    .trim(),
  
  // Email Validation
  email: yup
    .string()
    .required(errorMessages.email.required)
    .email(errorMessages.email.email)
    .lowercase()
    .trim(),
  
  // Phone Number Validation
  phoneNumber: yup
    .string()
    .required(errorMessages.phoneNumber.required)
    .matches(phoneRegex, errorMessages.phoneNumber.pattern)
    .min(10, errorMessages.phoneNumber.min)
    .max(10, errorMessages.phoneNumber.max),
  
  // Password Validation
  password: yup
    .string()
    .required(errorMessages.password.required)
    .min(6, errorMessages.password.min)
    .max(20, errorMessages.password.max)
    .matches(/[A-Z]/, errorMessages.password.uppercase)
    .matches(/[a-z]/, errorMessages.password.lowercase)
    .matches(/[0-9]/, errorMessages.password.number)
    .matches(/[!@#$%^&*]/, errorMessages.password.special),
  
  // Confirm Password Validation
  confirmPassword: yup
    .string()
    .required(errorMessages.confirmPassword.required)
    .oneOf([yup.ref('password'), null], errorMessages.confirmPassword.oneOf),
  
  // Role Validation
  role: yup
    .string()
    .oneOf(['CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER', 'ADMIN'], 'Please select a valid role')
    .default('CUSTOMER'),
});

// ============================================
// LOGIN SCHEMA (Optional)
// ============================================
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('📧 Email is required')
    .email('📧 Please enter a valid email address'),
  password: yup
    .string()
    .required('🔒 Password is required')
    .min(6, '🔒 Password must be at least 6 characters'),
});

export const updateProfileSchema = yup.object().shape({
  firstName: yup
    .string()
    .required(errorMessages.firstName.required)
    .min(2, errorMessages.firstName.min)
    .max(50, errorMessages.firstName.max)
    .matches(/^[A-Za-z\s]+$/, errorMessages.firstName.pattern)
    .trim(),
  lastName: yup
    .string()
    .required(errorMessages.lastName.required)
    .min(2, errorMessages.lastName.min)
    .max(50, errorMessages.lastName.max)
    .matches(/^[A-Za-z\s]+$/, errorMessages.lastName.pattern)
    .trim(),
  phoneNumber: yup
    .string()
    .nullable()
    .matches(phoneRegex, {
      message: errorMessages.phoneNumber.pattern,
      excludeEmptyString: true,
    }),
  profileImageUrl: yup
    .string()
    .nullable()
    .url('Please enter a valid image URL'),
});

export const changePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Current password is required'),
  newPassword: yup
    .string()
    .required(errorMessages.password.required)
    .min(6, errorMessages.password.min)
    .max(20, errorMessages.password.max)
    .matches(/[A-Z]/, errorMessages.password.uppercase)
    .matches(/[a-z]/, errorMessages.password.lowercase)
    .matches(/[0-9]/, errorMessages.password.number)
    .matches(/[!@#$%^&*]/, errorMessages.password.special),
  confirmNewPassword: yup
    .string()
    .required(errorMessages.confirmPassword.required)
    .oneOf([yup.ref('newPassword'), null], errorMessages.confirmPassword.oneOf),
});
