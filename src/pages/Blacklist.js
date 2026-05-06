import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { FaExclamationTriangle, FaMapMarkerAlt, FaCalendar, FaBuilding, FaFlag, FaCheckCircle } from 'react-icons/fa';
import { employerAPI } from '../services/api';
import toast from 'react-hot-toast';

const Blacklist = () => {
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const fetchBlacklist = async () => {
    try {
      const res = await employerAPI.getBlacklist();
      setBlacklist(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load blacklist');
    } finally {
      setLoading(false);
    }
  };

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
      case 'wage_theft': return 'í²° Wage Theft';
      case 'abuse': return 'í±Š Physical Abuse';
      case 'document_theft': return 'í³„ Document Theft';
      case 'human_trafficking': return 'íº¨ Human Trafficking';
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
        <h1 className="display-5 fw-bold">Blacklisted Employers</h1>
        <p className="lead text-muted">Stay away from these employers who have been reported for violations</p>
      </div>

      {blacklist.length === 0 ? (
        <div className="text-center py-5">
          <FaCheckCircle size={60} className="text-success mb-3" />
          <p className="text-muted">No blacklisted employers at this time. All reported employers are currently clean.</p>
        </div>
      ) : (
        <Row>
          {blacklist.map(employer => (
            <Col md={6} lg={4} key={employer._id} className="mb-4">
              <Card className="h-100 shadow-sm border-danger">
                <Card.Body>
                  <div className="text-center mb-3">
                    <FaExclamationTriangle size={40} className="text-danger" />
                  </div>
                  <Card.Title className="text-center">{employer.employerName}</Card.Title>
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
                  <Badge bg={getCategoryColor(employer.category)} className="mb-2 p-2 w-100">
                    <FaFlag className="me-1" /> {getCategoryLabel(employer.category)}
                  </Badge>
                  <p className="text-muted small mt-2">{employer.reason}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Blacklist;
