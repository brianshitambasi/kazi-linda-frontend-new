import React from 'react';
import { useAuth } from '../../context/AuthContext';
import FacebookLayout from './FacebookLayout';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const { user } = useAuth();
  
  // Use Facebook layout for logged-in users, regular navbar for guests
  if (user) {
    return <FacebookLayout>{children}</FacebookLayout>;
  }
  
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

export default Layout;
