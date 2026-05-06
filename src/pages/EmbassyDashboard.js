import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Spinner, Table, Badge, Button } from 'react-bootstrap';
import { FaUsers, FaFlag, FaCheckCircle, FaClock, FaGlobe } from 'react-icons/fa';

const EmbassyDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkers: 0,
    activeCases: 0,
    resolvedCases: 0,
    countries: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setStats({
        totalWorkers: 1250,
        activeCases: 8,
        resolvedCases: 45,
        countries: 12
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Embassy Dashboard</h1>
      <p className="text-muted mb-4">Welcome, {user?.name}. Monitor and assist Kenyan workers abroad.</p>
      
      <Row className="g-4 mb-5">
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <FaUsers size={30} className="text-warning mb-2" />
              <h2 className="mb-0">{stats.totalWorkers}</h2>
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

      <h3 className="mb-3">Recent Emergency Cases</h3>
      <Card className="shadow-sm">
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead className="bg-dark text-white">
              <tr>
                <th>Worker Name</th>
                <th>Country</th>
                <th>Type</th>
                <th>Status</th>
                <th>Reported</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mary Wanjiku</td>
                <td>Saudi Arabia</td>
                <td>Document Theft</td>
                <td><Badge bg="danger">Active</Badge></td>
                <td>2024-01-15</td>
                <td><Button size="sm" variant="warning">View</Button></td>
              </tr>
              <tr>
                <td>John Kamau</td>
                <td>UAE</td>
                <td>Wage Theft</td>
                <td><Badge bg="warning">Pending</Badge></td>
                <td>2024-01-14</td>
                <td><Button size="sm" variant="warning">View</Button></td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EmbassyDashboard;
