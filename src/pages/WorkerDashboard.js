import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationAPI } from '../services/api';
import { Row, Col, Card, Spinner, Table, Button, Badge } from 'react-bootstrap';
import { FaBriefcase, FaCheckCircle, FaClock, FaStar } from 'react-icons/fa';
import DashboardLayout from '../components/Layout/DashboardLayout';
// eslint-disable-next-line no-unused-vars
import toast from 'react-hot-toast';

const WorkerDashboard = () => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });

  const fetchApplications = useCallback(async () => {
    try {
      const res = await applicationAPI.getMy(token);
      const apps = Array.isArray(res.data) ? res.data : [];
      setApplications(apps);
      setStats({
        total: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        accepted: apps.filter(a => a.status === 'accepted').length,
        rejected: apps.filter(a => a.status === 'rejected').length
      });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  if (loading) {
    return (
      <DashboardLayout title="Worker Dashboard">
        <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Welcome back, ${user?.name?.split(' ')[0] || 'Worker'}!`}>
      <Row className="g-4 mb-5">
        <Col md={3}><Card className="text-center border-0 shadow-sm"><Card.Body><FaBriefcase size={30} className="text-warning mb-2" /><h2>{stats.total}</h2><p>Total Applications</p></Card.Body></Card></Col>
        <Col md={3}><Card className="text-center border-0 shadow-sm"><Card.Body><FaClock size={30} className="text-warning mb-2" /><h2>{stats.pending}</h2><p>Pending Review</p></Card.Body></Card></Col>
        <Col md={3}><Card className="text-center border-0 shadow-sm"><Card.Body><FaCheckCircle size={30} className="text-success mb-2" /><h2>{stats.accepted}</h2><p>Accepted</p></Card.Body></Card></Col>
        <Col md={3}><Card className="text-center border-0 shadow-sm"><Card.Body><FaStar size={30} className="text-warning mb-2" /><h2>0</h2><p>Completed Jobs</p></Card.Body></Card></Col>
      </Row>

      <h3>Recent Applications</h3>
      {applications.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm"><Card.Body><p>No applications yet.</p><Button as={Link} to="/jobs" style={{ background: '#f39c12', border: 'none' }}>Browse Jobs</Button></Card.Body></Card>
      ) : (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead className="bg-dark text-white"><tr><th>Job Title</th><th>Country</th><th>Applied On</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{applications.map(app => (<tr key={app._id}><td>{app.jobId?.title}</td><td>{app.jobId?.country}</td><td>{new Date(app.appliedAt).toLocaleDateString()}</td><td><Badge bg={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}>{app.status}</Badge></td><td><Button as={Link} to={`/jobs/${app.jobId?._id}`} size="sm" variant="outline-warning">View</Button></td></tr>))}</tbody>
        </Table>
      )}
    </DashboardLayout>
  );
};

export default WorkerDashboard;
