import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import EmployerProfile from "./pages/Employer/EmployerProfile";
import AdminDashboard from './pages/AdminDashboard';
import EmbassyDashboard from './pages/EmbassyDashboard';
import Messages from './pages/Messages/Messages';
import ProfileEdit from './pages/ProfileEdit';
import NewsFeed from './pages/NewsFeed';
import Profile from './pages/Profile';
import Discover from './pages/Discover';
import Friends from './pages/Friends';
import Settings from './pages/Settings/Settings';
import AdminJobs from './pages/Admin/AdminJobs';
import AdminReports from './pages/Admin/AdminReports';
import AdminActivityLog from './pages/Admin/AdminActivityLog';
import AdminAnalytics from './pages/Admin/AdminAnalytics';

const HomeRedirect = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/news" replace /> : <Home />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/about" element={<About />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterEnhanced />} />
            
            {/* Social / Feed Routes */}
            <Route path="/news" element={<ProtectedRoute><NewsFeed /></ProtectedRoute>} />
            <Route path="/social" element={<ProtectedRoute><Navigate to="/news" replace /></ProtectedRoute>} />
            <Route path="/feed" element={<ProtectedRoute><Navigate to="/news" replace /></ProtectedRoute>} />
            
            {/* User Routes */}
            <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
            <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
            <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
            <Route path="/verify" element={<ProtectedRoute><VerifyEmployer /></ProtectedRoute>} />
            <Route path="/blacklist" element={<ProtectedRoute><Blacklist /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><WorkerDashboard /></ProtectedRoute>} />
            <Route path="/employer/dashboard" element={<ProtectedRoute><EmployerDashboard /></ProtectedRoute>} />
            <Route path="/employer/profile" element={<ProtectedRoute><EmployerProfile /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/embassy/dashboard" element={<ProtectedRoute><EmbassyDashboard /></ProtectedRoute>} />
            
            {/* Settings Route */}
            <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            {/* Admin Management Routes */}
            <Route path="/admin/jobs" element={<ProtectedRoute><AdminJobs /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/activity-log" element={<ProtectedRoute><AdminActivityLog /></ProtectedRoute>} />
            
            {/* 404 - Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
