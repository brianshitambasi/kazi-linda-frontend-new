import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Get dashboard path based on user role
  const getDashboardPath = (role) => {
    switch(role) {
      case 'admin':
        return '/admin/dashboard';
      case 'employer':
        return '/employer/dashboard';
      case 'embassy':
        return '/embassy/dashboard';
      case 'recruiter':
        return '/recruiter/dashboard';
      default:
        return '/dashboard';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userData = await login({ email, password });
      toast.success(`Welcome back, ${userData.name}!`);
      
      // Redirect to role-specific dashboard
      const dashboardPath = getDashboardPath(userData.role);
      navigate(dashboardPath);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      toast.error('Login failed');
    }
    setLoading(false);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <div className="bg-warning rounded-circle d-inline-flex p-3 mb-3">
                  <FaSignInAlt size={32} className="text-dark" />
                </div>
                <h2 className="fw-bold">Welcome Back</h2>
                <p className="text-muted">Login to your KAZI LINDA account</p>
              </div>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><FaEnvelope className="text-muted" /></span>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="border-start-0"
                      required
                    />
                  </div>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><FaLock className="text-muted" /></span>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="border-start-0"
                      required
                    />
                  </div>
                </Form.Group>
                <Button variant="warning" type="submit" className="w-100 fw-bold py-2" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
              <div className="text-center mt-4">
                <Link to="/register" className="text-decoration-none">Don't have an account? Register</Link>
              </div>
              <hr className="my-4" />
              <div className="text-center">
                <small className="text-muted">By logging in, you agree to our Terms and Privacy Policy</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
