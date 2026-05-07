import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import { Container } from 'react-bootstrap';

const Layout = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <>
      <Navbar />
      <main className={user ? 'py-4' : ''}>
        <Container fluid={!!user} className={!user ? 'py-4' : ''}>
          {children}
        </Container>
      </main>
    </>
  );
};

export default Layout;
