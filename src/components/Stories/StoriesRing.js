import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import StoryViewer from './StoryViewer';
import { FaPlus } from 'react-icons/fa';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';

const StoriesRing = () => {
  const { user, token } = useAuth();
  const [stories, setStories] = useState([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [storyMedia, setStoryMedia] = useState(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [storyMediaType, setStoryMediaType] = useState('photo');
  const [storyPreview, setStoryPreview] = useState(null);

  const fetchStories = useCallback(async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/stories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStories(data);
    } catch (err) {
      console.error('Error fetching stories:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchStories();
    const interval = setInterval(fetchStories, 60000);
    return () => clearInterval(interval);
  }, [fetchStories]);

  const handleStoryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video file');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File must be less than 50MB');
      return;
    }
    
    setStoryMedia(file);
    setStoryMediaType(file.type.startsWith('video') ? 'video' : 'photo');
    setStoryPreview(URL.createObjectURL(file));
    setShowUploadModal(true);
  };

  const uploadStory = async () => {
    if (!storyMedia) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', storyMedia);
      formData.append('upload_preset', 'kazi_linda_uploads');
      formData.append('resource_type', storyMediaType === 'video' ? 'video' : 'image');
      
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/denczbmin/${storyMediaType === 'video' ? 'video' : 'image'}/upload`, {
        method: 'POST',
        body: formData
      });
      const cloudinaryData = await uploadRes.json();
      
      const res = await fetch('https://kazi-linda.onrender.com/api/stories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          media: cloudinaryData.secure_url,
          mediaType: storyMediaType,
          caption: storyCaption
        })
      });
      
      if (res.ok) {
        toast.success('Story posted!');
        setShowUploadModal(false);
        setStoryMedia(null);
        setStoryCaption('');
        setStoryPreview(null);
        fetchStories();
      } else {
        toast.error('Failed to post story');
      }
    } catch (err) {
      toast.error('Failed to upload story');
    } finally {
      setUploading(false);
    }
  };

  const openStory = (index) => {
    setSelectedStoryIndex(index);
  };

  return (
    <>
      <div className="stories-ring">
        <div className="stories-scroll">
          <div className="story-create" onClick={() => document.getElementById('storyInput').click()}>
            <div className="story-create-avatar">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Your Story" className="story-create-img" />
              ) : (
                <div className="story-create-placeholder" />
              )}
              <div className="story-create-plus">
                <FaPlus />
              </div>
            </div>
            <span className="story-create-text">Create story</span>
            <input
              id="storyInput"
              type="file"
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={handleStoryUpload}
            />
          </div>
          
          {stories.map((group, idx) => {
            const isOwnStory = group.user?._id === user?._id;
            if (isOwnStory) return null;
            return (
              <div key={group.user._id} className="story-item" onClick={() => openStory(idx)}>
                <div className="story-ring">
                  {group.user?.profilePicture ? (
                    <img src={group.user.profilePicture} alt="Story" className="story-avatar" />
                  ) : (
                    <div className="story-avatar-placeholder" />
                  )}
                </div>
                <span className="story-name">{group.user?.name?.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {selectedStoryIndex !== null && stories[selectedStoryIndex] && (
        <StoryViewer
          stories={stories[selectedStoryIndex]?.stories || []}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}
      
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Create story</Modal.Title></Modal.Header>
        <Modal.Body>
          {storyPreview && (
            <div className="story-preview">
              {storyMediaType === 'video' ? (
                <video src={storyPreview} controls className="w-100 rounded" style={{ maxHeight: '400px' }} />
              ) : (
                <img src={storyPreview} alt="Preview" className="w-100 rounded" />
              )}
            </div>
          )}
          <Form.Group className="mt-3">
            <Form.Label>Add caption</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="What's happening?"
              value={storyCaption}
              onChange={(e) => setStoryCaption(e.target.value)}
            />
          </Form.Group>
          <div className="text-muted small mt-2">Your story will disappear after 24 hours</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>Cancel</Button>
          <Button variant="warning" onClick={uploadStory} disabled={uploading}>
            {uploading ? <Spinner animation="border" size="sm" /> : 'Share to Story'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      <style>{`
        .stories-ring { background: white; padding: 12px 0; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .stories-scroll { display: flex; gap: 16px; overflow-x: auto; padding: 0 16px; scrollbar-width: none; }
        .stories-scroll::-webkit-scrollbar { display: none; }
        .story-create { display: flex; flex-direction: column; align-items: center; cursor: pointer; min-width: 72px; }
        .story-create-avatar { position: relative; width: 66px; height: 66px; border-radius: 50%; background: white; border: 1px solid #e4e6eb; }
        .story-create-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .story-create-placeholder { width: 100%; height: 100%; border-radius: 50%; background: #e4e6eb; }
        .story-create-plus { position: absolute; bottom: -4px; right: -4px; background: #f39c12; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; }
        .story-create-text { font-size: 12px; color: #65676b; margin-top: 6px; }
        .story-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; min-width: 72px; }
        .story-ring { width: 66px; height: 66px; border-radius: 50%; background: linear-gradient(45deg, #f39c12, #e67e22, #f1c40f); padding: 2px; }
        .story-avatar { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid white; }
        .story-avatar-placeholder { width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .story-name { font-size: 12px; color: #65676b; margin-top: 6px; max-width: 72px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      `}</style>
    </>
  );
};

export default StoriesRing;
