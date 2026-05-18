import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobAPI } from '../services/api';
import { Card, Button, Form, Table, Modal, Spinner, Badge, Row, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import DashboardLayout from '../components/Layout/DashboardLayout';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import toast from 'react-hot-toast';

const EmployerDashboard = () => {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', country: 'Saudi Arabia', city: '', salary: '', salaryCurrency: 'SAR', contractDuration: 24,
  accommodation: "provided",
  food: "provided", requirements: [], benefits: [] });
  const [reqInput, setReqInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  const fetchMyJobs = useCallback(async () => {
    try { const res = await jobAPI.getMyJobs(token); setJobs(res.data || []); } 
    catch (err) { setJobs([]); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (user && user.role === 'employer') fetchMyJobs(); else setLoading(false); }, [user, fetchMyJobs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        country: formData.country,
        city: formData.city || "Nairobi",
        salary: Number(formData.salary),
        salaryCurrency: formData.salaryCurrency || "KES",
        contractDuration: Number(formData.contractDuration),
        accommodation: formData.accommodation || "provided",
        food: formData.food || "provided",
        requirements: formData.requirements || [],
        benefits: formData.benefits || []
      };
      console.log("Submitting job:", submitData);
      if (editingJob) {
        await jobAPI.update(editingJob._id, submitData);
      } else {
        await jobAPI.create(submitData);
      }
      toast.success(editingJob ? "Job updated" : "Job posted");
      setShowModal(false);
      resetForm();
      fetchMyJobs();
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.message || "Failed to save job");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this job?')) {
      try { await jobAPI.delete(id, token); toast.success('Job deleted'); fetchMyJobs(); } 
      catch (err) { toast.error('Failed to delete'); }
    }
  };

  const addRequirement = () => { if (reqInput.trim()) setFormData({ ...formData, requirements: [...formData.requirements, reqInput.trim()] }); setReqInput(''); };
  const removeRequirement = (index) => setFormData({ ...formData, requirements: formData.requirements.filter((_, i) => i !== index) });
  const addBenefit = () => { if (benefitInput.trim()) setFormData({ ...formData, benefits: [...formData.benefits, benefitInput.trim()] }); setBenefitInput(''); };
  const removeBenefit = (index) => setFormData({ ...formData, benefits: formData.benefits.filter((_, i) => i !== index) });
  const resetForm = () => setFormData({ title: '', description: '', country: 'Saudi Arabia', city: '', salary: '', salaryCurrency: 'SAR', contractDuration: 24,
  accommodation: "provided",
  food: "provided", requirements: [], benefits: [] });

  if (!user || user.role !== 'employer') return <div className="text-center py-5"><Badge bg="warning">Only employers can access this page.</Badge></div>;
  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>;

  return (
    <DashboardLayout title="Employer Dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <ClickableAvatar userId={user._id} src={user.profilePicture} name={user.name} size={50} />
          <h1>Manage Jobs</h1>
        </div>
        <Button variant="warning" onClick={() => { resetForm(); setEditingJob(null); setShowModal(true); }}><FaPlus /> Post New Job</Button>
      </div>

      {jobs.length === 0 ? (
        <Card className="text-center py-5"><Card.Body><p>No jobs yet.</p><Button variant="warning" onClick={() => { resetForm(); setShowModal(true); }}>Post Your First Job</Button></Card.Body></Card>
      ) : (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead className="bg-dark text-white"><tr><th>Title</th><th>Country</th><th>Salary</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{jobs.map(job => (<tr key={job._id}><td>{job.title}</td><td>{job.country}</td><td>{job.salary} {job.salaryCurrency}</td><td><Badge bg={job.isActive ? 'success' : 'secondary'}>{job.isActive ? 'Active' : 'Inactive'}</Badge></td>
          <td><Button size="sm" variant="outline-warning" className="me-2" onClick={() => { setEditingJob(job); setFormData(job); setShowModal(true); }}><FaEdit /></Button><Button size="sm" variant="outline-danger" onClick={() => handleDelete(job._id)}><FaTrash /></Button></td></tr>))}</tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg"><Modal.Header closeButton><Modal.Title>{editingJob ? 'Edit Job' : 'Post Job'}</Modal.Title></Modal.Header><Modal.Body>
        <Form onSubmit={handleSubmit}><Row><Col md={6}><Form.Group><Form.Label>Title</Form.Label><Form.Control value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></Form.Group></Col><Col md={6}><Form.Group><Form.Label>Country</Form.Label><Form.Control value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} required /></Form.Group></Col></Row>
        <Form.Group><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required /></Form.Group>
        <Row><Col md={6}><Form.Group><Form.Label>Requirements</Form.Label><div className="d-flex"><Form.Control value={reqInput} onChange={e => setReqInput(e.target.value)} /><Button type="button" onClick={addRequirement}>Add</Button></div><div className="d-flex flex-wrap gap-2 mt-2">{formData.requirements.map((r, i) => (<Badge key={i} bg="secondary" onClick={() => removeRequirement(i)}>{r} ✕</Badge>))}</div></Form.Group></Col>
        <Col md={6}><Form.Group><Form.Label>Benefits</Form.Label><div className="d-flex"><Form.Control value={benefitInput} onChange={e => setBenefitInput(e.target.value)} /><Button type="button" onClick={addBenefit}>Add</Button></div><div className="d-flex flex-wrap gap-2 mt-2">{formData.benefits.map((b, i) => (<Badge key={i} bg="success" onClick={() => removeBenefit(i)}>{b} ✕</Badge>))}</div></Form.Group></Col></Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Accommodation</Form.Label>
              <Form.Select value={formData.accommodation} onChange={e => setFormData({...formData, accommodation: e.target.value})} required>
                <option value="provided">Provided</option>
                <option value="allowance">Allowance</option>
                <option value="none">Not Provided</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Food</Form.Label>
              <Form.Select value={formData.food} onChange={e => setFormData({...formData, food: e.target.value})} required>
                <option value="provided">Provided</option>
                <option value="allowance">Allowance</option>
                <option value="none">Not Provided</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex justify-content-end gap-2 mt-3"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" style={{ background: '#f39c12', border: 'none' }}>{editingJob ? 'Update' : 'Post'}</Button></div></Form>
      </Modal.Body></Modal>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
