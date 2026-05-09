import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Table, Badge, Button, Modal, Form, Pagination, InputGroup } from 'react-bootstrap';
import { FaUsers, FaBriefcase, FaBan, FaTrash, FaEdit, FaUserPlus, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', password: '', role: 'worker', status: 'active' });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, blacklisted: 0 });

  const fetchData = useCallback(async () => {
    try {
      const usersRes = await fetch('https://kazi-linda.onrender.com/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = usersRes.ok ? await usersRes.json() : [];
      setUsers(usersData);
      
      const jobsRes = await fetch('https://kazi-linda.onrender.com/api/admin/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const jobsData = jobsRes.ok ? await jobsRes.json() : [];
      
      const blacklistRes = await fetch('https://kazi-linda.onrender.com/api/admin/blacklist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blacklistData = blacklistRes.ok ? await blacklistRes.json() : [];
      
      setStats({ 
        totalUsers: usersData.length, 
        totalJobs: jobsData.length, 
        blacklisted: blacklistData.length 
      });
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateUser = async () => {
    const response = await fetch('https://kazi-linda.onrender.com/api/admin/users', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm)
    });
    if (response.ok) toast.success('User created');
    setShowUserModal(false);
    fetchData();
  };

  if (loading) return <Container className="text-center mt-5"><Spinner /><p>Loading...</p></Container>;

  const filteredUsers = users.filter(u => 
    (!searchTerm || u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!roleFilter || u.role === roleFilter) &&
    (!statusFilter || u.status === statusFilter)
  );
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h1>Admin Dashboard</h1></div>
        <Button variant="warning" onClick={() => setShowUserModal(true)}><FaUserPlus /> Add User</Button>
      </div>
      <Row className="g-3 mb-4">
        <Col md={4}><Card><Card.Body><FaUsers className="text-warning mb-2" size={30} /><h2>{stats.totalUsers}</h2><p>Total Users</p></Card.Body></Card></Col>
        <Col md={4}><Card><Card.Body><FaBriefcase className="text-success mb-2" size={30} /><h2>{stats.totalJobs}</h2><p>Jobs</p></Card.Body></Card></Col>
        <Col md={4}><Card><Card.Body><FaBan className="text-danger mb-2" size={30} /><h2>{stats.blacklisted}</h2><p>Blacklisted</p></Card.Body></Card></Col>
      </Row>
      <Row className="mb-3 g-2">
        <Col md={4}><InputGroup><InputGroup.Text><FaSearch /></InputGroup.Text><Form.Control placeholder="Search..." onChange={e => setSearchTerm(e.target.value)} /></InputGroup></Col>
        <Col md={3}><Form.Select onChange={e => setRoleFilter(e.target.value)}><option value="">All Roles</option><option value="worker">Workers</option><option value="employer">Employers</option></Form.Select></Col>
        <Col md={3}><Form.Select onChange={e => setStatusFilter(e.target.value)}><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></Form.Select></Col>
      </Row>
      <Table striped bordered hover responsive>
        <thead className="bg-dark text-white">
          <tr>
            <th>User</th>
            <th>Contact</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map(u => (
            <tr key={u._id}>
              <td className="d-flex align-items-center gap-2">
                <ClickableAvatar userId={u._id} src={u.profilePicture} size={40} />
                {u.name}
              </td>
              <td>
                <small>{u.email}</small><br />
                <small>{u.phone}</small>
              </td>
              <td>{u.role}</td>
              <td>
                <Badge bg={u.status === 'active' ? 'success' : 'danger'}>{u.status}</Badge>
              </td>
              <td>
                <Button size="sm" variant="outline-warning" className="me-1"><FaEdit /></Button>
                <Button size="sm" variant="outline-danger"><FaTrash /></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination>
        {[...Array(Math.ceil(filteredUsers.length / itemsPerPage))].map((_, i) => (
          <Pagination.Item key={i+1} active={i+1 === currentPage} onClick={() => setCurrentPage(i+1)}>
            {i+1}
          </Pagination.Item>
        ))}
      </Pagination>
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton><Modal.Title>Add User</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>Phone</Form.Label>
              <Form.Control value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>Role</Form.Label>
              <Form.Select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
                <option value="worker">Worker</option>
                <option value="employer">Employer</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>Status</Form.Label>
              <Form.Select value={userForm.status} onChange={e => setUserForm({...userForm, status: e.target.value})}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" onChange={e => setUserForm({...userForm, password: e.target.value})} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>Cancel</Button>
          <Button variant="warning" onClick={handleCreateUser}>Create</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;