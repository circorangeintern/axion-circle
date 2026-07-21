import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import AuthHeroPanel from '../components/AuthHeroPanel';
import Logo from '../components/Logo';

const SharedLogo = () => (
  <div className="flex flex-col items-center justify-center">
    <Logo className="w-14 h-14 sm:w-16 sm:h-16 object-contain mb-1" />
  </div>
);

export default function RegisterPage() {
  const navigate = useNavigate();

  // Lifted state
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  // Step 1 state
  const [step1Error, setStep1Error] = useState('');

  // Step 2 state
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState('Create Account');

  useEffect(() => {
    if (isSubmitting) {
      setLoadingText('Creating Account...');
    } else {
      setLoadingText('Create Account');
    }
  }, [isSubmitting]);

  // Step 1 handler
  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setStep1Error('Email is required to continue.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStep1Error('Please enter a valid email address.');
      return;
    }
    setStep1Error('');
    setStep(2);
  };

  // Step 2 validation
  const validateStep2 = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
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
      newErrors.confirmPassword = 'Confirm Password is required.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to our Privacy & Terms of Service.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field, value) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field === 'fullName') setFullName(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
    if (field === 'agreedToTerms') setAgreedToTerms(value);
  };

  // Step 2 submit handler
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateStep2()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/register', {
        email: email.trim(),
        password: password,
        displayName: fullName.trim(),
      });



      const resData = response.data?.data || response.data;
      let token =
        resData?.access_token ||
        resData?.accessToken ||
        resData?.token;
      let refreshToken = resData?.refresh_token || resData?.refreshToken;
      let userObj = resData?.user;

      // If the backend doesn't return a token on registration, automatically log the user in
      if (!token) {
        try {
          const loginRes = await api.post('/auth/login', {
            email: email.trim(),
            password: password,
          });
          const loginData = loginRes.data?.data || loginRes.data;
          token = loginData?.access_token || loginData?.accessToken || loginData?.token;
          refreshToken = loginData?.refresh_token || loginData?.refreshToken;
          userObj = loginData?.user || userObj;
        } catch (loginErr) {
          toast.success('Account created successfully! Please log in.');
          navigate('/login');
          return;
        }
      }

      // If token is STILL missing (e.g., backend returned 200 OK but with an error payload due to DB replica delay)
      if (!token) {
        toast.success('Account created successfully! Please log in.');
        navigate('/login');
        return;
      }

      if (token) {
        localStorage.setItem('access_token', token);
      }
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }

      // Save user details to localStorage for instant UI persistence
      userObj = userObj || {
        fullName: fullName.trim(),
        email: email.trim(),
      };
      
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('user_name', userObj.fullName || userObj.name || userObj.displayName || fullName.trim());
      localStorage.setItem('user_email', email.trim());

      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {

      // Connection failure: timeout (ECONNABORTED) or no response from server
      if (error.isConnectionError || error.code === 'ECONNABORTED' || !error.response) {
        toast.error('Connection failed. Please try again.');
        return;
      }

      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (typeof error.response?.data === 'string'
          ? error.response.data
          : null) ||
        'Registration failed. Please try again.';
      setServerError(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialClick = (provider) => {
    toast(`Sign up with ${provider} coming soon!`);
  };

  return (
    <div className="min-h-screen flex lg:flex font-body bg-white-bg">
      {/* Left Column - Shared Auth Hero */}
      <AuthHeroPanel />

      {/* Right Column */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-auth-form px-8 my-auto relative">
          {/* Back button on Step 2 */}
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-black-icon hover:text-black mb-4 transition-colors p-1 -ml-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Step 1
            </button>
          )}

          {/* Shared logo at top */}
          <div className="mb-6 flex justify-center">
            <SharedLogo />
          </div>

          {/* Step 1 Flow */}
          {step === 1 && (
            <div className="animate-in fade-in duration-200">
              <div className="text-center mb-6">
                <h1 className="font-heading text-auth-heading text-primary mb-1 whitespace-nowrap">
                  Create Account
                </h1>
                <p className="font-body text-auth-subtext text-paragraph">
                  sign up to get started on cleanreport
                </p>
              </div>

              {/* Social Login Buttons and Email Input section with tight 6px gap-1.5 specifically per design */}
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSocialClick('Google')}
                  className="w-full px-4 py-2.5 bg-white border border-white-stroke text-black font-medium rounded-lg hover:bg-white-bg active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign up with Google
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialClick('Facebook')}
                  className="w-full px-4 py-2.5 bg-white border border-white-stroke text-black font-medium rounded-lg hover:bg-white-bg active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Sign up with Facebook
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialClick('Apple')}
                  className="w-full px-4 py-2.5 bg-white border border-white-stroke text-black font-medium rounded-lg hover:bg-white-bg active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0 fill-black" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Sign up with Apple
                </button>

                {/* OR Divider */}
                <div className="flex items-center my-3">
                  <div className="flex-1 border-t border-white-stroke" />
                  <span className="px-3 text-xs text-black-placeholder font-medium tracking-wider">OR</span>
                  <div className="flex-1 border-t border-white-stroke" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleStep1Submit} className="flex flex-col gap-1.5 font-body" noValidate>
                  <div>
                    <input
                      id="step1-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (step1Error) setStep1Error('');
                      }}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                        step1Error
                          ? 'border-alert-error focus:ring-alert-errorLight'
                          : 'border-white-stroke focus:border-primary focus:ring-primary/20'
                      }`}
                      placeholder="Enter your email"
                    />
                    {step1Error && (
                      <p className="mt-1 text-xs text-alert-error font-medium">{step1Error}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 active:scale-[0.99] transition-all shadow-sm cursor-pointer"
                  >
                    Get Started
                  </button>
                </form>
              </div>

              <div className="mt-6 text-center text-sm text-paragraph font-body">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Log in
                </Link>
              </div>
            </div>
          )}

          {/* Step 2 Flow */}
          {step === 2 && (
            <div className="animate-in fade-in duration-200">
              <div className="text-center mb-6">
                <h1 className="font-heading text-auth-heading text-primary mb-1">
                  Create Account
                </h1>
                <p className="font-body text-auth-subtext text-paragraph">
                  Sign up to get started with cleanreport
                </p>
              </div>

              <form onSubmit={handleStep2Submit} className="space-y-4 font-body" noValidate>
                {serverError && (
                  <div className="p-3 bg-alert-errorLight border border-alert-error/20 rounded-lg text-alert-error text-sm font-medium mb-4">
                    {serverError}
                  </div>
                )}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => handleFieldChange('fullName', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                      errors.fullName
                        ? 'border-alert-error focus:ring-alert-errorLight'
                        : 'border-white-stroke focus:border-primary focus:ring-primary/20'
                    }`}
                    placeholder="Your placeholder goes here"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-alert-error font-medium">{errors.fullName}</p>
                  )}
                </div>

                {/* Editable Email Address field carried over from Step 1 per updated design */}
                <div>
                  <label
                    htmlFor="emailAddressStep2"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="emailAddressStep2"
                    type="email"
                    value={email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                      errors.email
                        ? 'border-alert-error focus:ring-alert-errorLight'
                        : 'border-white-stroke focus:border-primary focus:ring-primary/20'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-alert-error font-medium">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Create Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => handleFieldChange('password', e.target.value)}
                      className={`w-full pl-4 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                        errors.password
                          ? 'border-alert-error focus:ring-alert-errorLight'
                          : 'border-white-stroke focus:border-primary focus:ring-primary/20'
                      }`}
                      placeholder="*************"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black-icon hover:text-black focus:outline-none p-1 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-alert-error font-medium">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) =>
                        handleFieldChange('confirmPassword', e.target.value)
                      }
                      className={`w-full pl-4 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                        errors.confirmPassword
                          ? 'border-alert-error focus:ring-alert-errorLight'
                          : 'border-white-stroke focus:border-primary focus:ring-primary/20'
                      }`}
                      placeholder="*************"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black-icon hover:text-black focus:outline-none p-1 cursor-pointer"
                      aria-label={
                        showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-alert-error font-medium">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2.5 cursor-pointer text-black select-none text-sm pt-1">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) =>
                        handleFieldChange('agreedToTerms', e.target.checked)
                      }
                      className="w-4 h-4 text-primary border-white-stroke rounded focus:ring-primary/20"
                    />
                    <span className="text-paragraph">
                      Agree to our{' '}
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-primary font-semibold hover:underline"
                      >
                        Privacy
                      </a>{' '}
                      &{' '}
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-primary font-semibold hover:underline"
                      >
                        Terms of Service
                      </a>
                    </span>
                  </label>
                  {errors.agreedToTerms && (
                    <p className="mt-1 text-xs text-alert-error font-medium">{errors.agreedToTerms}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2.5 pt-1">
                  <button
                    type="submit"
                    disabled={!fullName || !password || !confirmPassword || !agreedToTerms || isSubmitting}
                    className="w-full px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                  >
                    {isSubmitting ? loadingText : 'Create Account'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialClick('Google')}
                    className="w-full px-4 py-2.5 bg-white border border-white-stroke text-black font-medium rounded-lg hover:bg-white-bg active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign up with Google
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center text-sm text-paragraph font-body">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
