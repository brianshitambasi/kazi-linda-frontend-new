import Logo from "../Common/Logo";
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { 
  FaTachometerAlt, FaBriefcase, FaClipboardList, FaUsers, 
  FaBuilding, FaShieldAlt, FaBan, FaUserCircle, FaSignOutAlt,
  FaCog, FaBell, FaFileAlt, FaFlag, FaEnvelope,
  FaStar, FaCalendarAlt, FaLeaf
} from 'react-icons/fa';

// Eco-friendly color palette
const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  accent: '#81C784',
  warning: '#FFC107',
  danger: '#F44336',
  dark: '#1B5E20',
  light: '#E8F5E9',
  gradient: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)',
  gradientLight: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
  text: '#1B5E20',
  textLight: '#fff',
  border: '#A5D6A7'
};

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', icon: FaTachometerAlt, label: 'Dashboard', roles: ['worker', 'employer', 'admin', 'embassy'] },
      { path: '/dashboard/profile', icon: FaUserCircle, label: 'My Profile', roles: ['worker', 'employer', 'admin', 'embassy'] },
      { path: '/dashboard/settings', icon: FaCog, label: 'Settings', roles: ['worker', 'employer', 'admin', 'embassy'] },
    ];

    const roleSpecificItems = {
      worker: [
        { path: '/jobs', icon: FaBriefcase, label: 'Browse Jobs', roles: ['worker'] },
        { path: '/applications', icon: FaClipboardList, label: 'My Applications', roles: ['worker'] },
        { path: '/dashboard/saved-jobs', icon: FaStar, label: 'Saved Jobs', roles: ['worker'] },
        { path: '/verify', icon: FaShieldAlt, label: 'Verify Employer', roles: ['worker'] },
        { path: '/blacklist', icon: FaBan, label: 'Blacklist', roles: ['worker'] },
        { path: '/dashboard/check-in', icon: FaCalendarAlt, label: 'Daily Check-in', roles: ['worker'] },
      ],
      employer: [
        { path: '/employer/dashboard', icon: FaTachometerAlt, label: 'Dashboard', roles: ['employer'] },
        { path: '/employer/jobs', icon: FaBriefcase, label: 'My Jobs', roles: ['employer'] },
        { path: '/employer/post-job', icon: FaFileAlt, label: 'Post a Job', roles: ['employer'] },
        { path: '/employer/applications', icon: FaClipboardList, label: 'Applications', roles: ['employer'] },
        { path: '/verify', icon: FaShieldAlt, label: 'Verification', roles: ['employer'] },
      ],
      admin: [
        { path: '/admin/dashboard', icon: FaTachometerAlt, label: 'Dashboard', roles: ['admin'] },
        { path: '/admin/users', icon: FaUsers, label: 'Manage Users', roles: ['admin'] },
        { path: '/admin/jobs', icon: FaBriefcase, label: 'Manage Jobs', roles: ['admin'] },
        { path: '/admin/employers', icon: FaBuilding, label: 'Manage Employers', roles: ['admin'] },
        { path: '/admin/blacklist', icon: FaBan, label: 'Blacklist', roles: ['admin'] },
        { path: '/admin/reports', icon: FaFlag, label: 'Reports', roles: ['admin'] },
        { path: '/admin/settings', icon: FaCog, label: 'System Settings', roles: ['admin'] },
      ],
      embassy: [
        { path: '/embassy/dashboard', icon: FaTachometerAlt, label: 'Dashboard', roles: ['embassy'] },
        { path: '/embassy/workers', icon: FaUsers, label: 'Workers', roles: ['embassy'] },
        { path: '/embassy/cases', icon: FaFlag, label: 'Emergency Cases', roles: ['embassy'] },
        { path: '/embassy/reports', icon: FaFileAlt, label: 'Reports', roles: ['embassy'] },
      ],
    };

    const roleItems = roleSpecificItems[user?.role] || [];
    return [...commonItems, ...roleItems];
  };

  const menuItems = getMenuItems();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-wrapper">
      <div className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <Logo size={32} variant="dark" />
            {!sidebarCollapsed && <h4 className="logo-text" style={{ marginLeft: 8 }}>KaziLinda</h4>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? '☰' : '◀'}
          </button>
        </div>
        
        <div className="user-info text-center">
          <div className="avatar-wrapper">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user?.name} className="avatar-img" />
            ) : (
              <FaUserCircle className="avatar-icon" />
            )}
            {!sidebarCollapsed && <div className="online-dot"></div>}
          </div>
          {!sidebarCollapsed && (
            <>
              <h5 className="user-name">{user?.name?.split(' ')[0] || 'User'}</h5>
              <span className="user-role text-capitalize">{user?.role}</span>
            </>
          )}
        </div>

        <Nav className="flex-column">
          {menuItems.map((item, idx) => (
            <Nav.Link 
              key={idx}
              as={Link}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon className="link-icon" />
              {!sidebarCollapsed && <span className="link-label">{item.label}</span>}
            </Nav.Link>
          ))}
          <hr className="sidebar-divider" />
          <Nav.Link onClick={handleLogout} className="sidebar-link logout-link">
            <FaSignOutAlt className="link-icon" />
            {!sidebarCollapsed && <span className="link-label">Logout</span>}
          </Nav.Link>
        </Nav>
      </div>

      <div className={`dashboard-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <h2 className="page-title">{title}</h2>
            <div className="breadcrumb">
              <span>Home</span> / <span className="active">{title}</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="action-btn">
              <FaBell />
              <span className="badge">3</span>
            </button>
            <button className="action-btn">
              <FaEnvelope />
            </button>
            <div className="eco-score">
              <FaLeaf />
              <span>Eco Score: 86%</span>
            </div>
          </div>
        </div>
        <div className="dashboard-body">
          {children}
        </div>
      </div>

      <style>{`
        .dashboard-wrapper {
          display: flex;
          min-height: calc(100vh - 56px);
          background: ${colors.gradientLight};
        }
        .dashboard-sidebar {
          width: 280px;
          background: ${colors.gradient};
          color: ${colors.textLight};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: fixed;
          height: calc(100vh - 56px);
          overflow-y: auto;
          box-shadow: 4px 0 20px rgba(0,0,0,0.1);
        }
        .dashboard-sidebar.collapsed {
          width: 80px;
        }
        .sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-icon {
          font-size: 32px;
          color: ${colors.warning};
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        .logo-text {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #fff, ${colors.accent});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sidebar-toggle {
          background: rgba(255,255,255,0.1);
          border: none;
          color: ${colors.textLight};
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s;
        }
        .sidebar-toggle:hover {
          background: rgba(255,255,255,0.2);
        }
        .user-info {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.15);
        }
        .avatar-wrapper {
          position: relative;
          display: inline-block;
        }
        .avatar-icon {
          font-size: 64px;
          color: ${colors.warning};
        }
        .avatar-img {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid ${colors.warning};
        }
        .online-dot {
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 14px;
          height: 14px;
          background: #4CAF50;
          border-radius: 50%;
          border: 2px solid ${colors.primary};
          animation: blink 1.5s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .user-name {
          margin-top: 12px;
          margin-bottom: 4px;
          font-size: 16px;
          font-weight: 600;
        }
        .user-role {
          font-size: 12px;
          opacity: 0.8;
          background: rgba(255,255,255,0.15);
          padding: 4px 12px;
          border-radius: 20px;
          display: inline-block;
        }
        .sidebar-link {
          color: rgba(255,255,255,0.85);
          padding: 12px 20px;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 12px;
          border-left: 3px solid transparent;
        }
        .sidebar-link:hover {
          background: rgba(255,255,255,0.1);
          color: ${colors.textLight};
          border-left-color: ${colors.warning};
        }
        .sidebar-link.active {
          background: rgba(255,255,255,0.15);
          color: ${colors.warning};
          border-left-color: ${colors.warning};
        }
        .link-icon {
          font-size: 20px;
          min-width: 24px;
        }
        .link-label {
          font-size: 14px;
          font-weight: 500;
        }
        .sidebar-divider {
          margin: 12px 20px;
          border-color: rgba(255,255,255,0.1);
        }
        .logout-link {
          color: rgba(255,100,100,0.9);
        }
        .logout-link:hover {
          background: rgba(255,100,100,0.15);
          color: #ff6b6b;
        }
        .dashboard-content {
          flex: 1;
          margin-left: 280px;
          padding: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dashboard-content.expanded {
          margin-left: 80px;
        }
        .dashboard-header {
          background: white;
          padding: 20px 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border: 1px solid ${colors.border};
        }
        .header-left {
          flex: 1;
        }
        .page-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          color: ${colors.text};
        }
        .breadcrumb {
          font-size: 13px;
          color: #666;
          margin-top: 4px;
        }
        .breadcrumb .active {
          color: ${colors.primary};
          font-weight: 500;
        }
        .header-actions {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .action-btn {
          position: relative;
          background: ${colors.light};
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          color: ${colors.primary};
        }
        .action-btn:hover {
          background: ${colors.accent};
          transform: translateY(-2px);
        }
        .action-btn .badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: ${colors.warning};
          color: #fff;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
        }
        .eco-score {
          background: ${colors.gradientLight};
          padding: 8px 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${colors.primary};
          font-weight: 600;
          font-size: 14px;
        }
        .eco-score svg {
          color: ${colors.warning};
        }
        .dashboard-body {
          background: white;
          border-radius: 16px;
          padding: 24px;
          min-height: 500px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border: 1px solid ${colors.border};
        }
        @media (max-width: 768px) {
          .dashboard-sidebar {
            transform: translateX(-100%);
            z-index: 1000;
          }
          .dashboard-sidebar.mobile-open {
            transform: translateX(0);
          }
          .dashboard-content {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
