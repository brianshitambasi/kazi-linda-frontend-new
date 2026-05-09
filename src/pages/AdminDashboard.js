import React, { useState, useEffect, useCallback } from 'react';
import { Button, Spinner, Modal, Form, Badge } from 'react-bootstrap';
import { 
  FaUsers, FaBriefcase, FaBan, FaTrash, FaEdit, FaUserPlus, 
  FaSearch, FaHome, FaBell, FaFacebookMessenger, FaEllipsisH,
  FaUserShield, FaChartLine, FaExclamationTriangle, FaCheckCircle, FaClock
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [userForm, setUserForm] = useState({ 
    name: '', email: '', phone: '', password: '', role: 'worker', status: 'active' 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeNav, setActiveNav] = useState('admin');
  const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, blacklisted: 0, pendingReports: 3 });

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
      
      setStats(prev => ({ 
        ...prev,
        totalUsers: usersData.length, 
        totalJobs: jobsData.length, 
        blacklisted: blacklistData.length 
      }));
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    const response = await fetch('https://kazi-linda.onrender.com/api/admin/users', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm)
    });
    if (response.ok) {
      toast.success('User created successfully');
      setShowUserModal(false);
      setUserForm({ name: '', email: '', phone: '', password: '', role: 'worker', status: 'active' });
      fetchData();
    } else {
      toast.error('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`https://kazi-linda.onrender.com/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('User deleted');
        fetchData();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (err) {
      toast.error('Error deleting user');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'admin', icon: FaUserShield, label: 'Admin', link: '/admin' },
    { id: 'users', icon: FaUsers, label: 'Users', link: '/admin' },
    { id: 'reports', icon: FaExclamationTriangle, label: 'Reports', link: '/admin/reports' },
  ];

  const leftLinks = [
    { icon: FaUsers, label: 'User Management', count: stats.totalUsers, color: KL_BRAND, active: true },
    { icon: FaBriefcase, label: 'Job Moderation', count: stats.totalJobs, color: '#45bd62' },
    { icon: FaBan, label: 'Blacklist', count: stats.blacklisted, color: '#e41e3f' },
    { icon: FaExclamationTriangle, label: 'Reports', count: stats.pendingReports, color: '#f7b928' },
    { icon: FaChartLine, label: 'Analytics', color: '#1877f2' },
    { icon: FaClock, label: 'Activity Log', color: '#7c3aed' },
  ];

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingLogo}>KL</div>
        <Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} />
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    (!searchTerm || u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!roleFilter || u.role === roleFilter) &&
    (!statusFilter || u.status === statusFilter)
  );
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div style={styles.page}>
      {/* ════════════ TOP NAV ════════════ */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link to="/" style={styles.logoBox}>
            <span style={styles.logoText}>KL</span>
          </Link>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input 
              style={styles.searchInput} 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.navCenter}>
          {navTabs.map(tab => (
            <Link
              key={tab.id}
              to={tab.link}
              style={{
                ...styles.navTab,
                ...(activeNav === tab.id ? styles.navTabActive : {}),
              }}
              onClick={() => setActiveNav(tab.id)}
            >
              <tab.icon size={24} style={{ color: activeNav === tab.id ? KL_BRAND : '#65676b' }} />
              {activeNav === tab.id && <div style={styles.navTabLine} />}
            </Link>
          ))}
        </div>

        <div style={styles.navRight}>
          <button style={styles.navIconBtn}>
            <div style={styles.navIconInner}>
              <FaEllipsisH size={18} color="#050505" />
            </div>
          </button>
          <button style={styles.navIconBtn}>
            <div style={styles.navIconInner}>
              <FaFacebookMessenger size={18} color="#050505" />
            </div>
          </button>
          <button style={styles.navIconBtn}>
            <div style={styles.navIconInner}>
              <FaBell size={18} color="#050505" />
            </div>
            <span style={styles.badge}>3</span>
          </button>
          <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={40} />
        </div>
      </nav>

      {/* ════════════ BODY (3-COLUMN LAYOUT) ════════════ */}
      <div style={styles.body}>
        {/* ── LEFT SIDEBAR ── */}
        <aside style={styles.leftSidebar}>
          <Link to={`/profile/${user?._id}`} style={styles.sidebarProfileLink}>
            <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={36} />
            <span style={styles.sidebarLinkText}>{user?.name || 'Admin User'}</span>
            <Badge bg="warning" style={styles.adminBadge}>Admin</Badge>
          </Link>

          {leftLinks.map(({ icon: Icon, label, count, color, active }) => (
            <button 
              key={label} 
              style={{
                ...styles.sidebarNavItem,
                ...(active ? styles.sidebarNavItemActive : {}),
              }}
            >
              <span style={{ ...styles.sidebarIconWrap, background: color + '22' }}>
                <Icon size={18} color={color} />
              </span>
              <span style={styles.sidebarLinkText}>{label}</span>
              {count !== undefined && count > 0 && (
                <span style={{ ...styles.sidebarCount, background: color + '22', color }}>{count}</span>
              )}
            </button>
          ))}

          <div style={styles.sidebarDivider} />
          
          <div style={styles.sidebarSectionTitle}>Admin Tools</div>
          <button style={styles.adminToolBtn} onClick={() => setShowUserModal(true)}>
            <FaUserPlus /> Create User
          </button>
          <button style={styles.adminToolBtn}>
            <FaBan /> Manage Blacklist
          </button>
          <button style={styles.adminToolBtn}>
            <FaBriefcase /> Review Jobs
          </button>

          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>
            Admin Access Only · Secure Zone<br />
            © {new Date().getFullYear()} KaziLinda
          </div>
        </aside>

        {/* ── MAIN FEED (ADMIN DASHBOARD) ── */}
        <main style={styles.feedCol}>
          {/* Header */}
          <div style={styles.headerCard}>
            <div style={styles.headerIcon}>
              <FaUserShield size={32} color={KL_BRAND} />
            </div>
            <div>
              <h1 style={styles.headerTitle}>Admin Dashboard</h1>
              <p style={styles.headerDesc}>
                Manage users, moderate jobs, and oversee platform safety
              </p>
            </div>
            <Button style={styles.addUserBtn} onClick={() => setShowUserModal(true)}>
              <FaUserPlus /> Add User
            </Button>
          </div>

          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: KL_BRAND + '22' }}>
                <FaUsers size={24} color={KL_BRAND} />
              </div>
              <div>
                <h3 style={styles.statNumber}>{stats.totalUsers}</h3>
                <p style={styles.statLabel}>Total Users</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: '#45bd6222' }}>
                <FaBriefcase size={24} color="#45bd62" />
              </div>
              <div>
                <h3 style={styles.statNumber}>{stats.totalJobs}</h3>
                <p style={styles.statLabel}>Total Jobs</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: '#e41e3f22' }}>
                <FaBan size={24} color="#e41e3f" />
              </div>
              <div>
                <h3 style={styles.statNumber}>{stats.blacklisted}</h3>
                <p style={styles.statLabel}>Blacklisted</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: '#f7b92822' }}>
                <FaExclamationTriangle size={24} color="#f7b928" />
              </div>
              <div>
                <h3 style={styles.statNumber}>{stats.pendingReports}</h3>
                <p style={styles.statLabel}>Pending Reports</p>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div style={styles.filtersBar}>
            <div style={styles.filterGroup}>
              <FaSearch style={styles.filterIcon} />
              <input 
                type="text" 
                style={styles.filterInput} 
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              style={styles.filterSelect} 
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="worker">Workers</option>
              <option value="employer">Employers</option>
              <option value="admin">Admins</option>
            </select>
            <select 
              style={styles.filterSelect} 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Users Table */}
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <span>User Management</span>
              <span style={styles.tableCount}>{filteredUsers.length} users</span>
            </div>
            
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableRow}>
                    <th style={styles.tableTh}>User</th>
                    <th style={styles.tableTh}>Contact</th>
                    <th style={styles.tableTh}>Role</th>
                    <th style={styles.tableTh}>Status</th>
                    <th style={styles.tableTh}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map(u => (
                    <tr key={u._id} style={styles.tableRow}>
                      <td style={styles.tableTd}>
                        <div style={styles.userCell}>
                          <ClickableAvatar userId={u._id} src={u.profilePicture} size={36} />
                          <span style={styles.userName}>{u.name}</span>
                        </div>
                      </td>
                      <td style={styles.tableTd}>
                        <div style={styles.contactCell}>
                          <div><small>{u.email}</small></div>
                          <div><small style={styles.phoneText}>{u.phone || 'No phone'}</small></div>
                        </div>
                      </td>
                      <td style={styles.tableTd}>
                        <Badge bg={u.role === 'admin' ? 'warning' : u.role === 'employer' ? 'info' : 'secondary'} 
                               style={styles.roleBadge}>
                          {u.role}
                        </Badge>
                      </td>
                      <td style={styles.tableTd}>
                        <Badge bg={u.status === 'active' ? 'success' : u.status === 'inactive' ? 'danger' : 'secondary'}
                               style={styles.statusBadge}>
                          {u.status}
                        </Badge>
                      </td>
                      <td style={styles.tableTd}>
                        <div style={styles.actionButtons}>
                          <button style={styles.editBtn} title="Edit User">
                            <FaEdit size={14} />
                          </button>
                          <button 
                            style={styles.deleteBtn} 
                            title="Delete User"
                            onClick={() => setShowDeleteConfirm(u._id)}
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button 
                  style={{ ...styles.pageBtn, ...(currentPage === 1 && styles.pageBtnDisabled) }}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <div style={styles.pageNumbers}>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i+1}
                      style={{
                        ...styles.pageNumber,
                        ...(currentPage === i+1 ? styles.pageNumberActive : {})
                      }}
                      onClick={() => setCurrentPage(i+1)}
                    >
                      {i+1}
                    </button>
                  ))}
                </div>
                <button 
                  style={{ ...styles.pageBtn, ...(currentPage === totalPages && styles.pageBtnDisabled) }}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {filteredUsers.length === 0 && (
            <div style={styles.emptyState}>
              <FaUsers size={48} color={KL_BRAND} />
              <h4>No users found</h4>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}>
              <FaUserShield color={KL_BRAND} />
              <span>Quick Actions</span>
            </div>
            <button style={styles.quickActionBtn} onClick={() => setShowUserModal(true)}>
              <FaUserPlus /> Add New User
            </button>
            <button style={styles.quickActionBtn}>
              <FaBan /> Add to Blacklist
            </button>
            <button style={styles.quickActionBtn}>
              <FaBriefcase /> Moderate Jobs
            </button>
          </div>

          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}>
              <FaCheckCircle color="#45bd62" />
              <span>System Status</span>
            </div>
            <div style={styles.statusItem}>
              <span>API</span>
              <Badge bg="success">Operational</Badge>
            </div>
            <div style={styles.statusItem}>
              <span>Database</span>
              <Badge bg="success">Connected</Badge>
            </div>
            <div style={styles.statusItem}>
              <span>Last Sync</span>
              <span style={styles.statusValue}>Just now</span>
            </div>
          </div>

          <div style={styles.tipsCard}>
            <h4>Admin Tips</h4>
            <ul style={styles.tipsList}>
              <li>✓ Verify employers before approval</li>
              <li>✓ Review reported content daily</li>
              <li>✓ Update blacklist regularly</li>
              <li>✓ Monitor user activity</li>
            </ul>
          </div>

          <div style={styles.sidebarFooter}>
            Admin Dashboard v1.0<br />
            © {new Date().getFullYear()} KaziLinda
          </div>
        </aside>
      </div>

      {/* Add User Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered size="lg">
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={styles.modalTitle}>
            <FaUserPlus className="me-2" /> Add New User
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Full Name *</Form.Label>
              <Form.Control 
                value={userForm.name} 
                onChange={e => setUserForm({...userForm, name: e.target.value})}
                placeholder="Enter full name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control 
                type="email" 
                value={userForm.email} 
                onChange={e => setUserForm({...userForm, email: e.target.value})}
                placeholder="Enter email address"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control 
                value={userForm.phone} 
                onChange={e => setUserForm({...userForm, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
                <option value="worker">Worker</option>
                <option value="employer">Employer</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select value={userForm.status} onChange={e => setUserForm({...userForm, status: e.target.value})}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password *</Form.Label>
              <Form.Control 
                type="password" 
                onChange={e => setUserForm({...userForm, password: e.target.value})}
                placeholder="Enter password"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>Cancel</Button>
          <Button style={styles.createBtn} onClick={handleCreateUser}>Create User</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={!!showDeleteConfirm} onHide={() => setShowDeleteConfirm(null)} centered>
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this user? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => handleDeleteUser(showDeleteConfirm)}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const styles = {
  page: {
    background: '#f0f2f5',
    minHeight: '100vh',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, height: 56,
    background: '#fff', borderBottom: '1px solid #dddfe2',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', zIndex: 200,
    boxShadow: '0 2px 4px rgba(0,0,0,.08)',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  navCenter: { display: 'flex', gap: 4 },
  navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  logoBox: {
    width: 40, height: 40, borderRadius: '50%',
    background: KL_BRAND,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none',
  },
  logoText: { color: '#fff', fontWeight: 900, fontSize: 18, fontStyle: 'italic' },
  searchBox: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 12, color: '#65676b', fontSize: 14 },
  searchInput: {
    background: '#f0f2f5', border: 'none', borderRadius: 20,
    padding: '8px 16px 8px 36px', fontSize: 15, outline: 'none',
    width: 240, color: '#050505',
  },
  navTab: {
    width: 100, height: 48, border: 'none', background: 'transparent',
    borderRadius: 10, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', position: 'relative',
    textDecoration: 'none',
  },
  navTabActive: { background: KL_BRAND_LIGHT },
  navTabLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
    background: KL_BRAND, borderRadius: '2px 2px 0 0',
  },
  navIconBtn: {
    position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer',
  },
  navIconInner: {
    width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: 0, right: 0,
    background: '#e41e3f', color: '#fff', borderRadius: 10,
    fontSize: 11, fontWeight: 700, padding: '1px 5px',
  },
  body: {
    display: 'flex', paddingTop: 56,
    maxWidth: 1440, margin: '0 auto',
  },
  leftSidebar: {
    width: 280, flexShrink: 0,
    padding: '12px 8px',
    position: 'sticky', top: 56, height: 'calc(100vh - 56px)',
    overflowY: 'auto',
  },
  sidebarProfileLink: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '8px 8px', borderRadius: 8,
    textDecoration: 'none', color: '#050505',
    fontWeight: 500, fontSize: 15, marginBottom: 8,
  },
  adminBadge: { fontSize: 10, padding: '2px 6px', background: KL_BRAND, color: '#fff' },
  sidebarNavItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 8px', borderRadius: 8,
    border: 'none', background: 'transparent',
    cursor: 'pointer', width: '100%', textAlign: 'left',
    fontWeight: 500, fontSize: 14, color: '#050505',
  },
  sidebarNavItemActive: { background: KL_BRAND_LIGHT },
  sidebarIconWrap: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  sidebarLinkText: { fontSize: 14, fontWeight: 500, color: '#050505', flex: 1 },
  sidebarCount: {
    fontSize: 12, fontWeight: 600, padding: '2px 8px',
    borderRadius: 12, minWidth: 24, textAlign: 'center',
  },
  sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' },
  sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px', marginBottom: 4 },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, lineHeight: 1.6, textAlign: 'center' },
  adminToolBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 8,
    border: 'none', background: 'transparent', cursor: 'pointer',
    width: '100%', fontSize: 14, color: '#050505',
  },
  feedCol: {
    flex: 1, maxWidth: 800, margin: '0 16px', padding: '16px 0',
    minWidth: 0,
  },
  headerCard: {
    background: '#fff', borderRadius: 12, padding: '20px',
    display: 'flex', alignItems: 'center', gap: 16,
    marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
    position: 'relative',
  },
  headerIcon: {
    width: 56, height: 56, borderRadius: '50%', background: KL_BRAND_LIGHT,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#050505' },
  headerDesc: { fontSize: 13, color: '#65676b', margin: 0 },
  addUserBtn: {
    marginLeft: 'auto', background: KL_BRAND, border: 'none',
    borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12, marginBottom: 16,
  },
  statCard: {
    background: '#fff', borderRadius: 12, padding: '16px',
    display: 'flex', alignItems: 'center', gap: 12,
    boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  statIcon: {
    width: 48, height: 48, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  statNumber: { fontSize: 24, fontWeight: 700, marginBottom: 0, color: '#050505' },
  statLabel: { fontSize: 13, color: '#65676b', margin: 0 },
  filtersBar: {
    background: '#fff', borderRadius: 12, padding: '12px 16px',
    marginBottom: 16, display: 'flex', gap: 12,
    boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  filterGroup: {
    flex: 2, position: 'relative', display: 'flex', alignItems: 'center',
  },
  filterIcon: { position: 'absolute', left: 12, color: '#65676b', fontSize: 14 },
  filterInput: {
    width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #dddfe2',
    borderRadius: 8, fontSize: 14, outline: 'none',
  },
  filterSelect: {
    flex: 1, padding: '8px 12px', border: '1px solid #dddfe2',
    borderRadius: 8, fontSize: 14, background: '#fff',
  },
  tableCard: {
    background: '#fff', borderRadius: 12, overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  tableHeader: {
    padding: '14px 16px', borderBottom: '1px solid #dddfe2',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontWeight: 600, fontSize: 15,
  },
  tableCount: { fontSize: 13, fontWeight: 400, color: '#65676b' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableTh: {
    textAlign: 'left', padding: '12px 16px', background: '#fafafa',
    borderBottom: '1px solid #dddfe2', fontSize: 13, fontWeight: 600,
    color: '#65676b',
  },
  tableTd: { padding: '12px 16px', borderBottom: '1px solid #f0f2f5', fontSize: 14 },
  tableRow: {},
  userCell: { display: 'flex', alignItems: 'center', gap: 10 },
  userName: { fontWeight: 500 },
  contactCell: { lineHeight: 1.4 },
  phoneText: { color: '#65676b' },
  roleBadge: { fontSize: 11, padding: '4px 8px' },
  statusBadge: { fontSize: 11, padding: '4px 8px' },
  actionButtons: { display: 'flex', gap: 8 },
  editBtn: {
    background: '#e4e6eb', border: 'none', borderRadius: 6,
    padding: '6px 10px', cursor: 'pointer', color: KL_BRAND,
  },
  deleteBtn: {
    background: '#e4e6eb', border: 'none', borderRadius: 6,
    padding: '6px 10px', cursor: 'pointer', color: '#e41e3f',
  },
  pagination: {
    padding: '16px', borderTop: '1px solid #dddfe2',
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12,
  },
  pageBtn: {
    padding: '6px 12px', borderRadius: 6, border: '1px solid #dddfe2',
    background: '#fff', cursor: 'pointer', fontSize: 13,
  },
  pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  pageNumbers: { display: 'flex', gap: 6 },
  pageNumber: {
    width: 32, height: 32, borderRadius: 6, border: '1px solid #dddfe2',
    background: '#fff', cursor: 'pointer', fontSize: 13,
  },
  pageNumberActive: { background: KL_BRAND, color: '#fff', borderColor: KL_BRAND },
  rightSidebar: {
    width: 300, flexShrink: 0,
    padding: '12px 8px',
    position: 'sticky', top: 56, height: 'calc(100vh - 56px)',
    overflowY: 'auto',
  },
  rightCard: {
    background: '#fff', borderRadius: 12, padding: '16px',
    marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  rightCardHeader: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 15, fontWeight: 600, marginBottom: 12,
    paddingBottom: 8, borderBottom: '1px solid #dddfe2',
  },
  quickActionBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 8,
    border: 'none', background: '#f0f2f5', cursor: 'pointer',
    width: '100%', marginBottom: 8, fontSize: 14,
  },
  statusItem: {
    display: 'flex', justifyContent: 'space-between',
    padding: '8px 0', fontSize: 13,
    borderBottom: '1px solid #f0f2f5',
  },
  statusValue: { color: '#65676b' },
  tipsCard: {
    background: KL_BRAND_LIGHT, borderRadius: 12, padding: '16px',
    marginBottom: 16,
  },
  tipsList: { paddingLeft: 20, fontSize: 13, color: '#050505', lineHeight: 1.8 },
  modalHeader: { borderBottom: '1px solid #dddfe2', background: '#fff' },
  modalTitle: { fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center' },
  modalBody: { padding: '20px' },
  modalFooter: { borderTop: '1px solid #dddfe2', padding: '16px 20px' },
  createBtn: { background: KL_BRAND, border: 'none', padding: '8px 20px' },
  emptyState: {
    textAlign: 'center', padding: '60px 20px',
    background: '#fff', borderRadius: 12,
    color: '#65676b',
  },
  loadingWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100vh', background: '#f0f2f5',
  },
  loadingLogo: {
    width: 60, height: 60, borderRadius: '50%', background: KL_BRAND,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 900, fontSize: 24, fontStyle: 'italic',
  },
};

export default AdminDashboard;