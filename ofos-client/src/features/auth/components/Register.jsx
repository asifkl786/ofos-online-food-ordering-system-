import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { registerSchema } from '../schemas/authSchemas';
import { useAuth } from '../hooks/useAuth';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { 
  FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, 
  FiBriefcase, FiHome, FiTruck 
} from 'react-icons/fi';

const roleOptions = [
  { value: 'CUSTOMER', label: 'Customer', icon: FiHome },
  { value: 'RESTAURANT_OWNER', label: 'Restaurant Owner', icon: FiBriefcase },
  { value: 'DELIVERY_PARTNER', label: 'Delivery Partner', icon: FiTruck },
];

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('CUSTOMER');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (values, { setSubmitting }) => {
        alert('Form submitted! Check console for details'); // ← Add this line
        console.log('Form submitted with values:', values);
    const result = await register(values);
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/');
    }
    console.log(values);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-orange-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg mb-4">
            <span className="text-3xl font-bold text-white">OF</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us and start ordering delicious food
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              phoneNumber: '',
              password: '',
              confirmPassword: '',
              role: 'CUSTOMER',
            }}
            validationSchema={registerSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, handleChange, handleBlur, touched, errors, setFieldValue }) => (
              <Form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    name="firstName"
                    placeholder="John"
                    icon={<FiUser className="text-gray-400" />}
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.firstName && errors.firstName}
                  />
                  <Input
                    label="Last Name"
                    name="lastName"
                    placeholder="Doe"
                    icon={<FiUser className="text-gray-400" />}
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.lastName && errors.lastName}
                  />
                </div>

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  icon={<FiMail className="text-gray-400" />}
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && errors.email}
                />

                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  placeholder="9876543210"
                  icon={<FiPhone className="text-gray-400" />}
                  value={values.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.phoneNumber && errors.phoneNumber}
                />

                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  icon={<FiLock className="text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? (
                        <FiEyeOff className="text-gray-400 hover:text-gray-600" />
                      ) : (
                        <FiEye className="text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  }
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && errors.password}
                />

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  icon={<FiLock className="text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff className="text-gray-400 hover:text-gray-600" />
                      ) : (
                        <FiEye className="text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  }
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.confirmPassword && errors.confirmPassword}
                />

                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    I want to join as
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {roleOptions.map((role) => {
                      const Icon = role.icon;
                      const isSelected = values.role === role.value;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setFieldValue('role', role.value)}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50 text-orange-600'
                              : 'border-gray-200 hover:border-orange-200 text-gray-600'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-orange-500' : ''}`} />
                          <span className="text-xs font-medium">{role.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  type="submit"
                  isLoading={isSubmitting || isLoading}
                  className="w-full bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  Create Account
                </Button>

                <p className="text-center text-xs text-gray-500">
                  By signing up, you agree to our{' '}
                  <Link to="/terms" className="text-orange-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-orange-600 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </Form>
            )}
          </Formik>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}