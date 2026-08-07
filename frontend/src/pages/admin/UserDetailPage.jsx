import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import SEO from '../../components/SEO';
import { ChevronRight, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import UserProfileHeader from '../../components/admin/user-details/UserProfileHeader';
import UserStatCards from '../../components/admin/user-details/UserStatCards';
import UserTabsBar from '../../components/admin/user-details/UserTabsBar';

// Lazy loaded tab components
const ProfileTab = lazy(() => import('../../components/admin/user-details/ProfileTab'));
const ReportsTab = lazy(() => import('../../components/admin/user-details/ReportsTab'));
const RewardsTab = lazy(() => import('../../components/admin/user-details/RewardsTab'));
const ActivityTab = lazy(() => import('../../components/admin/user-details/ActivityTab'));

export default function UserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/admin/users/${userId}`);
      setUser(res.data?.data);
    } catch (err) {
      console.error('Failed to fetch user details', err);
      setError('Unable to load user profile. Please try again.');
      if (err.response?.status === 404) {
        toast.error('User not found');
        navigate('/admin/users');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const handleToggleStatus = async () => {
    if (!user) return;
    
    const isSuspending = !user.suspended;
    const actionText = isSuspending ? 'suspend' : 'activate';
    
    setUpdatingStatus(true);
    try {
      await api.patch(`/admin/users/${user.id}/suspend`, { suspended: isSuspending });
      setUser(prev => ({ ...prev, suspended: isSuspending }));
      toast.success(`User ${isSuspending ? 'suspended' : 'activated'} successfully`);
    } catch (err) {
      console.error(`Failed to ${actionText} user`, err);
      toast.error(`Failed to ${actionText} user. Please try again.`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to delete this user? This action can be undone later via restore.')) return;
    
    setUpdatingStatus(true);
    try {
      await api.delete(`/admin/users/${user.id}`);
      toast.success('User deleted successfully');
      navigate('/admin/users');
    } catch (err) {
      console.error('Failed to delete user', err);
      toast.error('Failed to delete user. Please try again.');
      setUpdatingStatus(false);
    }
  };

  const TabFallback = () => (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (loading && !user) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !user) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-[#FFE8E8] border border-[#fdd8d6] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <AlertCircle className="w-8 h-8 text-[#DB0404]" />
          </div>
          <h3 className="font-heading font-bold text-lg text-black mb-3">{error}</h3>
          <button 
            onClick={fetchUserDetails}
            className="bg-primary text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2 mt-4"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!user) return null;

  return (
    <AdminLayout>
      <SEO title={`${user.displayName || user.firstName || 'User'} | Admin`} />
      
      <div className="flex flex-col gap-6 max-w-[1000px] mx-auto pb-10">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-sm font-bold text-[#1F2937]">
            <Link to="/admin" className="hover:text-primary transition-colors">Dashboard</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-[#6B7280]" />
            <Link to="/admin/users" className="hover:text-primary transition-colors">User Profile</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-[#6B7280]" />
            <span className="text-[#127C2F]">
              {activeTab === 'profile' && 'Profile Details'}
              {activeTab === 'reports' && 'Reports'}
              {activeTab === 'rewards' && 'Rewards'}
              {activeTab === 'activity' && 'Activity'}
            </span>
          </div>
          <p className="text-sm text-[#6B7280] font-medium">Profile of a Cleanreport user</p>
        </div>

        {/* Profile Header Card */}
        <UserProfileHeader 
          user={user} 
          activeTab={activeTab}
          onToggleStatus={handleToggleStatus}
          onDeleteUser={handleDeleteUser}
          isUpdating={updatingStatus}
        />

        {/* Stat Cards */}
        <UserStatCards user={user} />

        {/* Tabs Bar */}
        <UserTabsBar 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          reportsCount={user.totalReports || 0} 
        />

        {/* Tab Content */}
        <div className="mt-2">
          <Suspense fallback={<TabFallback />}>
            {activeTab === 'profile' && <ProfileTab user={user} />}
            {activeTab === 'reports' && <ReportsTab userId={user.id} />}
            {activeTab === 'rewards' && <RewardsTab userId={user.id} />}
            {activeTab === 'activity' && <ActivityTab userId={user.id} />}
          </Suspense>
        </div>
      </div>
    </AdminLayout>
  );
}
