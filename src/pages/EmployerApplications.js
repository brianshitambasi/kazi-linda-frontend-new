import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

const EmployerApplications = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/jobs/my-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, status) => {
    try {
      await fetch(`https://kazi-linda.onrender.com/api/jobs/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, feedback })
      });
      toast.success(`Application ${status}`);
      fetchApplications();
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'accepted': return <Badge bg="success">Accepted</Badge>;
      case 'rejected': return <Badge bg="danger">Rejected</Badge>;
      case 'reviewing': return <Badge bg="info">Reviewing</Badge>;
      default: return <Badge bg="warning">Pending</Badge>;
    }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner /></Container>;

  return (
    <Container className="py-4">
      <h2 className="mb-4">Job Applications Received</h2>
      
      <Card className="shadow-sm">
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead className="bg-dark text-white">
              <tr>
                <th>Worker</th>
                <th>Job Title</th>
                <th>Skills</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app._id}>
                  <td>
                    <strong>{app.workerId?.name}</strong><br />
                    <small className="text-muted">{app.workerId?.email}</small>
                  </td>
                  <td>{app.jobId?.title} - {app.jobId?.country}</td>
                  <td>
                    {app.workerId?.skills?.slice(0, 3).map((s, i) => (
                      <Badge key={i} bg="info" className="me-1">{s}</Badge>
                    ))}
                  </td>
                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="outline-info" 
                      className="me-1"
                      onClick={() => { setSelectedApp(app); setShowModal(true); }}
                    >
                      <FaEye /> Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Review Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApp && (
            <>
              <h6>Worker: {selectedApp.workerId?.name}</h6>
              <p><strong>Email:</strong> {selectedApp.workerId?.email}</p>
              <p><strong>Skills:</strong> {selectedApp.workerId?.skills?.join(', ')}</p>
              <p><strong>Experience:</strong> {selectedApp.workerId?.experience}</p>
              <hr />
              <Form.Group>
                <Form.Label>Feedback (optional)</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  value={feedback} 
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Add feedback for the applicant..."
                />
              </Form.Group>
              <div className="mt-3 d-flex gap-2">
                <Button variant="success" onClick={() => updateStatus(selectedApp._id, 'accepted')}>
                  <FaCheck /> Accept
                </Button>
                <Button variant="danger" onClick={() => updateStatus(selectedApp._id, 'rejected')}>
                  <FaTimes /> Reject
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default EmployerApplications;
