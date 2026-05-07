import React from 'react';
import { Image } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';

const Avatar = ({ src, size = 40, className = '', onClick }) => {
  if (src) {
    return (
      <Image
        src={src}
        roundedCircle
        width={size}
        height={size}
        className={`object-fit-cover ${className}`}
        style={{ objectFit: 'cover' }}
        onClick={onClick}
      />
    );
  }
  
  return (
    <FaUserCircle 
      size={size} 
      className={`text-secondary ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    />
  );
};

export default Avatar;
