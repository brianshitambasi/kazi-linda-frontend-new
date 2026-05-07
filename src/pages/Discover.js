import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Image, Button, Spinner, InputGroup, Form, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaUserPlus, FaUserCheck, FaSearch, FaUsers, FaEnvelope, FaCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Discover = () => {
  const { user, token } = useAuth();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPeople();
    // Update online status every 30 seconds
    const interval = setInterval(updateOnlineStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPeople = async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/people', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPeople(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      console.error(err);
    }
  };

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
      toast.success('Follow request sent!');
      fetchPeople();
    } catch (err) {
      toast.error('Failed to follow');
    }
  };

  const getFilteredPeople = () => {
    let filtered = people.filter(p => p._id !== user?._id);
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filter === 'online') {
      filtered = filtered.filter(p => p.isOnline);
    }
    return filtered;
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
      </Container>
    );
  }

  const filteredPeople = getFilteredPeople();

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        <FaUsers className="me-2 text-warning" />
        Discover People
      </h2>

      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Search by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Users</option>
            <option value="online">Online Now</option>
          </Form.Select>
        </Col>
      </Row>

      <Row>
        {filteredPeople.length === 0 ? (
          <div className="text-center py-5 text-muted">
            No users found
          </div>
        ) : (
          filteredPeople.map(person => (
            <Col md={6} lg={4} key={person._id} className="mb-4">
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="text-center">
                  <div className="position-relative d-inline-block">
                    {person.profilePicture ? (
                      <Image
                        src={person.profilePicture}
                        roundedCircle
                        width="100"
                        height="100"
                        className="mb-3 border"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="bg-secondary rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                        <FaUsers size={50} className="text-white" />
                      </div>
                    )}
                    {person.isOnline && (
                      <span className="position-absolute bottom-0 end-0">
                        <FaCircle className="text-success" size={16} />
                      </span>
                    )}
                  </div>
                  <h5 className="mb-1">{person.name}</h5>
                  <Badge bg="secondary" className="mb-2">{person.role}</Badge>
                  <p className="text-muted small mb-2">
                    {person.currentCountry || 'Location not set'}
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <Button
                      as={Link}
                      to={`/profile/${person._id}`}
                      variant="outline-primary"
                      size="sm"
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => handleFollow(person._id)}
                    >
                      <FaUserPlus className="me-1" /> Follow
                    </Button>
                    <Button
                      as={Link}
                      to={`/messages?user=${person._id}`}
                      variant="outline-success"
                      size="sm"
                    >
                      <FaEnvelope />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default Discover;
