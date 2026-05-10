import React, { useState, useEffect, useCallback } from 'react';
import { Modal, ProgressBar } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import moment from 'moment';

const StoryViewer = ({ stories, onClose }) => {
  const { token } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const currentStory = stories[currentIndex];

  const goToNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  useEffect(() => {
    if (!isPaused && currentStory) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            goToNext();
            return 0;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPaused, currentStory, goToNext]);

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleReaction = async (type) => {
    try {
      await fetch(`https://kazi-linda.onrender.com/api/stories/${currentStory._id}/react`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });
      toast.success(`Reacted with ${type}!`);
    } catch (err) {
      toast.error('Failed to react');
    }
  };

  if (!currentStory) return null;

  return (
    <Modal show={true} fullscreen={true} onHide={onClose} className="story-viewer">
      <Modal.Body className="p-0">
        <div className="story-container">
          <div className="story-progress">
            <ProgressBar now={progress} variant="warning" />
          </div>
          
          <div className="story-header">
            <div className="story-user">
              {currentStory.user?.profilePicture ? (
                <img src={currentStory.user.profilePicture} alt="User" className="story-avatar" />
              ) : (
                <FaUserCircle size={40} />
              )}
              <div>
                <strong>{currentStory.user?.name}</strong>
                <div className="text-muted small">{moment(currentStory.createdAt).fromNow()}</div>
              </div>
            </div>
            <div className="story-actions">
              <button className="story-reaction" onClick={() => handleReaction('like')}>‚ù§Ô∏è</button>
              <button className="story-close" onClick={onClose}>‚úï</button>
            </div>
          </div>
          
          <div className="story-content" onClick={() => setIsPaused(!isPaused)}>
            {currentStory.mediaType === 'video' ? (
              <video src={currentStory.media} autoPlay muted={false} className="story-media" onEnded={goToNext} />
            ) : (
              <img src={currentStory.media} alt="Story" className="story-media" />
            )}
          </div>
          
          {currentStory.caption && (
            <div className="story-caption">
              <p>{currentStory.caption}</p>
            </div>
          )}
          
          <div className="story-nav">
            <div className="story-nav-left" onClick={goToPrev} />
            <div className="story-nav-right" onClick={goToNext} />
          </div>
          
          <div className="story-stats">
            <span>Ì±ÅÔ∏è {currentStory.views?.length || 0} views</span>
          </div>
        </div>
      </Modal.Body>
      
      <style>{`
        .story-viewer .modal-content { background: black; }
        .story-container { position: relative; height: 100vh; background: black; display: flex; flex-direction: column; }
        .story-progress { position: absolute; top: 0; left: 0; right: 0; z-index: 10; padding: 10px; }
        .story-header { position: absolute; top: 20px; left: 20px; right: 20px; display: flex; justify-content: space-between; align-items: center; z-index: 10; color: white; }
        .story-user { display: flex; align-items: center; gap: 12px; }
        .story-avatar { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #f39c12; object-fit: cover; }
        .story-actions { display: flex; gap: 16px; }
        .story-reaction, .story-close { background: rgba(0,0,0,0.5); border: none; color: white; font-size: 20px; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s; }
        .story-reaction:hover, .story-close:hover { transform: scale(1.1); background: rgba(0,0,0,0.7); }
        .story-content { flex: 1; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .story-media { max-width: 100%; max-height: 90vh; object-fit: contain; }
        .story-caption { position: absolute; bottom: 80px; left: 20px; right: 20px; background: rgba(0,0,0,0.5); padding: 12px; border-radius: 10px; color: white; text-align: center; }
        .story-nav { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; }
        .story-nav-left, .story-nav-right { flex: 1; cursor: pointer; }
        .story-stats { position: absolute; bottom: 20px; left: 20px; color: white; background: rgba(0,0,0,0.5); padding: 5px 12px; border-radius: 20px; font-size: 12px; }
      `}</style>
    </Modal>
  );
};

export default StoryViewer;
