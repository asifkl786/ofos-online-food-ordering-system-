import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { loginSchema } from '../schemas/authSchemas';
import { useAuth } from '../hooks/useAuth';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const getPostLoginPath = (role) => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'RESTAURANT_OWNER') return '/owner/restaurants';
    if (role === 'DELIVERY_PARTNER') return '/delivery/dashboard';
    return '/';
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getPostLoginPath(user?.role));
    }
  }, [isAuthenticated, navigate, user?.role]);

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (values, { setSubmitting }) => {
    const result = await login(values);
    if (result.meta.requestStatus === 'fulfilled') {
      const loggedInRole = result.payload?.user?.role;
      navigate(getPostLoginPath(loggedInRole));
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-r from-orange-500 to-red-500 shadow-lg">
          <span className="text-lg font-bold text-white">OF</span>
        </div>
        <h2 className="text-xl font-extrabold text-white">Welcome Back</h2>
        <p className="mt-1 text-sm text-white/75">Sign in to continue your food journey</p>
      </div>

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={loginSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, handleChange, handleBlur, touched, errors }) => (
          <Form className="space-y-3">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email"
              icon={<FiMail className="text-white/60" />}
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email}
              showSuccess={false}
              className="py-1.5 text-sm"
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              icon={<FiLock className="text-white/60" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <FiEyeOff className="text-white/60 hover:text-white/75" />
                  ) : (
                    <FiEye className="text-white/60 hover:text-white/75" />
                  )}
                </button>
              }
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && errors.password}
              showSuccess={false}
              className="py-1.5 text-sm"
            />

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/25 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white/85">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting || isLoading}
              className="w-full bg-linear-to-r from-orange-500 to-red-500 py-2.5 hover:from-orange-600 hover:to-red-600"
            >
              Sign In
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/25" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-transparent px-2 text-white/60">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex w-full items-center justify-center rounded-md border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white shadow-sm backdrop-blur hover:bg-white/20"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="mr-2 h-5 w-5" />
                Google
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-center rounded-md border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white shadow-sm backdrop-blur hover:bg-white/20"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" className="mr-2 h-5 w-5" />
                Facebook
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <p className="mt-4 text-center text-sm text-white/75">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-orange-600 hover:text-orange-500">
          Sign up now
        </Link>
      </p>
    </div>
  );
}




