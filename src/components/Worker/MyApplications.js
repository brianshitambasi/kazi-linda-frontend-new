import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaClock, FaBriefcase, FaMapMarkerAlt, FaMoneyBillWave, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import moment from 'moment';

const KL_BRAND = '#f39c12';

const MyApplications = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch('https://kazi-linda.onrender.com/api/applications/my-applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [token]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'accepted': return <FaCheckCircle size={24} color="#28a745" />;
      case 'rejected': return <FaTimesCircle size={24} color="#dc3545" />;
      default: return <FaClock size={24} color="#f39c12" />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'accepted': return '‚úÖ Accepted - Congratulations! The employer has accepted your application.';
      case 'rejected': return '‚ùå Rejected - Your application was not selected at this time.';
      default: return '‚è≥ Pending - Employer is reviewing your application.';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: KL_BRAND }} />
        <p className="mt-3">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4" style={{ color: KL_BRAND }}>Ì≥ã My Job Applications</h2>
      
      {applications.length === 0 ? (
        <Alert variant="info" className="text-center">
          You haven't applied for any jobs yet. <Link to="/jobs">Browse jobs</Link> and start applying!
        </Alert>
      ) : (
        <div className="row">
          {applications.map((app) => (
            <div key={app._id} className="col-12 mb-3">
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex gap-3">
                      {getStatusIcon(app.status)}
                      <div>
                        <h4 className="mb-1">{app.jobId?.title}</h4>
                        <div className="text-muted small mb-2">
                          <FaBriefcase className="me-1" /> {app.jobId?.employerId?.name || 'Employer'} ‚Ä¢ 
                          <FaMapMarkerAlt className="ms-2 me-1" /> {app.jobId?.country} ‚Ä¢ 
                          <FaMoneyBillWave className="ms-2 me-1" /> {app.jobId?.salary?.toLocaleString()} {app.jobId?.salaryCurrency}
                        </div>
                        <div className={`alert alert-${app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'} py-2 px-3 mb-0 small`}>
                          {getStatusText(app.status)}
                        </div>
                        {app.status === 'accepted' && (
                          <div className="mt-3">
                            <Button 
                              variant="success" 
                              size="sm"
                              as={Link}
                              to={`/messages?employer=${app.jobId?.employerId?._id}`}
                            >
                              <FaEnvelope className="me-1" /> Contact Employer
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-end text-muted small">
                      Applied: {moment(app.appliedAt).fromNow()}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
