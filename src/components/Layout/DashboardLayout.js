import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { 
  FaTachometerAlt, FaBriefcase, FaClipboardList, FaUsers, 
  FaBuilding, FaShieldAlt, FaBan, FaUserCircle, FaSignOutAlt,
  FaCog, FaFileAlt, FaChartLine, FaFlag, FaEnvelope,
  FaBookmark, FaHome, FaCalendarAlt
} from 'react-icons/fa';

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Menu items based on user role
  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', icon: FaTachometerAlt, label: 'Dashboard', roles: ['worker', 'employer', 'recruiter', 'admin', 'embassy'] },
      { path: '/profile/edit', icon: FaUserCircle, label: 'My Profile', roles: ['worker', 'employer', 'recruiter', 'admin', 'embassy'] },
      { path: '/dashboard/settings', icon: FaCog, label: 'Settings', roles: ['worker', 'employer', 'recruiter', 'admin', 'embassy'] },
    ];

    const roleSpecificItems = {
      worker: [
        { path: '/jobs', icon: FaBriefcase, label: 'Browse Jobs', roles: ['worker'] },
        { path: '/applications', icon: FaClipboardList, label: 'My Applications', roles: ['worker'] },
        { path: '/dashboard/saved-jobs', icon: FaBookmark, label: 'Saved Jobs', roles: ['worker'] },
        { path: '/verify', icon: FaShieldAlt, label: 'Verify Employer', roles: ['worker'] },
        { path: '/blacklist', icon: FaBan, label: 'Blacklist', roles: ['worker'] },
        { path: '/dashboard/check-in', icon: FaCalendarAlt, label: 'Daily Check-in', roles: ['worker'] },
        { path: '/dashboard/emergency', icon: FaFlag, label: 'Emergency SOS', roles: ['worker'] },
        { path: '/news', icon: FaHome, label: 'News Feed', roles: ['worker'] },
      ],
      employer: [
        { path: '/employer/dashboard', icon: FaTachometerAlt, label: 'Dashboard', roles: ['employer'] },
        { path: '/employer/jobs', icon: FaBriefcase, label: 'My Jobs', roles: ['employer'] },
        { path: '/employer/post-job', icon: FaFileAlt, label: 'Post a Job', roles: ['employer'] },
        { path: '/employer/applications', icon: FaClipboardList, label: 'Applications', roles: ['employer'] },
        { path: '/employer/analytics', icon: FaChartLine, label: 'Analytics', roles: ['employer'] },
        { path: '/verify', icon: FaShieldAlt, label: 'Verification', roles: ['employer'] },
      ],
      recruiter: [
        { path: '/recruiter/dashboard', icon: FaTachometerAlt, label: 'Dashboard', roles: ['recruiter'] },
        { path: '/recruiter/jobs', icon: FaBriefcase, label: 'Job Listings', roles: ['recruiter'] },
        { path: '/recruiter/candidates', icon: FaUsers, label: 'Candidates', roles: ['recruiter'] },
        { path: '/recruiter/post-job', icon: FaFileAlt, label: 'Post Job', roles: ['recruiter'] },
      ],
      admin: [
        { path: '/admin/dashboard', icon: FaTachometerAlt, label: 'Dashboard', roles: ['admin'] },
        { path: '/admin/users', icon: FaUsers, label: 'Manage Users', roles: ['admin'] },
        { path: '/admin/jobs', icon: FaBriefcase, label: 'Manage Jobs', roles: ['admin'] },
        { path: '/admin/employers', icon: FaBuilding, label: 'Manage Employers', roles: ['admin'] },
        { path: '/admin/blacklist', icon: FaBan, label: 'Blacklist', roles: ['admin'] },
        { path: '/admin/reports', icon: FaFlag, label: 'Reports', roles: ['admin'] },
        { path: '/admin/analytics', icon: FaChartLine, label: 'Analytics', roles: ['admin'] },
        { path: '/admin/activity-log', icon: FaClipboardList, label: 'Activity Log', roles: ['admin'] },
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
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h4 className={sidebarCollapsed ? 'text-center' : ''}>
            {!sidebarCollapsed && 'KAZI LINDA'}
            <Button 
              variant="link" 
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? '☰' : '◀'}
            </Button>
          </h4>
        </div>
        
        <div className="user-info text-center mb-4">
          {user?.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt={user.name} 
              style={{ width: sidebarCollapsed ? 40 : 60, height: sidebarCollapsed ? 40 : 60, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <FaUserCircle size={sidebarCollapsed ? 40 : 60} className="text-warning" />
          )}
          {!sidebarCollapsed && (
            <>
              <h5 className="mt-2">{user?.name}</h5>
              <small className="text-muted text-capitalize">{user?.role}</small>
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
              <item.icon className="me-2" />
              {!sidebarCollapsed && item.label}
            </Nav.Link>
          ))}
          <hr className="my-3" />
          <Nav.Link onClick={handleLogout} className="sidebar-link text-danger">
            <FaSignOutAlt className="me-2" />
            {!sidebarCollapsed && 'Logout'}
          </Nav.Link>
        </Nav>
      </div>

      {/* Main Content */}
      <div className={`dashboard-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <div className="dashboard-header d-flex justify-content-between align-items-center">
          <h2>{title}</h2>
          <div className="header-actions d-flex gap-3">
            <Button variant="light" size="sm" as={Link} to="/messages">
              <FaEnvelope /> {!sidebarCollapsed && ' Messages'}
            </Button>
            <Button variant="light" size="sm" as={Link} to="/news">
              <FaHome /> {!sidebarCollapsed && ' Feed'}
            </Button>
          </div>
        </div>
        <div className="dashboard-body">
          {children}
        </div>
      </div>

      <style>{`
        .dashboard-wrapper {
          display: flex;
          min-height: calc(100vh - 72px);
        }
        .dashboard-sidebar {
          width: 260px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: #fff;
          transition: all 0.3s ease;
          position: fixed;
          height: calc(100vh - 72px);
          overflow-y: auto;
        }
        .dashboard-sidebar.collapsed {
          width: 80px;
        }
        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .sidebar-header h4 {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0;
        }
        .sidebar-toggle {
          color: #DAA520;
          font-size: 14px;
          padding: 0;
        }
        .user-info {
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .sidebar-link {
          color: rgba(255,255,255,0.8);
          padding: 12px 20px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }
        .sidebar-link:hover {
          background: rgba(218,165,32,0.2);
          color: #DAA520;
        }
        .sidebar-link.active {
          background: #DAA520;
          color: #000;
        }
        .dashboard-content {
          flex: 1;
          margin-left: 260px;
          padding: 20px;
          background: #f5f5f5;
          transition: all 0.3s ease;
          min-height: calc(100vh - 72px);
        }
        .dashboard-content.expanded {
          margin-left: 80px;
        }
        .dashboard-header {
          background: white;
          padding: 15px 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .dashboard-body {
          background: white;
          border-radius: 10px;
          padding: 20px;
          min-height: 500px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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
