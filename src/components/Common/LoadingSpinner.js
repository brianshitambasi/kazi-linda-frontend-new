import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div style={styles.container}>
      <div style={styles.logoContainer}>
        <div style={styles.logo}>KL</div>
        <div style={styles.leafIcon}>í¼¿</div>
      </div>
      <div style={styles.pulseRing}></div>
      <p style={styles.message}>{message}</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)'
  },
  logoContainer: {
    position: 'relative',
    marginBottom: '24px'
  },
  logo: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: 800,
    color: '#fff',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    boxShadow: '0 8px 24px rgba(46,125,50,0.3)',
    position: 'relative',
    zIndex: 2
  },
  leafIcon: {
    position: 'absolute',
    bottom: '-10px',
    right: '-10px',
    fontSize: '24px',
    background: '#fff',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 3
  },
  pulseRing: {
    position: 'absolute',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '2px solid #4CAF50',
    animation: 'pulseRing 1.5s ease-out infinite',
    opacity: 0
  },
  message: {
    marginTop: '32px',
    color: '#2E7D32',
    fontSize: '16px',
    fontWeight: 500,
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  }
};

// Add keyframes to document
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulseRing {
    0% {
      transform: scale(0.8);
      opacity: 0.8;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }
`;
document.head.appendChild(styleSheet);

export default LoadingSpinner;
