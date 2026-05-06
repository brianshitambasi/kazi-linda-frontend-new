import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Spinner, Table, Badge, Button, Modal, Form, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaUsers, FaBriefcase, FaBuilding, FaBan, FaTrash, FaEdit, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalEmployers: 0,
    blacklisted: 0,
    pendingJobs: 0
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Mock data - In production, fetch from actual APIs
      const mockUsers = [
        { _id: '1', name: 'John Worker', email: 'john@worker.com', role: 'worker', status: 'active', createdAt: '2024-01-15' },
        { _id: '2', name: 'Sarah Employer', email: 'sarah@employer.com', role: 'employer', status: 'active', createdAt: '2024-01-14' },
        { _id: '3', name: 'Admin User', email: 'admin@kazilinda.com', role: 'admin', status: 'active', createdAt: '2024-01-13' },
        { _id: '4', name: 'James Recruiter', email: 'james@recruiter.com', role: 'recruiter', status: 'inactive', createdAt: '2024-01-12' },
      ];
      
      const mockJobs = [
        { _id: '1', title: 'House Help in Riyadh', employer: 'Sarah Employer', country: 'Saudi Arabia', status: 'active', applications: 5, createdAt: '2024-01-15' },
        { _id: '2', title: 'Driver Needed', employer: 'Sarah Employer', country: 'UAE', status: 'pending', applications: 2, createdAt: '2024-01-14' },
        { _id: '3', title: 'Nanny Position', employer: 'ABC Agency', country: 'Kuwait', status: 'active', applications: 8, createdAt: '2024-01-13' },
      ];
      
      const mockEmployers = [
        { _id: '1', name: 'Sarah Employer', company: 'Sarah Recruitment', country: 'Saudi Arabia', verified: true, jobsPosted: 5, rating: 4.5 },
        { _id: '2', name: 'ABC Agency', company: 'ABC Recruitment', country: 'UAE', verified: false, jobsPosted: 2, rating: 3.8 },
      ];
      
      const mockBlacklist = [
        { _id: '1', employerName: 'Bad Company', country: 'Qatar', reason: 'Wage theft', category: 'wage_theft', reportedAt: '2024-01-10' },
        { _id: '2', employerName: 'Scam Agency', country: 'Kuwait', reason: 'Document confiscation', category: 'document_theft', reportedAt: '2024-01-08' },
      ];

      setUsers(mockUsers);
      setJobs(mockJobs);
      setEmployers(mockEmployers);
      setBlacklist(mockBlacklist);
      setStats({
        totalUsers: mockUsers.length,
        totalJobs: mockJobs.length,
        totalEmployers: mockEmployers.length,
        blacklisted: mockBlacklist.length,
        pendingJobs: mockJobs.filter(j => j.status === 'pending').length
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      // API call would go here
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const deleteJob = async (jobId) => {
    if (window.confirm('Delete this job posting?')) {
      try {
        toast.success('Job deleted');
        fetchAllData();
      } catch (err) {
        toast.error('Failed to delete job');
      }
    }
  };

  const verifyJob = async (jobId) => {
    try {
      toast.success('Job verified');
      fetchAllData();
    } catch (err) {
      toast.error('Failed to verify job');
    }
  };

  const removeFromBlacklist = async (blacklistId) => {
    if (window.confirm('Remove this employer from blacklist?')) {
      try {
        toast.success('Employer removed from blacklist');
        fetchAllData();
      } catch (err) {
        toast.error('Failed to remove');
      }
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
      <h1 className="mb-4">Admin Dashboard</h1>
      <p className="text-muted mb-4">Welcome, {user?.name}. Manage the KAZI LINDA platform.</p>
      
      {/* Stats Cards */}
      <Row className="g-4 mb-5">
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <FaUsers size={30} className="text-warning mb-2" />
              <h2 className="mb-0">{stats.totalUsers}</h2>
              <p className="text-muted">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <FaBriefcase size={30} className="text-warning mb-2" />
              <h2 className="mb-0">{stats.totalJobs}</h2>
              <p className="text-muted">Job Postings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <FaBuilding size={30} className="text-warning mb-2" />
              <h2 className="mb-0">{stats.totalEmployers}</h2>
              <p className="text-muted">Employers</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <FaBan size={30} className="text-danger mb-2" />
              <h2 className="mb-0">{stats.blacklisted}</h2>
              <p className="text-muted">Blacklisted</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        {/* Users Tab */}
        <Tab eventKey="users" title="Users Management">
          <div className="mt-3">
            <Table striped bordered hover responsive>
              <thead className="bg-dark text-white">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><Badge bg="secondary" className="text-capitalize">{u.role}</Badge></td>
                    <td>
                      <Badge bg={u.status === 'active' ? 'success' : 'danger'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button 
                        size="sm" 
                        variant={u.status === 'active' ? 'danger' : 'success'}
                        onClick={() => updateUserStatus(u._id, u.status === 'active' ? 'inactive' : 'active')}
                      >
                        {u.status === 'active' ? <FaTimes /> : <FaCheck />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>

        {/* Jobs Tab */}
        <Tab eventKey="jobs" title="Jobs Management">
          <div className="mt-3">
            <Table striped bordered hover responsive>
              <thead className="bg-dark text-white">
                <tr>
                  <th>Title</th>
                  <th>Employer</th>
                  <th>Country</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j._id}>
                    <td>{j.title}</td>
                    <td>{j.employer}</td>
                    <td>{j.country}</td>
                    <td>{j.applications}</td>
                    <td>
                      <Badge bg={j.status === 'active' ? 'success' : 'warning'}>
                        {j.status}
                      </Badge>
                    </td>
                    <td>{new Date(j.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button size="sm" variant="warning" className="me-1" onClick={() => verifyJob(j._id)}>
                        <FaCheck /> Verify
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => deleteJob(j._id)}>
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>

        {/* Blacklist Tab */}
        <Tab eventKey="blacklist" title="Blacklist Management">
          <div className="mt-3">
            <Table striped bordered hover responsive>
              <thead className="bg-dark text-white">
                <tr>
                  <th>Employer Name</th>
                  <th>Country</th>
                  <th>Violation Type</th>
                  <th>Reason</th>
                  <th>Reported Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blacklist.map(b => (
                  <tr key={b._id}>
                    <td>{b.employerName}</td>
                    <td>{b.country}</td>
                    <td><Badge bg="danger">{b.category?.replace('_', ' ')}</Badge></td>
                    <td>{b.reason}</td>
                    <td>{new Date(b.reportedAt).toLocaleDateString()}</td>
                    <td>
                      <Button size="sm" variant="success" onClick={() => removeFromBlacklist(b._id)}>
                        <FaCheck /> Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminDashboard;
