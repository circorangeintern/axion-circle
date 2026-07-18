import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../services/api';
import AuthHeroPanel from '../components/AuthHeroPanel';
import Logo from '../components/Logo';

const SharedLogo = () => (
  <div className="flex flex-col items-center justify-center">
    <Logo className="w-14 h-14 sm:w-16 sm:h-16 object-contain mb-1" />
  </div>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password: password,
      });


      const accessToken =
        response.data?.access_token ||
        response.data?.accessToken ||
        response.data?.token;
      const refreshToken =
        response.data?.refresh_token || response.data?.refreshToken;

      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }

      const userObj = response.data?.user || {
        fullName: email.split('@')[0] ? email.split('@')[0].replace(/[._0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim() : '',
        email: email.trim(),
      };
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('user_name', userObj.fullName || '');
      localStorage.setItem('user_email', email.trim());

      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error) {

      // Connection failure: timeout (ECONNABORTED) or no response from server
      if (error.isConnectionError || error.code === 'ECONNABORTED' || !error.response) {
        toast.error('Connection failed. Please try again.');
        return;
      }
      toast.error('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex lg:flex font-body bg-white-bg">
      {/* Left Column */}
      <AuthHeroPanel />

      {/* Right Column */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-auth-form px-8 my-auto">
          {/* Shared logo at top */}
          <div className="mb-6 flex justify-center">
            <SharedLogo />
          </div>

          {/* Heading & subtext */}
          <div className="text-center mb-6">
            <h1 className="font-heading text-auth-heading text-primary mb-1">
              Welcome Back, {localStorage.getItem('user_name')?.split(' ')[0] || 'there'}
            </h1>
            <p className="font-body text-auth-subtext text-paragraph">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-body" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-white-stroke rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                placeholder="enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-black mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 border border-white-stroke rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
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
            </div>

            {/* Remember for 30 days & Forgot password */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-black select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary border-white-stroke rounded focus:ring-primary/20"
                />
                <span>Remember for 30 days</span>
              </label>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); toast.success('Password reset link sent to your email!'); }}
                className="text-primary hover:underline font-semibold"
              >
                Forgot password?
              </a>
            </div>

            {/* Log into Account button */}
            <button
              type="submit"
              disabled={!email || !password || isSubmitting}
              className="w-full px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm cursor-pointer"
            >
              {isSubmitting ? 'Logging in...' : 'Log into Account'}
            </button>

            {/* Sign in with Google button */}
            <button
              type="button"
              onClick={() => toast.success('Signing in with Google...')}
              className="w-full mt-3 px-4 py-2.5 bg-white border border-white-stroke text-black font-medium rounded-lg hover:bg-white-bg active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
            >
              <svg
                className="w-5 h-5 shrink-0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
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
              Sign in with Google
            </button>
          </form>

          {/* Bottom text matching design */}
          <div className="mt-6 text-center text-sm text-paragraph font-body">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

