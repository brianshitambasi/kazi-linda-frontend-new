import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

const ClickableAvatar = ({ 
  userId, 
  src, 
  name,
  size = 40, 
  className = '', 
  showOnline = false, 
  isOnline = false, 
  style = {}, 
  onClick,
  asLink = true 
}) => {
  const avatarStyles = {
    cursor: onClick ? 'pointer' : (asLink && userId ? 'pointer' : 'default'),
    objectFit: 'cover',
    width: size,
    height: size,
    borderRadius: '50%',
    ...style
  };

  // Get initials for fallback when no image
  const getInitials = () => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const avatarContent = src && src !== '' ? (
    <img
      src={src}
      alt="Profile"
      style={avatarStyles}
      className={className}
      onError={(e) => {
        e.target.style.display = 'none';
        if (e.target.nextSibling) {
          e.target.nextSibling.style.display = 'flex';
        }
      }}
    />
  ) : (
    <div style={{
      ...avatarStyles,
      background: `linear-gradient(135deg, #f39c12 0%, #e67e22 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 'bold',
      fontSize: size * 0.4,
    }}>
      {getInitials()}
    </div>
  );

  const onlineIndicator = showOnline && isOnline && (
    <span style={styles.onlineIndicator} />
  );

  const AvatarWrapper = () => (
    <div style={styles.container}>
      {avatarContent}
      {onlineIndicator}
    </div>
  );

  // If onClick is provided, just return clickable div
  if (onClick) {
    return <div onClick={onClick} style={{ cursor: 'pointer' }}><AvatarWrapper /></div>;
  }

  // If asLink is false or no userId, just return the avatar
  if (!asLink || !userId) {
    return <AvatarWrapper />;
  }

  // Use <a> tag directly instead of react-router-dom Link to avoid nesting issues
  return (
    <a href={`/profile/${userId}`} style={styles.link} onClick={(e) => {
      e.preventDefault();
      window.location.href = `/profile/${userId}`;
    }}>
      <AvatarWrapper />
    </a>
  );
};

const styles = {
  link: {
    textDecoration: 'none',
    cursor: 'pointer',
  },
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    width: '12px',
    height: '12px',
    backgroundColor: '#31a24c',
    borderRadius: '50%',
    border: '2px solid white',
    zIndex: 1,
  },
};

export default ClickableAvatar;
