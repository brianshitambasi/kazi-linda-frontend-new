import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Badge, Image, Dropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaHome, FaNewspaper, FaUsers, FaBriefcase, 
  FaShieldAlt, FaBan, FaBell, FaSignOutAlt,
  FaUserCircle, FaFacebookMessenger
} from 'react-icons/fa';
import { messageAPI } from '../../services/api';
import ClickableAvatar from '../Common/ClickableAvatar';

const FacebookLayout = ({ children }) => {
  const { user, logout, token } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchOnlineFriends();
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchOnlineFriends();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await messageAPI.getUnreadCount();
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchOnlineFriends = async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/online-friends', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOnlineFriends(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching online friends:', err);
    } finally {
      setLoading(false);
    }
  };

  const leftMenuItems = [
    { icon: FaNewspaper, label: 'News Feed', path: '/news', active: location.pathname === '/news' },
    { icon: FaUsers, label: 'Friends', path: '/friends', active: location.pathname === '/friends' },
    { icon: FaBriefcase, label: 'Jobs', path: '/jobs', active: location.pathname === '/jobs' },
    { divider: true },
    { icon: FaBriefcase, label: 'My Applications', path: '/applications', active: location.pathname === '/applications' },
    { icon: FaShieldAlt, label: 'Verify Employer', path: '/verify', active: location.pathname === '/verify' },
    { icon: FaBan, label: 'Blacklist', path: '/blacklist', active: location.pathname === '/blacklist' },
  ];

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="facebook-layout">
      <nav className="top-nav">
        <Container fluid>
          <div className="nav-content">
            <div className="nav-left">
              <Link to="/news" className="logo">
                <span className="logo-text">KAZI LINDA</span>
              </Link>
            </div>
            
            <div className="nav-center">
              <div className="search-bar">
                <input type="text" placeholder="Search KaziLinda..." />
              </div>
            </div>
            
            <div className="nav-right">
              <Link to="/news" className={`nav-icon ${location.pathname === '/news' ? 'active' : ''}`}>
                <FaHome size={24} />
              </Link>
              <Link to="/friends" className={`nav-icon ${location.pathname === '/friends' ? 'active' : ''}`}>
                <FaUsers size={24} />
              </Link>
              <Link to="/messages" className={`nav-icon ${location.pathname === '/messages' ? 'active' : ''}`}>
                <FaFacebookMessenger size={24} />
                {unreadCount > 0 && <Badge bg="danger" className="notification-badge">{unreadCount}</Badge>}
              </Link>
              <Link to="/notifications" className={`nav-icon ${location.pathname === '/notifications' ? 'active' : ''}`}>
                <FaBell size={24} />
              </Link>
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="profile-toggle">
                  {user.profilePicture ? (
                    <Image src={user.profilePicture} roundedCircle width="32" height="32" />
                  ) : (
                    <FaUserCircle size={32} />
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/dashboard">
                    Dashboard
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/profile/edit">
                    Edit Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </Container>
      </nav>

      <Container fluid className="main-container">
        <Row className="main-row">
          <Col lg={3} className="left-sidebar">
            <div className="sidebar-card">
              <div className="user-info">
                {user.profilePicture ? (
                  <Image src={user.profilePicture} roundedCircle width="50" height="50" />
                ) : (
                  <FaUserCircle size={50} />
                )}
                <div className="user-details">
                  <strong>{user.name}</strong>
                  <small>{user.role || 'Member'}</small>
                </div>
              </div>
              <Nav className="flex-column">
                {leftMenuItems.map((item, idx) => 
                  item.divider ? (
                    <hr key={idx} className="my-2" />
                  ) : (
                    <Nav.Link key={idx} as={Link} to={item.path} active={item.active}>
                      <item.icon className="me-3" size={20} />
                      {item.label}
                    </Nav.Link>
                  )
                )}
              </Nav>
            </div>
          </Col>

          <Col lg={6} className="main-content">
            {children}
          </Col>

          <Col lg={3} className="right-sidebar">
            <div className="sidebar-card">
              <h6>Online Friends ({onlineFriends.length})</h6>
              {loading ? (
                <div className="text-center py-3">
                  <small>Loading...</small>
                </div>
              ) : onlineFriends.length > 0 ? (
                onlineFriends.map((friend, idx) => (
                  <div key={friend._id || idx} className="online-friend">
                    <div className="friend-avatar">
                      <ClickableAvatar 
                        userId={friend._id} 
                        src={friend.profilePicture} 
                        name={friend.name} 
                        size={32}
                      />
                      {friend.isOnline && <span className="online-dot"></span>}
                    </div>
                    <span className="friend-name">{friend.name}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-3">
                  <small className="text-muted">No friends online</small>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      <style>{`
        .facebook-layout {
          background: #f0f2f5;
          min-height: 100vh;
        }
        .top-nav {
          background: white;
          border-bottom: 1px solid #dddfe2;
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 8px 0;
        }
        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .logo-text {
          font-size: 24px;
          font-weight: bold;
          color: #DAA520;
          font-family: Georgia, serif;
        }
        .search-bar input {
          background: #f0f2f5;
          border: none;
          border-radius: 50px;
          padding: 8px 16px;
          width: 300px;
          font-size: 14px;
        }
        .nav-right {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .nav-icon {
          color: #65676b;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s;
          position: relative;
        }
        .nav-icon:hover {
          background: #f0f2f5;
        }
        .nav-icon.active {
          color: #DAA520;
        }
        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          font-size: 10px;
          padding: 2px 6px;
        }
        .profile-toggle {
          padding: 0;
          border: none;
          background: transparent;
        }
        .profile-toggle::after {
          display: none;
        }
        .main-container {
          max-width: 1200px;
          margin: 20px auto;
          padding: 0 16px;
        }
        .main-row {
          gap: 20px;
        }
        .left-sidebar, .right-sidebar {
          position: sticky;
          top: 70px;
          height: fit-content;
        }
        .sidebar-card {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 1px solid #dddfe2;
          margin-bottom: 16px;
        }
        .user-details {
          display: flex;
          flex-direction: column;
        }
        .sidebar-card .nav-link {
          color: #050505;
          padding: 8px 12px;
          border-radius: 8px;
          margin: 2px 0;
        }
        .sidebar-card .nav-link:hover {
          background: #f0f2f5;
        }
        .sidebar-card .nav-link.active {
          background: #e7f3ff;
          color: #DAA520;
          font-weight: 500;
        }
        .main-content {
          padding: 0;
        }
        .online-friend {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
        }
        .friend-avatar {
          position: relative;
        }
        .online-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 10px;
          height: 10px;
          background: #31a24c;
          border-radius: 50%;
          border: 2px solid white;
        }
        .friend-name {
          font-size: 14px;
        }
        @media (max-width: 768px) {
          .left-sidebar, .right-sidebar {
            display: none;
          }
          .search-bar input {
            width: 150px;
          }
        }
      `}</style>
    </div>
  );
};

export default FacebookLayout;
