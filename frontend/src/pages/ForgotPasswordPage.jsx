import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import AuthHeroPanel from '../components/AuthHeroPanel';
import Logo from '../components/Logo';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;

    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setIsSuccess(true);
    } catch (error) {
      // Always show success regardless of whether email exists for security
      console.error(error);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const maskEmail = (emailStr) => {
    if (!emailStr) return '';
    const [local, domain] = emailStr.split('@');
    if (local.length <= 3) return emailStr;
    return `${local.slice(0, 3)}***@${domain}`;
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex lg:flex font-body bg-white-bg">
        <AuthHeroPanel />
        <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-auth-form px-4 sm:px-8 my-auto flex flex-col items-center text-center animate-in fade-in duration-300">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-alert-success/10 rounded-full flex items-center justify-center mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-alert-success rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-black mb-3">
              Check Your Email
            </h1>
            <p className="text-paragraph text-sm sm:text-base mb-8 max-w-sm leading-relaxed">
              Please check the email address <span className="text-alert-success font-semibold">{maskEmail(email)}</span> for instructions to reset your password.
            </p>
            
            <button
              onClick={handleResend}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white border border-white-stroke text-black font-semibold rounded-lg hover:bg-white-bg active:scale-[0.99] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Resend mail'}
            </button>
            <div className="mt-8 text-center w-full">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-alert-success hover:text-alert-success/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex lg:flex font-body bg-white-bg">
      <AuthHeroPanel />

      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-sm mx-auto my-auto flex flex-col">
          <div className="mb-6 self-center">
            <Logo className="w-14 h-14 sm:w-16 sm:h-16 object-contain" />
          </div>

          <div className="text-center mb-8">
            <h1 className="font-heading text-xl font-bold text-black mb-2">
              Forgot your Password?
            </h1>
            <p className="text-paragraph text-sm leading-relaxed">
              Enter your email address and we will send you instructions to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-white-stroke rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                placeholder="enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || isSubmitting}
              className={`w-full px-4 py-3 font-semibold rounded-lg transition-all shadow-sm ${
                !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || isSubmitting
                  ? 'bg-[#d0d3d9] text-white cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90 active:scale-[0.99]'
              }`}
            >
              Continue
            </button>
          </form>

          <div className="mt-8 text-center w-full">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-alert-success hover:text-alert-success/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
