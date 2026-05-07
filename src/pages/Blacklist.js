import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { FaExclamationTriangle, FaMapMarkerAlt, FaCalendar, FaBuilding, FaFlag, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Blacklist = () => {
  const { token } = useAuth();
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlacklist = useCallback(async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/admin/blacklist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBlacklist(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load blacklist');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  const getCategoryColor = (category) => {
    switch(category) {
      case 'wage_theft': return 'danger';
      case 'abuse': return 'danger';
      case 'document_theft': return 'warning';
      case 'human_trafficking': return 'danger';
      default: return 'secondary';
    }
  };

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'wage_theft': return 'Ì≤∞ Wage Theft';
      case 'abuse': return 'Ì±ä Physical Abuse';
      case 'document_theft': return 'Ì≥Ñ Document Theft';
      case 'human_trafficking': return 'Ì∫´ Human Trafficking';
      default: return category?.replace('_', ' ') || 'Other';
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-2">Loading blacklist...</p>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">‚ö†Ô∏è Blacklisted Employers</h1>
        <p className="lead text-muted">Stay away from these employers who have been reported for violations</p>
      </div>

      {blacklist.length === 0 ? (
        <div className="text-center py-5">
          <FaCheckCircle size={60} className="text-success mb-3" />
          <p className="text-muted">No blacklisted employers at this time.</p>
          <p className="text-muted small">All reported employers are currently clean.</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <Badge bg="danger" className="p-2">‚ö†Ô∏è {blacklist.length} Blacklisted Employers</Badge>
          </div>
          <Row>
            {blacklist.map(employer => (
              <Col md={6} lg={4} key={employer._id} className="mb-4">
                <Card className="h-100 shadow-sm border-danger">
                  <Card.Header className="bg-danger text-white">
                    <FaExclamationTriangle className="me-2" /> Blacklisted
                  </Card.Header>
                  <Card.Body>
                    <Card.Title className="text-center mb-3">{employer.employerName}</Card.Title>
                    <div className="mb-2">
                      <FaBuilding className="text-warning me-2" />
                      <span>{employer.employerName}</span>
                    </div>
                    <div className="mb-2">
                      <FaMapMarkerAlt className="text-warning me-2" />
                      <span>{employer.country}</span>
                    </div>
                    <div className="mb-3">
                      <FaCalendar className="text-warning me-2" />
                      <span>Reported: {new Date(employer.reportedAt).toLocaleDateString()}</span>
                    </div>
                    <Badge bg={getCategoryColor(employer.category)} className="mb-3 p-2 w-100">
                      <FaFlag className="me-1" /> {getCategoryLabel(employer.category)}
                    </Badge>
                    <p className="text-muted small mt-2 mb-0">
                      <strong>Reason:</strong> {employer.reason}
                    </p>
                    {employer.reportedBy && (
                      <p className="text-muted small mt-2 mb-0">
                        <strong>Reported by:</strong> {employer.reportedBy}
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      <div className="mt-5 p-4 bg-light rounded-4 text-center">
        <h5>‚ö†Ô∏è Important Notice</h5>
        <p className="text-muted mb-0">
          These employers have been verified and blacklisted for violating worker rights. 
          Please avoid any job offers from these entities. If you have been affected by any of these employers, 
          please contact your local embassy or report through our emergency system.
        </p>
      </div>
    </Container>
  );
};

export default Blacklist;
