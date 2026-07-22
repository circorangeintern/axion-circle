import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageCircle, AlertCircle, CheckCircle, Info } from 'lucide-react';
import api from '../services/api';
import { timeAgo } from '../utils/timeAgo';

export default function NotificationBell() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, 60000); // 60 seconds
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setIsLoading(true);
      try {
        const { data } = await api.get('/notifications?page=0&size=10');
        // Handle paginated response which usually has content or data array
        const items = data.content || data.data || data || [];
        setNotifications(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNotificationClick = async (notification) => {
    setIsOpen(false);
    try {
      await api.post('/notifications/mark-read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
    
    if (notification?.report?.id) {
      navigate(`/reports/${notification.report.id}`);
    }
  };

  const getIconForType = (type) => {
    switch (type?.toLowerCase()) {
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-primary" />;
      case 'status_change':
        return <CheckCircle className="w-5 h-5 text-alert-success" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-alert-error" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`text-black-icon hover:text-black p-1.5 relative rounded-lg hover:bg-white-bg transition-colors ${isOpen ? 'bg-white-bg text-black' : ''}`}
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-alert-error text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white transform translate-x-1 -translate-y-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white border border-white-stroke rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden origin-top-right">
          <div className="px-4 py-3 border-b border-white-stroke flex justify-between items-center bg-white-bg/50">
            <h3 className="font-bold text-black text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          
          <div className="max-h-[350px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-black-placeholder">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 mx-auto text-black-placeholder/50 mb-2" />
                <p className="text-sm text-black-icon">No notifications yet.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`text-left p-3 border-b border-white-stroke last:border-0 hover:bg-white-bg transition-colors flex gap-3 relative ${!notif.isRead ? 'bg-primary/5' : ''}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {getIconForType(notif.type)}
                    </div>
                    <div className="flex-1 overflow-hidden pr-2">
                      <p className={`text-sm truncate ${!notif.isRead ? 'font-bold text-black' : 'font-semibold text-black-icon'}`}>
                        {notif.title}
                      </p>
                      <p className={`text-xs mt-0.5 line-clamp-2 ${!notif.isRead ? 'text-black/80' : 'text-black-placeholder'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] font-medium text-black-placeholder mt-1.5">
                        {timeAgo(notif.sentAt || notif.createdAt)}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
