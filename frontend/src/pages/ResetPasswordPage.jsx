import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import AuthHeroPanel from '../components/AuthHeroPanel';
import Logo from '../components/Logo';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [token, setToken] = useState(tokenFromUrl || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!token.trim()) {
      newErrors.token = 'Reset token is required.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else {
      const missing = [];
      if (password.length < 8) missing.push('8 characters');
      if (!/[A-Z]/.test(password)) missing.push('1 uppercase letter');
      if (!/[a-z]/.test(password)) missing.push('1 lowercase letter');
      if (!/\d/.test(password)) missing.push('1 number');
      if (!/[^A-Za-z0-9]/.test(password)) missing.push('1 special character');

      if (missing.length > 0) {
        newErrors.password = `Password needs: ${missing.join(', ')}.`;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field, value) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field === 'token') setToken(value);
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword: password
      });
      setIsSuccess(true);
    } catch (error) {
      const serverMessage = error.response?.data?.message || error.response?.data?.error || 'Invalid or expired reset token.';
      setServerError(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex lg:flex font-body bg-white-bg">
        <AuthHeroPanel />
        <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-auth-form px-4 sm:px-8 my-auto flex flex-col items-center text-center animate-in fade-in duration-300">
            <div className="w-24 h-24 bg-alert-success/10 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                 {/* Decorative confetti pieces */}
                 <div className="absolute w-2 h-4 bg-blue-500 rounded-full -top-4 left-4 transform rotate-45"></div>
                 <div className="absolute w-3 h-3 bg-yellow-400 rounded-full -top-2 right-2"></div>
                 <div className="absolute w-4 h-2 bg-red-500 rounded-full top-8 -right-6 transform -rotate-45"></div>
                 <div className="absolute w-3 h-3 bg-purple-400 rounded-full bottom-4 -left-4"></div>
                 <div className="absolute w-2 h-4 bg-green-500 rounded-full -bottom-6 left-8 transform rotate-12"></div>
                 <div className="absolute w-4 h-4 bg-orange-400 rounded-full -bottom-2 right-8 clip-star"></div>
              </div>
              <div className="w-20 h-20 bg-alert-success rounded-full flex items-center justify-center relative z-10">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-black mb-3">
              Password Changed
            </h1>
            <p className="text-paragraph text-sm sm:text-base mb-8 max-w-xs">
              Your password have been changed successfully.
            </p>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-3 bg-alert-success text-white font-semibold rounded-lg hover:bg-alert-success/90 active:scale-[0.99] transition-all shadow-sm"
            >
              Back to Login
            </button>
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
              Change Your Password
            </h1>
            <p className="text-paragraph text-sm leading-relaxed">
              Input a new password which you have never used to reset password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {serverError && (
              <div className="p-3 bg-alert-errorLight border border-alert-error/20 rounded-lg text-alert-error text-sm font-medium">
                {serverError}
              </div>
            )}
            
            {!tokenFromUrl && (
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-black mb-1.5">
                  Reset Token
                </label>
                <input
                  id="token"
                  name="resetToken"
                  type="text"
                  autoComplete="off"
                  value={token}
                  onChange={(e) => handleFieldChange('token', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.token ? 'border-alert-error focus:ring-alert-errorLight' : 'border-white-stroke focus:border-primary focus:ring-primary/20'
                  }`}
                  placeholder="Paste your reset token here"
                />
                {errors.token && (
                  <p className="mt-1 text-xs text-alert-error font-medium">{errors.token}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  className={`w-full pl-4 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? 'border-alert-error focus:ring-alert-errorLight'
                      : (password && !errors.password) ? 'border-alert-success focus:ring-alert-successLight' : 'border-white-stroke focus:border-primary focus:ring-primary/20'
                  }`}
                  placeholder="*************"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black-icon hover:text-black focus:outline-none p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-1 text-xs text-alert-error font-medium">{errors.password}</p>
              ) : (password.length >= 8 && !errors.password) ? (
                <p className="mt-1 text-xs text-alert-success font-medium">Strong password</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  className={`w-full pl-4 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.confirmPassword
                      ? 'border-alert-warning text-alert-warning focus:ring-alert-warning/20'
                      : (confirmPassword && confirmPassword === password) ? 'border-alert-success focus:ring-alert-successLight' : 'border-white-stroke focus:border-primary focus:ring-primary/20'
                  }`}
                  placeholder="*************"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black-icon hover:text-black focus:outline-none p-1 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className="mt-1 text-xs text-alert-warning font-medium">
                  {errors.confirmPassword}
                </p>
              ) : (confirmPassword.length > 0 && confirmPassword === password) ? (
                <p className="mt-1 text-xs text-alert-success font-medium">
                  Password match!
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={!password || !confirmPassword || (!token && !tokenFromUrl) || isSubmitting}
              className={`w-full px-4 py-3 mt-2 font-semibold rounded-lg transition-all shadow-sm ${
                !password || !confirmPassword || (!token && !tokenFromUrl) || isSubmitting
                  ? 'bg-[#d0d3d9] text-white cursor-not-allowed'
                  : 'bg-alert-success text-white hover:bg-alert-success/90 active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? 'Changing...' : 'Change Password'}
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
