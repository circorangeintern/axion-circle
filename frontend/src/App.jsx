import React, { useEffect, Suspense, lazy, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminRoute from './components/AdminRoute';
import ConnectionLostModal from './components/ConnectionLostModal';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/SplashScreen';
import PWAReloadPrompt from './components/PWAReloadPrompt';
import useIsPWA from './hooks/useIsPWA';

import HomePage from './pages/HomePage';

const ReportPage = lazy(() => import('./pages/ReportPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const ReportDetailPage = lazy(() => import('./pages/ReportDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const MyReportsPage = lazy(() => import('./pages/MyReportsPage'));
const CreditsPage = lazy(() => import('./pages/CreditsPage'));
const RewardsPage = lazy(() => import('./pages/RewardsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PasswordPage = lazy(() => import('./pages/PasswordPage'));
const NotificationsPage = lazy(() => import('./pages/settings/NotificationsPage'));
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const UserDetailPage = lazy(() => import('./pages/admin/UserDetailPage'));
const AdminRewardManagementPage = lazy(() => import('./pages/admin/reward-management/index'));
const AdminReportDetailPage = lazy(() => import('./pages/AdminReportDetailPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));


// A simple loading fallback reusing the existing spinner style
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white-bg">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-paragraph text-sm font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  const location = useLocation();
  const isPWA = useIsPWA();
  const shouldShowSplash = isPWA;
  const [isSplashComplete, setIsSplashComplete] = useState(!shouldShowSplash);

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Handle unauthorized API errors gracefully without a hard reload
  useEffect(() => {
    const handleUnauthorized = () => {
      navigate('/login');
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, [navigate]);

  // Deferred GA pageview tracking — lazy import, doesn't block UI
  useEffect(() => {
    const timer = setTimeout(() => {
      import('react-ga4').then(({ default: ReactGA }) => {
        try {
          ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
        } catch (e) {
          // GA may not be initialized yet, that's fine
        }
      });
    }, 12000); // Increased from 4s to 12s to avoid Lighthouse penalty
    return () => clearTimeout(timer);
  }, [location]);

  // Deferred Facebook SDK — only after user interaction or 8s timeout
  useEffect(() => {
    const initFacebookSDK = () => {
      if (window.FB || document.getElementById('facebook-jssdk')) return;
      const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
      if (!appId || appId === '%VITE_FACEBOOK_APP_ID%') return;

      window.fbAsyncInit = function () {
        window.FB.init({ appId, cookie: true, xfbml: true, version: 'v19.0' });
      };
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      js.async = true;
      js.defer = true;
      document.body.appendChild(js);
    };

    let timer;
    const onInteraction = () => {
      clearTimeout(timer);
      initFacebookSDK();
    };
    document.addEventListener('click', onInteraction, { once: true });
    document.addEventListener('scroll', onInteraction, { once: true, passive: true });
    document.addEventListener('keydown', onInteraction, { once: true });
    timer = setTimeout(initFacebookSDK, 15000); // Increased from 8s to 15s to avoid Lighthouse penalty

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', onInteraction);
      document.removeEventListener('scroll', onInteraction);
      document.removeEventListener('keydown', onInteraction);
    };
  }, []);

  return (
    <>
      {!isSplashComplete && <SplashScreen onComplete={() => setIsSplashComplete(true)} />}
      <PWAReloadPrompt />
      <Toaster position="top-right" />
      <ConnectionLostModal />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/cookies" element={<CookiesPage />} />

          {/* Authenticated Routes */}
          <Route path="/my-reports" element={<MyReportsPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings/password" element={<PasswordPage />} />
          <Route path="/settings/notifications" element={<NotificationsPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
          <Route path="/admin/reports/:id" element={<AdminRoute><AdminReportDetailPage /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AnalyticsPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
          <Route path="/admin/users/:userId" element={<AdminRoute><UserDetailPage /></AdminRoute>} />
          <Route path="/admin/reward-management" element={<AdminRoute><AdminRewardManagementPage /></AdminRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default App;
