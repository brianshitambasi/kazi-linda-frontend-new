import React, { useState, useEffect, useCallback } from 'react';
import { Card, Image, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import PostCreator from './Posts/PostCreator';
import { FaHeart, FaComment, FaShare } from 'react-icons/fa';

const SocialFeed = () => {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/feed', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleLike = async (postId) => {
    try {
      await fetch(`https://kazi-linda.onrender.com/api/social/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchFeed();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  return (
    <div className="social-feed">
      <PostCreator onPostCreated={fetchFeed} />
      
      {posts.length === 0 && (
        <div className="text-center text-muted py-5">
          No posts yet. Follow people to see their updates!
        </div>
      )}
      
      {posts.map(post => (
        <Card key={post._id} className="mb-3 shadow-sm">
          <Card.Body>
            <div className="d-flex align-items-center mb-3">
              {post.author?.profilePicture ? (
                <Image src={post.author.profilePicture} roundedCircle width="40" height="40" className="me-2" />
              ) : (
                <div className="bg-secondary rounded-circle me-2" style={{ width: '40px', height: '40px' }} />
              )}
              <div>
                <strong>{post.author?.name}</strong>
                <small className="text-muted d-block">{new Date(post.createdAt).toLocaleString()}</small>
              </div>
            </div>
            <p className="mb-3">{post.content}</p>
            <div className="d-flex gap-3 pt-2 border-top">
              <Button 
                variant="link" 
                onClick={() => handleLike(post._id)} 
                className="text-decoration-none"
              >
                <FaHeart className={`me-2 ${post.likes?.includes(user?._id) ? 'text-danger' : 'text-muted'}`} />
                {post.likes?.length || 0} Likes
              </Button>
              <Button variant="link" className="text-decoration-none">
                <FaComment className="me-2" /> {post.comments?.length || 0} Comments
              </Button>
              <Button variant="link" className="text-decoration-none">
                <FaShare className="me-2" /> {post.shares?.length || 0} Shares
              </Button>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default SocialFeed;
