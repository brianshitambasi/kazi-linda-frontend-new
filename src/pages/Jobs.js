import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../services/api';
import { Container, Row, Col, Card, Button, Spinner, Badge, Form, InputGroup } from 'react-bootstrap';
import { FaMapMarkerAlt, FaMoneyBillWave, FaBuilding, FaSearch, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchTerm, countryFilter, jobs]);

  const fetchJobs = async () => {
    try {
      const res = await jobAPI.getAll();
      const jobsData = res.data.jobs || [];
      setJobs(jobsData);
      setFilteredJobs(jobsData);
      const uniqueCountries = [...new Set(jobsData.map(job => job.country).filter(Boolean))];
      setCountries(uniqueCountries);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (countryFilter) {
      filtered = filtered.filter(job => job.country === countryFilter);
    }
    setFilteredJobs(filtered);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-2">Loading jobs...</p>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">Find Your Next Job</h1>
        <p className="lead text-muted">Browse verified job opportunities from trusted employers</p>
      </div>

      {/* Search and Filter */}
      <Row className="mb-4 g-3">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text className="bg-white"><FaSearch className="text-warning" /></InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by job title or description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text className="bg-white"><FaFilter className="text-warning" /></InputGroup.Text>
            <Form.Select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}>
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No jobs found matching your criteria.</p>
          <Button variant="link" onClick={() => { setSearchTerm(''); setCountryFilter(''); }}>Clear filters</Button>
        </div>
      ) : (
        <Row>
          {filteredJobs.map(job => (
            <Col md={6} lg={4} key={job._id} className="mb-4">
              <Card className="h-100 shadow-sm border-0 hover-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="mb-0">{job.title}</Card.Title>
                    {job.isVerified && <Badge bg="success" className="ms-2">✓ Verified</Badge>}
                  </div>
                  <Card.Text className="text-muted small mb-3">
                    {job.description?.substring(0, 100)}...
                  </Card.Text>
                  <div className="mb-2">
                    <FaMapMarkerAlt className="text-warning me-2" />
                    <span>{job.country}, {job.city || 'N/A'}</span>
                  </div>
                  <div className="mb-2">
                    <FaMoneyBillWave className="text-warning me-2" />
                    <span>{job.salary} {job.salaryCurrency}/month</span>
                  </div>
                  {job.employerId && (
                    <div className="mb-3">
                      <FaBuilding className="text-warning me-2" />
                      <span>{job.employerId.name}</span>
                    </div>
                  )}
                </Card.Body>
                <Card.Footer className="bg-white border-0 pb-3">
                  <Button as={Link} to={`/jobs/${job._id}`} variant="warning" className="w-100">
                    View Details
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <style>{`
        .hover-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
      `}</style>
    </Container>
  );
};

export default Jobs;
