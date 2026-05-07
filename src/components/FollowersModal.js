import React, { useState, useEffect, useCallback } from 'react';
import { Modal, ListGroup, Image, Button, Spinner } from 'react-bootstrap';
import { FaUserCircle, FaEnvelope, FaUserPlus, FaUserCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const FollowersModal = ({ show, onHide, userId, title, type }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'followers' ? 'followers' : 'following';
      const res = await fetch(`https://kazi-linda.onrender.com/api/social/${endpoint}/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch');
      }
      
      const data = await res.json();
      setUsers(data);
      
      // Check following status for each user (for followers modal)
      if (type === 'followers') {
        const statuses = {};
        for (const user of data) {
          const followRes = await fetch(`https://kazi-linda.onrender.com/api/social/following/check/${user._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const followData = await followRes.json();
          statuses[user._id] = followData.following;
        }
        setFollowingStatus(statuses);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [type, userId]);

  useEffect(() => {
    if (show && userId) {
      fetchUsers();
    }
  }, [show, userId, fetchUsers]);

  const handleFollow = async (targetUserId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch('https://kazi-linda.onrender.com/api/social/follow', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ followingId: targetUserId })
      });
      setFollowingStatus({ ...followingStatus, [targetUserId]: true });
      toast.success('Now following!');
    } catch (err) {
      toast.error('Failed to follow');
    }
  };

  const startConversation = (user) => {
    onHide();
    window.location.href = `/messages?user=${user._id}`;
  };

  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Header closeButton className="bg-warning">
        <Modal.Title>{title} ({users.length})</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="warning" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-5 text-muted">
            No {type?.toLowerCase()} to show
          </div>
        ) : (
          <ListGroup variant="flush">
            {users.map(user => (
              <ListGroup.Item key={user._id} className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  {user.profilePicture ? (
                    <Image 
                      src={user.profilePicture} 
                      roundedCircle 
                      width="50" 
                      height="50" 
                      className="me-3"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <FaUserCircle size={50} className="text-muted me-3" />
                  )}
                  <div>
                    <Link to={`/profile/${user._id}`} className="text-decoration-none text-dark fw-bold">
                      {user.name}
                    </Link>
                    <div className="text-muted small">{user.role}</div>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline-primary"
                    onClick={() => startConversation(user)}
                  >
                    <FaEnvelope /> Message
                  </Button>
                  {type === 'followers' && (
                    <Button 
                      size="sm" 
                      variant={followingStatus[user._id] ? 'secondary' : 'outline-success'}
                      onClick={() => handleFollow(user._id)}
                      disabled={followingStatus[user._id]}
                    >
                      {followingStatus[user._id] ? <FaUserCheck /> : <FaUserPlus />}
                      {followingStatus[user._id] ? ' Following' : ' Follow Back'}
                    </Button>
                  )}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FollowersModal;
