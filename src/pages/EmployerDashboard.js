import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI } from '../services/api';
import { Container, Card, Button, Form, Table, Modal, Spinner, Badge, Row, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', country: 'Saudi Arabia', city: '', salary: '', salaryCurrency: 'SAR',
    contractDuration: 24, accommodation: 'provided', food: 'provided', workingHours: '8 hours/day',
    daysOff: '1 day/week', requirements: [], benefits: []
  });
  const [reqInput, setReqInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  useEffect(() => {
    if (user && user.role === 'employer') {
      fetchMyJobs();
    }
  }, [user]);

  const fetchMyJobs = async () => {
    try {
      const res = await jobAPI.getMyJobs();
      setJobs(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await jobAPI.update(editingJob._id, formData);
        toast.success('Job updated successfully');
      } else {
        await jobAPI.create(formData);
        toast.success('Job posted successfully');
      }
      setShowModal(false);
      resetForm();
      fetchMyJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this job?')) {
      try {
        await jobAPI.delete(id);
        toast.success('Job deleted');
        fetchMyJobs();
      } catch (err) {
        toast.error('Failed to delete job');
      }
    }
  };

  const addRequirement = () => {
    if (reqInput.trim()) {
      setFormData({ ...formData, requirements: [...formData.requirements, reqInput.trim()] });
      setReqInput('');
    }
  };

  const removeRequirement = (index) => {
    const newReqs = formData.requirements.filter((_, i) => i !== index);
    setFormData({ ...formData, requirements: newReqs });
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setFormData({ ...formData, benefits: [...formData.benefits, benefitInput.trim()] });
      setBenefitInput('');
    }
  };

  const removeBenefit = (index) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData({ ...formData, benefits: newBenefits });
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', country: 'Saudi Arabia', city: '', salary: '', salaryCurrency: 'SAR',
      contractDuration: 24, accommodation: 'provided', food: 'provided', workingHours: '8 hours/day',
      daysOff: '1 day/week', requirements: [], benefits: []
    });
    setEditingJob(null);
    setReqInput('');
    setBenefitInput('');
  };

  if (!user || user.role !== 'employer') {
    return (
      <Container className="py-5 text-center">
        <Badge bg="warning">Only employers can access this page.</Badge>
        <Button as={Link} to="/" variant="primary" className="mt-3">Go Home</Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Employer Dashboard</h1>
        <Button variant="warning" onClick={() => { resetForm(); setShowModal(true); }}>
          <FaPlus className="me-2" /> Post New Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <p>You haven't posted any jobs yet.</p>
            <Button variant="warning" onClick={() => { resetForm(); setShowModal(true); }}>
              Post Your First Job
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="bg-dark text-white">
            <tr><th>Title</th><th>Country</th><th>Salary</th><th>Applications</th><th>Status</th><th>Posted</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job._id}>
                <td>{job.title}</td>
                <td>{job.country}</td>
                <td>{job.salary} {job.salaryCurrency}</td>
                <td>0</td>
                <td>{job.isActive ? <Badge bg="success">Active</Badge> : <Badge bg="secondary">Inactive</Badge>}</td>
                <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button size="sm" variant="outline-warning" className="me-2" onClick={() => {
                    setEditingJob(job);
                    setFormData(job);
                    setShowModal(true);
                  }}>
                    <FaEdit />
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(job._id)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="lg">
        <Modal.Header closeButton><Modal.Title>{editingJob ? 'Edit Job' : 'Post New Job'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Job Title *</Form.Label><Form.Control type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Country *</Form.Label><Form.Control type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} required /></Form.Group></Col>
            </Row>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>City</Form.Label><Form.Control type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Salary *</Form.Label><Form.Control type="number" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} required /></Form.Group></Col>
            </Row>
            <Form.Group className="mb-3"><Form.Label>Description *</Form.Label><Form.Control as="textarea" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required /></Form.Group>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Requirements</Form.Label><div className="d-flex mb-2"><Form.Control type="text" value={reqInput} onChange={e => setReqInput(e.target.value)} placeholder="e.g., 2 years experience" /><Button type="button" variant="outline-warning" onClick={addRequirement} className="ms-2">Add</Button></div><div className="d-flex flex-wrap gap-2">{formData.requirements.map((req, idx) => (<Badge key={idx} bg="secondary" className="p-2" style={{ cursor: 'pointer' }} onClick={() => removeRequirement(idx)}>{req} ✕</Badge>))}</div></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Benefits</Form.Label><div className="d-flex mb-2"><Form.Control type="text" value={benefitInput} onChange={e => setBenefitInput(e.target.value)} placeholder="e.g., Medical insurance" /><Button type="button" variant="outline-warning" onClick={addBenefit} className="ms-2">Add</Button></div><div className="d-flex flex-wrap gap-2">{formData.benefits.map((benefit, idx) => (<Badge key={idx} bg="success" className="p-2" style={{ cursor: 'pointer' }} onClick={() => removeBenefit(idx)}>{benefit} ✕</Badge>))}</div></Form.Group></Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
              <Button type="submit" variant="warning">{editingJob ? 'Update' : 'Post'} Job</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default EmployerDashboard;
