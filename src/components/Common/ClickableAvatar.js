import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

const ClickableAvatar = ({ userId, src, size = 40, className = '', showOnline = false, isOnline = false, style = {} }) => {
  const avatarStyles = {
    cursor: 'pointer',
    objectFit: 'cover',
    width: size,
    height: size,
    borderRadius: '50%',
    ...style
  };

  const avatarContent = src ? (
    <img
      src={src}
      alt="Profile"
      style={avatarStyles}
      className={className}
    />
  ) : (
    <FaUserCircle 
      size={size} 
      className={`text-secondary ${className}`}
      style={{ cursor: 'pointer', color: '#bcc0c4', ...style }}
    />
  );

  const AvatarWrapper = () => (
    <div style={styles.container}>
      {avatarContent}
      {showOnline && isOnline && <span style={styles.onlineIndicator}></span>}
    </div>
  );

  if (!userId) {
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
