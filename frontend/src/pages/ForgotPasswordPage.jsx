import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import AuthHeroPanel from '../components/AuthHeroPanel';
import Logo from '../components/Logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;

    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
    } catch (error) {
      // Always show success regardless of whether email exists for security
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setIsSuccess(true);
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
          <div className="w-full max-w-md px-8 my-auto flex flex-col items-center">
            
            <div className="w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 flex flex-col items-center text-center border border-white-stroke/50">
              <div className="w-16 h-16 bg-alert-success rounded-full flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="font-heading text-xl font-bold text-black mb-3">
                Check Your Email
              </h1>
              <p className="text-paragraph text-sm mb-8 leading-relaxed">
                Please check the email address <span className="text-alert-success font-semibold">{maskEmail(email)}</span> for instructions to reset your password.
              </p>
              
              <button
                onClick={handleResend}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-white border border-white-stroke text-black font-semibold rounded-lg hover:bg-white-bg active:scale-[0.99] transition-all shadow-sm"
              >
                {isSubmitting ? 'Sending...' : 'Resend Email'}
              </button>
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
