import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const KL_BRAND = '#f39c12';

const FollowButton = ({ userId, isFollowingProp, onFollowChange, token, size = 'sm' }) => {
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(isFollowingProp || false);

  useEffect(() => {
    setIsFollowing(isFollowingProp);
  }, [isFollowingProp]);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://kazi-linda.onrender.com/api/social/follow', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ followingId: userId })
      });
      
      const data = await response.json();
      if (response.ok) {
        setIsFollowing(true);
        toast.success(data.message || `Following!`);
        if (onFollowChange) onFollowChange(true);
      } else {
        toast.error(data.message || 'Failed to follow');
      }
    } catch (err) {
      console.error('Follow error:', err);
      toast.error('Failed to follow user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://kazi-linda.onrender.com/api/social/follow/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setIsFollowing(false);
        toast.success('Unfollowed');
        if (onFollowChange) onFollowChange(false);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to unfollow');
      }
    } catch (err) {
      console.error('Unfollow error:', err);
      toast.error('Failed to unfollow');
    } finally {
      setLoading(false);
    }
  };

  const followButtonStyle = {
    background: KL_BRAND,
    border: 'none',
    borderRadius: '6px',
    padding: size === 'sm' ? '6px 12px' : '8px 16px',
    fontSize: size === 'sm' ? '13px' : '14px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  const followingButtonStyle = {
    background: 'transparent',
    border: `1px solid ${KL_BRAND}`,
    color: KL_BRAND,
    borderRadius: '6px',
    padding: size === 'sm' ? '6px 12px' : '8px 16px',
    fontSize: size === 'sm' ? '13px' : '14px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  const loadingStyle = {
    background: '#e4e6eb',
    border: 'none',
    borderRadius: '6px',
    padding: size === 'sm' ? '6px 12px' : '8px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'not-allowed',
  };

  if (loading) {
    return (
      <button style={loadingStyle} disabled>
        <Spinner animation="border" size="sm" style={{ color: KL_BRAND, width: '14px', height: '14px' }} />
      </button>
    );
  }

  return isFollowing ? (
    <button style={followingButtonStyle} onClick={handleUnfollow}>
      <FaUserCheck size={14} /> Following
    </button>
  ) : (
    <button style={followButtonStyle} onClick={handleFollow}>
      <FaUserPlus size={14} /> Follow
    </button>
  );
};

export default FollowButton;
