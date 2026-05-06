import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Applications from './pages/Applications';
import VerifyEmployer from './pages/VerifyEmployer';
import Blacklist from './pages/Blacklist';
import Login from './pages/Login';
import RegisterEnhanced from './pages/RegisterEnhanced';
import WorkerDashboard from './pages/WorkerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmbassyDashboard from './pages/EmbassyDashboard';
import Messages from './pages/Messages/Messages';
import ProfileEdit from './pages/ProfileEdit';
import SocialFeed from './components/SocialFeed';
import Friends from './pages/Friends';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterEnhanced />} />
            
            {/* Protected Routes */}
            <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
            <Route path="/verify" element={<ProtectedRoute><VerifyEmployer /></ProtectedRoute>} />
            <Route path="/blacklist" element={<ProtectedRoute><Blacklist /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
            <Route path="/news" element={<ProtectedRoute><SocialFeed /></ProtectedRoute>} />
            <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
            
            {/* Role-Specific Dashboards */}
            <Route path="/dashboard" element={<ProtectedRoute><WorkerDashboard /></ProtectedRoute>} />
            <Route path="/employer/dashboard" element={<ProtectedRoute><EmployerDashboard /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/embassy/dashboard" element={<ProtectedRoute><EmbassyDashboard /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
