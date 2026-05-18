import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Badge, Card, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaEye, FaEnvelope, FaPhone, FaUserCheck } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import moment from 'moment';

const KL_BRAND = '#f39c12';

const ApplicationsManager = ({ jobId, show, onHide, onStatusChange }) => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showWorkerModal, setShowWorkerModal] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      let url = jobId 
        ? `https://kazi-linda.onrender.com/api/employers/applications?jobId=${jobId}`
        : 'https://kazi-linda.onrender.com/api/employers/applications';
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [jobId, token]);

  useEffect(() => {
    if (show) {
      fetchApplications();
    }
  }, [show, jobId, fetchApplications]);

  const updateStatus = async (appId, status, notes = '') => {
    setProcessing(appId);
    try {
      const res = await fetch(`https://kazi-linda.onrender.com/api/employers/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes })
      });
      
      if (res.ok) {
        toast.success(`Application ${status === 'accepted' ? 'accepted' : 'rejected'}!`);
        fetchApplications();
        if (onStatusChange) onStatusChange();
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Error updating status');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'accepted': return <Badge bg="success" className="px-3 py-2 rounded-pill"><FaCheckCircle className="me-1" /> Accepted</Badge>;
      case 'rejected': return <Badge bg="danger" className="px-3 py-2 rounded-pill"><FaTimesCircle className="me-1" /> Rejected</Badge>;
      case 'reviewing': return <Badge bg="info" className="px-3 py-2 rounded-pill">Reviewing</Badge>;
      default: return <Badge bg="warning" className="px-3 py-2 rounded-pill">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Body className="text-center py-5">
          <Spinner animation="border" style={{ color: KL_BRAND }} />
          <p className="mt-3">Loading applications...</p>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton style={{ background: KL_BRAND, color: 'white' }}>
          <Modal.Title>Ì≥ã Job Applications ({applications.length})</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {applications.length === 0 ? (
            <div className="text-center py-5">
              <FaUserCheck size={64} color="#ccc" />
              <p className="mt-3 text-muted">No applications yet</p>
            </div>
          ) : (
            applications.map((app) => (
              <Card key={app._id} className="mb-3 shadow-sm border-0">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col md={4}>
                      <div className="d-flex align-items-center gap-3">
                        {app.workerId?.profilePicture ? (
                          <img src={app.workerId.profilePicture} alt="" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 50, height: 50, borderRadius: '50%', background: KL_BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20 }}>
                            {app.workerId?.name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <strong>{app.workerId?.name}</strong>
                          <div className="text-muted small">{app.workerId?.role}</div>
                        </div>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="small text-muted">Applied</div>
                      <div>{moment(app.appliedAt).fromNow()}</div>
                    </Col>
                    <Col md={2}>
                      {getStatusBadge(app.status)}
                    </Col>
                    <Col md={3}>
                      <div className="d-flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline-info" 
                          onClick={() => { setSelectedApp(app); setShowWorkerModal(true); }}
                        >
                          <FaEye /> View
                        </Button>
                        {app.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="success" 
                              onClick={() => updateStatus(app._id, 'accepted')}
                              disabled={processing === app._id}
                            >
                              <FaCheckCircle /> Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="danger" 
                              onClick={() => updateStatus(app._id, 'rejected')}
                              disabled={processing === app._id}
                            >
                              <FaTimesCircle /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </Col>
                  </Row>
                  
                  {app.status === 'accepted' && (
                    <Alert variant="success" className="mt-3 mb-0 small">
                      ‚úÖ You have accepted this application. The worker has been notified.
                    </Alert>
                  )}
                  {app.status === 'rejected' && (
                    <Alert variant="danger" className="mt-3 mb-0 small">
                      ‚ùå You have rejected this application.
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Worker Details Modal */}
      <Modal show={showWorkerModal} onHide={() => setShowWorkerModal(false)} size="md" centered>
        <Modal.Header closeButton style={{ background: KL_BRAND, color: 'white' }}>
          <Modal.Title>Ì±§ Worker Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApp && (
            <div>
              <div className="text-center mb-3">
                {selectedApp.workerId?.profilePicture ? (
                  <img src={selectedApp.workerId.profilePicture} alt="" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 100, height: 100, borderRadius: '50%', background: KL_BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 40, margin: '0 auto' }}>
                    {selectedApp.workerId?.name?.charAt(0)}
                  </div>
                )}
                <h4 className="mt-2">{selectedApp.workerId?.name}</h4>
                <Badge bg="secondary">{selectedApp.workerId?.role}</Badge>
              </div>
              
              <hr />
              
              <div className="mb-2">
                <FaEnvelope className="me-2" color={KL_BRAND} />
                <strong>Email:</strong> {selectedApp.workerId?.email}
              </div>
              <div className="mb-2">
                <FaPhone className="me-2" color={KL_BRAND} />
                <strong>Phone:</strong> {selectedApp.workerId?.phone}
              </div>
              
              {selectedApp.workerId?.skills?.length > 0 && (
                <div className="mb-2">
                  <strong>Skills:</strong>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {selectedApp.workerId.skills.map((skill, i) => (
                      <Badge key={i} bg="light" text="dark" className="rounded-pill">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedApp.coverLetter && (
                <div className="mb-2">
                  <strong>Cover Letter:</strong>
                  <p className="mt-1 small text-muted">{selectedApp.coverLetter}</p>
                </div>
              )}
              
              {selectedApp.experience && (
                <div className="mb-2">
                  <strong>Experience:</strong>
                  <p className="mt-1 small text-muted">{selectedApp.experience}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWorkerModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ApplicationsManager;
