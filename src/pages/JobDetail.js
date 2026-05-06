import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaMapMarkerAlt, FaMoneyBillWave, FaBuilding, FaCheckCircle, FaArrowLeft, FaClock, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const res = await jobAPI.getById(id);
      setJob(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkIfApplied = useCallback(async () => {
    if (!user) return;
    try {
      const res = await applicationAPI.getMy();
      const applied = res.data.some(app => app.jobId?._id === id);
      setHasApplied(applied);
    } catch (err) {
      console.error(err);
    }
  }, [user, id]);

  useEffect(() => {
    fetchJob();
    checkIfApplied();
  }, [fetchJob, checkIfApplied]);

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      await applicationAPI.create({ jobId: id });
      toast.success('Application submitted successfully!');
      setHasApplied(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  if (!job) {
    return (
      <Container className="py-4">
        <Alert variant="danger">Job not found</Alert>
        <Button as={Link} to="/jobs">Back to Jobs</Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button variant="link" className="mb-3 p-0" onClick={() => navigate('/jobs')}>
        <FaArrowLeft className="me-2" /> Back to Jobs
      </Button>

      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4 p-lg-5">
              <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                <h2 className="mb-0">{job.title}</h2>
                {job.isVerified && <Badge bg="success" className="p-2">✓ Verified Job</Badge>}
              </div>

              <Row className="mb-4 g-3">
                <Col md={6}>
                  <div className="d-flex align-items-center">
                    <FaMapMarkerAlt className="text-warning me-2" />
                    <strong>Location:</strong> <span className="ms-2">{job.country}, {job.city || 'N/A'}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center">
                    <FaMoneyBillWave className="text-warning me-2" />
                    <strong>Salary:</strong> <span className="ms-2">{job.salary} {job.salaryCurrency}/month</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center">
                    <FaClock className="text-warning me-2" />
                    <strong>Contract:</strong> <span className="ms-2">{job.contractDuration} months</span>
                  </div>
                </Col>
                {job.employerId && (
                  <Col md={6}>
                    <div className="d-flex align-items-center">
                      <FaBuilding className="text-warning me-2" />
                      <strong>Employer:</strong> <span className="ms-2">{job.employerId.name}</span>
                    </div>
                  </Col>
                )}
              </Row>

              <div className="mb-4">
                <h5 className="border-bottom pb-2 mb-3">Job Description</h5>
                <p className="text-muted">{job.description}</p>
              </div>

              {job.requirements && job.requirements.length > 0 && (
                <div className="mb-4">
                  <h5 className="border-bottom pb-2 mb-3">Requirements</h5>
                  <ul className="text-muted">
                    {job.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <div className="mb-4">
                  <h5 className="border-bottom pb-2 mb-3">Benefits</h5>
                  <ul className="text-muted">
                    {job.benefits.map((benefit, idx) => (
                      <li key={idx}>⭐ {benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {hasApplied ? (
                <Alert variant="success" className="mt-3">
                  <FaCheckCircle className="me-2" /> You have already applied for this job. We'll notify you when the employer reviews your application.
                </Alert>
              ) : (
                <Button 
                  variant="warning" 
                  size="lg" 
                  className="w-100 mt-3" 
                  onClick={handleApply} 
                  disabled={applying}
                >
                  {applying ? 'Applying...' : 'Apply for this Job'}
                </Button>
              )}

              <div className="mt-4 p-3 bg-light rounded">
                <div className="d-flex align-items-center">
                  <FaShieldAlt className="text-warning me-2" />
                  <small className="text-muted">This job has been verified by KAZI LINDA. The employer has been vetted for legitimacy.</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default JobDetail;
