import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { FaCamera } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePictureUpload = ({ onUpdate, currentImage, size = 40 }) => {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'kazi_linda_uploads');

      const uploadRes = await fetch('https://api.cloudinary.com/v1_1/denczbmin/image/upload', {
        method: 'POST',
        body: formData
      });
      const cloudinaryData = await uploadRes.json();

      if (cloudinaryData.secure_url) {
        const response = await fetch('https://kazi-linda.onrender.com/api/profile/me', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ profilePicture: cloudinaryData.secure_url })
        });

        if (response.ok) {
          toast.success('Profile picture updated!');
          if (onUpdate) onUpdate(cloudinaryData.secure_url);
        } else {
          toast.error('Failed to update profile picture');
        }
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        id="profile-upload"
        onChange={handleUpload}
        disabled={uploading}
      />
      <label
        htmlFor="profile-upload"
        style={{
          position: 'absolute',
          bottom: '-8px',
          right: '-8px',
          background: '#f39c12',
          borderRadius: '50%',
          width: size / 2,
          height: size / 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '2px solid white',
        }}
      >
        {uploading ? (
          <Spinner animation="border" size="sm" style={{ width: size / 3, height: size / 3 }} />
        ) : (
          <FaCamera size={size / 3} color="white" />
        )}
      </label>
    </div>
  );
};

export default ProfilePictureUpload;
