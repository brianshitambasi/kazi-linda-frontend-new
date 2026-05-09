import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar as BsNavbar, Nav, Container, Button, Dropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../services/api';
import ClickableAvatar from '../Common/ClickableAvatar';
import { 
  FaHome, FaBriefcase, FaSignOutAlt, FaUser, FaSignInAlt, FaUserPlus, 
  FaTachometerAlt, FaBars, FaTimes, FaInfoCircle, FaEnvelope, FaNewspaper,
  FaSearch, FaBell, FaFacebookMessenger, FaEllipsisH, FaStore, FaUsers, FaShieldAlt
} from 'react-icons/fa';

const KL_BRAND = '#f39c12';

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

  const navLinks = [
    { path: '/', icon: FaHome, label: 'Home' },
    { path: '/verify', icon: FaShieldAlt, label: 'Verify' },
    { path: '/jobs', icon: FaBriefcase, label: 'Jobs' },
    { path: '/blacklist', icon: FaUsers, label: 'Blacklist' },
  ];

  if (user) {
    navLinks.push({ path: '/social', icon: FaNewspaper, label: 'Feed' });
    navLinks.push({ path: '/messages', icon: FaEnvelope, label: 'Messages', badge: unreadCount });
  }

  return (
    <BsNavbar bg="white" expand="lg" expanded={expanded} className="shadow-sm sticky-top" style={{ borderBottom: '1px solid #dddfe2' }}>
      <Container fluid className="px-3">
        <BsNavbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center" onClick={() => setExpanded(false)}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: KL_BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>KL</span>
          </div>
          <span style={{ color: KL_BRAND, fontWeight: 700, fontSize: '1.2rem' }}>KaziLinda</span>
        </BsNavbar.Brand>
        
        <div className="d-none d-lg-flex" style={{ flex: 1, maxWidth: 300, marginLeft: 16 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b', fontSize: 14 }} />
            <input placeholder="Search KaziLinda..." style={{ width: '100%', background: '#f0f2f5', border: 'none', borderRadius: 20, padding: '8px 16px 8px 36px', fontSize: 15, outline: 'none' }} />
          </div>
        </div>
        
        <BsNavbar.Toggle onClick={() => setExpanded(!expanded)} style={{ border: 'none' }}>
          {expanded ? <FaTimes /> : <FaBars />}
        </BsNavbar.Toggle>
        
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto" style={{ gap: 4 }}>
            {navLinks.map(link => (
              <Nav.Link 
                key={link.path}
                as={Link} 
                to={link.path} 
                className={isActive(link.path) ? 'active' : ''}
                onClick={() => setExpanded(false)}
                style={{ 
                  borderRadius: 10, 
                  padding: '12px 16px',
                  color: isActive(link.path) ? KL_BRAND : '#65676b',
                  fontWeight: isActive(link.path) ? 600 : 500,
                  background: isActive(link.path) ? `${KL_BRAND}10` : 'transparent'
                }}
              >
                <link.icon className="me-2" size={20} />
                {link.label}
                {link.badge > 0 && <Badge bg="danger" pill className="ms-2">{link.badge}</Badge>}
              </Nav.Link>
            ))}
          </Nav>

          <div className="d-flex align-items-center gap-2 ms-lg-3">
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="d-flex align-items-center gap-2 border-0 bg-transparent">
                  <ClickableAvatar userId={user._id} src={user.profilePicture} size={36} showOnline={true} isOnline={user.isOnline} />
                  <span className="d-none d-md-block">{userName}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow-sm border-0 mt-2" style={{ borderRadius: 12 }}>
                  <Dropdown.Item as={Link} to={getDashboardPath()} onClick={() => setExpanded(false)}>
                    <FaTachometerAlt className="me-2" style={{ color: KL_BRAND }} /> Dashboard
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/profile/edit" onClick={() => setExpanded(false)}>
                    <FaUser className="me-2" style={{ color: KL_BRAND }} /> Edit Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" style={{ color: '#e41e3f' }} /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex gap-2">
                <Button as={Link} to="/login" variant="outline-warning" size="sm" style={{ borderRadius: 6 }}>
                  <FaSignInAlt className="me-1" /> Login
                </Button>
                <Button as={Link} to="/register" style={{ background: KL_BRAND, border: 'none', borderRadius: 6 }} size="sm">
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