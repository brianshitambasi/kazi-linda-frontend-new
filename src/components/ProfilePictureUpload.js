import React, { useState, useRef } from 'react';
import { Button, Spinner, Modal, Image } from 'react-bootstrap';
import { FaCamera, FaUpload } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePictureUpload = ({ onUpdate, currentImage, buttonSize = 'sm' }) => {
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { token } = useAuth();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, GIF)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setShowModal(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'kazi_linda_uploads');
      
      const uploadRes = await fetch('https://api.cloudinary.com/v1_1/denczbmin/image/upload', {
        method: 'POST',
        body: formData
      });
      
      const cloudinaryData = await uploadRes.json();
      
      if (!cloudinaryData.secure_url) {
        throw new Error('Cloudinary upload failed');
      }
      
      // Update profile with new image URL
      const response = await fetch('https://kazi-linda.onrender.com/api/profile/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profilePicture: cloudinaryData.secure_url }),
      });
      
      const data = await response.json();
      
      if (data.success || data.user) {
        toast.success('Profile picture updated successfully!');
        if (onUpdate) onUpdate(cloudinaryData.secure_url);
        setShowModal(false);
        setSelectedFile(null);
        setPreview(null);
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error('Profile update failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="position-relative d-inline-block">
        <Button
          variant="light"
          size={buttonSize}
          className="rounded-circle p-2"
          style={{ 
            position: 'absolute', 
            bottom: '5px', 
            right: '5px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          onClick={() => fileInputRef.current.click()}
          title="Change profile picture"
        >
          <FaCamera size={14} />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>

      <Modal show={showModal} onHide={handleCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Profile Picture</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {preview ? (
            <>
              <Image
                src={preview}
                rounded
                width="200"
                height="200"
                style={{ objectFit: 'cover', marginBottom: '15px' }}
              />
              <p className="mt-2">Set this as your profile picture?</p>
            </>
          ) : (
            <div className="py-4">
              <FaUpload size={40} className="text-muted mb-3" />
              <p>Select an image from your computer</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleUpload} disabled={uploading}>
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Uploading...
              </>
            ) : (
              'Confirm Upload'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProfilePictureUpload;
