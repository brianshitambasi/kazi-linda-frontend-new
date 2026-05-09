import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar as BsNavbar, Nav, Container, Button, Dropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../services/api';
import ClickableAvatar from '../Common/ClickableAvatar';
import { 
  FaHome, FaBriefcase, 
  FaSignOutAlt, FaUser, FaSignInAlt, FaUserPlus, FaTachometerAlt,
  FaBars, FaTimes, FaInfoCircle, FaEnvelope, FaNewspaper
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await messageAPI.getUnreadCount();
      setUnreadCount(res.data?.count || 0);
    } catch (err) {
      console.log('Could not fetch unread count');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setExpanded(false);
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

  const isActive = (path) => location.pathname === path;
  const userName = user?.name?.split(' ')[0] || 'User';

  return (
    <BsNavbar bg="dark" variant="dark" expand="lg" expanded={expanded} className="shadow-sm sticky-top">
      <Container>
        <BsNavbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center" onClick={() => setExpanded(false)}>
          <FaHome className="me-2 text-warning" />
          <span style={{ color: '#DAA520', fontFamily: 'Georgia, serif', fontSize: '1.3rem' }}>KAZI LINDA</span>
        </BsNavbar.Brand>
        
        <BsNavbar.Toggle onClick={() => setExpanded(!expanded)}>
          {expanded ? <FaTimes /> : <FaBars />}
        </BsNavbar.Toggle>
        
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link as={Link} to="/" className={isActive('/') ? 'active text-warning' : ''} onClick={() => setExpanded(false)}>
              <FaHome className="me-1" /> Home
            </Nav.Link>
            <Nav.Link as={Link} to="/about" className={isActive('/about') ? 'active text-warning' : ''} onClick={() => setExpanded(false)}>
              <FaInfoCircle className="me-1" /> About
            </Nav.Link>
            <Nav.Link as={Link} to="/jobs" className={isActive('/jobs') ? 'active text-warning' : ''} onClick={() => setExpanded(false)}>
              <FaBriefcase className="me-1" /> Jobs
            </Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/news" className={isActive('/news') ? 'active text-warning' : ''} onClick={() => setExpanded(false)}>
                  <FaNewspaper className="me-1" /> Feed
                </Nav.Link>
                <Nav.Link as={Link} to="/messages" className={isActive('/messages') ? 'active text-warning' : ''} onClick={() => setExpanded(false)}>
                  <FaEnvelope className="me-1" /> Messages
                  {unreadCount > 0 && <Badge bg="danger" pill className="ms-1">{unreadCount}</Badge>}
                </Nav.Link>
              </>
            )}
          </Nav>

          <div className="d-flex">
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-warning" size="sm" className="d-flex align-items-center gap-2">
                  <ClickableAvatar userId={user._id} src={user.profilePicture} size={28} showOnline={true} isOnline={user.isOnline} />
                  <span>{userName}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={getDashboardPath()}>
                    <FaTachometerAlt className="me-2" /> Dashboard
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/profile/edit">
                    <FaUser className="me-2" /> Edit Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
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
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
