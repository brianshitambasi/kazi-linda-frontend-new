import React from 'react';
import { Image } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';

const KL_BRAND = '#f39c12';

const Avatar = ({ src, size = 40, className = '', onClick, style = {} }) => {
  const avatarStyles = {
    objectFit: 'cover',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.2s ease',
    ...style
  };

  if (src) {
    return (
      <Image
        src={src}
        roundedCircle
        width={size}
        height={size}
        className={className}
        style={avatarStyles}
        onClick={onClick}
        onMouseEnter={(e) => {
          if (onClick) e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          if (onClick) e.currentTarget.style.transform = 'scale(1)';
        }}
      />
    );
  }
  
  return (
    <FaUserCircle 
      size={size} 
      className={`text-secondary ${className}`}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        color: '#bcc0c4',
        transition: 'transform 0.2s ease',
        ...style
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.transform = 'scale(1)';
      }}
    />
  );
};

export default Avatar;