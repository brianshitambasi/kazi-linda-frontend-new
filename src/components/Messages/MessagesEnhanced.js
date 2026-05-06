import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageAPI, profileAPI } from '../../services/api';
import { Container, Row, Col, Card, ListGroup, Form, Button, Badge, Spinner, Image, Modal } from 'react-bootstrap';
import { FaUserCircle, FaPhone, FaVideo, FaPaperPlane, FaMapMarkerAlt, FaBriefcase, FaLanguage, FaStar, FaRegClock, FaCheckCircle, FaGraduationCap, FaCertificate, FaHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import moment from 'moment';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const messagesEndRef = useRef(null);

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
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const viewUserProfile = async (userId) => {
    try {
      const res = await profileAPI.getPublicProfile(userId);
      setUserProfile(res.data);
      setShowProfileModal(true);
    } catch (err) {
      toast.error('Failed to load profile');
    }
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
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar key={i} className={i <= rating ? 'text-warning' : 'text-muted'} size={14} />
      );
    }
    return stars;
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
      <h2 className="mb-4">Messages</h2>
      
      <Row>
        <Col md={4} lg={3}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white fw-bold">Conversations</Card.Header>
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
                <div className="d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => viewUserProfile(selectedUser._id)}>
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
                  <div>
                    <strong>{selectedUser.name}</strong>
                    <div>
                      {getStatusBadge(selectedUser.currentStatus)}
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
                            </small>
                          )}
                          <p className="mb-0">{msg.message}</p>
                          <small className="text-muted d-block mt-1">
                            {moment(msg.createdAt).format('HH:mm')}
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
                  or start a new one by messaging a user
                </p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
      
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} size="lg">
        <Modal.Header closeButton className="bg-warning">
          <Modal.Title>
            <FaUserCircle className="me-2" />
            {userProfile?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userProfile && (
            <Row>
              <Col md={4} className="text-center">
                {userProfile.profilePicture ? (
                  <Image 
                    src={userProfile.profilePicture} 
                    roundedCircle 
                    width="150" 
                    height="150" 
                    className="mb-3"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <FaUserCircle size={150} className="text-muted mb-3" />
                )}
                <div>
                  {getRatingStars(userProfile.rating || 0)}
                  <span className="ms-2">({userProfile.totalRatings || 0})</span>
                </div>
                {getStatusBadge(userProfile.currentStatus)}
              </Col>
              <Col md={8}>
                <h6>About</h6>
                <p>{userProfile.bio || 'No bio provided'}</p>
                
                <h6>Location</h6>
                <p>
                  <FaMapMarkerAlt className="me-1" />
                  From: {userProfile.countryOfOrigin || 'Not specified'}<br />
                  Currently: {userProfile.currentCountry || 'Not specified'}
                </p>
                
                {userProfile.skills?.length > 0 && (
                  <>
                    <h6>Skills</h6>
                    <div>
                      {userProfile.skills.map((skill, idx) => (
                        <Badge key={idx} bg="info" className="me-1 mb-1">{skill}</Badge>
                      ))}
                    </div>
                  </>
                )}
                
                <h6>Languages</h6>
                {userProfile.languages?.map((lang, idx) => (
                  <div key={idx}>
                    <FaLanguage className="me-1" />
                    <strong>{lang.name}</strong> - {lang.proficiency}
                  </div>
                ))}
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="warning" onClick={() => {
            setShowProfileModal(false);
            if (userProfile) setSelectedUser(userProfile);
          }}>
            <FaPaperPlane className="me-1" /> Send Message
          </Button>
          <Button variant="secondary" onClick={() => setShowProfileModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Messages;
