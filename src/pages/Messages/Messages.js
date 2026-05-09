import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../services/api';
import { Container, Row, Col, Card, ListGroup, Form, Button, Badge, Spinner, Image } from 'react-bootstrap';
import { FaUserCircle, FaPhone, FaVideo, FaPaperPlane, FaMapMarkerAlt, FaCircle } from 'react-icons/fa';
import ProfileModal from '../../components/ProfileModal';
import toast from 'react-hot-toast';

const Messages = () => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchUserAndStartChat = useCallback(async (userId) => {
    try {
      const res = await fetch(`https://kazi-linda.onrender.com/api/profile/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await res.json();
      setSelectedUser(userData);
    } catch (err) {
      console.error(err);
      toast.error('Could not load user');
    }
  }, [token]);

  // Check for user parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('user');
    if (userId && !selectedUser) {
      fetchUserAndStartChat(userId);
    }
  }, [fetchUserAndStartChat, selectedUser]);

  // Update online status periodically
  useEffect(() => {
    const updateOnlineStatus = async () => {
      try {
        await fetch('https://kazi-linda.onrender.com/api/social/online', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        console.error('Error updating online status:', err);
      }
    };
    
    updateOnlineStatus();
    const interval = setInterval(updateOnlineStatus, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      if (selectedUser) {
        fetchMessages(selectedUser._id, false);
      }
      fetchConversations();
    }, 15000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await messageAPI.getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId, showToast = true) => {
    try {
      const res = await messageAPI.getMessages(userId);
      setMessages(res.data.messages || res.data);
    } catch (err) {
      if (showToast) {
        console.error(err);
        toast.error('Failed to load messages');
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      await messageAPI.sendMessage({
        receiverId: selectedUser._id,
        message: newMessage,
        subject: `Message from ${user.name}`
      });
      setNewMessage('');
      await fetchMessages(selectedUser._id);
      await fetchConversations();
      toast.success('Message sent');
    } catch (err) {
      console.error('Send error:', err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const viewUserProfile = (userId) => {
    setSelectedProfileUserId(userId);
    setShowProfileModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'looking': { variant: 'success', text: 'Looking for work' },
      'working': { variant: 'primary', text: 'Currently working' },
      'available': { variant: 'success', text: 'Available' },
      'departed': { variant: 'warning', text: 'Departed' },
      'returned': { variant: 'info', text: 'Returned' },
      'distress': { variant: 'danger', text: 'Distress' }
    };
    const config = statusConfig[status] || { variant: 'secondary', text: status || 'Unknown' };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">
        Messages 
        <Badge bg="warning" className="ms-2">
          {conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)} unread
        </Badge>
      </h2>
      
      <Row>
        <Col md={4} lg={3}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white fw-bold">
              Conversations ({conversations.length})
            </Card.Header>
            <ListGroup variant="flush" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {conversations.length === 0 ? (
                <ListGroup.Item className="text-center text-muted py-5">
                  No conversations yet<br />
                  <small>Start by messaging someone!</small>
                </ListGroup.Item>
              ) : (
                conversations.map(conv => {
                  const otherUser = conv.otherUser || conv.participants?.find(p => p._id !== user._id);
                  if (!otherUser) return null;
                  
                  return (
                    <ListGroup.Item
                      key={conv._id}
                      action
                      active={selectedUser?._id === otherUser._id}
                      onClick={() => setSelectedUser(otherUser)}
                      className="p-3"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="position-relative">
                          {otherUser.profilePicture ? (
                            <Image 
                              src={otherUser.profilePicture} 
                              roundedCircle 
                              width="50" 
                              height="50" 
                              className="me-3"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <FaUserCircle size={50} className="text-warning me-3" />
                          )}
                          {otherUser.isOnline && (
                            <FaCircle className="position-absolute bottom-0 end-0 text-success" size={14} style={{ border: '2px solid white', borderRadius: '50%' }} />
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center">
                            <strong>{otherUser.name}</strong>
                            {conv.unreadCount > 0 && (
                              <Badge bg="danger" pill>{conv.unreadCount}</Badge>
                            )}
                          </div>
                          <div className="small text-muted">
                            {otherUser.role && <Badge bg="secondary" className="me-1">{otherUser.role}</Badge>}
                            {otherUser.currentStatus && getStatusBadge(otherUser.currentStatus)}
                          </div>
                          {conv.lastMessage && (
                            <div className="small text-muted mt-1 text-truncate" style={{ maxWidth: '180px' }}>
                              {conv.lastMessage}
                            </div>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  );
                })
              )}
            </ListGroup>
          </Card>
        </Col>
        
        <Col md={8} lg={9}>
          {selectedUser ? (
            <Card className="shadow-sm h-100 d-flex flex-column">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="position-relative">
                    {selectedUser.profilePicture ? (
                      <Image 
                        src={selectedUser.profilePicture} 
                        roundedCircle 
                        width="40" 
                        height="40" 
                        className="me-2"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <FaUserCircle size={40} className="text-warning me-2" />
                    )}
                    {selectedUser.isOnline && (
                      <FaCircle className="position-absolute bottom-0 end-0 text-success" size={12} style={{ border: '2px solid white', borderRadius: '50%' }} />
                    )}
                  </div>
                  <div>
                    <strong>{selectedUser.name}</strong>
                    <div>
                      {getStatusBadge(selectedUser.currentStatus)}
                      {selectedUser.currentCountry && (
                        <span className="ms-2 text-muted small">
                          <FaMapMarkerAlt className="me-1" />
                          {selectedUser.currentCountry}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <Button variant="outline-primary" size="sm" className="me-2">
                    <FaPhone /> Call
                  </Button>
                  <Button variant="outline-danger" size="sm">
                    <FaVideo /> Video
                  </Button>
                </div>
              </Card.Header>
              
              <Card.Body style={{ height: '500px', overflowY: 'auto' }}>
                {messages.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <FaUserCircle size={60} className="mb-3" />
                    <h6>No messages yet</h6>
                    <p>Start a conversation with {selectedUser.name}!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isOwn = msg.senderId?._id === user._id;
                    const sender = msg.senderId;
                    
                    return (
                      <div key={msg._id} className={`d-flex mb-3 ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}>
                        {!isOwn && (
                          <div 
                            className="me-2" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => viewUserProfile(sender?._id)}
                          >
                            {sender?.profilePicture ? (
                              <Image 
                                src={sender.profilePicture} 
                                roundedCircle 
                                width="40" 
                                height="40" 
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <FaUserCircle size={40} className="text-muted" />
                            )}
                          </div>
                        )}
                        <div className={`p-3 rounded ${isOwn ? 'bg-warning' : 'bg-light'}`} style={{ maxWidth: '70%' }}>
                          {!isOwn && (
                            <small className="text-muted d-block mb-1">
                              <strong>{sender?.name}</strong>
                              {sender?.role && <span className="ms-1">({sender.role})</span>}
                            </small>
                          )}
                          <p className="mb-0">{msg.message}</p>
                          <small className="text-muted d-block mt-1">
                            {formatDate(msg.createdAt)}
                          </small>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Card.Body>
              
              <Card.Footer className="bg-white">
                <Form onSubmit={handleSendMessage} className="d-flex">
                  <Form.Control
                    type="text"
                    placeholder={`Message ${selectedUser.name}...`}
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <Button type="submit" variant="warning" className="ms-2" disabled={sending}>
                    {sending ? <Spinner animation="border" size="sm" /> : <FaPaperPlane />}
                  </Button>
                </Form>
              </Card.Footer>
            </Card>
          ) : (
            <Card className="shadow-sm text-center py-5">
              <Card.Body>
                <FaUserCircle size={80} className="text-muted mb-3" />
                <h5>Welcome to Messages</h5>
                <p className="text-muted">
                  Select a conversation from the sidebar<br />
                  or click on a user's profile to start chatting!
                </p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
      
      <ProfileModal 
        userId={selectedProfileUserId}
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
        onSendMessage={(user) => {
          setSelectedUser(user);
          setShowProfileModal(false);
        }}
      />
    </Container>
  );
};

export default Messages;
// Add import at top

