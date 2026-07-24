export const optimizeCloudinaryUrl = (url, width = 400) => {
  if (!url || typeof url !== 'string') return url;
  
  // Only process if it's a Cloudinary URL and doesn't already have transformations
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // If it already has f_auto or similar transformations, skip to avoid breaking it
    if (url.includes('/upload/f_')) return url;
    
    // Insert f_auto,q_auto,w_{width},c_fill after /upload/
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_fill/`);
  }
  
  return url;
};
