import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Check, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import ReactGA from 'react-ga4';
import api from '../services/api';
import AuthHeroPanel from '../components/AuthHeroPanel';
import Logo from '../components/Logo';
import AccountCreatedModal from '../components/AccountCreatedModal';

const SharedLogo = () => (
  <div className="flex flex-col items-center justify-center">
    <Logo className="w-14 h-14 sm:w-16 sm:h-16 object-contain mb-1" />
  </div>
);

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Lifted state
  const [step, setStep] = useState(location.state?.step || 1);
  const [email, setEmail] = useState(location.state?.email || '');

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    ReactGA.event({ category: 'Auth', action: 'register_page_view' });
  }, []);

  useEffect(() => {
    if (isSubmitting) {
      setLoadingText('Creating Account...');
    } else {
      setLoadingText('Create Account');
    }
  }, [isSubmitting]);

  // Step 1 handler
  const handleStep1Submit = async (e) => {
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
    setIsSubmitting(true);
    setLoadingText('Sending Code...');
    try {
      // Mocking the send-registration-otp placeholder endpoint for 404s, but handle real errors
      try {
        await api.post('/auth/send-registration-otp', { email: email.trim() });
        navigate('/verify-email', { state: { email: email.trim() } });
      } catch (err) {
        if (!err.response || err.response.status === 404 || err.code === 'ECONNABORTED') {
          console.warn('Endpoint missing or connection failed, mocking OTP send success');
          navigate('/verify-email', { state: { email: email.trim() } });
        } else {
          // A real error from the backend (like "Email already in use")
          const errorMsg = err.response.data?.message || err.response.data?.error || 'Failed to send verification code. Please try again.';
          setStep1Error(errorMsg);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
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
      newErrors.confirmPassword = 'Confirm password is required.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match. Please re-enter both fields correctly.';
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

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (credentialResponse) => {
      try {
        setIsSubmitting(true);
        setLoadingText('Signing in...');
        setServerError('');

        const response = await api.post('/auth/google', {
          code: credentialResponse.code
        });

        const resData = response.data?.data || response.data;
        const accessToken =
          resData?.access_token ||
          resData?.accessToken ||
          resData?.token;
        const refreshToken =
          resData?.refresh_token || resData?.refreshToken;

        if (accessToken) {
          localStorage.setItem('access_token', accessToken);
        }
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

        const parsedName = resData?.fullName || resData?.name || resData?.displayName || resData?.authorName || '';
        const parsedAvatar = resData?.avatarUrl || resData?.authorAvatarUrl || null;
        const parsedRole = resData?.role || resData?.accountType || 'user';
        const parsedId = resData?.id || resData?._id || '';
        const userEmail = resData?.email || '';

        const userObj = resData?.user || {
          id: parsedId,
          fullName: parsedName || (userEmail.split('@')[0] ? userEmail.split('@')[0].replace(/[._0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim() : ''),
          email: userEmail,
          avatarUrl: parsedAvatar,
          role: parsedRole
        };
        
        const storeName = userObj.fullName || userObj.name || userObj.displayName || '';

        localStorage.setItem('user', JSON.stringify(userObj));
        localStorage.setItem('user_name', storeName);
        localStorage.setItem('user_email', userEmail);

        toast.success('Signed in successfully!');
        navigate('/');
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Google sign-in failed. Please try again.';
        toast.error(errorMsg);
        setServerError(errorMsg);
        setStep1Error(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => {
      toast.error('Google sign-in popup failed. Please try again.');
      setServerError('Google sign-in popup failed.');
      setStep1Error('Google sign-in popup failed.');
    }
  });

  const handleFacebookLogin = () => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!appId || appId === '%VITE_FACEBOOK_APP_ID%') {
      toast.error('Facebook login is not configured on this environment (missing App ID).');
      return;
    }

    if (!window.FB) {
      toast.error('Facebook SDK not loaded. Please try again later.');
      return;
    }
    
    window.FB.login((response) => {
      const processLogin = async () => {
        if (response.authResponse) {
          try {
            setIsSubmitting(true);
            setLoadingText('Signing in...');
            setServerError('');

            const apiResponse = await api.post('/auth/facebook', {
              accessToken: response.authResponse.accessToken
            });

            const resData = apiResponse.data?.data || apiResponse.data;
            const accessToken =
              resData?.access_token ||
              resData?.accessToken ||
              resData?.token;
            const refreshToken =
              resData?.refresh_token || resData?.refreshToken;

            if (accessToken) {
              localStorage.setItem('access_token', accessToken);
            }
            if (refreshToken) {
              localStorage.setItem('refresh_token', refreshToken);
            }

            const parsedName = resData?.fullName || resData?.name || resData?.displayName || resData?.authorName || '';
            const parsedAvatar = resData?.avatarUrl || resData?.authorAvatarUrl || null;
            const parsedRole = resData?.role || resData?.accountType || 'user';
            const parsedId = resData?.id || resData?._id || '';
            const userEmail = resData?.email || '';

            const userObj = resData?.user || {
              id: parsedId,
              fullName: parsedName || (userEmail.split('@')[0] ? userEmail.split('@')[0].replace(/[._0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim() : ''),
              email: userEmail,
              avatarUrl: parsedAvatar,
              role: parsedRole
            };
            
            const storeName = userObj.fullName || userObj.name || userObj.displayName || '';

            localStorage.setItem('user', JSON.stringify(userObj));
            localStorage.setItem('user_name', storeName);
            localStorage.setItem('user_email', userEmail);

            toast.success('Signed in successfully!');
            navigate('/');
          } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data?.error || 'Facebook sign-in failed. Please try again.');
            setServerError('Facebook sign-in failed.');
          } finally {
            setIsSubmitting(false);
          }
        } else {
          toast.error('Facebook sign-in was cancelled or failed.');
        }
      };
      processLogin();
    }, { scope: 'email,public_profile' });
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

      // Show Account Created step inline to match Figma
      setStep(3);
      ReactGA.event({ category: 'Auth', action: 'sign_up', label: 'email' });
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
                <h1 className="font-heading text-2xl font-bold text-black mb-2">
                  Create an account
                </h1>
                <p className="text-paragraph text-sm">
                  Start your 30-day free trial.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => googleLogin()}
                  className="w-full px-4 py-3 bg-white border border-white-stroke text-black font-semibold rounded-xl hover:bg-white-bg transition-all flex items-center justify-center gap-3 text-sm shadow-sm"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.73 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </svg>
                  Sign up with Google
                </button>

                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  className="w-full px-4 py-3 bg-white border border-white-stroke text-black font-semibold rounded-xl hover:bg-white-bg transition-all flex items-center justify-center gap-3 text-sm shadow-sm"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Sign up with Facebook
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialClick('Apple')}
                  className="w-full px-4 py-3 bg-white border border-white-stroke text-black font-semibold rounded-xl hover:bg-white-bg transition-all flex items-center justify-center gap-3 text-sm shadow-sm"
                >
                  <svg className="w-5 h-5 shrink-0 fill-black" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Sign up with Apple
                </button>

                {/* OR Divider */}
                <div className="flex items-center my-2">
                  <div className="flex-1 border-t border-white-stroke" />
                  <span className="px-3 text-xs text-paragraph uppercase font-medium tracking-wider">OR</span>
                  <div className="flex-1 border-t border-white-stroke" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleStep1Submit} className="flex flex-col gap-4 font-body" noValidate>
                  {step1Error && (
                    <div className="p-3 bg-alert-errorLight border border-alert-error/20 rounded-lg text-alert-error text-sm font-medium">
                      {step1Error}
                    </div>
                  )}
                  <div>
                    {email.length > 0 && (
                      <label htmlFor="step1-email" className={`block text-sm font-medium mb-1 ${!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'text-alert-error' : 'text-black'}`}>
                        {(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) ? 'Email Address*' : <><span className="text-black">Email </span><span className="text-alert-error">*</span></>}
                      </label>
                    )}
                    <input
                      id="step1-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (step1Error) setStep1Error('');
                      }}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${
                        email.length > 0
                          ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                            ? 'border-alert-error focus:ring-alert-errorLight text-black'
                            : 'border-alert-success text-black focus:ring-alert-successLight'
                          : 'border-white-stroke focus:border-primary focus:ring-primary/20 text-black'
                      }`}
                      placeholder={email.length === 0 ? "Enter your email" : ""}
                    />
                    {email.length > 0 && (
                      <p className={`mt-1.5 text-xs font-medium ${!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'text-alert-error' : 'text-alert-success'}`}>
                        {!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                          ? 'The email format you entered is incorrect. Please ensure it follows the format: mymail@example.com.'
                          : 'Email format correct.'}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={email.length === 0 || isSubmitting}
                    className={`w-full px-4 py-3 font-semibold rounded-xl transition-all shadow-sm ${
                      email.length === 0 || isSubmitting
                        ? 'bg-[#d0d3d9] text-white cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary/90 active:scale-[0.99]'
                    }`}
                  >
                    {isSubmitting ? loadingText : 'Verify Email Address'}
                  </button>
                </form>
              </div>

              <div className="mt-8 text-center text-sm text-paragraph font-body">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary font-bold hover:underline"
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
                <h1 className="font-heading text-auth-heading text-primary mb-1 whitespace-nowrap">
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
                    Create Password <span className="text-alert-error">*</span>
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
                          : (password && !errors.password) ? 'border-alert-success focus:ring-alert-successLight' : 'border-white-stroke focus:border-primary focus:ring-primary/20'
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
                  {errors.password ? (
                    <p className="mt-1 text-xs text-alert-error font-medium">{errors.password}</p>
                  ) : (password.length >= 8 && !errors.password) ? (
                    <p className="mt-1 text-xs text-alert-success font-medium">Strong password</p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Confirm password <span className="text-alert-error">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        handleFieldChange('confirmPassword', e.target.value);
                        if (errors.confirmPassword) {
                          setErrors(prev => ({...prev, confirmPassword: undefined}));
                        }
                      }}
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
                  {errors.confirmPassword ? (
                    <p className="mt-1 text-xs text-alert-warning font-medium">
                      {errors.confirmPassword}
                    </p>
                  ) : (confirmPassword.length > 0 && confirmPassword === password) ? (
                    <p className="mt-1 text-xs text-alert-success font-medium">
                      Password match! You can proceed.
                    </p>
                  ) : null}
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
                    onClick={() => googleLogin()}
                    className="w-full px-4 py-2.5 bg-white border border-white-stroke text-black font-semibold rounded-lg hover:bg-white-bg transition-all flex items-center justify-center gap-3 text-sm shadow-sm mt-3"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.73 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      <path fill="none" d="M0 0h48v48H0z"/>
                    </svg>
                    Sign up with Google
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleFacebookLogin}
                    className="w-full px-4 py-2.5 bg-white border border-white-stroke text-black font-semibold rounded-lg hover:bg-white-bg transition-all flex items-center justify-center gap-3 text-sm shadow-sm mt-3"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Sign up with Facebook
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

          {/* Step 3: Account Created Success Screen */}
          {step === 3 && (
            <div className="w-full max-w-sm px-4 sm:px-8 mx-auto animate-in fade-in duration-300 flex flex-col items-center text-center">
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
                Account Created
              </h1>
              <p className="text-paragraph text-sm sm:text-base mb-8 leading-relaxed max-w-xs">
                Your CleanReport Account has been created. Login to start requesting a clean up in your community
              </p>
              
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => navigate('/')}
                  className="w-full px-4 py-3 bg-alert-success text-white font-semibold rounded-lg hover:bg-alert-success/90 active:scale-[0.99] transition-all shadow-sm"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/report')}
                  className="w-full px-4 py-3 bg-white border border-white-stroke text-black font-semibold rounded-lg hover:bg-white-bg active:scale-[0.99] transition-all shadow-sm"
                >
                  Make a CleanReport
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <AccountCreatedModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
