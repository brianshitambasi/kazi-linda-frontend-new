import React from 'react';
import { Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

const ClickableAvatar = ({ userId, src, size = 40, className = '', showOnline = false, isOnline = false }) => {
  const avatarContent = src ? (
    <Image
      src={src}
      roundedCircle
      width={size}
      height={size}
      className={`object-fit-cover ${className}`}
      style={{ objectFit: 'cover', cursor: 'pointer' }}
    />
  ) : (
    <FaUserCircle 
      size={size} 
      className={`text-secondary ${className}`}
      style={{ cursor: 'pointer' }}
    />
  );

  if (!userId) {
    return (
      <div className="position-relative d-inline-block">
        {avatarContent}
        {showOnline && isOnline && <span className="online-indicator"></span>}
      </div>
    );
  }

  return (
    <Link to={`/profile/${userId}`} className="text-decoration-none">
      <div className="position-relative d-inline-block">
        {avatarContent}
        {showOnline && isOnline && <span className="online-indicator"></span>}
      </div>
    </Link>
  );
};

// Add styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .online-indicator {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      background-color: #31a24c;
      border-radius: 50%;
      border: 2px solid white;
    }
  `;
  if (!document.querySelector('#clickable-avatar-styles')) {
    style.id = 'clickable-avatar-styles';
    document.head.appendChild(style);
  }
}

export default ClickableAvatar;
