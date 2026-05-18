import React from 'react';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaUserEdit, FaSignOutAlt, FaEnvelope, FaEye } from 'react-icons/fa';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const WorkerDashboard = () => {
  const { logout } = useAuth();

  return (
    <DashboardLayout title="Worker Dashboard">
      <div className="container py-4">
        <div className="row">
          <div className="col-md-6 col-lg-4 mb-3">
            <Link to="/my-applications" className="btn btn-outline-primary w-100 py-3">
              <FaEye className="me-2" size={20} /> My Applications Status
            </Link>
          </div>
          <div className="col-md-6 col-lg-4 mb-3">
            <Link to="/jobs" className="btn btn-outline-success w-100 py-3">
              <FaBriefcase className="me-2" size={20} /> Browse Jobs
            </Link>
          </div>
          <div className="col-md-6 col-lg-4 mb-3">
            <Link to="/profile/edit" className="btn btn-outline-warning w-100 py-3">
              <FaUserEdit className="me-2" size={20} /> Edit Profile
            </Link>
          </div>
          <div className="col-md-6 col-lg-4 mb-3">
            <Link to="/messages" className="btn btn-outline-info w-100 py-3">
              <FaEnvelope className="me-2" size={20} /> Messages
            </Link>
          </div>
          <div className="col-md-6 col-lg-4 mb-3">
            <button onClick={logout} className="btn btn-outline-danger w-100 py-3">
              <FaSignOutAlt className="me-2" size={20} /> Logout
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkerDashboard;
