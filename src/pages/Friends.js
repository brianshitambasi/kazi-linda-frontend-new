import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Image, Button, Spinner, InputGroup, Form, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaUserPlus, FaSearch, FaUserFriends, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Friends = () => {
  const { token } = useAuth();
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/friends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setFriends(data);
    } catch (err) {
      console.error(err);
      setFriends([]);
    }
  }, [token]);

  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/suggestions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    }
  }, [token]);

  useEffect(() => {
    Promise.all([fetchFriends(), fetchSuggestions()]).finally(() => setLoading(false));
  }, [fetchFriends, fetchSuggestions]);

  const handleFollow = async (userId) => {
    try {
      await fetch('https://kazi-linda.onrender.com/api/social/follow', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ followingId: userId })
      });
      toast.success('Now following!');
      fetchSuggestions();
      fetchFriends();
    } catch (err) {
      toast.error('Failed to follow');
    }
  };

  const filteredFriends = friends.filter(friend => 
    friend.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        <FaUserFriends className="me-2 text-warning" />
        Friends & Connections
      </h2>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white fw-bold">
              Your Connections ({friends.length})
              <InputGroup className="mt-2">
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search friends..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Card.Header>
            <Card.Body>
              {filteredFriends.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  No connections yet. Start following people!
                </div>
              ) : (
                <Row>
                  {filteredFriends.map(friend => (
                    <Col md={6} lg={4} key={friend._id} className="mb-3">
                      <Card className="h-100 text-center border-0 shadow-sm">
                        <Card.Body>
                          {friend.profilePicture ? (
                            <Image src={friend.profilePicture} roundedCircle width="80" height="80" className="mb-2" />
                          ) : (
                            <div className="bg-secondary rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                              <FaUserFriends size={40} className="text-white" />
                            </div>
                          )}
                          <h6 className="mb-1">{friend.name}</h6>
                          <small className="text-muted">{friend.role}</small>
                          <div className="mt-2">
                            <Badge bg="success" className="me-1">Following</Badge>
                            <Button as={Link} to={`/messages?user=${friend._id}`} variant="outline-primary" size="sm">
                              <FaEnvelope /> Message
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white fw-bold">Suggested Connections</Card.Header>
            <Card.Body className="p-0">
              {suggestions.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  No suggestions at this time
                </div>
              ) : (
                suggestions.map(suggestion => (
                  <div key={suggestion._id} className="d-flex align-items-center p-3 border-bottom">
                    {suggestion.profilePicture ? (
                      <Image src={suggestion.profilePicture} roundedCircle width="48" height="48" className="me-2" />
                    ) : (
                      <div className="bg-secondary rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                        <FaUserFriends size={24} className="text-white" />
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <strong>{suggestion.name}</strong>
                      <div className="text-muted small">{suggestion.role}</div>
                      <div className="text-muted small">{suggestion.currentCountry || 'Location not set'}</div>
                    </div>
                    <Button size="sm" variant="outline-primary" onClick={() => handleFollow(suggestion._id)}>
                      <FaUserPlus /> Follow
                    </Button>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Friends;
