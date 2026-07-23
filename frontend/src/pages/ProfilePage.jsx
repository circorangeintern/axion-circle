import React, { useState, useEffect, useRef } from 'react';
import { Camera, User } from 'lucide-react';
import toast from 'react-hot-toast';
import AppNavbar from '../components/AppNavbar';
import { uploadToCloudinary } from '../services/cloudinary';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const storedUser = (localStorage.getItem('user') || sessionStorage.getItem('user'));
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        setUser(JSON.parse(storedUser));
      } else {
        setUser({
          displayName: (localStorage.getItem('user_name') || sessionStorage.getItem('user_name')) || '',
          email: (localStorage.getItem('user_email') || sessionStorage.getItem('user_email')) || '',
        });
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }, []);

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const loadingToast = toast.loading('Uploading profile picture...');
      
      const secureUrl = await uploadToCloudinary(file);
      
      const updatedUser = { ...user, avatarUrl: secureUrl };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.dismiss(loadingToast);
      toast.success('Profile picture updated successfully!');
      
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.dismiss();
      toast.error('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name, email) => {
    if (name && typeof name === 'string' && name.trim() !== '') {
      return name.charAt(0).toUpperCase();
    }
    if (email && typeof email === 'string' && email.trim() !== '') {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  if (!user) {
    return <div className="min-h-screen bg-white-bg flex items-center justify-center">Loading...</div>;
  }

  const displayName = user.displayName || user.name || user.fullName || user.username || (localStorage.getItem('user_name') || sessionStorage.getItem('user_name')) || '';
  const email = user.email || (localStorage.getItem('user_email') || sessionStorage.getItem('user_email')) || '';

  return (
    <div className="min-h-screen bg-white-bg font-body flex flex-col">
      <AppNavbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Avatar Upload */}
        <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current?.click()}>
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Profile"
              width="128"
              height="128"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-white-stroke object-cover bg-white"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getInitials(displayName, email))}&background=random`;
              }}
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-white-stroke bg-primary/10 flex items-center justify-center text-primary text-3xl sm:text-5xl font-heading font-bold shadow-sm">
              {getInitials(displayName, email)}
            </div>
          )}
          
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />
        </div>

        {/* Heading */}
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-black mb-3">
          Profile Settings — Coming Soon
        </h1>

        {/* Subtext */}
        <p className="text-sm sm:text-base text-paragraph max-w-sm leading-relaxed">
          Full profile management features will be available here soon. For now, you can update your avatar above.
        </p>
      </main>
    </div>
  );
}
