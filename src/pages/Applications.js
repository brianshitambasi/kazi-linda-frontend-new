import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { FaBriefcase, FaMapMarkerAlt, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await applicationAPI.getMy();
      setApplications(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'accepted':
        return <Badge bg="success" className="px-3 py-2"><FaCheckCircle className="me-1" /> Accepted</Badge>;
      case 'rejected':
        return <Badge bg="danger" className="px-3 py-2"><FaTimesCircle className="me-1" /> Rejected</Badge>;
      case 'reviewing':
        return <Badge bg="info" className="px-3 py-2"><FaEye className="me-1" /> Reviewing</Badge>;
      default:
        return <Badge bg="warning" className="px-3 py-2 text-dark"><FaHourglassHalf className="me-1" /> Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-2">Loading your applications...</p>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">My Applications</h1>
        <p className="lead text-muted">Track all your job applications and their status</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-5">
          <FaBriefcase size={60} className="text-muted mb-3" />
          <p className="text-muted">You haven't applied for any jobs yet.</p>
          <Button as={Link} to="/jobs" variant="warning">Browse Jobs</Button>
        </div>
      ) : (
        <Row>
          {applications.map(app => (
            <Col md={6} lg={4} key={app._id} className="mb-4">
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-3">
                    {getStatusBadge(app.status)}
                    <small className="text-muted">Applied: {new Date(app.appliedAt).toLocaleDateString()}</small>
                  </div>
                  <Card.Title className="mb-2">{app.jobId?.title}</Card.Title>
                  <div className="mb-2">
                    <FaMapMarkerAlt className="text-warning me-2" />
                    <span>{app.jobId?.country}, {app.jobId?.city || 'N/A'}</span>
                  </div>
                  <div className="mb-3">
                    <FaBriefcase className="text-warning me-2" />
                    <span>Salary: {app.jobId?.salary} {app.jobId?.salaryCurrency}</span>
                  </div>
                  {app.feedback && (
                    <div className="mt-3 p-2 bg-light rounded">
                      <small className="text-muted">Feedback: {app.feedback}</small>
                    </div>
                  )}
                </Card.Body>
                <Card.Footer className="bg-white border-0 pb-3">
                  <Button as={Link} to={`/jobs/${app.jobId?._id}`} variant="outline-warning" size="sm" className="w-100">
                    View Job
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Applications;
