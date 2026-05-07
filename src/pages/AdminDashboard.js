import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Table, Badge, Button, Modal, Form, Tabs, Tab, Pagination, InputGroup, Alert } from 'react-bootstrap';
import { FaUsers, FaBriefcase, FaBan, FaTrash, FaEdit, FaCheck, FaTimes, FaUserPlus, FaSearch, FaChartLine, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [warningMessage, setWarningMessage] = useState({ subject: '', message: '' });
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', password: '', role: 'worker', status: 'active' });
  const [blacklistForm, setBlacklistForm] = useState({ employerName: '', country: '', reason: '', category: 'wage_theft' });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, totalEmployers: 0, blacklisted: 0, pendingJobs: 0, totalApplications: 0, activeWorkers: 0, monthlyGrowth: 0, successRate: 0 });

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const usersRes = await fetch('https://kazi-linda.onrender.com/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      const jobsRes = await fetch('https://kazi-linda.onrender.com/api/admin/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      }

      const blacklistRes = await fetch('https://kazi-linda.onrender.com/api/admin/blacklist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (blacklistRes.ok) {
        const blacklistData = await blacklistRes.json();
        setBlacklist(blacklistData);
      }

      const statsRes = await fetch('https://kazi-linda.onrender.com/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const handleCreateUser = async () => {
    try {
      const response = await fetch('https://kazi-linda.onrender.com/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userForm)
      });
      
      if (response.ok) {
        toast.success('User created successfully');
        setShowUserModal(false);
        resetUserForm();
        fetchAllData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create user');
      }
    } catch (err) {
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    try {
      const response = await fetch(`https://kazi-linda.onrender.com/api/admin/users/${userForm._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userForm)
      });
      
      if (response.ok) {
        toast.success('User updated successfully');
        setShowUserModal(false);
        fetchAllData();
      } else {
        toast.error('Failed to update user');
      }
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`https://kazi-linda.onrender.com/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          toast.success('User deleted successfully');
          fetchAllData();
        } else {
          toast.error('Failed to delete user');
        }
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await fetch(`https://kazi-linda.onrender.com/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        fetchAllData();
      } else {
        toast.error('Failed to update user status');
      }
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleSendWarning = async () => {
    if (!selectedUserId) return;
    try {
      const response = await fetch('https://kazi-linda.onrender.com/api/admin/send-warning', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedUserId,
          subject: warningMessage.subject,
          message: warningMessage.message
        })
      });
      
      if (response.ok) {
        toast.success('Warning sent successfully');
        setShowWarningModal(false);
        setWarningMessage({ subject: '', message: '' });
      } else {
        toast.error('Failed to send warning');
      }
    } catch (err) {
      toast.error('Failed to send warning');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Delete this job posting?')) {
      try {
        const response = await fetch(`https://kazi-linda.onrender.com/api/admin/jobs/${jobId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          toast.success('Job deleted');
          fetchAllData();
        } else {
          toast.error('Failed to delete job');
        }
      } catch (err) {
        toast.error('Failed to delete job');
      }
    }
  };

  const handleVerifyJob = async (jobId) => {
    try {
      const response = await fetch(`https://kazi-linda.onrender.com/api/admin/jobs/${jobId}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('Job verified successfully');
        fetchAllData();
      } else {
        toast.error('Failed to verify job');
      }
    } catch (err) {
      toast.error('Failed to verify job');
    }
  };

  const handleAddToBlacklist = async () => {
    try {
      const response = await fetch('https://kazi-linda.onrender.com/api/admin/blacklist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(blacklistForm)
      });
      
      if (response.ok) {
        toast.success('Employer added to blacklist');
        setShowBlacklistModal(false);
        resetBlacklistForm();
        fetchAllData();
      } else {
        toast.error('Failed to add to blacklist');
      }
    } catch (err) {
      toast.error('Failed to add to blacklist');
    }
  };

  const handleRemoveFromBlacklist = async (blacklistId) => {
    if (window.confirm('Remove this employer from blacklist?')) {
      try {
        const response = await fetch(`https://kazi-linda.onrender.com/api/admin/blacklist/${blacklistId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          toast.success('Employer removed from blacklist');
          fetchAllData();
        } else {
          toast.error('Failed to remove');
        }
      } catch (err) {
        toast.error('Failed to remove');
      }
    }
  };

  const resetUserForm = () => {
    setUserForm({ name: '', email: '', phone: '', password: '', role: 'worker', status: 'active' });
    setModalMode('add');
  };

  const resetBlacklistForm = () => {
    setBlacklistForm({ employerName: '', country: '', reason: '', category: 'wage_theft' });
  };

  const getFilteredUsers = () => {
    let filtered = [...users];
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (roleFilter) filtered = filtered.filter(u => u.role === roleFilter);
    if (statusFilter) filtered = filtered.filter(u => u.status === statusFilter);
    return filtered;
  };

  const getFilteredJobs = () => {
    let filtered = [...jobs];
    if (searchTerm) {
      filtered = filtered.filter(j => 
        j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) filtered = filtered.filter(j => j.status === statusFilter);
    return filtered;
  };

  const paginate = (items) => items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const getRoleIcon = (role) => ({ admin: 'í±‘', employer: 'í¿¢', recruiter: 'í³‹', worker: 'í±·', embassy: 'í¿›ï¸' }[role] || 'í±¤');
  const getCategoryColor = (cat) => ({ wage_theft: 'danger', abuse: 'danger', document_theft: 'warning' }[cat] || 'secondary');

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p>Loading...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={fetchAllData} variant="warning">Retry</Button>
      </Container>
    );
  }

  const filteredUsers = getFilteredUsers();
  const filteredJobs = getFilteredJobs();

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h1>Admin Dashboard</h1><p className="text-muted">Manage your platform</p></div>
        <Button variant="warning" onClick={() => { setModalMode('add'); resetUserForm(); setShowUserModal(true); }}><FaUserPlus /> Add User</Button>
      </div>

      <Row className="g-3 mb-4">
        <Col md={3}><Card><Card.Body><FaUsers className="text-warning mb-2" size={30} /><h2>{stats.totalUsers}</h2><p>Total Users</p></Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body><FaBriefcase className="text-success mb-2" size={30} /><h2>{stats.totalJobs}</h2><p>Jobs</p></Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body><FaChartLine className="text-info mb-2" size={30} /><h2>{stats.totalApplications}</h2><p>Applications</p></Card.Body></Card></Col>
        <Col md={3}><Card><Card.Body><FaBan className="text-danger mb-2" size={30} /><h2>{stats.blacklisted}</h2><p>Blacklisted</p></Card.Body></Card></Col>
      </Row>

      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Tab eventKey="users" title="Users">
          <div className="mt-3">
            <Row className="mb-3 g-2">
              <Col md={4}><InputGroup><InputGroup.Text><FaSearch /></InputGroup.Text><Form.Control placeholder="Search..." onChange={e => setSearchTerm(e.target.value)} /></InputGroup></Col>
              <Col md={3}><Form.Select onChange={e => setRoleFilter(e.target.value)}><option value="">All Roles</option><option value="worker">Workers</option><option value="employer">Employers</option><option value="admin">Admins</option></Form.Select></Col>
              <Col md={3}><Form.Select onChange={e => setStatusFilter(e.target.value)}><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></Form.Select></Col>
            </Row>
            <Table striped bordered hover responsive>
              <thead className="bg-dark text-white"><tr><th>User</th><th>Contact</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {paginate(filteredUsers).map(u => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong>{u.rating && <small className="text-warning d-block">â˜… {u.rating}</small>}</td>
                    <td><small>{u.email}</small><br /><small>{u.phone}</small></td>
                    <td><Badge bg="secondary">{getRoleIcon(u.role)} {u.role}</Badge></td>
                    <td><Badge bg={u.status === 'active' ? 'success' : 'danger'}>{u.status}</Badge></td>
                    <td>
                      <Button size="sm" variant="outline-warning" className="me-1" onClick={() => { setUserForm(u); setModalMode('edit'); setShowUserModal(true); }}><FaEdit /></Button>
                      <Button size="sm" variant="outline-danger" className="me-1" onClick={() => handleDeleteUser(u._id)}><FaTrash /></Button>
                      <Button size="sm" variant={u.status === 'active' ? 'outline-danger' : 'outline-success'} onClick={() => handleToggleUserStatus(u._id, u.status)}>{u.status === 'active' ? <FaTimes /> : <FaCheck />}</Button>
                      <Button size="sm" variant="outline-info" className="ms-1" onClick={() => { setSelectedUserId(u._id); setShowWarningModal(true); }}><FaEnvelope /> Warn</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination>{[...Array(Math.ceil(filteredUsers.length / itemsPerPage))].map((_, i) => (<Pagination.Item key={i+1} active={i+1 === currentPage} onClick={() => setCurrentPage(i+1)}>{i+1}</Pagination.Item>))}</Pagination>
          </div>
        </Tab>

        <Tab eventKey="jobs" title="Jobs">
          <div className="mt-3">
            <Table striped bordered hover responsive>
              <thead className="bg-dark text-white"><tr><th>Title</th><th>Employer</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {paginate(filteredJobs).map(j => (
                  <tr key={j._id}>
                    <td><strong>{j.title}</strong>{j.isVerified && <Badge bg="success" className="ms-1">âœ“</Badge>}</td>
                    <td>{j.employerId?.name || j.employer}</td>
                    <td>{j.country}</td>
                    <td><Badge bg={j.isVerified ? 'success' : 'warning'}>{j.isVerified ? 'Verified' : 'Pending'}</Badge></td>
                    <td>
                      {!j.isVerified && <Button size="sm" variant="outline-success" className="me-1" onClick={() => handleVerifyJob(j._id)}><FaCheck /> Verify</Button>}
                      <Button size="sm" variant="outline-danger" onClick={() => handleDeleteJob(j._id)}><FaTrash /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey="blacklist" title="Blacklist">
          <div className="mt-3">
            <Button variant="danger" className="mb-3" onClick={() => setShowBlacklistModal(true)}><FaBan /> Add to Blacklist</Button>
            <Table striped bordered hover responsive>
              <thead className="bg-dark text-white"><tr><th>Employer</th><th>Country</th><th>Violation</th><th>Actions</th></tr></thead>
              <tbody>
                {blacklist.map(b => (
                  <tr key={b._id}>
                    <td><strong>{b.employerName}</strong></td>
                    <td>{b.country}</td>
                    <td><Badge bg={getCategoryColor(b.category)}>{b.category?.replace('_', ' ')}</Badge><br /><small>{b.reason}</small></td>
                    <td><Button size="sm" variant="outline-success" onClick={() => handleRemoveFromBlacklist(b._id)}><FaCheck /> Remove</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>
      </Tabs>

      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton><Modal.Title>{modalMode === 'add' ? 'Add User' : 'Edit User'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group><Form.Label>Name</Form.Label><Form.Control value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} /></Form.Group>
            <Form.Group className="mt-2"><Form.Label>Email</Form.Label><Form.Control type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} /></Form.Group>
            <Form.Group className="mt-2"><Form.Label>Phone</Form.Label><Form.Control value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} /></Form.Group>
            <Form.Group className="mt-2"><Form.Label>Role</Form.Label><Form.Select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}><option value="worker">Worker</option><option value="employer">Employer</option><option value="admin">Admin</option></Form.Select></Form.Group>
            <Form.Group className="mt-2"><Form.Label>Status</Form.Label><Form.Select value={userForm.status} onChange={e => setUserForm({...userForm, status: e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></Form.Select></Form.Group>
            {modalMode === 'add' && <Form.Group className="mt-2"><Form.Label>Password</Form.Label><Form.Control type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} /></Form.Group>}
          </Form>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowUserModal(false)}>Cancel</Button><Button variant="warning" onClick={modalMode === 'add' ? handleCreateUser : handleUpdateUser}>{modalMode === 'add' ? 'Create' : 'Save'}</Button></Modal.Footer>
      </Modal>

      <Modal show={showBlacklistModal} onHide={() => setShowBlacklistModal(false)}>
        <Modal.Header closeButton className="bg-danger text-white"><Modal.Title><FaBan /> Add to Blacklist</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group><Form.Label>Employer Name</Form.Label><Form.Control value={blacklistForm.employerName} onChange={e => setBlacklistForm({...blacklistForm, employerName: e.target.value})} /></Form.Group>
            <Form.Group className="mt-2"><Form.Label>Country</Form.Label><Form.Control value={blacklistForm.country} onChange={e => setBlacklistForm({...blacklistForm, country: e.target.value})} /></Form.Group>
            <Form.Group className="mt-2"><Form.Label>Violation</Form.Label><Form.Select value={blacklistForm.category} onChange={e => setBlacklistForm({...blacklistForm, category: e.target.value})}><option value="wage_theft">Wage Theft</option><option value="abuse">Abuse</option><option value="document_theft">Document Theft</option></Form.Select></Form.Group>
            <Form.Group className="mt-2"><Form.Label>Reason</Form.Label><Form.Control as="textarea" rows={3} value={blacklistForm.reason} onChange={e => setBlacklistForm({...blacklistForm, reason: e.target.value})} /></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowBlacklistModal(false)}>Cancel</Button><Button variant="danger" onClick={handleAddToBlacklist}>Add</Button></Modal.Footer>
      </Modal>

      <Modal show={showWarningModal} onHide={() => setShowWarningModal(false)}>
        <Modal.Header closeButton className="bg-warning"><Modal.Title><FaEnvelope /> Send Warning</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group><Form.Label>Subject</Form.Label><Form.Control placeholder="Warning subject" value={warningMessage.subject} onChange={e => setWarningMessage({...warningMessage, subject: e.target.value})} /></Form.Group>
            <Form.Group className="mt-2"><Form.Label>Message</Form.Label><Form.Control as="textarea" rows={4} placeholder="Enter warning message..." value={warningMessage.message} onChange={e => setWarningMessage({...warningMessage, message: e.target.value})} /></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowWarningModal(false)}>Cancel</Button><Button variant="warning" onClick={handleSendWarning}>Send Warning</Button></Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
