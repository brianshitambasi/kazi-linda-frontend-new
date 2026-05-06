import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../services/api';
import { Container, Row, Col, Card, ListGroup, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { FaSend, FaUserCircle, FaPhone, FaVideo, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

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

  const fetchMessages = async (userId) => {
    try {
      const res = await messageAPI.getMessages(userId);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load messages');
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
      fetchMessages(selectedUser._id);
      fetchConversations();
      toast.success('Message sent');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getConversationName = (conversation) => {
    const otherUser = conversation.participants.find(p => p._id !== user._id);
    return otherUser?.name || 'Unknown User';
  };

  const getConversationRole = (conversation) => {
    const otherUser = conversation.participants.find(p => p._id !== user._id);
    return otherUser?.role || 'User';
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
        {/* Conversations Sidebar */}
        <Col md={4} lg={3}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white fw-bold">Conversations</Card.Header>
            <ListGroup variant="flush">
              {conversations.length === 0 ? (
                <ListGroup.Item className="text-center text-muted">
                  No conversations yet
                </ListGroup.Item>
              ) : (
                conversations.map(conv => (
                  <ListGroup.Item
                    key={conv._id}
                    action
                    active={selectedUser?._id === conv.participants.find(p => p._id !== user._id)?._id}
                    onClick={() => setSelectedUser(conv.participants.find(p => p._id !== user._id))}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <FaUserCircle className="me-2 text-warning" />
                      <strong>{getConversationName(conv)}</strong>
                      <br />
                      <small className="text-muted">{getConversationRole(conv)}</small>
                    </div>
                    {conv.unreadCount?.get(user._id) > 0 && (
                      <Badge bg="danger" pill>
                        {conv.unreadCount.get(user._id)}
                      </Badge>
                    )}
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>
        
        {/* Chat Area */}
        <Col md={8} lg={9}>
          {selectedUser ? (
            <Card className="shadow-sm h-100 d-flex flex-column">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <div>
                  <FaUserCircle size={30} className="text-warning me-2" />
                  <strong>{selectedUser.name}</strong>
                  <Badge bg="secondary" className="ms-2">{selectedUser.role}</Badge>
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
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg._id}
                      className={`d-flex mb-3 ${msg.senderId._id === user._id ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      <div className={`p-3 rounded ${msg.senderId._id === user._id ? 'bg-warning' : 'bg-light'}`} style={{ maxWidth: '70%' }}>
                        <small className="text-muted d-block mb-1">
                          {msg.senderId._id === user._id ? 'You' : msg.senderId.name}
                        </small>
                        <p className="mb-0">{msg.message}</p>
                        <small className="text-muted d-block mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </small>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </Card.Body>
              
              <Card.Footer className="bg-white">
                <Form onSubmit={handleSendMessage} className="d-flex">
                  <Form.Control
                    type="text"
                    placeholder="Type your message..."
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
                <FaUserCircle size={60} className="text-muted mb-3" />
                <h5>Select a conversation to start messaging</h5>
                <p className="text-muted">Choose a user from the left sidebar</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Messages;
