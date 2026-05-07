import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Spinner } from 'react-bootstrap';
import { FaShieldAlt, FaBriefcase, FaUsers, FaGlobeAfrica, FaArrowRight, FaStar } from 'react-icons/fa';
import { jobAPI } from '../services/api';

const Home = () => {
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ jobs: 0, workers: 0, countries: 0, rating: 4.8 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const jobsRes = await jobAPI.getAll();
      setRecentJobs(jobsRes.data.jobs?.slice(0, 3) || []);
      setStats(prev => ({ ...prev, jobs: jobsRes.data.total || 0 }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: FaBriefcase, title: 'Verified Jobs', desc: 'All jobs are vetted for your safety' },
    { icon: FaShieldAlt, title: 'Employer Verification', desc: 'Check employer legitimacy' },
    { icon: FaGlobeAfrica, title: 'Global Opportunities', desc: 'Jobs in Kenya, Gulf countries, Europe' },
    { icon: FaUsers, title: 'Worker Community', desc: 'Connect with other workers' }
  ];

  const testimonials = [
    { name: 'Mary Wanjiku', role: 'House Help in Riyadh', text: 'KAZI LINDA helped me find a legitimate job!', rating: 5 },
    { name: 'John Kamau', role: 'Driver in Dubai', text: 'The blacklist feature saved me from a scam!', rating: 5 },
    { name: 'Sarah Otieno', role: 'Nanny in Nairobi', text: 'Easy to use and very helpful!', rating: 4 }
  ];

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-dark text-white py-5 rounded-3 mb-5" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <Container className="py-5 text-center">
          <FaShieldAlt size={80} className="mb-4 text-warning" />
          <h1 className="display-3 fw-bold mb-3">KAZI LINDA</h1>
          <p className="lead mb-3">Safe Jobs for Kenyans at Home and Abroad</p>
          <p className="mb-4">Find verified jobs, protect yourself from exploitation, and stay safe wherever you work.</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Button as={Link} to="/jobs" variant="warning" size="lg">
              <FaBriefcase className="me-2" /> Find Jobs <FaArrowRight className="ms-2" />
            </Button>
            <Button as={Link} to="/verify" variant="outline-light" size="lg">
              <FaShieldAlt className="me-2" /> Verify Employer
            </Button>
          </div>
        </Container>
      </div>

      <Container>
        <Row className="text-center mb-5 g-4">
          <Col md={4}>
            <div className="p-3 bg-light rounded-3">
              <h2 className="display-4 fw-bold text-warning">{stats.jobs}+</h2>
              <p className="text-muted mb-0">Verified Jobs</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-3 bg-light rounded-3">
              <h2 className="display-4 fw-bold text-warning">1000+</h2>
              <p className="text-muted mb-0">Workers Protected</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-3 bg-light rounded-3">
              <h2 className="display-4 fw-bold text-warning">{stats.rating}</h2>
              <p className="text-muted mb-0">User Rating ★</p>
            </div>
          </Col>
        </Row>

        <h2 className="text-center mb-4">Why Choose KAZI LINDA?</h2>
        <Row className="mb-5 g-4">
          {features.map((feature, idx) => (
            <Col md={3} key={idx}>
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body>
                  <feature.icon size={45} className="text-warning mb-3" />
                  <Card.Title>{feature.title}</Card.Title>
                  <Card.Text className="text-muted small">{feature.desc}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <h2 className="text-center mb-4">Recent Job Opportunities</h2>
        <Row className="mb-5 g-4">
          {recentJobs.map(job => (
            <Col md={4} key={job._id}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <Card.Title>{job.title}</Card.Title>
                  <Card.Text className="text-muted small">{job.description?.substring(0, 100)}...</Card.Text>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="text-warning fw-bold">{job.salary} {job.salaryCurrency}</span>
                    <span className="text-muted small">{job.country}</span>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white border-0 pb-3">
                  <Button as={Link} to={`/jobs/${job._id}`} variant="outline-warning" size="sm" className="w-100">
                    View Details
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>

        <h2 className="text-center mb-4">What Workers Say</h2>
        <Row className="mb-5 g-4">
          {testimonials.map((t, idx) => (
            <Col md={4} key={idx}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <div className="mb-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < t.rating ? 'text-warning' : 'text-muted'} />
                    ))}
                  </div>
                  <Card.Text className="text-muted">"{t.text}"</Card.Text>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <strong>{t.name}</strong>
                    <small className="text-muted">{t.role}</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="bg-light rounded-4 p-5 text-center mb-4">
          <h3 className="mb-3">Ready to find safe employment?</h3>
          <p className="text-muted mb-4">Join thousands of Kenyans who have found secure jobs through KAZI LINDA.</p>
          <Button as={Link} to="/register" variant="warning" size="lg">
            Register Now <FaArrowRight className="ms-2" />
          </Button>
        </div>
      </Container>
    </>
  );
};

export default Home;
