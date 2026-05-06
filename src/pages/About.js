import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaShieldAlt, FaUsers, FaGlobeAfrica, FaHandsHelping, FaCheckCircle, FaHeart } from 'react-icons/fa';

const About = () => {
  const values = [
    { icon: FaShieldAlt, title: 'Safety First', desc: 'We prioritize worker safety above all else' },
    { icon: FaUsers, title: 'Community', desc: 'Building a supportive worker community' },
    { icon: FaGlobeAfrica, title: 'Global Reach', desc: 'Connecting Kenyans to opportunities worldwide' },
    { icon: FaHandsHelping, title: 'Support', desc: '24/7 emergency support for all workers' }
  ];

  const stats = [
    { number: '5000+', label: 'Workers Protected' },
    { number: '50+', label: 'Countries Served' },
    { number: '1000+', label: 'Verified Jobs' },
    { number: '98%', label: 'Satisfaction Rate' }
  ];

  return (
    <Container className="py-5">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">About KAZI LINDA</h1>
        <p className="lead text-muted">Safe Jobs for Kenyans at Home and Abroad</p>
      </div>

      {/* Mission Section */}
      <Row className="mb-5 align-items-center">
        <Col md={6} className="mb-4 mb-md-0">
          <h2 className="mb-3">Our Mission</h2>
          <p className="text-muted">
            KAZI LINDA was founded with a single mission: to protect Kenyan workers from exploitation 
            while helping them find legitimate employment opportunities both locally and internationally.
          </p>
          <p className="text-muted">
            We believe that every worker deserves dignity, fair treatment, and a safe working environment. 
            Our platform connects job seekers with verified employers and provides tools to report abuse, 
            verify employers, and access emergency support when needed.
          </p>
          <div className="mt-4">
            <FaCheckCircle className="text-warning me-2" />
            <span>Verify employers before you accept a job</span>
          </div>
          <div className="mt-2">
            <FaCheckCircle className="text-warning me-2" />
            <span>Access emergency support 24/7</span>
          </div>
          <div className="mt-2">
            <FaCheckCircle className="text-warning me-2" />
            <span>Connect with a community of workers</span>
          </div>
        </Col>
        <Col md={6}>
          <div className="bg-dark text-white p-5 rounded-4 text-center">
            <FaHeart size={50} className="text-warning mb-3" />
            <h3>Protecting Kenyan Workers</h3>
            <p className="mt-3">"Every worker deserves to return home safely"</p>
          </div>
        </Col>
      </Row>

      {/* Stats Section */}
      <div className="bg-light rounded-4 p-4 mb-5">
        <Row className="text-center">
          {stats.map((stat, idx) => (
            <Col md={3} key={idx} className="mb-3 mb-md-0">
              <h2 className="display-5 fw-bold text-warning">{stat.number}</h2>
              <p className="text-muted">{stat.label}</p>
            </Col>
          ))}
        </Row>
      </div>

      {/* Values Section */}
      <h2 className="text-center mb-4">Our Core Values</h2>
      <Row className="mb-5 g-4">
        {values.map((value, idx) => (
          <Col md={3} key={idx}>
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body>
                <value.icon size={45} className="text-warning mb-3" />
                <Card.Title>{value.title}</Card.Title>
                <Card.Text className="text-muted small">{value.desc}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* How It Works */}
      <h2 className="text-center mb-4">How KAZI LINDA Works</h2>
      <Row className="g-4 mb-5">
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '50px', height: '50px' }}>
                <span className="fw-bold text-dark">1</span>
              </div>
              <Card.Title>Find Jobs</Card.Title>
              <Card.Text className="text-muted">Browse verified job listings from trusted employers</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '50px', height: '50px' }}>
                <span className="fw-bold text-dark">2</span>
              </div>
              <Card.Title>Verify Employer</Card.Title>
              <Card.Text className="text-muted">Check employer legitimacy before accepting an offer</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '50px', height: '50px' }}>
                <span className="fw-bold text-dark">3</span>
              </div>
              <Card.Title>Stay Safe</Card.Title>
              <Card.Text className="text-muted">Access emergency support and daily check-ins</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CTA Section */}
      <div className="bg-warning bg-opacity-10 rounded-4 p-5 text-center">
        <h3 className="mb-3">Ready to find safe employment?</h3>
        <p className="text-muted mb-4">Join thousands of Kenyans who trust KAZI LINDA</p>
        <Button as={Link} to="/register" variant="warning" size="lg">
          Register Now
        </Button>
      </div>
    </Container>
  );
};

export default About;
