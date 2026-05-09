import React, { useEffect, useState } from 'react';
import ClickableAvatar from "../components/Common/ClickableAvatar";
import { Container, Row, Col, Card, Spinner, Table, Badge, Button } from 'react-bootstrap';
import { FaUsers, FaFlag, FaCheckCircle, FaGlobe } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const EmbassyDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState({ totalWorkers: 0, activeCases: 0, resolvedCases: 0, countries: 0 });

  useEffect(() => {
    setTimeout(() => {
      setWorkers([
        { _id: '1', name: 'John Worker', email: 'john@worker.com', phone: '0712345678', currentCountry: 'Saudi Arabia', isActive: true, profilePicture: '' },
        { _id: '2', name: 'Mary Wanjiku', email: 'mary@worker.com', phone: '0723456789', currentCountry: 'UAE', isActive: true, profilePicture: '' }
      ]);
      setStats({ totalWorkers: 1250, activeCases: 8, resolvedCases: 45, countries: 12 });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" variant="warning" /></Container>;

  return (
    <Container className="py-4">
      <h1 className="mb-4">Embassy Dashboard</h1>
      <p className="text-muted mb-4">Welcome, {user?.name}. Monitor and assist Kenyan workers abroad.</p>
      <Row className="g-4 mb-5">
        <Col md={3}><Card><Card.Body><FaUsers size={30} className="text-warning mb-2" /><h2>{stats.totalWorkers}</h2><p>Registered Workers</p></Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body><FaFlag size={30} className="text-danger mb-2" /><h2>{stats.activeCases}</h2><p>Active Cases</p></Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body><FaCheckCircle size={30} className="text-success mb-2" /><h2>{stats.resolvedCases}</h2><p>Resolved Cases</p></Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body><FaGlobe size={30} className="text-warning mb-2" /><h2>{stats.countries}</h2><p>Countries Covered</p></Card.Body></Card></Col>
      </Row>
      <h3 className="mb-3">Registered Workers</h3>
      <Card><Card.Body><Table striped bordered hover><thead className="bg-dark text-white"><tr><th>Worker</th><th>Contact</th><th>Country</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>{workers.map(w => (<tr key={w._id}><td><ClickableAvatar userId={w._id} src={w.profilePicture} size={40} className="me-2" /> {w.name}</td><td>{w.email}<br />{w.phone}</td><td>{w.currentCountry}</td><td><Badge bg={w.isActive ? 'success' : 'danger'}>{w.isActive ? 'Active' : 'Inactive'}</Badge></td><td><Button size="sm" variant="warning" as={Link} to={`/profile/${w._id}`}>View</Button></td></tr>))}</tbody></Table></Card.Body></Card>
    </Container>
  );
};
export default EmbassyDashboard;
