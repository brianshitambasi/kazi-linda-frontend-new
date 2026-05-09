import React, { useState } from 'react';
import { Button, Dropdown, Modal, Form } from 'react-bootstrap';
import { FaEdit, FaTrash, FaShare, FaFlag, FaEllipsisH } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PostActions = ({ post, isOwner, onEdit, onDelete, onShare, token }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareText, setShareText] = useState('');

  const handleEdit = async () => {
    try {
      const res = await fetch(`https://kazi-linda.onrender.com/api/social/posts/${post._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editContent })
      });
      if (res.ok) {
        toast.success('Post updated!');
        setShowEditModal(false);
        onEdit();
      } else {
        toast.error('Failed to update post');
      }
    } catch (err) {
      toast.error('Failed to update post');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const res = await fetch(`https://kazi-linda.onrender.com/api/social/posts/${post._id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          toast.success('Post deleted!');
          onDelete();
        } else {
          toast.error('Failed to delete post');
        }
      } catch (err) {
        toast.error('Failed to delete post');
      }
    }
  };

  const handleShare = async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: shareText || `Shared: ${post.content.substring(0, 100)}...`,
          originalPost: post._id,
          mediaType: 'share'
        })
      });
      if (res.ok) {
        toast.success('Post shared!');
        setShowShareModal(false);
        onShare();
      } else {
        toast.error('Failed to share');
      }
    } catch (err) {
      toast.error('Failed to share');
    }
  };

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle variant="link" className="text-muted p-0">
          <FaEllipsisH />
        </Dropdown.Toggle>
        <Dropdown.Menu align="end">
          {isOwner && (
            <>
              <Dropdown.Item onClick={() => setShowEditModal(true)}>
                <FaEdit className="me-2" /> Edit Post
              </Dropdown.Item>
              <Dropdown.Item onClick={handleDelete} className="text-danger">
                <FaTrash className="me-2" /> Delete Post
              </Dropdown.Item>
              <Dropdown.Divider />
            </>
          )}
          <Dropdown.Item onClick={() => setShowShareModal(true)}>
            <FaShare className="me-2" /> Share Post
          </Dropdown.Item>
          <Dropdown.Item>
            <FaFlag className="me-2" /> Report
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton><Modal.Title>Edit Post</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={4}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="warning" onClick={handleEdit}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Share Modal */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)}>
        <Modal.Header closeButton><Modal.Title>Share Post</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Say something about this post..."
            value={shareText}
            onChange={(e) => setShareText(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowShareModal(false)}>Cancel</Button>
          <Button variant="warning" onClick={handleShare}>Share Now</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PostActions;
