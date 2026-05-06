import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BsNavbar, Nav, Container, Button, Dropdown, Badge, Image, Form, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../services/api';
import { 
  FaHome, FaBriefcase, FaClipboardList, FaShieldAlt, FaBan, 
  FaSignOutAlt, FaUser, FaSignInAlt, FaUserPlus, FaTachometerAlt,
  FaBars, FaTimes, FaInfoCircle, FaEnvelope, FaBell, FaComments,
  FaUsers, FaNewspaper, FaSearch, FaFacebookMessenger
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotificationCount();
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchNotificationCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await messageAPI.getUnreadCount();
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/notifications/unread', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setNotificationCount(data.count || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setExpanded(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setExpanded(false);
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch(user.role) {
      case 'admin': return '/admin/dashboard';
      case 'employer': return '/employer/dashboard';
      case 'embassy': return '/embassy/dashboard';
      case 'recruiter': return '/recruiter/dashboard';
      default: return '/dashboard';
    }
  };

  return (
    <BsNavbar bg="white" variant="light" expand="lg" expanded={expanded} className="shadow-sm sticky-top border-bottom">
      <Container fluid>
        <BsNavbar.Brand as={Link} to={user ? '/news' : '/'} className="fw-bold d-flex align-items-center" onClick={() => setExpanded(false)}>
          <div className="bg-warning rounded-circle p-1 me-2" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaShieldAlt className="text-dark" size={18} />
          </div>
          <span style={{ color: '#DAA520', fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: '1.3rem' }}>KAZI LINDA</span>
        </BsNavbar.Brand>

        {user && (
          <Form onSubmit={handleSearch} className="mx-auto" style={{ width: '300px' }}>
            <InputGroup size="sm">
              <InputGroup.Text className="bg-light border-0 rounded-pill">
                <FaSearch className="text-muted" size={14} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search KAZI LINDA"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-light border-0 rounded-pill"
              />
            </InputGroup>
          </Form>
        )}

        <div className="d-flex align-items-center">
          {user ? (
            <>
              <div className="d-none d-lg-flex gap-2 me-3">
                <Button variant="light" as={Link} to="/news" className="rounded-circle p-2" style={{ width: '40px', height: '40px' }}>
                  <FaNewspaper size={20} />
                </Button>
                <Button variant="light" as={Link} to="/friends" className="rounded-circle p-2" style={{ width: '40px', height: '40px' }}>
                  <FaUsers size={20} />
                </Button>
                <Button variant="light" as={Link} to="/messages" className="rounded-circle p-2 position-relative" style={{ width: '40px', height: '40px' }}>
                  <FaFacebookMessenger size={20} />
                  {unreadCount > 0 && <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle">{unreadCount}</Badge>}
                </Button>
                <Button variant="light" as={Link} to="/notifications" className="rounded-circle p-2 position-relative" style={{ width: '40px', height: '40px' }}>
                  <FaBell size={20} />
                  {notificationCount > 0 && <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle">{notificationCount}</Badge>}
                </Button>
              </div>

              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="d-flex align-items-center gap-2 rounded-pill">
                  {user.profilePicture ? (
                    <Image src={user.profilePicture} roundedCircle width="32" height="32" />
                  ) : (
                    <FaUser size={20} />
                  )}
                  <span className="d-none d-md-block">{user.name?.split(' ')[0]}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={getDashboardPath()}>
                    <FaTachometerAlt className="me-2" /> Dashboard
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/profile/edit">
                    <FaUser className="me-2" /> Edit Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/messages">
                    <FaComments className="me-2" /> Messages
                    {unreadCount > 0 && <Badge bg="danger" className="ms-2">{unreadCount}</Badge>}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <BsNavbar.Toggle onClick={() => setExpanded(!expanded)} className="ms-2 border-0">
                {expanded ? <FaTimes /> : <FaBars />}
              </BsNavbar.Toggle>
            </>
          ) : (
            <div className="d-flex gap-2">
              <Button as={Link} to="/login" variant="outline-warning" size="sm">
                <FaSignInAlt className="me-1" /> Login
              </Button>
              <Button as={Link} to="/register" variant="warning" size="sm" className="text-dark">
                <FaUserPlus className="me-1" /> Register
              </Button>
            </div>
          )}
        </div>

        <BsNavbar.Collapse id="basic-navbar-nav" className="mt-3">
          <Nav className="flex-column">
            {!user && (
              <>
                <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>
                  <FaHome className="me-2" /> Home
                </Nav.Link>
                <Nav.Link as={Link} to="/about" onClick={() => setExpanded(false)}>
                  <FaInfoCircle className="me-2" /> About Us
                </Nav.Link>
              </>
            )}
            
            <Nav.Link as={Link} to="/jobs" onClick={() => setExpanded(false)}>
              <FaBriefcase className="me-2" /> Jobs
            </Nav.Link>
            
            {user && (
              <>
                <Nav.Link as={Link} to="/news" onClick={() => setExpanded(false)}>
                  <FaNewspaper className="me-2" /> News Feed
                </Nav.Link>
                <Nav.Link as={Link} to="/friends" onClick={() => setExpanded(false)}>
                  <FaUsers className="me-2" /> Friends
                </Nav.Link>
                <Nav.Link as={Link} to="/messages" onClick={() => setExpanded(false)}>
                  <FaEnvelope className="me-2" /> Messages
                  {unreadCount > 0 && <Badge bg="danger" className="ms-2">{unreadCount}</Badge>}
                </Nav.Link>
                <Nav.Link as={Link} to="/applications" onClick={() => setExpanded(false)}>
                  <FaClipboardList className="me-2" /> My Applications
                </Nav.Link>
                <Nav.Link as={Link} to="/verify" onClick={() => setExpanded(false)}>
                  <FaShieldAlt className="me-2" /> Verify Employer
                </Nav.Link>
                <Nav.Link as={Link} to="/blacklist" onClick={() => setExpanded(false)}>
                  <FaBan className="me-2" /> Blacklist
                </Nav.Link>
                <hr />
                <Nav.Link as={Link} to={getDashboardPath()} onClick={() => setExpanded(false)}>
                  <FaTachometerAlt className="me-2" /> Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/profile/edit" onClick={() => setExpanded(false)}>
                  <FaUser className="me-2" /> Edit Profile
                </Nav.Link>
                <Nav.Link onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" /> Logout
                </Nav.Link>
              </>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
