import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Table, Badge, Button, Modal, Form, Tabs, Tab, Pagination, InputGroup } from 'react-bootstrap';
import { FaUsers, FaBriefcase, FaBan, FaTrash, FaEdit, FaCheck, FaTimes, FaUserPlus, FaSearch, FaChartLine } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', password: '', role: 'worker', status: 'active' });
  const [blacklistForm, setBlacklistForm] = useState({ employerName: '', country: '', reason: '', category: 'wage_theft' });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, totalEmployers: 0, blacklisted: 0, pendingJobs: 0, totalApplications: 0, activeWorkers: 0, monthlyGrowth: 0, successRate: 0 });

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const mockUsers = [
        { _id: '1', name: 'John Worker', email: 'john@worker.com', phone: '0712345678', role: 'worker', status: 'active', rating: 4.5 },
        { _id: '2', name: 'Sarah Employer', email: 'sarah@employer.com', phone: '0723456789', role: 'employer', status: 'active', rating: 4.8 },
        { _id: '3', name: 'Admin User', email: 'admin@kazilinda.com', phone: '0734567890', role: 'admin', status: 'active' },
        { _id: '4', name: 'James Recruiter', email: 'james@recruiter.com', phone: '0745678901', role: 'recruiter', status: 'inactive' },
      ];
      const mockJobs = [
        { _id: '1', title: 'House Help in Riyadh', employer: 'Sarah Employer', country: 'Saudi Arabia', status: 'active', isVerified: true },
        { _id: '2', title: 'Driver Needed', employer: 'Sarah Employer', country: 'UAE', status: 'pending', isVerified: false },
        { _id: '3', title: 'Nanny Position', employer: 'ABC Agency', country: 'Kuwait', status: 'active', isVerified: true },
      ];
      const mockBlacklist = [
        { _id: '1', employerName: 'Bad Company', country: 'Qatar', reason: 'Wage theft', category: 'wage_theft' },
        { _id: '2', employerName: 'Scam Agency', country: 'Kuwait', reason: 'Document confiscation', category: 'document_theft' },
      ];
      setUsers(mockUsers);
      setJobs(mockJobs);
      setBlacklist(mockBlacklist);
      setStats({ totalUsers: mockUsers.length, totalJobs: mockJobs.length, totalEmployers: 2, blacklisted: mockBlacklist.length, pendingJobs: mockJobs.filter(j => j.status === 'pending').length, totalApplications: 0, activeWorkers: mockUsers.filter(u => u.role === 'worker' && u.status === 'active').length, monthlyGrowth: 23, successRate: 75 });
    } catch (err) { console.error(err); toast.error('Failed to load data'); } 
    finally { setLoading(false); }
  };

  const handleCreateUser = () => { toast.success('User created'); setShowUserModal(false); setUserForm({ name: '', email: '', phone: '', password: '', role: 'worker', status: 'active' }); };
  const handleUpdateUser = () => { toast.success('User updated'); setShowUserModal(false); };
  const handleDeleteUser = (id) => { if (window.confirm('Delete user?')) toast.success('User deleted'); };
  const handleToggleUserStatus = (id, current) => { toast.success(`User ${current === 'active' ? 'deactivated' : 'activated'}`); };
  const handleDeleteJob = (id) => { if (window.confirm('Delete job?')) toast.success('Job deleted'); };
  const handleVerifyJob = (id) => { toast.success('Job verified'); };
  const handleAddToBlacklist = () => { toast.success('Added to blacklist'); setShowBlacklistModal(false); setBlacklistForm({ employerName: '', country: '', reason: '', category: 'wage_theft' }); };
  const handleRemoveFromBlacklist = (id) => { if (window.confirm('Remove?')) toast.success('Removed'); };
  const getFilteredUsers = () => { let filtered = [...users]; if (searchTerm) filtered = filtered.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())); if (roleFilter) filtered = filtered.filter(u => u.role === roleFilter); if (statusFilter) filtered = filtered.filter(u => u.status === statusFilter); return filtered; };
  const getFilteredJobs = () => { let filtered = [...jobs]; if (searchTerm) filtered = filtered.filter(j => j.title?.toLowerCase().includes(searchTerm.toLowerCase())); if (statusFilter) filtered = filtered.filter(j => j.status === statusFilter); return filtered; };
  const paginate = (items) => items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const getRoleIcon = (role) => ({ admin: 'í±‘', employer: 'í¿¢', recruiter: 'í³‹', worker: 'í±·' }[role] || 'í±¤');
  const getCategoryColor = (cat) => ({ wage_theft: 'danger', abuse: 'danger', document_theft: 'warning' }[cat] || 'secondary');

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" variant="warning" /><p>Loading...</p></Container>;

  const filteredUsers = getFilteredUsers();
  const filteredJobs = getFilteredJobs();

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h1>Admin Dashboard</h1><p className="text-muted">Manage your platform</p></div>
        <Button variant="warning" onClick={() => { setModalMode('add'); setUserForm({ name: '', email: '', phone: '', password: '', role: 'worker', status: 'active' }); setShowUserModal(true); }}><FaUserPlus /> Add User</Button>
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
              <Col md={3}><Form.Select onChange={e => setRoleFilter(e.target.value)}><option value="">All Roles</option><option value="worker">Workers</option><option value="employer">Employers</option></Form.Select></Col>
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
                    <td>{j.employer}</td>
                    <td>{j.country}</td>
                    <td><Badge bg={j.status === 'active' ? 'success' : 'warning'}>{j.status}</Badge></td>
                    <td>
                      {j.status !== 'active' && <Button size="sm" variant="outline-success" className="me-1" onClick={() => handleVerifyJob(j._id)}><FaCheck /> Verify</Button>}
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

      {/* User Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton><Modal.Title>{modalMode === 'add' ? 'Add User' : 'Edit User'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}><Form.Group><Form.Label>Name</Form.Label><Form.Control value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Email</Form.Label><Form.Control type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Phone</Form.Label><Form.Control value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Role</Form.Label><Form.Select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}><option value="worker">Worker</option><option value="employer">Employer</option><option value="admin">Admin</option></Form.Select></Form.Group></Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowUserModal(false)}>Cancel</Button><Button variant="warning" onClick={modalMode === 'add' ? handleCreateUser : handleUpdateUser}>{modalMode === 'add' ? 'Create' : 'Save'}</Button></Modal.Footer>
      </Modal>

      {/* Blacklist Modal */}
      <Modal show={showBlacklistModal} onHide={() => setShowBlacklistModal(false)}>
        <Modal.Header closeButton className="bg-danger text-white"><Modal.Title><FaBan /> Add to Blacklist</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group><Form.Label>Employer Name</Form.Label><Form.Control value={blacklistForm.employerName} onChange={e => setBlacklistForm({...blacklistForm, employerName: e.target.value})} /></Form.Group>
            <Form.Group><Form.Label>Country</Form.Label><Form.Control value={blacklistForm.country} onChange={e => setBlacklistForm({...blacklistForm, country: e.target.value})} /></Form.Group>
            <Form.Group><Form.Label>Violation</Form.Label><Form.Select value={blacklistForm.category} onChange={e => setBlacklistForm({...blacklistForm, category: e.target.value})}><option value="wage_theft">Wage Theft</option><option value="abuse">Abuse</option><option value="document_theft">Document Theft</option></Form.Select></Form.Group>
            <Form.Group><Form.Label>Reason</Form.Label><Form.Control as="textarea" rows={3} value={blacklistForm.reason} onChange={e => setBlacklistForm({...blacklistForm, reason: e.target.value})} /></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowBlacklistModal(false)}>Cancel</Button><Button variant="danger" onClick={handleAddToBlacklist}>Add</Button></Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
