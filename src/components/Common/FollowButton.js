import React, { useState, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const FollowButton = ({ userId, isFollowingProp, onFollowChange, token }) => {
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

  if (loading) {
    return (
      <Button variant="secondary" size="sm" disabled className="d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" />
      </Button>
    );
  }

  return isFollowing ? (
    <Button variant="outline-secondary" size="sm" onClick={handleUnfollow} className="d-flex align-items-center gap-1">
      <FaUserCheck /> Following
    </Button>
  ) : (
    <Button variant="primary" size="sm" onClick={handleFollow} className="d-flex align-items-center gap-1">
      <FaUserPlus /> Follow
    </Button>
  );
};

export default FollowButton;
