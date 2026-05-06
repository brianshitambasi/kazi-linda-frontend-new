import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar as BsNavbar, Nav, Container, Button, Dropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../services/api';
import { 
  FaHome, FaBriefcase, FaClipboardList, FaShieldAlt, FaBan, 
  FaSignOutAlt, FaUser, FaSignInAlt, FaUserPlus, FaTachometerAlt,
  FaBars, FaTimes, FaInfoCircle, FaEnvelope
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
      const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
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

  const handleLogout = () => {
    logout();
    navigate('/login');
    setExpanded(false);
  };

  const isActive = (path) => location.pathname === path;

  const getDashboardPath = () => {
    if (!user) return '/';
    switch(user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'employer':
        return '/employer/dashboard';
      case 'embassy':
        return '/embassy/dashboard';
      case 'recruiter':
        return '/recruiter/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <BsNavbar bg="dark" variant="dark" expand="lg" expanded={expanded} className="shadow-sm sticky-top">
      <Container>
        <BsNavbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center" onClick={() => setExpanded(false)}>
          <FaShieldAlt className="me-2 text-warning" /> 
          <span style={{ color: '#DAA520', fontFamily: 'Georgia, serif', letterSpacing: '1px' }}>KAZI LINDA</span>
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(!expanded)}>
          {expanded ? <FaTimes /> : <FaBars />}
        </BsNavbar.Toggle>
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            
            {/* Show Home and About ONLY when NOT logged in */}
            {!user && (
              <>
                <Nav.Link as={Link} to="/" className={isActive('/') ? 'active text-warning' : ''} onClick={() => setExpanded(false)}>
                  <FaHome className="me-1" /> Home
                </Nav.Link>
                <Nav.Link as={Link} to="/about" className={isActive('/about') ? 'active text-warning' : ''} onClick={() => setExpanded(false)}>
                  <FaInfoCircle className="me-1" /> About Us
                </Nav.Link>
              </>
            )}
            
            {/* Jobs - Always visible */}
            <Nav.Link as={Link} to="/jobs" className={isActive('/jobs') ? 'active text-warning' : ''} onClick={() => setExpanded(false)}>
              <FaBriefcase className="me-1" /> Jobs
            </Nav.Link>
            
            {/* Features that require login - Only show if user is logged in */}
            {user && (
              <>
                <Nav.Link as={Link} to="/applications" className={isActive('/applications') ? 'active text-warning' : ''} onClick={() => setExpanded(false)}>
                  <FaClipboardList className="me-1" /> My Apps
                </Nav.Link>
                <Nav.Link as={Link} to="/verify" className={isActive('/verify') ? 'active text-warning' : ''} onClick={() => setExpanded(false)}>
                  <FaShieldAlt className="me-1" /> Verify
                </Nav.Link>
                <Nav.Link as={Link} to="/blacklist" className={isActive('/blacklist') ? 'active text-warning' : ''} onClick={() => setExpanded(false)}>
                  <FaBan className="me-1" /> Blacklist
                </Nav.Link>
                <Nav.Link as={Link} to="/messages" className={isActive('/messages') ? 'active text-warning' : ''} onClick={() => setExpanded(false)}>
                  <FaEnvelope className="me-1" /> Messages
                  {unreadCount > 0 && (
                    <Badge bg="danger" pill className="ms-1" style={{ fontSize: '10px' }}>
                      {unreadCount}
                    </Badge>
                  )}
                </Nav.Link>
              </>
            )}
            
            {/* Auth buttons */}
            {user ? (
              <Dropdown align="end" className="ms-lg-2">
                <Dropdown.Toggle variant="outline-warning" size="sm" id="dropdown-basic">
                  <FaUser className="me-1" /> {user.name?.split(' ')[0]}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={getDashboardPath()}>
                    <FaTachometerAlt className="me-2" /> Dashboard
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex ms-lg-3 mt-2 mt-lg-0 gap-2">
                <Button as={Link} to="/login" variant="outline-warning" size="sm" onClick={() => setExpanded(false)}>
                  <FaSignInAlt className="me-1" /> Login
                </Button>
                <Button as={Link} to="/register" variant="warning" size="sm" className="text-dark" onClick={() => setExpanded(false)}>
                  <FaUserPlus className="me-1" /> Register
                </Button>
              </div>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
