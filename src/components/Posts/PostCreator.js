import React, { useState } from 'react';
import { Form, Button, Image, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { FaImage, FaSmile } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PostCreator = ({ onPostCreated }) => {
  const { user, token } = useAuth();
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setPosting(true);
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      
      await res.json();
      setContent('');
      if (onPostCreated) onPostCreated();
      toast.success('Post shared!');
    } catch (err) {
      toast.error('Failed to post');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="post-creator bg-white rounded-3 p-3 mb-3 shadow-sm">
      <div className="d-flex gap-3">
        {user?.profilePicture ? (
          <Image src={user.profilePicture} roundedCircle width="40" height="40" />
        ) : (
          <div className="bg-secondary rounded-circle" style={{ width: '40px', height: '40px' }} />
        )}
        <Form.Control
          as="textarea"
          rows={2}
          placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-light border-0"
        />
      </div>
      <div className="d-flex justify-content-around mt-3 pt-2 border-top">
        <Button variant="link" className="text-decoration-none text-success">
          <FaImage className="me-2" /> Photo/Video
        </Button>
        <Button variant="link" className="text-decoration-none text-warning">
          <FaSmile className="me-2" /> Feeling
        </Button>
        <Button variant="warning" onClick={handleSubmit} disabled={posting} className="px-4">
          {posting ? <Spinner animation="border" size="sm" /> : 'Post'}
        </Button>
      </div>
    </div>
  );
};

export default PostCreator;
