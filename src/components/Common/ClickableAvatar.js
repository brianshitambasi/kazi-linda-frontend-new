import React from 'react';
import { Link } from 'react-router-dom';

const ClickableAvatar = ({ 
  userId, 
  src, 
  name,
  size = 40, 
  className = '', 
  showOnline = false, 
  isOnline = false, 
  style = {}, 
  onClick 
}) => {
  const avatarStyles = {
    cursor: onClick ? 'pointer' : 'default',
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
        e.target.nextSibling.style.display = 'flex';
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

  if (onClick || !userId) {
    return <AvatarWrapper />;
  }

  return (
    <Link to={`/profile/${userId}`} style={styles.link}>
      <AvatarWrapper />
    </Link>
  );
};

const styles = {
  link: {
    textDecoration: 'none',
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
