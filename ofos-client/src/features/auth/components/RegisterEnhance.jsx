import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { registerSchema } from '../schemas/authSchemas';
import { useDispatch, useSelector } from 'react-redux';
import { register as registerAction, clearError } from '../slices/authSlice';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import {
  FiAlertCircle,
  FiBriefcase,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiHome,
  FiLock,
  FiMail,
  FiPhone,
  FiTruck,
  FiUser,
  FiShield,
} from 'react-icons/fi';

const roleOptions = [
  { value: 'CUSTOMER', label: 'Customer', icon: FiHome, description: 'Order food' },
  { value: 'RESTAURANT_OWNER', label: 'Restaurant Owner', icon: FiBriefcase, description: 'Manage restaurant' },
  { value: 'DELIVERY_PARTNER', label: 'Delivery Partner', icon: FiTruck, description: 'Deliver orders' },
  { value: 'ADMIN', label: 'Admin', icon: FiShield, description: 'First setup only' },
];

const PasswordStrength = ({ password }) => {
  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const label = strength <= 2 ? 'Weak' : strength <= 3 ? 'Fair' : strength <= 4 ? 'Good' : 'Strong';
  const color = strength <= 2 ? 'bg-red-500' : strength <= 3 ? 'bg-yellow-500' : strength <= 4 ? 'bg-blue-500' : 'bg-green-500';

  if (!password) return <div className="h-5" />;

  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
        <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${(strength / 5) * 100}%` }} />
      </div>
      <span className="min-w-10 text-right text-xs font-medium text-white/70">{label}</span>
    </div>
  );
};

export default function RegisterEnhance() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => () => {
    if (error) dispatch(clearError());
  }, [error, dispatch]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const { confirmPassword, ...userData } = values;
    const result = await dispatch(registerAction(userData));
    if (result.meta?.requestStatus === 'fulfilled') {
      resetForm();
    }
    setSubmitting(false);
  };

  return (
    <section className="grid h-full max-h-[calc(100vh-32px)] w-full overflow-hidden rounded-2xl border border-white/25 bg-white/15 shadow-2xl backdrop-blur-xl lg:grid-cols-[260px_1fr]">
          <aside className="hidden border-r border-white/15 bg-orange-500/80 p-6 text-white backdrop-blur-md lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-lg font-bold text-orange-600 shadow-lg">
                OF
              </div>
              <h1 className="text-2xl font-bold leading-tight">Create your Online Food account</h1>
              <p className="mt-3 text-sm leading-5 text-orange-50">
                Register once and continue as a customer, restaurant owner, or delivery partner from one simple account.
              </p>
            </div>
            <div className="space-y-2 text-sm text-orange-50">
              <div className="flex items-center gap-2"><FiCheckCircle /> Fast checkout and saved addresses</div>
              <div className="flex items-center gap-2"><FiCheckCircle /> Role based access after login</div>
              <div className="flex items-center gap-2"><FiCheckCircle /> Secure token based session</div>
            </div>
          </aside>

          <div className="min-w-0 p-4 sm:p-5 lg:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Online Food</p>
                <h2 className="text-xl font-bold text-white">Create Account</h2>
              </div>
              <p className="text-right text-sm text-white/70">
                Have account? <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700">Sign in</Link>
              </p>
            </div>

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
              validateOnMount={false}
              validateOnChange
              validateOnBlur
            >
              {({ isSubmitting, values, handleChange, handleBlur, touched, errors, setFieldValue, isValid }) => (
                <Form className="space-y-2.5">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <Input
                      label="First Name"
                      name="firstName"
                      placeholder="John"
                      icon={<FiUser className="h-4 w-4" />}
                      value={values.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.firstName}
                      touched={touched.firstName}
                      showSuccess={false}
                      required
                      className="py-1.5 text-sm"
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      placeholder="Doe"
                      icon={<FiUser className="h-4 w-4" />}
                      value={values.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.lastName}
                      touched={touched.lastName}
                      showSuccess={false}
                      required
                      className="py-1.5 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      icon={<FiMail className="h-4 w-4" />}
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.email}
                      touched={touched.email}
                      showSuccess={false}
                      required
                      className="py-1.5 text-sm"
                    />
                    <Input
                      label="Phone Number"
                      name="phoneNumber"
                      maxLength="10"
                      type="tel"
                      placeholder="9876543210"
                      icon={<FiPhone className="h-4 w-4" />}
                      value={values.phoneNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.phoneNumber}
                      touched={touched.phoneNumber}
                      showSuccess={false}
                      required
                      className="py-1.5 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <Input
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Strong password"
                        icon={<FiLock className="h-4 w-4" />}
                        rightIcon={(
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none" aria-label="Toggle password">
                            {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                          </button>
                        )}
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.password}
                        touched={touched.password}
                        showSuccess={false}
                        required
                        className="py-1.5 text-sm"
                      />
                      <PasswordStrength password={values.password} />
                    </div>
                    <Input
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      icon={<FiLock className="h-4 w-4" />}
                      rightIcon={(
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="focus:outline-none" aria-label="Toggle confirm password">
                          {showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                        </button>
                      )}
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.confirmPassword}
                      touched={touched.confirmPassword}
                      showSuccess={false}
                      required
                      className="py-1.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/90">
                      I want to join as <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {roleOptions.map((role) => {
                        const Icon = role.icon;
                        const isSelected = values.role === role.value;
                        return (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => setFieldValue('role', role.value)}
                            className={`flex min-h-16 items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all ${
                              isSelected
                                ? 'border-orange-300 bg-orange-500/25 text-white shadow-sm'
                                : 'border-white/20 text-white/80 hover:border-orange-200/70 hover:bg-white/15'
                            }`}
                          >
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${isSelected ? 'bg-orange-500 text-white' : 'bg-white/15 text-white/70'}`}> 
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-xs font-semibold leading-tight sm:text-sm">{role.label}</span>
                              <span className="hidden truncate text-xs text-white/60 sm:block">{role.description}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-300/50 bg-red-500/15 px-3 py-2">
                      <p className="flex items-center gap-2 text-sm text-red-100">
                        <FiAlertCircle className="h-4 w-4" />
                        {typeof error === 'string' ? error : error.message || 'Registration failed'}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    isLoading={isSubmitting || isLoading}
                    disabled={isSubmitting || isLoading || !isValid}
                    className="w-full rounded-xl py-2 text-sm font-semibold shadow-md disabled:transform-none"
                  >
                    {isSubmitting || isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  <p className="text-center text-xs text-white/70">
                    By signing up, you agree to our <Link to="/terms" className="text-orange-600 hover:underline">Terms</Link> and <Link to="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link>.
                  </p>
                </Form>
              )}
            </Formik>
          </div>
    </section>
  );
}



