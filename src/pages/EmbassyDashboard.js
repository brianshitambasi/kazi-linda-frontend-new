import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Table, Badge, Button, Alert } from 'react-bootstrap';
import { FaUsers, FaFlag, FaCheckCircle, FaGlobe, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const EmbassyDashboard = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    totalWorkers: 0, 
    activeCases: 0, 
    resolvedCases: 0, 
    countries: 0,
    totalEmployers: 0,
    pendingVerifications: 0
  });
  const [recentEmergencies, setRecentEmergencies] = useState([]);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const workersRes = await fetch('https://kazi-linda.onrender.com/api/admin/users?role=worker', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const workersData = await workersRes.json();
      
      const emergenciesRes = await fetch('https://kazi-linda.onrender.com/api/emergencies/recent', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ json: () => [] }));
      
      let emergencies = [];
      try {
        const emergenciesData = await emergenciesRes.json();
        emergencies = Array.isArray(emergenciesData) ? emergenciesData : [];
      } catch (e) {
        emergencies = [];
      }
      
      setRecentEmergencies(emergencies);
      const workers = Array.isArray(workersData) ? workersData : [];
      const activeEmergencies = emergencies.filter(e => e.status === 'active').length;
      const resolvedEmergencies = emergencies.filter(e => e.status === 'resolved').length;
      const uniqueCountries = [...new Set(workers.map(w => w.currentCountry).filter(Boolean))];
      
      setStats({
        totalWorkers: workers.length,
        activeCases: activeEmergencies,
        resolvedCases: resolvedEmergencies,
        countries: uniqueCountries.length,
        totalEmployers: 0,
        pendingVerifications: 0
      });
      
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load data. Using sample data.');
      setStats({
        totalWorkers: 1250,
        activeCases: 8,
        resolvedCases: 45,
        countries: 12,
        totalEmployers: 156,
        pendingVerifications: 23
      });
      setRecentEmergencies([
        { _id: '1', workerName: 'Mary Wanjiku', country: 'Saudi Arabia', type: 'Document Theft', status: 'active', reportedAt: new Date() },
        { _id: '2', workerName: 'John Kamau', country: 'UAE', type: 'Wage Theft', status: 'pending', reportedAt: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return <Badge bg="danger">Active</Badge>;
      case 'resolved': return <Badge bg="success">Resolved</Badge>;
      case 'pending': return <Badge bg="warning">Pending</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-2">Loading embassy dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">Embassy Dashboard</h1>
          <p className="text-muted">Welcome, {user?.name}. Monitor and assist Kenyan workers abroad.</p>
        </div>
        <Button variant="warning" as={Link} to="/emergencies/report">
          <FaExclamationTriangle className="me-2" /> Report Emergency
        </Button>
      </div>
      
      {error && <Alert variant="warning">{error}</Alert>}
      
      <Row className="g-4 mb-5">
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <FaUsers size={30} className="text-warning mb-2" />
              <h2 className="mb-0">{stats.totalWorkers.toLocaleString()}</h2>
              <p className="text-muted">Registered Workers</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <FaFlag size={30} className="text-danger mb-2" />
              <h2 className="mb-0">{stats.activeCases}</h2>
              <p className="text-muted">Active Cases</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <FaCheckCircle size={30} className="text-success mb-2" />
              <h2 className="mb-0">{stats.resolvedCases}</h2>
              <p className="text-muted">Resolved Cases</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <FaGlobe size={30} className="text-warning mb-2" />
              <h2 className="mb-0">{stats.countries}</h2>
              <p className="text-muted">Countries Covered</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-5">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white fw-bold">
              <FaFlag className="me-2 text-warning" /> Active Cases by Country
            </Card.Header>
            <Card.Body>
              <Table responsive size="sm">
                <thead>
                  <tr><th>Country</th><th>Active Cases</th><th>Resolved</th><th>Total</th></tr>
                </thead>
                <tbody>
                  <tr><td>Saudi Arabia</td><td><Badge bg="danger">3</Badge></td><td><Badge bg="success">12</Badge></td><td>15</td></tr>
                  <tr><td>UAE</td><td><Badge bg="danger">2</Badge></td><td><Badge bg="success">18</Badge></td><td>20</td></tr>
                  <tr><td>Kuwait</td><td><Badge bg="danger">1</Badge></td><td><Badge bg="success">8</Badge></td><td>9</td></tr>
                  <tr><td>Qatar</td><td><Badge bg="danger">2</Badge></td><td><Badge bg="success">7</Badge></td><td>9</td></tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white fw-bold">
              <FaExclamationTriangle className="me-2 text-warning" /> Quick Actions
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-warning" as={Link} to="/workers/list">
                  <FaUsers className="me-2" /> View All Registered Workers
                </Button>
                <Button variant="outline-danger" as={Link} to="/emergencies">
                  <FaFlag className="me-2" /> Manage Emergencies
                </Button>
                <Button variant="outline-info" as={Link} to="/embassy/reports">
                  <FaCheckCircle className="me-2" /> Generate Reports
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h3 className="mb-3">Recent Emergency Cases</h3>
      <Card className="shadow-sm">
        <Card.Body>
          {recentEmergencies.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <FaCheckCircle size={40} className="mb-2" />
              <p>No recent emergencies</p>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="bg-dark text-white">
                <tr><th>Worker Name</th><th>Country</th><th>Type</th><th>Status</th><th>Reported</th><th>Action</th></tr>
              </thead>
              <tbody>
                {recentEmergencies.map(emergency => (
                  <tr key={emergency._id}>
                    <td>{emergency.workerName}</td>
                    <td>{emergency.country}</td>
                    <td>{emergency.type}</td>
                    <td>{getStatusBadge(emergency.status)}</td>
                    <td>{new Date(emergency.reportedAt).toLocaleDateString()}</td>
                    <td><Button size="sm" variant="warning" as={Link} to={`/emergencies/${emergency._id}`}>View Details</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <div className="mt-4 p-3 bg-light rounded-4 text-center">
        <FaGlobe size={30} className="text-warning mb-2" />
        <h6>Embassy Support Services</h6>
        <p className="text-muted small mb-0">
          For urgent assistance, please contact our 24/7 helpline or use the emergency reporting system.
        </p>
      </div>
    </Container>
  );
};

export default EmbassyDashboard;
