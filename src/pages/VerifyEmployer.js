import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { 
  FaSearch, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, 
  FaBuilding, FaMapMarkerAlt, FaBriefcase, FaStar, FaClock, FaUsers
} from 'react-icons/fa';
import { employerAPI } from '../services/api';
import toast from 'react-hot-toast';

const VerifyEmployer = () => {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employerData, setEmployerData] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!name || !country) {
      toast.error('Please enter employer name and country');
      return;
    }

    setLoading(true);
    try {
      const res = await employerAPI.verify({ name, country });
      setResult(res.data);
      
      if (res.data.employer?._id) {
        const statsRes = await employerAPI.getStats(res.data.employer._id);
        setEmployerData(statsRes.data);
      } else {
        setEmployerData(null);
      }
    } catch (err) {
      toast.error('Failed to verify employer');
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar key={i} className={i <= fullStars ? 'text-warning' : 'text-muted'} />
      );
    }
    return stars;
  };

  return (
    <Container className="py-4">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">Verify Employer</h1>
        <p className="lead text-muted">Check employer history and track record before accepting a job</p>
      </div>

      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <Form onSubmit={handleVerify}>
                <Form.Group className="mb-3">
                  <Form.Label>Employer Name</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaBuilding /></span>
                    <Form.Control
                      type="text"
                      placeholder="Enter employer name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Country</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaMapMarkerAlt /></span>
                    <Form.Control
                      type="text"
                      placeholder="Enter country"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      required
                    />
                  </div>
                </Form.Group>
                <Button variant="warning" type="submit" className="w-100" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : <><FaSearch className="me-2" /> Verify Employer</>}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {result && (
        <Row className="justify-content-center mt-4">
          <Col md={8}>
            {result.blacklisted ? (
              <Card className="border-0 shadow-sm bg-danger bg-opacity-10">
                <Card.Body className="p-4 text-center">
                  <FaExclamationTriangle size={50} className="text-danger mb-3" />
                  <h3 className="text-danger">⚠️ BLACKLISTED</h3>
                  <p className="mb-2">Reason: {result.blacklistReason}</p>
                  <hr />
                  <p className="mb-0 text-muted small">This employer has been reported for workplace violations.</p>
                </Card.Body>
              </Card>
            ) : result.employer?._id ? (
              <>
                <Card className="border-0 shadow-sm mb-4">
                  <Card.Body className="p-4">
                    <div className="text-center mb-3">
                      {result.employer.verified ? (
                        <FaCheckCircle size={40} className="text-success" />
                      ) : (
                        <FaShieldAlt size={40} className="text-warning" />
                      )}
                      <h3 className="mt-2">{result.employer.name}</h3>
                      <p className="text-muted">{result.employer.companyName || 'Individual Employer'}</p>
                      <div>
                        {getRatingStars(result.employer.rating)}
                        <span className="ms-2">({result.employer.totalRatings} reviews)</span>
                      </div>
                    </div>
                    <hr />
                    <Row>
                      <Col md={6}>
                        <p><FaMapMarkerAlt className="text-warning me-2" /> Country: {result.employer.country}</p>
                        <p><FaClock className="text-warning me-2" /> Member since: {new Date(result.employer.memberSince).toLocaleDateString()}</p>
                      </Col>
                      <Col md={6}>
                        <p><FaUsers className="text-warning me-2" /> Total Hired: {employerData?.stats?.hiredCount || 0}</p>
                        <p><FaBriefcase className="text-warning me-2" /> Jobs Posted: {employerData?.stats?.totalJobsPosted || 0}</p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {result.complaints > 0 && (
                  <Alert variant="danger" className="mt-3">
                    <FaExclamationTriangle className="me-2" />
                    This employer has {result.complaints} complaint{result.complaints !== 1 ? 's' : ''} on record.
                  </Alert>
                )}
              </>
            ) : (
              <Card className="border-0 shadow-sm bg-success bg-opacity-10">
                <Card.Body className="p-4 text-center">
                  <FaCheckCircle size={50} className="text-success mb-3" />
                  <h3 className="text-success">✓ CLEAN</h3>
                  <p className="mb-2">No blacklist records found for this employer.</p>
                  <p className="text-muted small">This employer is not in our database yet.</p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default VerifyEmployer;
