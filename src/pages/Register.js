import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaUserPlus, FaCheckCircle, FaBuilding, FaBriefcase, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '',
    role: 'worker'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({ 
        name: form.name, 
        email: form.email, 
        phone: form.phone, 
        password: form.password,
        role: form.role
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'worker', label: 'Job Seeker / Worker', icon: FaBriefcase, desc: 'Looking for employment opportunities' },
    { value: 'employer', label: 'Employer', icon: FaBuilding, desc: 'Hire workers for your business' },
    { value: 'recruiter', label: 'Recruiter / Agency', icon: FaUserPlus, desc: 'Recruitment agency representative' },
    { value: 'embassy', label: 'Embassy Staff', icon: FaShieldAlt, desc: 'Government/Embassy personnel' }
  ];

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={7} lg={6}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-4 p-lg-5">
              <div className="text-center mb-4">
                <div className="bg-warning rounded-circle d-inline-flex p-3 mb-3">
                  <FaUserPlus size={32} className="text-dark" />
                </div>
                <h2 className="fw-bold">Create Account</h2>
                <p className="text-muted">Join KAZI LINDA today</p>
              </div>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaUser /></span>
                    <Form.Control 
                      name="name" 
                      onChange={handleChange} 
                      placeholder="Enter your full name" 
                      required 
                    />
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaEnvelope /></span>
                    <Form.Control 
                      name="email" 
                      type="email" 
                      onChange={handleChange} 
                      placeholder="your@email.com" 
                      required 
                    />
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaPhone /></span>
                    <Form.Control 
                      name="phone" 
                      onChange={handleChange} 
                      placeholder="0712345678" 
                      required 
                    />
                  </div>
                </Form.Group>
                
                {/* Role Selection */}
                <Form.Group className="mb-3">
                  <Form.Label>I am a:</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {roleOptions.map(role => (
                      <Button
                        key={role.value}
                        type="button"
                        variant={form.role === role.value ? 'warning' : 'outline-secondary'}
                        className="d-flex align-items-center gap-2"
                        onClick={() => setForm({ ...form, role: role.value })}
                        size="sm"
                      >
                        <role.icon size={16} />
                        {role.label}
                      </Button>
                    ))}
                  </div>
                  <Form.Text className="text-muted">
                    {roleOptions.find(r => r.value === form.role)?.desc}
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaLock /></span>
                    <Form.Control 
                      name="password" 
                      type="password" 
                      onChange={handleChange} 
                      placeholder="Create password" 
                      required 
                    />
                  </div>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FaCheckCircle /></span>
                    <Form.Control 
                      name="confirmPassword" 
                      type="password" 
                      onChange={handleChange} 
                      placeholder="Confirm password" 
                      required 
                    />
                  </div>
                </Form.Group>
                <Button variant="warning" type="submit" className="w-100 fw-bold py-2" disabled={loading}>
                  {loading ? 'Creating account...' : 'Register as ' + form.role.toUpperCase()}
                </Button>
              </Form>
              <div className="text-center mt-4">
                <Link to="/login" className="text-decoration-none">Already have an account? Login</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
