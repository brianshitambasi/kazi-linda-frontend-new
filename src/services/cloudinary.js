// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'denczbmin';
const CLOUDINARY_UPLOAD_PRESET = 'kazi_linda_uploads'; // You need to create this in Cloudinary dashboard

// Direct upload to Cloudinary from frontend
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Upload profile picture
export const uploadProfilePicture = async (file, token) => {
  try {
    // First upload to Cloudinary
    const imageUrl = await uploadToCloudinary(file);
    
    // Then update user profile with the image URL
    const response = await fetch('https://kazi-linda.onrender.com/api/profile/me', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profilePicture: imageUrl }),
    });
    
    const data = await response.json();
    return { success: true, url: imageUrl, data };
  } catch (error) {
    console.error('Profile picture upload error:', error);
    throw error;
  }
};

// Helper to get optimized Cloudinary URL
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary')) return url;
  
  const transformations = [];
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  
  if (transformations.length === 0) return url;
  
  // Insert transformations after '/upload/'
  const parts = url.split('/upload/');
  return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
};
