import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationAPI, profileAPI } from '../services/api';
import { Container, Row, Col, Card, Spinner, Table, Button, Image } from 'react-bootstrap';
import { FaBriefcase, FaCheckCircle, FaClock, FaStar, FaUserCircle } from 'react-icons/fa';

const WorkerDashboard = () => {
  const { user, updateUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    completed: 0
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await profileAPI.getProfile();
      setProfile(res.data);
      if (res.data.profilePicture && user?.profilePicture !== res.data.profilePicture) {
        updateUser({ profilePicture: res.data.profilePicture });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, [updateUser, user]);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await applicationAPI.getMy();
      const apps = Array.isArray(res.data) ? res.data : [];
      setApplications(apps);
      setStats({
        total: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        accepted: apps.filter(a => a.status === 'accepted').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
        completed: apps.filter(a => a.status === 'completed').length
      });
    } catch (err) {
      console.error('Error fetching applications:', err);
      setApplications([]);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchProfile(), fetchApplications()]).finally(() => setLoading(false));
  }, [fetchProfile, fetchApplications]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-2">Loading dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          {profile?.profilePicture ? (
            <Image 
              src={profile.profilePicture} 
              roundedCircle 
              width="60" 
              height="60" 
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <FaUserCircle size={60} className="text-secondary" />
          )}
          <div>
            <h1 className="mb-0">Welcome, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-muted mb-0">Member since {new Date(profile?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <Button as={Link} to="/profile/edit" variant="outline-warning">
          <FaUserCircle className="me-2" /> Edit Profile
        </Button>
      </div>
      
      <Row className="g-4 mb-5">
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <FaBriefcase size={30} className="text-warning mb-2" />
              <h2 className="mb-0">{stats.total}</h2>
              <p className="text-muted">Total Applications</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <FaClock size={30} className="text-warning mb-2" />
              <h2 className="mb-0">{stats.pending}</h2>
              <p className="text-muted">Pending Review</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <FaCheckCircle size={30} className="text-success mb-2" />
              <h2 className="mb-0">{stats.accepted}</h2>
              <p className="text-muted">Accepted</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <FaStar size={30} className="text-warning mb-2" />
              <h2 className="mb-0">{stats.completed}</h2>
              <p className="text-muted">Completed Jobs</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Recent Applications</h3>
        <Button as={Link} to="/jobs" variant="warning" size="sm">
          Browse More Jobs
        </Button>
      </div>
      
      {applications.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FaBriefcase size={50} className="text-muted mb-3" />
            <h5>No applications yet</h5>
            <p className="text-muted">Start applying for jobs to see them here!</p>
            <Button as={Link} to="/jobs" variant="warning">Browse Jobs</Button>
          </Card.Body>
        </Card>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="bg-dark text-white">
            <tr>
              <th>Job Title</th>
              <th>Country</th>
              <th>Salary</th>
              <th>Applied On</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.slice(0, 10).map(app => (
              <tr key={app._id}>
                <td>{app.jobId?.title || 'Unknown Job'}</td>
                <td>{app.jobId?.country || 'N/A'}</td>
                <td>{app.jobId?.salary} {app.jobId?.salaryCurrency}</td>
                <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                <td>
                  <span className={`badge bg-${app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}`}>
                    {app.status}
                  </span>
                </td>
                <td>
                  <Button as={Link} to={`/jobs/${app.jobId?._id}`} size="sm" variant="outline-warning">
                    View Job
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {stats.pending > 0 && (
        <div className="mt-4 p-3 bg-light rounded-4">
          <h6 className="text-warning mb-2">í³Œ Application Status</h6>
          <p className="text-muted small mb-0">
            You have {stats.pending} pending application{stats.pending !== 1 ? 's' : ''}. 
            We'll notify you once employers review your applications.
          </p>
        </div>
      )}
    </Container>
  );
};

export default WorkerDashboard;
