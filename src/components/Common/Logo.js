import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 40, variant = 'default', className = '' }) => {
  const colors = {
    primary: '#2E7D32',
    secondary: '#4CAF50',
    gradient: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)'
  };

  const styles = {
    default: {
      container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        background: colors.gradient,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(46,125,50,0.3)',
        transition: 'all 0.3s ease',
        textDecoration: 'none'
      },
      text: {
        fontSize: size * 0.45,
        fontWeight: 800,
        color: '#fff',
        letterSpacing: '1px',
        fontFamily: "'Poppins', 'Segoe UI', sans-serif"
      }
    },
    minimal: {
      container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        background: 'transparent',
        borderRadius: '8px',
        textDecoration: 'none'
      },
      text: {
        fontSize: size * 0.55,
        fontWeight: 800,
        background: colors.gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        letterSpacing: '1px',
        fontFamily: "'Poppins', 'Segoe UI', sans-serif"
      }
    },
    dark: {
      container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        background: '#1a1a2e',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        textDecoration: 'none'
      },
      text: {
        fontSize: size * 0.45,
        fontWeight: 800,
        color: '#f39c12',
        letterSpacing: '1px',
        fontFamily: "'Poppins', 'Segoe UI', sans-serif"
      }
    }
  };

  const currentStyle = styles[variant] || styles.default;

  return (
    <Link to="/" style={currentStyle.container} className={className}>
      <span style={currentStyle.text}>KL</span>
    </Link>
  );
};

export default Logo;
