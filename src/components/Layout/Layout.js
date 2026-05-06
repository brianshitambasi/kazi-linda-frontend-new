import React from 'react';
import Navbar from './Navbar';
import { Container } from 'react-bootstrap';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <Container className="py-4" style={{ minHeight: 'calc(100vh - 136px)' }}>
        {children}
      </Container>
      <footer className="bg-dark text-white-50 text-center py-3 mt-4">
        <Container>
          <small>© 2026 KAZI LINDA. All rights reserved. | Safe Jobs for Kenyans at Home and Abroad</small>
        </Container>
      </footer>
    </>
  );
};

export default Layout;
