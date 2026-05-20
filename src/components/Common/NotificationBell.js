import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaBell, FaCheckCircle, FaUserPlus, FaBriefcase, FaEnvelope } from 'react-icons/fa';
import moment from 'moment';

const colors = {
  primary: '#2E7D32',
  warning: '#FFC107',
  danger: '#F44336',
  light: '#E8F5E9'
};

const NotificationBell = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`https://kazi-linda.onrender.com/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('https://kazi-linda.onrender.com/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'follow': return <FaUserPlus color={colors.primary} />;
      case 'follow_accept': return <FaCheckCircle color={colors.primary} />;
      case 'job_application': return <FaBriefcase color={colors.warning} />;
      case 'application_status': return <FaCheckCircle color={colors.primary} />;
      case 'message': return <FaEnvelope color={colors.primary} />;
      default: return <FaBell color={colors.warning} />;
    }
  };

  if (!token) return null;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={styles.bellButton}
        title="Notifications"
      >
        <div style={styles.iconInner}>
          <FaBell size={18} color="#050505" />
        </div>
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={styles.markAllBtn}>
                Mark all as read
              </button>
            )}
          </div>
          
          <div style={styles.notificationList}>
            {loading ? (
              <div style={styles.loading}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={styles.empty}>No notifications yet</div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif._id}
                  style={{ ...styles.notificationItem, opacity: notif.isRead ? 0.7 : 1 }}
                  onClick={() => markAsRead(notif._id)}
                >
                  <div style={styles.notificationIcon}>
                    {getIcon(notif.type)}
                  </div>
                  <div style={styles.notificationContent}>
                    <div style={styles.notificationTitle}>{notif.title}</div>
                    <div style={styles.notificationMessage}>{notif.message}</div>
                    <div style={styles.notificationTime}>
                      {moment(notif.createdAt).fromNow()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  bellButton: {
    position: 'relative',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0
  },
  iconInner: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: colors.light,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    background: colors.danger,
    color: '#fff',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    padding: '1px 5px',
    minWidth: 18,
    textAlign: 'center'
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: 380,
    maxHeight: 500,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,.15)',
    zIndex: 400,
    overflow: 'hidden'
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: `1px solid ${colors.light}`,
    fontWeight: 700,
    fontSize: 16
  },
  markAllBtn: {
    background: 'none',
    border: 'none',
    color: colors.primary,
    fontSize: 12,
    cursor: 'pointer'
  },
  notificationList: {
    maxHeight: 450,
    overflowY: 'auto'
  },
  notificationItem: {
    display: 'flex',
    gap: 12,
    padding: '12px 16px',
    borderBottom: `1px solid ${colors.light}`,
    cursor: 'pointer',
    transition: 'background .15s'
  },
  notificationIcon: {
    flexShrink: 0,
    fontSize: 20
  },
  notificationContent: {
    flex: 1
  },
  notificationTitle: {
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 2,
    color: '#050505'
  },
  notificationMessage: {
    fontSize: 13,
    color: '#65676b',
    marginBottom: 4
  },
  notificationTime: {
    fontSize: 11,
    color: '#bcc0c4'
  },
  loading: {
    textAlign: 'center',
    padding: 20,
    color: '#65676b'
  },
  empty: {
    textAlign: 'center',
    padding: 40,
    color: '#65676b'
  }
};

export default NotificationBell;
