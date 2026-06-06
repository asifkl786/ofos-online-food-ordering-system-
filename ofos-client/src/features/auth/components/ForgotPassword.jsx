import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheckCircle, FiCopy, FiMail, FiSend } from 'react-icons/fi';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { authService } from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error('Email address is required');
      return;
    }

    setIsLoading(true);
    setResetUrl('');

    try {
      const response = await authService.forgotPassword(email.trim());
      const data = response?.data || {};
      setResetUrl(data.resetUrl || '');
      if (data.emailSent) {
        toast.success('Reset link sent to your email');
      } else if (data.resetUrl) {
        toast.success('Email is not configured. Use the reset link shown below');
      } else {
        toast.success('Password reset request sent');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to send reset request');
    } finally {
      setIsLoading(false);
    }
  };

  const copyResetLink = async () => {
    if (!resetUrl) return;
    await navigator.clipboard.writeText(resetUrl);
    toast.success('Reset link copied');
  };

  return (
    <div className="w-full">
      <div className="mb-5 text-center">
        <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-r from-orange-500 to-red-500 shadow-lg">
          <FiMail className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-extrabold text-white">Forgot Password</h2>
        <p className="mt-1 text-sm text-white/75">Enter your email to receive a reset link</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="Enter your registered email"
          icon={<FiMail className="text-white/60" />}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          showSuccess={false}
          className="py-1.5 text-sm"
        />

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full bg-linear-to-r from-orange-500 to-red-500 py-2.5 hover:from-orange-600 hover:to-red-600"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <FiSend />
            Send Reset Link
          </span>
        </Button>
      </form>

      {resetUrl && (
        <div className="mt-4 rounded-md border border-emerald-300/30 bg-emerald-500/10 p-3 text-sm text-white">
          <div className="mb-2 flex items-center gap-2 font-semibold text-emerald-100">
            <FiCheckCircle />
            Reset link ready
          </div>
          <a
            href={resetUrl}
            className="block break-all rounded border border-white/15 bg-white/10 px-3 py-2 text-white/90 hover:text-white"
          >
            {resetUrl}
          </a>
          <button
            type="button"
            onClick={copyResetLink}
            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-orange-200 hover:text-orange-100"
          >
            <FiCopy />
            Copy link
          </button>
        </div>
      )}

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
