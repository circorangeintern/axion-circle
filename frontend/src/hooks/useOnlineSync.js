import { useState, useEffect } from 'react';
import { getPendingReports, removePendingReport, getPendingCount } from '../services/offlineQueue';
import { uploadToCloudinary } from '../services/cloudinary';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useOnlineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const updateCount = async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch (err) {
      console.error('Failed to get pending count:', err);
    }
  };

  const syncPendingReports = async () => {
    if (isSyncing || !navigator.onLine) return;
    
    try {
      const count = await getPendingCount();
      if (count === 0) return;
      
      setIsSyncing(true);
      const reports = await getPendingReports();
      let successCount = 0;

      for (const report of reports) {
        try {
          // Upload photo if it's a File/Blob, otherwise use existing photoUrl
          let photoUrl = report.photoUrl;
          if (report.photo instanceof Blob || report.photo instanceof File) {
            photoUrl = await uploadToCloudinary(report.photo);
          } else if (report.photo && typeof report.photo === 'string') {
            photoUrl = report.photo;
          }

          const payload = {
            title: report.title,
            photoUrl: photoUrl,
            latitude: report.latitude,
            longitude: report.longitude,
            category: report.category,
            description: report.description,
            address: report.address,
            urgency: report.urgency,
            isAnonymous: report.isAnonymous,
          };

          await api.post('/reports', payload);
          // If successful, remove from queue
          await removePendingReport(report.id);
          successCount++;
        } catch (error) {
          console.error(`Failed to sync report ${report.id}:`, error);
          // Leave it in the queue to retry later
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully synced ${successCount} offline report${successCount !== 1 ? 's' : ''}!`);
      }
    } finally {
      await updateCount();
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    updateCount();
    
    const handleOnline = () => {
      setIsOnline(true);
      // Automatically attempt sync when coming online
      syncPendingReports();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check in case we start online with pending items
    if (navigator.onLine) {
      syncPendingReports();
    }

    // Also set up a periodic check in case of flaky connections that didn't trigger 'online'
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        updateCount().then(() => {
           // We'll rely on the manual or online-triggered sync, 
           // but occasionally we can check count to ensure UI is in sync
        });
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return { isOnline, pendingCount, syncPendingReports, updateCount };
};
