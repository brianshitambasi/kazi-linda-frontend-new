import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationAPI } from '../services/api';
import { Container, Row, Col, Card, Spinner, Table, Button } from 'react-bootstrap';
import { FaBriefcase, FaCheckCircle, FaClock, FaStar, FaUserCircle } from 'react-icons/fa';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await applicationAPI.getMy();
      const apps = res.data;
      setApplications(apps);
      setStats({
        total: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        accepted: apps.filter(a => a.status === 'accepted').length,
        rejected: apps.filter(a => a.status === 'rejected').length
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Welcome, {user?.name?.split(' ')[0]}!</h1>
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
              <h2 className="mb-0">5</h2>
              <p className="text-muted">Completed Jobs</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h3 className="mb-3">Recent Applications</h3>
      {applications.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <p>You haven't applied for any jobs yet.</p>
            <Button as={Link} to="/jobs" variant="warning">Browse Jobs</Button>
          </Card.Body>
        </Card>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="bg-dark text-white">
            <tr>
              <th>Job Title</th>
              <th>Country</th>
              <th>Applied On</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.slice(0, 10).map(app => (
              <tr key={app._id}>
                <td>{app.jobId?.title}</td>
                <td>{app.jobId?.country}</td>
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
    </Container>
  );
};

export default WorkerDashboard;
