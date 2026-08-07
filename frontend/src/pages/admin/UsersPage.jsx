import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import SEO from '../../components/SEO';
import { Search, Eye, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [pageData, setPageData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({ page: 0, size: 10, search: '', sortBy: '', direction: 'desc' });
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Update filters when search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch, page: 0 }));
  }, [debouncedSearch]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setHasError(false);
      
      const apiFilters = {
        page: filters.page,
        size: filters.size,
        ...(filters.search ? { search: filters.search } : {})
      };
      
      const res = await api.get('/admin/users', { params: apiFilters });
      const data = res.data?.data;
      
      if (data && data.content) {
        let fetchedUsers = [...data.content];
        
        // Client-side sorting for status if active
        if (filters.sortBy === 'status') {
          fetchedUsers.sort((a, b) => {
            const statusA = a.suspended ? 1 : 0;
            const statusB = b.suspended ? 1 : 0;
            if (filters.direction === 'asc') return statusA - statusB;
            return statusB - statusA;
          });
        }
        
        setUsers(fetchedUsers);
        setPageData(data);
      } else {
        setUsers([]);
        setPageData({});
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (column) => {
    if (column !== 'status') return; // Only status sort is requested in UI
    
    let direction = 'desc';
    if (filters.sortBy === column && filters.direction === 'desc') {
      direction = 'asc';
    }
    setFilters(prev => ({ ...prev, sortBy: column, direction }));
  };

  const handleToggleStatus = async (user) => {
    const isSuspending = !user.suspended;
    const actionText = isSuspending ? 'suspend' : 'activate';
    
    setUpdatingId(user.id);
    
    // Optimistic update
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, suspended: isSuspending } : u));
    
    try {
      await api.patch(`/admin/users/${user.id}/suspend`, { suspended: isSuspending });
      toast.success(`User ${isSuspending ? 'suspended' : 'activated'} successfully`);
    } catch (err) {
      console.error(`Failed to ${actionText} user`, err);
      toast.error(`Failed to ${actionText} user. Please try again.`);
      // Revert optimistic update
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, suspended: !isSuspending } : u));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(userId => userId !== id));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedUsers, id];
      setSelectedUsers(newSelected);
      if (newSelected.length === users.length && users.length > 0) {
        setSelectAll(true);
      }
    }
  };

  const totalPages = pageData?.totalPages || 1;
  const currentPage = filters.page + 1;
  
  const SortIcon = ({ column }) => {
    if (filters.sortBy !== column) return <ChevronDown className="w-3 h-3 text-paragraph opacity-50" />;
    return filters.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  return (
    <AdminLayout>
      <SEO title="User Managements | Admin" description="CleanReport Admin User Management Dashboard" />
      
      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-[28px] font-bold text-[#1F2937] mb-1">
              User Managements
            </h1>
            <p className="text-sm text-[#6B7280] font-medium">
              Community reporters, their activity and CleanCredits balances.
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-white-stroke text-black font-semibold rounded-xl hover:bg-white-bg transition-colors shadow-sm self-start sm:self-auto text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Page
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-white-stroke rounded-2xl shadow-sm flex flex-col overflow-hidden">
          
          {/* Card Header & Search */}
          <div className="p-4 sm:p-5 border-b border-white-stroke flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-heading font-bold text-lg text-black">All Users</h2>
            
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black-icon" />
              <input 
                type="text" 
                placeholder="search for a user" 
                aria-label="Search users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-white-stroke bg-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-white-stroke text-xs font-semibold text-paragraph h-[44px]">
                  <th className="px-4 py-3 w-12">
                    <input 
                      type="checkbox" 
                      aria-label="Select all users" 
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-white-stroke text-primary focus:ring-primary" 
                    />
                  </th>
                  <th className="px-4 py-3 whitespace-nowrap">Name</th>
                  <th className="px-4 py-3 whitespace-nowrap">Phone Number</th>
                  <th className="px-4 py-3 whitespace-nowrap">No of Reports</th>
                  <th className="px-4 py-3 whitespace-nowrap">Credit Units</th>
                  <th className="px-4 py-3 cursor-pointer whitespace-nowrap" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">Status <SortIcon column="status" /></div>
                  </th>
                  <th className="px-4 py-3 whitespace-nowrap w-[146px]">Action</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white-stroke text-sm">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : hasError ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-12 text-center text-paragraph bg-white">
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-[#FFE8E8] border border-[#fdd8d6] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                          <AlertCircle className="w-8 h-8 text-[#DB0404]" />
                        </div>
                        <h3 className="font-heading font-bold text-lg text-black mb-3">Unable to load Users</h3>
                        <p className="text-sm text-paragraph leading-relaxed mb-6">
                          Our systems are currently experiencing a disruption. We couldn't retrieve the user data from the database.
                        </p>
                        <button 
                          onClick={fetchUsers}
                          className="bg-primary text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-12 text-center text-paragraph">
                      No users found matching criteria
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const initials = (user.displayName || user.firstName || 'User')
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase();
                    
                    const isSuspended = user.suspended;
                    
                    return (
                      <tr key={user.id} className="hover:bg-white-bg/50 transition-colors bg-white h-[72px]">
                        <td className="px-4 py-4">
                          <input 
                            type="checkbox" 
                            aria-label={`Select user ${user.displayName || user.email}`} 
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="w-4 h-4 rounded border-white-stroke text-primary focus:ring-primary cursor-pointer" 
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.firstName || 'User')}&background=random`} 
                              alt={user.displayName || user.email}
                              className="w-10 h-10 rounded-full object-cover shrink-0 border border-white-stroke bg-white-bg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.firstName || 'User')}&background=random`;
                              }}
                            />
                            <div className="flex flex-col min-w-0 max-w-[150px] lg:max-w-[220px] xl:max-w-[300px]">
                              <span className="font-bold text-[#1F2937] text-sm truncate">
                                {user.displayName || user.firstName || 'Unknown User'}
                              </span>
                              <span className="text-paragraph text-[13px] truncate">
                                {user.email || 'No email provided'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#4B5563] font-medium text-sm whitespace-nowrap">
                          {user.phone || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-[#4B5563] font-medium text-sm whitespace-nowrap">
                          {user.totalReports || 0}
                        </td>
                        <td className="px-4 py-4 text-[#4B5563] font-medium text-sm whitespace-nowrap">
                          {(user.creditBalance || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSuspended ? 'bg-[#EF4444]' : 'bg-[#127C2F]'}`}></span>
                            <span className={`text-[13px] font-bold ${isSuspended ? 'text-[#EF4444]' : 'text-[#127C2F]'}`}>
                              {isSuspended ? 'Suspended' : 'Active'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 w-[146px]">
                          <button 
                            onClick={() => handleToggleStatus(user)}
                            disabled={updatingId === user.id}
                            className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all disabled:opacity-50 w-full max-w-[100px] block
                              ${isSuspended 
                                ? 'bg-[#E9FFEA] text-[#127C2F] hover:bg-[#E9FFEA]/80' 
                                : 'bg-[#FEE2E2] text-[#EF4444] hover:bg-[#FEE2E2]/80'
                              }
                            `}
                          >
                            {updatingId === user.id ? '...' : (isSuspended ? 'Activate' : 'Suspend')}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Link 
                            to={`/admin/users/${user.id}`}
                            className="p-1.5 text-black-icon hover:text-primary transition-colors focus:outline-none inline-block"
                            title="View User Details"
                            aria-label="View user details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 sm:p-5 border-t border-white-stroke flex items-center justify-between">
            <button 
              disabled={currentPage === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
              className="flex items-center gap-2 px-4 py-2 border border-white-stroke rounded-xl text-sm font-semibold text-black hover:bg-white-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
            
            <div className="flex items-center justify-center flex-1 gap-1 hidden sm:flex">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setFilters(prev => ({ ...prev, page: page - 1 }))}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                        currentPage === page 
                          ? 'bg-[#127C2F] text-white shadow-sm' 
                          : 'text-paragraph hover:bg-white-bg hover:text-black'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="text-paragraph px-1">...</span>;
                }
                return null;
              })}
            </div>

            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages - 1, prev.page + 1) }))}
              className="flex items-center gap-2 px-4 py-2 border border-white-stroke rounded-xl text-sm font-semibold text-black hover:bg-white-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
