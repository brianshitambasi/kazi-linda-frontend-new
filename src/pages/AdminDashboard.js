import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Spinner, Table, Badge, Button, Modal, Form, Alert, Tabs, Tab, Pagination, InputGroup } from 'react-bootstrap';
import { 
  FaUsers, FaBriefcase, FaBuilding, FaBan, FaTrash, FaEdit, FaCheck, FaTimes, FaEye, 
  FaUserPlus, FaSearch, FaFilter, FaSort, FaDownload, FaEnvelope, FaPhone, 
  FaMapMarkerAlt, FaClock, FaShieldAlt, FaUserShield, FaUserTie, FaUserGraduate,
  FaChartLine, FaCalendarAlt, FaDollarSign, FaFlag, FaHeartbeat
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  
  // Form states
  const [userForm, setUserForm] = useState({
    name: '', email: '', phone: '', password: '', role: 'worker', status: 'active'
  });
  const [jobForm, setJobForm] = useState({
    title: '', description: '', country: '', city: '', salary: '', salaryCurrency: 'USD',
    requirements: [], benefits: [], status: 'pending'
  });
  const [blacklistForm, setBlacklistForm] = useState({
    employerName: '', country: '', reason: '', category: 'wage_theft'
  });
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalEmployers: 0,
    blacklisted: 0,
    pendingJobs: 0,
    totalApplications: 0,
    activeWorkers: 0,
    totalMessages: 0,
    monthlyGrowth: 0,
    successRate: 0
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Mock data for development
      const mockUsers = [
        { _id: '1', name: 'John Worker', email: 'john@worker.com', phone: '0712345678', role: 'worker', status: 'active', createdAt: '2024-01-15', lastLogin: '2024-01-20', applicationsCount: 3, rating: 4.5 },
        { _id: '2', name: 'Sarah Employer', email: 'sarah@employer.com', phone: '0723456789', role: 'employer', status: 'active', createdAt: '2024-01-14', lastLogin: '2024-01-19', jobsPosted: 5, rating: 4.8 },
        { _id: '3', name: 'Admin User', email: 'admin@kazilinda.com', phone: '0734567890', role: 'admin', status: 'active', createdAt: '2024-01-13', lastLogin: '2024-01-20' },
        { _id: '4', name: 'James Recruiter', email: 'james@recruiter.com', phone: '0745678901', role: 'recruiter', status: 'inactive', createdAt: '2024-01-12', lastLogin: '2024-01-15' },
        { _id: '5', name: 'Mary Wanjiku', email: 'mary@worker.com', phone: '0756789012', role: 'worker', status: 'active', createdAt: '2024-01-11', lastLogin: '2024-01-18', applicationsCount: 5, rating: 4.9 },
        { _id: '6', name: 'Dubai Construction', email: 'info@dubaiconstruction.com', phone: '0767890123', role: 'employer', status: 'pending', createdAt: '2024-01-10', jobsPosted: 2, rating: 3.5 },
      ];
      
      const mockJobs = [
        { _id: '1', title: 'House Help in Riyadh', employerId: { name: 'Sarah Employer' }, employer: 'Sarah Employer', country: 'Saudi Arabia', city: 'Riyadh', salary: 1500, salaryCurrency: 'SAR', status: 'active', applications: 5, createdAt: '2024-01-15', isVerified: true },
        { _id: '2', title: 'Driver Needed', employerId: { name: 'Sarah Employer' }, employer: 'Sarah Employer', country: 'UAE', city: 'Dubai', salary: 3000, salaryCurrency: 'AED', status: 'pending', applications: 2, createdAt: '2024-01-14', isVerified: false },
        { _id: '3', title: 'Nanny Position', employerId: { name: 'ABC Agency' }, employer: 'ABC Agency', country: 'Kuwait', city: 'Kuwait City', salary: 400, salaryCurrency: 'KWD', status: 'active', applications: 8, createdAt: '2024-01-13', isVerified: true },
        { _id: '4', title: 'Construction Worker', employerId: { name: 'Dubai Construction' }, employer: 'Dubai Construction', country: 'UAE', city: 'Abu Dhabi', salary: 2500, salaryCurrency: 'AED', status: 'active', applications: 12, createdAt: '2024-01-12', isVerified: false },
      ];
      
      const mockEmployers = [
        { _id: '1', name: 'Sarah Employer', company: 'Sarah Recruitment', country: 'Saudi Arabia', verified: true, jobsPosted: 5, rating: 4.5, complaints: 0 },
        { _id: '2', name: 'ABC Agency', company: 'ABC Recruitment', country: 'UAE', verified: false, jobsPosted: 2, rating: 3.8, complaints: 1 },
        { _id: '3', name: 'Dubai Construction', company: 'Dubai Construction LLC', country: 'UAE', verified: false, jobsPosted: 1, rating: 3.5, complaints: 0 },
      ];
      
      const mockBlacklist = [
        { _id: '1', employerName: 'Bad Company', country: 'Qatar', reason: 'Wage theft - refused to pay salaries for 3 months', category: 'wage_theft', reportedAt: '2024-01-10', reportedBy: 'worker@example.com', status: 'verified' },
        { _id: '2', employerName: 'Scam Agency', country: 'Kuwait', reason: 'Document confiscation and threats', category: 'document_theft', reportedAt: '2024-01-08', reportedBy: 'worker2@example.com', status: 'verified' },
      ];
      
      const mockApplications = [
        { _id: '1', jobId: { title: 'House Help in Riyadh' }, workerId: { name: 'John Worker' }, status: 'pending', appliedAt: '2024-01-16' },
        { _id: '2', jobId: { title: 'Driver Needed' }, workerId: { name: 'Mary Wanjiku' }, status: 'accepted', appliedAt: '2024-01-15' },
        { _id: '3', jobId: { title: 'Construction Worker' }, workerId: { name: 'John Worker' }, status: 'rejected', appliedAt: '2024-01-14' },
      ];
      
      setUsers(mockUsers);
      setJobs(mockJobs);
      setEmployers(mockEmployers);
      setBlacklist(mockBlacklist);
      setApplications(mockApplications);
      
      // Calculate stats
      setStats({
        totalUsers: mockUsers.length,
        totalJobs: mockJobs.length,
        totalEmployers: mockEmployers.length,
        blacklisted: mockBlacklist.length,
        pendingJobs: mockJobs.filter(j => j.status === 'pending').length,
        totalApplications: mockApplications.length,
        activeWorkers: mockUsers.filter(u => u.role === 'worker' && u.status === 'active').length,
        totalMessages: 156,
        monthlyGrowth: 23,
        successRate: ((mockApplications.filter(a => a.status === 'accepted').length / mockApplications.length) * 100).toFixed(1) || 0
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // User CRUD Operations
  const handleCreateUser = async () => {
    try {
      toast.success('User created successfully');
      setShowUserModal(false);
      fetchAllData();
      resetUserForm();
    } catch (err) {
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    try {
      toast.success('User updated successfully');
      setShowUserModal(false);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        toast.success('User deleted successfully');
        fetchAllData();
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  // Job CRUD Operations
  const handleCreateJob = async () => {
    try {
      toast.success('Job posted successfully');
      setShowJobModal(false);
      fetchAllData();
      resetJobForm();
    } catch (err) {
      toast.error('Failed to create job');
    }
  };

  const handleUpdateJob = async () => {
    try {
      toast.success('Job updated successfully');
      setShowJobModal(false);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to update job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Delete this job posting?')) {
      try {
        toast.success('Job deleted');
        fetchAllData();
      } catch (err) {
        toast.error('Failed to delete job');
      }
    }
  };

  const handleVerifyJob = async (jobId) => {
    try {
      toast.success('Job verified successfully');
      fetchAllData();
    } catch (err) {
      toast.error('Failed to verify job');
    }
  };

  // Blacklist CRUD Operations
  const handleAddToBlacklist = async () => {
    try {
      toast.success('Employer added to blacklist');
      setShowBlacklistModal(false);
      fetchAllData();
      resetBlacklistForm();
    } catch (err) {
      toast.error('Failed to add to blacklist');
    }
  };

  const handleRemoveFromBlacklist = async (blacklistId) => {
    if (window.confirm('Remove this employer from blacklist?')) {
      try {
        toast.success('Employer removed from blacklist');
        fetchAllData();
      } catch (err) {
        toast.error('Failed to remove');
      }
    }
  };

  // Filter functions
  const getFilteredUsers = () => {
    let filtered = [...users];
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm)
      );
    }
    if (roleFilter) {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter(u => u.status === statusFilter);
    }
    return filtered;
  };

  const getFilteredJobs = () => {
    let filtered = [...jobs];
    if (searchTerm) {
      filtered = filtered.filter(j => 
        j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.employer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(j => j.status === statusFilter);
    }
    return filtered;
  };

  // Reset forms
  const resetUserForm = () => {
    setUserForm({ name: '', email: '', phone: '', password: '', role: 'worker', status: 'active' });
    setSelectedItem(null);
  };

  const resetJobForm = () => {
    setJobForm({ title: '', description: '', country: '', city: '', salary: '', salaryCurrency: 'USD', requirements: [], benefits: [], status: 'pending' });
    setSelectedItem(null);
  };

  const resetBlacklistForm = () => {
    setBlacklistForm({ employerName: '', country: '', reason: '', category: 'wage_theft' });
    setSelectedItem(null);
  };

  // Pagination
  const paginate = (items) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <FaUserShield className="text-danger" />;
      case 'employer': return <FaBuilding className="text-primary" />;
      case 'recruiter': return <FaUserTie className="text-info" />;
      default: return <FaUserGraduate className="text-success" />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      wage_theft: 'danger',
      abuse: 'danger',
      document_theft: 'warning',
      human_trafficking: 'danger'
    };
    return colors[category] || 'secondary';
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-2">Loading dashboard data...</p>
      </Container>
    );
  }

  const filteredUsers = getFilteredUsers();
  const filteredJobs = getFilteredJobs();
  const currentUsers = paginate(filteredUsers);
  const currentJobs = paginate(filteredJobs);

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">Admin Dashboard</h1>
          <p className="text-muted">Welcome back, {user?.name}. Here's what's happening with your platform.</p>
        </div>
        <div>
          <Button variant="outline-secondary" className="me-2">
            <FaDownload className="me-1" /> Export Report
          </Button>
          <Button variant="warning" onClick={() => {
            setModalMode('add');
            resetUserForm();
            setShowUserModal(true);
          }}>
            <FaUserPlus className="me-1" /> Add New User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <FaUsers size={40} className="text-warning mb-2" />
                  <h2 className="mb-0">{stats.totalUsers}</h2>
                  <p className="text-muted mb-0">Total Users</p>
                </div>
                <Badge bg="success" className="mt-auto">+{stats.monthlyGrowth}%</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <FaBriefcase size={40} className="text-success mb-2" />
                  <h2 className="mb-0">{stats.totalJobs}</h2>
                  <p className="text-muted mb-0">Job Postings</p>
                </div>
                <Badge bg="warning">{stats.pendingJobs} Pending</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <FaChartLine size={40} className="text-info mb-2" />
                  <h2 className="mb-0">{stats.totalApplications}</h2>
                  <p className="text-muted mb-0">Applications</p>
                </div>
                <Badge bg="success">{stats.successRate}% Success</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <FaBan size={40} className="text-danger mb-2" />
                  <h2 className="mb-0">{stats.blacklisted}</h2>
                  <p className="text-muted mb-0">Blacklisted</p>
                </div>
                <FaHeartbeat className="text-danger" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        {/* Overview Tab */}
        <Tab eventKey="overview" title="Overview">
          <Row className="mt-3">
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white fw-bold">Recent Users</Card.Header>
                <Card.Body className="p-0">
                  <Table responsive size="sm" className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 5).map(u => (
                        <tr key={u._id}>
                          <td>{u.name}</td>
                          <td><Badge bg="secondary">{u.role}</Badge></td>
                          <td><Badge bg={u.status === 'active' ? 'success' : 'danger'}>{u.status}</Badge></td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white fw-bold">Recent Applications</Card.Header>
                <Card.Body className="p-0">
                  <Table responsive size="sm" className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Job Title</th>
                        <th>Worker</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 5).map(a => (
                        <tr key={a._id}>
                          <td>{a.jobId?.title}</td>
                          <td>{a.workerId?.name}</td>
                          <td><Badge bg={a.status === 'accepted' ? 'success' : a.status === 'rejected' ? 'danger' : 'warning'}>{a.status}</Badge></td>
                          <td>{new Date(a.appliedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Users Tab */}
        <Tab eventKey="users" title="Users Management">
          <div className="mt-3">
            {/* Filters */}
            <Row className="mb-3 g-2">
              <Col md={4}>
                <InputGroup size="sm">
                  <InputGroup.Text><FaSearch /></InputGroup.Text>
                  <Form.Control placeholder="Search users..." onChange={e => setSearchTerm(e.target.value)} />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Select size="sm" onChange={e => setRoleFilter(e.target.value)}>
                  <option value="">All Roles</option>
                  <option value="worker">Workers</option>
                  <option value="employer">Employers</option>
                  <option value="recruiter">Recruiters</option>
                  <option value="admin">Admins</option>
                  <option value="embassy">Embassy</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select size="sm" onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button size="sm" variant="warning" onClick={() => {
                  setModalMode('add');
                  resetUserForm();
                  setShowUserModal(true);
                }} className="w-100">
                  <FaUserPlus /> Add User
                </Button>
              </Col>
            </Row>

            <Table striped bordered hover responsive>
              <thead className="bg-dark text-white">
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Activity</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {getRoleIcon(u.role)}
                        <div className="ms-2">
                          <strong>{u.name}</strong>
                          {u.rating && <div className="small text-warning">★ {u.rating}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div><small>{u.email}</small></div>
                      <div><small className="text-muted">{u.phone}</small></div>
                    </td>
                    <td><Badge bg="secondary" className="text-capitalize">{u.role}</Badge></td>
                    <td>
                      <Badge bg={u.status === 'active' ? 'success' : u.status === 'pending' ? 'warning' : 'danger'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td>
                      <small>
                        <FaClock className="me-1" size={10} />
                        Last: {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                      </small>
                    </td>
                    <td><small>{new Date(u.createdAt).toLocaleDateString()}</small></td>
                    <td>
                      <Button size="sm" variant="outline-warning" className="me-1" onClick={() => {
                        setSelectedItem(u);
                        setUserForm(u);
                        setModalMode('edit');
                        setShowUserModal(true);
                      }}>
                        <FaEdit />
                      </Button>
                      <Button size="sm" variant="outline-danger" className="me-1" onClick={() => handleDeleteUser(u._id)}>
                        <FaTrash />
                      </Button>
                      <Button size="sm" variant={u.status === 'active' ? 'outline-danger' : 'outline-success'} onClick={() => handleToggleUserStatus(u._id, u.status)}>
                        {u.status === 'active' ? <FaTimes /> : <FaCheck />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
            <Pagination className="justify-content-center">
              {[...Array(Math.ceil(filteredUsers.length / itemsPerPage)).keys()].map(number => (
                <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => setCurrentPage(number + 1)}>
                  {number + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>
        </Tab>

        {/* Jobs Tab */}
        <Tab eventKey="jobs" title="Jobs Management">
          <div className="mt-3">
            <Row className="mb-3">
              <Col md={6}>
                <InputGroup size="sm">
                  <InputGroup.Text><FaSearch /></InputGroup.Text>
                  <Form.Control placeholder="Search jobs..." onChange={e => setSearchTerm(e.target.value)} />
                </InputGroup>
              </Col>
              <Col md={4}>
                <Form.Select size="sm" onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button size="sm" variant="warning" onClick={() => setShowJobModal(true)} className="w-100">
                  <FaBriefcase /> Post Job
                </Button>
              </Col>
            </Row>

            <Table striped bordered hover responsive>
              <thead className="bg-dark text-white">
                <tr>
                  <th>Title</th>
                  <th>Employer</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentJobs.map(j => (
                  <tr key={j._id}>
                    <td>
                      <strong>{j.title}</strong>
                      {j.isVerified && <Badge bg="success" className="ms-1" size="sm">✓</Badge>}
                    </td>
                    <td>{j.employer || j.employerId?.name}</td>
                    <td><FaMapMarkerAlt className="text-muted me-1" size={10} /> {j.country}</td>
                    <td>{j.salary} {j.salaryCurrency}</td>
                    <td><Badge bg="info">{j.applications || 0}</Badge></td>
                    <td>
                      <Badge bg={j.status === 'active' ? 'success' : j.status === 'pending' ? 'warning' : 'secondary'}>
                        {j.status}
                      </Badge>
                    </td>
                    <td><small>{new Date(j.createdAt).toLocaleDateString()}</small></td>
                    <td>
                      {j.status !== 'active' && (
                        <Button size="sm" variant="outline-success" className="me-1" onClick={() => handleVerifyJob(j._id)}>
                          <FaCheck /> Verify
                        </Button>
                      )}
                      <Button size="sm" variant="outline-danger" onClick={() => handleDeleteJob(j._id)}>
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
            <div className="mb-3">
              <Button variant="danger" onClick={() => setShowBlacklistModal(true)}>
                <FaBan className="me-1" /> Add to Blacklist
              </Button>
            </div>
            <Table striped bordered hover responsive>
              <thead className="bg-dark text-white">
                <tr>
                  <th>Employer Name</th>
                  <th>Country</th>
                  <th>Violation Type</th>
                  <th>Reason</th>
                  <th>Reported By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blacklist.map(b => (
                  <tr key={b._id}>
                    <td><strong>{b.employerName}</strong></td>
                    <td>{b.country}</td>
                    <td><Badge bg={getCategoryColor(b.category)}>{b.category?.replace('_', ' ')}</Badge></td>
                    <td><small>{b.reason}</small></td>
                    <td><small>{b.reportedBy}</small></td>
                    <td><small>{new Date(b.reportedAt).toLocaleDateString()}</small></td>
                    <td>
                      <Button size="sm" variant="outline-success" onClick={() => handleRemoveFromBlacklist(b._id)}>
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

      {/* User Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg">
        <Modal.Header closeButton className="bg-warning">
          <Modal.Title>
            {modalMode === 'add' ? 'Add New User' : modalMode === 'edit' ? 'Edit User' : 'User Details'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control type="text" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control type="tel" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
                    <option value="worker">Worker</option>
                    <option value="employer">Employer</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="admin">Admin</option>
                    <option value="embassy">Embassy</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={userForm.status} onChange={e => setUserForm({...userForm, status: e.target.value})}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              {modalMode === 'add' && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
                  </Form.Group>
                </Col>
              )}
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>Cancel</Button>
          <Button variant="warning" onClick={modalMode === 'add' ? handleCreateUser : handleUpdateUser}>
            {modalMode === 'add' ? 'Create User' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Blacklist Modal */}
      <Modal show={showBlacklistModal} onHide={() => setShowBlacklistModal(false)}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title><FaBan className="me-2" /> Add to Blacklist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Employer Name</Form.Label>
              <Form.Control type="text" placeholder="Enter employer name" value={blacklistForm.employerName} onChange={e => setBlacklistForm({...blacklistForm, employerName: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control type="text" placeholder="Country" value={blacklistForm.country} onChange={e => setBlacklistForm({...blacklistForm, country: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Violation Category</Form.Label>
              <Form.Select value={blacklistForm.category} onChange={e => setBlacklistForm({...blacklistForm, category: e.target.value})}>
                <option value="wage_theft">Wage Theft</option>
                <option value="abuse">Physical/Verbal Abuse</option>
                <option value="document_theft">Document Confiscation</option>
                <option value="human_trafficking">Human Trafficking</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reason Details</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Describe the violation..." value={blacklistForm.reason} onChange={e => setBlacklistForm({...blacklistForm, reason: e.target.value})} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBlacklistModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleAddToBlacklist}>Add to Blacklist</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
