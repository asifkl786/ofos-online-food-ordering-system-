import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheckCircle, FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { authService } from '../services/authService';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error('Reset token is missing');
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({ token, newPassword: form.newPassword });
      setIsComplete(true);
      toast.success('Password reset successfully');
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="w-full text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-100">
          <FiCheckCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white">Password Updated</h2>
        <p className="mt-2 text-sm text-white/75">Redirecting you to sign in.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-5 text-center">
        <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-r from-orange-500 to-red-500 shadow-lg">
          <FiLock className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-extrabold text-white">Reset Password</h2>
        <p className="mt-1 text-sm text-white/75">Create a new password for your account</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="New Password"
          name="newPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter new password"
          icon={<FiLock className="text-white/60" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
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
          value={form.newPassword}
          onChange={handleChange}
          showSuccess={false}
          className="py-1.5 text-sm"
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm new password"
          icon={<FiLock className="text-white/60" />}
          value={form.confirmPassword}
          onChange={handleChange}
          showSuccess={false}
          className="py-1.5 text-sm"
        />

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full bg-linear-to-r from-orange-500 to-red-500 py-2.5 hover:from-orange-600 hover:to-red-600"
        >
          Update Password
        </Button>
      </form>

      <Link
        to="/login"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-white/80 hover:text-white"
      >
        <FiArrowLeft />
        Back to sign in
      </Link>
    </div>
  );
}
