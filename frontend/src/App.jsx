import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ReactGA from 'react-ga4';

const HomePage = lazy(() => import('./pages/HomePage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const ReportDetailPage = lazy(() => import('./pages/ReportDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const MyReportsPage = lazy(() => import('./pages/MyReportsPage'));
const CreditsPage = lazy(() => import('./pages/CreditsPage'));
const RewardsPage = lazy(() => import('./pages/RewardsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

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

  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
  }, [location]);

  useEffect(() => {
    const initFacebookSDK = () => {
      if (window.FB) return;
      
      window.fbAsyncInit = function() {
        const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
        if (appId && appId !== '%VITE_FACEBOOK_APP_ID%') {
          window.FB.init({
            appId      : appId,
            cookie     : true,
            xfbml      : true,
            version    : 'v19.0'
          });
        }
      };

      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    };
    
    initFacebookSDK();
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Authenticated Routes */}
          <Route path="/my-reports" element={<MyReportsPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminReportsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
