import React, { useState, useEffect, useCallback } from 'react';
import { Button, Spinner, Modal, Form, Badge } from 'react-bootstrap';
import { 
  FaUsers, FaBriefcase, FaBan, FaTrash, FaEdit, FaUserPlus, 
  FaSearch, FaHome, FaBell, FaFacebookMessenger, FaEllipsisH,
  FaUserShield, FaChartLine, FaExclamationTriangle, FaCheckCircle, FaClock, FaLeaf
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import Logo from '../components/Common/Logo';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Eco-friendly color palette
const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  accent: '#81C784',
  warning: '#FFC107',
  danger: '#F44336',
  dark: '#1B5E20',
  light: '#E8F5E9',
  gradient: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)',
  gradientLight: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
  text: '#1B5E20',
  border: '#A5D6A7'
};

const KL_BRAND = colors.primary;

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [blacklistData, setBlacklistData] = useState({ employerName: '', country: '', reason: '', category: 'fraud' });
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', password: '', role: 'worker', status: 'active' });
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
      const blacklistDataRes = blacklistRes.ok ? await blacklistRes.json() : [];
      
      setStats(prev => ({ 
        ...prev,
        totalUsers: usersData.length, 
        totalJobs: jobsData.length, 
        blacklisted: blacklistDataRes.length 
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

  const handleAddToBlacklist = async () => {
    if (!blacklistData.employerName || !blacklistData.country || !blacklistData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const response = await fetch('https://kazi-linda.onrender.com/api/admin/blacklist', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(blacklistData)
      });
      if (response.ok) {
        toast.success('Employer added to blacklist');
        setShowBlacklistModal(false);
        setBlacklistData({ employerName: '', country: '', reason: '', category: 'fraud' });
        fetchData();
      } else {
        toast.error('Failed to add to blacklist');
      }
    } catch (err) {
      toast.error('Error adding to blacklist');
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

  const handleNavigateToBlacklist = () => navigate('/blacklist');
  const handleNavigateToReports = () => navigate('/admin/reports');
  const handleNavigateToAnalytics = () => navigate('/admin/analytics');
  const handleNavigateToActivityLog = () => navigate('/admin/activity-log');
  const handleNavigateToJobModeration = () => navigate('/admin/jobs');

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'admin', icon: FaUserShield, label: 'Admin', link: '/admin' },
    { id: 'users', icon: FaUsers, label: 'Users', link: '/admin' },
    { id: 'reports', icon: FaExclamationTriangle, label: 'Reports', link: '/admin/reports' },
  ];

  const leftLinks = [
    { icon: FaUsers, label: 'User Management', count: stats.totalUsers, color: colors.primary, active: true, onClick: () => {} },
    { icon: FaBriefcase, label: 'Job Moderation', count: stats.totalJobs, color: colors.secondary, onClick: handleNavigateToJobModeration },
    { icon: FaBan, label: 'Blacklist', count: stats.blacklisted, color: colors.danger, onClick: handleNavigateToBlacklist },
    { icon: FaExclamationTriangle, label: 'Reports', count: stats.pendingReports, color: colors.warning, onClick: handleNavigateToReports },
    { icon: FaChartLine, label: 'Analytics', color: colors.primary, onClick: handleNavigateToAnalytics },
    { icon: FaClock, label: 'Activity Log', color: colors.accent, onClick: handleNavigateToActivityLog },
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
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Logo size={36} variant="minimal" />
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input style={styles.searchInput} placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div style={styles.navCenter}>
          {navTabs.map(tab => (
            <Link key={tab.id} to={tab.link} style={{ ...styles.navTab, ...(activeNav === tab.id ? styles.navTabActive : {}) }} onClick={() => setActiveNav(tab.id)}>
              <tab.icon size={24} style={{ color: activeNav === tab.id ? KL_BRAND : '#65676b' }} />
              {activeNav === tab.id && <div style={styles.navTabLine} />}
            </Link>
          ))}
        </div>
        <div style={styles.navRight}>
          <button style={styles.navIconBtn}><div style={styles.navIconInner}><FaEllipsisH size={18} /></div></button>
          <button style={styles.navIconBtn}><div style={styles.navIconInner}><FaFacebookMessenger size={18} /></div></button>
          <button style={styles.navIconBtn}><div style={styles.navIconInner}><FaBell size={18} /></div><span style={styles.badge}>3</span></button>
          <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={40} />
        </div>
      </nav>

      <div style={styles.body}>
        <aside style={styles.leftSidebar}>
          <Link to={`/profile/${user?._id}`} style={styles.sidebarProfileLink}>
            <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={36} />
            <span style={styles.sidebarLinkText}>{user?.name || 'Admin User'}</span>
            <Badge style={{ background: colors.gradient, border: 'none' }}>Admin</Badge>
          </Link>

          {leftLinks.map(({ icon: Icon, label, count, color, active, onClick }) => (
            <button key={label} style={{ ...styles.sidebarNavItem, ...(active ? styles.sidebarNavItemActive : {}) }} onClick={onClick}>
              <span style={{ ...styles.sidebarIconWrap, background: color + '22' }}><Icon size={18} color={color} /></span>
              <span style={styles.sidebarLinkText}>{label}</span>
              {count !== undefined && count > 0 && <span style={{ ...styles.sidebarCount, background: color + '22', color }}>{count}</span>}
            </button>
          ))}

          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarSectionTitle}>Admin Tools</div>
          <button style={styles.adminToolBtn} onClick={() => setShowUserModal(true)}><FaUserPlus /> Create User</button>
          <button style={styles.adminToolBtn} onClick={() => setShowBlacklistModal(true)}><FaBan /> Manage Blacklist</button>
          <button style={styles.adminToolBtn} onClick={handleNavigateToJobModeration}><FaBriefcase /> Review Jobs</button>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}><FaLeaf /> Admin Access Only · Secure Zone<br />© {new Date().getFullYear()} KaziLinda</div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.headerCard}>
            <div style={styles.headerIcon}><FaUserShield size={32} color={KL_BRAND} /></div>
            <div><h1 style={styles.headerTitle}>Admin Dashboard</h1><p style={styles.headerDesc}>Manage users, moderate jobs, and oversee platform safety</p></div>
            <Button style={styles.addUserBtn} onClick={() => setShowUserModal(true)}><FaUserPlus /> Add User</Button>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard} onClick={() => {}}><div style={{ ...styles.statIcon, background: colors.primary + '22' }}><FaUsers size={24} color={colors.primary} /></div><div><h3 style={styles.statNumber}>{stats.totalUsers}</h3><p style={styles.statLabel}>Total Users</p></div></div>
            <div style={styles.statCard} onClick={handleNavigateToJobModeration}><div style={{ ...styles.statIcon, background: colors.secondary + '22' }}><FaBriefcase size={24} color={colors.secondary} /></div><div><h3 style={styles.statNumber}>{stats.totalJobs}</h3><p style={styles.statLabel}>Total Jobs</p></div></div>
            <div style={styles.statCard} onClick={handleNavigateToBlacklist}><div style={{ ...styles.statIcon, background: colors.danger + '22' }}><FaBan size={24} color={colors.danger} /></div><div><h3 style={styles.statNumber}>{stats.blacklisted}</h3><p style={styles.statLabel}>Blacklisted</p></div></div>
            <div style={styles.statCard} onClick={handleNavigateToReports}><div style={{ ...styles.statIcon, background: colors.warning + '22' }}><FaExclamationTriangle size={24} color={colors.warning} /></div><div><h3 style={styles.statNumber}>{stats.pendingReports}</h3><p style={styles.statLabel}>Pending Reports</p></div></div>
          </div>

          <div style={styles.filtersBar}>
            <div style={styles.filterGroup}><FaSearch style={styles.filterIcon} /><input type="text" style={styles.filterInput} placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <select style={styles.filterSelect} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}><option value="">All Roles</option><option value="worker">Workers</option><option value="employer">Employers</option><option value="admin">Admins</option></select>
            <select style={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select>
          </div>

          <div style={styles.tableCard}>
            <div style={styles.tableHeader}><span>User Management</span><span style={styles.tableCount}>{filteredUsers.length} users</span></div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead><tr><th style={styles.tableTh}>User</th><th style={styles.tableTh}>Contact</th><th style={styles.tableTh}>Role</th><th style={styles.tableTh}>Status</th><th style={styles.tableTh}>Actions</th></tr></thead>
                <tbody>
                  {paginatedUsers.map(u => (
                    <tr key={u._id}>
                      <td style={styles.tableTd}><div style={styles.userCell}><ClickableAvatar userId={u._id} src={u.profilePicture} size={36} /><span style={styles.userName}>{u.name}</span></div></td>
                      <td style={styles.tableTd}><div style={styles.contactCell}><div><small>{u.email}</small></div><div><small style={styles.phoneText}>{u.phone || 'No phone'}</small></div></div></td>
                      <td style={styles.tableTd}><Badge style={{ background: u.role === 'admin' ? colors.warning : u.role === 'employer' ? colors.primary : colors.accent }}>{u.role}</Badge></td>
                      <td style={styles.tableTd}><Badge bg={u.status === 'active' ? 'success' : u.status === 'inactive' ? 'danger' : 'secondary'}>{u.status}</Badge></td>
                      <td style={styles.tableTd}><div style={styles.actionButtons}><button style={styles.editBtn}><FaEdit size={14} /></button><button style={styles.deleteBtn} onClick={() => setShowDeleteConfirm(u._id)}><FaTrash size={14} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button style={{ ...styles.pageBtn, ...(currentPage === 1 && styles.pageBtnDisabled) }} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>Previous</button>
                <div style={styles.pageNumbers}>{[...Array(totalPages)].map((_, i) => (<button key={i+1} style={{ ...styles.pageNumber, ...(currentPage === i+1 ? styles.pageNumberActive : {}) }} onClick={() => setCurrentPage(i+1)}>{i+1}</button>))}</div>
                <button style={{ ...styles.pageBtn, ...(currentPage === totalPages && styles.pageBtnDisabled) }} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Next</button>
              </div>
            )}
          </div>
          {filteredUsers.length === 0 && <div style={styles.emptyState}><FaUsers size={48} color={KL_BRAND} /><h4>No users found</h4><p>Try adjusting your search or filters</p></div>}
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}><div style={styles.rightCardHeader}><FaUserShield color={KL_BRAND} /><span>Quick Actions</span></div>
            <button style={styles.quickActionBtn} onClick={() => setShowUserModal(true)}><FaUserPlus /> Add New User</button>
            <button style={styles.quickActionBtn} onClick={() => setShowBlacklistModal(true)}><FaBan /> Add to Blacklist</button>
            <button style={styles.quickActionBtn} onClick={handleNavigateToJobModeration}><FaBriefcase /> Moderate Jobs</button>
          </div>
          <div style={styles.rightCard}><div style={styles.rightCardHeader}><FaCheckCircle color={colors.secondary} /><span>System Status</span></div>
            <div style={styles.statusItem}><span>API</span><Badge bg="success">Operational</Badge></div>
            <div style={styles.statusItem}><span>Database</span><Badge bg="success">Connected</Badge></div>
            <div style={styles.statusItem}><span>Last Sync</span><span style={styles.statusValue}>Just now</span></div>
          </div>
          <div style={styles.tipsCard}><h4 style={{ color: colors.text }}>Admin Tips</h4><ul style={styles.tipsList}><li>✓ Verify employers before approval</li><li>✓ Review reported content daily</li><li>✓ Update blacklist regularly</li><li>✓ Monitor user activity</li></ul></div>
          <div style={styles.sidebarFooter}>Admin Dashboard v1.0<br />© {new Date().getFullYear()} KaziLinda</div>
        </aside>
      </div>

      {/* Modals */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered size="lg">
        <Modal.Header closeButton style={styles.modalHeader}><Modal.Title style={styles.modalTitle}><FaUserPlus className="me-2" style={{ color: colors.primary }} /> Add New User</Modal.Title></Modal.Header>
        <Modal.Body style={styles.modalBody}>
          <Form>
            <Form.Group className="mb-3"><Form.Label>Full Name *</Form.Label><Form.Control value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} placeholder="Enter full name" style={{ borderRadius: 10, borderColor: colors.border }} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Email *</Form.Label><Form.Control type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} placeholder="Enter email address" style={{ borderRadius: 10, borderColor: colors.border }} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Phone</Form.Label><Form.Control value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} placeholder="Enter phone number" style={{ borderRadius: 10, borderColor: colors.border }} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Role</Form.Label><Form.Select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} style={{ borderRadius: 10, borderColor: colors.border }}><option value="worker">Worker</option><option value="employer">Employer</option><option value="admin">Admin</option></Form.Select></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Status</Form.Label><Form.Select value={userForm.status} onChange={e => setUserForm({...userForm, status: e.target.value})} style={{ borderRadius: 10, borderColor: colors.border }}><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></Form.Select></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Password *</Form.Label><Form.Control type="password" onChange={e => setUserForm({...userForm, password: e.target.value})} placeholder="Enter password" style={{ borderRadius: 10, borderColor: colors.border }} /></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}><Button variant="secondary" onClick={() => setShowUserModal(false)}>Cancel</Button><Button style={{ background: colors.gradient, border: 'none', borderRadius: 30 }} onClick={handleCreateUser}>Create User</Button></Modal.Footer>
      </Modal>

      <Modal show={showBlacklistModal} onHide={() => setShowBlacklistModal(false)} centered>
        <Modal.Header closeButton style={styles.modalHeader}><Modal.Title style={styles.modalTitle}><FaBan className="me-2" style={{ color: colors.danger }} /> Add to Blacklist</Modal.Title></Modal.Header>
        <Modal.Body style={styles.modalBody}>
          <Form>
            <Form.Group className="mb-3"><Form.Label>Employer Name *</Form.Label><Form.Control value={blacklistData.employerName} onChange={e => setBlacklistData({...blacklistData, employerName: e.target.value})} placeholder="Enter employer name" style={{ borderRadius: 10, borderColor: colors.border }} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Country *</Form.Label><Form.Control value={blacklistData.country} onChange={e => setBlacklistData({...blacklistData, country: e.target.value})} placeholder="Enter country" style={{ borderRadius: 10, borderColor: colors.border }} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Reason *</Form.Label><Form.Control as="textarea" rows={3} value={blacklistData.reason} onChange={e => setBlacklistData({...blacklistData, reason: e.target.value})} placeholder="Reason for blacklisting" style={{ borderRadius: 10, borderColor: colors.border }} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Category</Form.Label><Form.Select value={blacklistData.category} onChange={e => setBlacklistData({...blacklistData, category: e.target.value})} style={{ borderRadius: 10, borderColor: colors.border }}><option value="wage_theft">Wage Theft</option><option value="abuse">Physical Abuse</option><option value="document_theft">Document Theft</option><option value="fraud">Fraud</option></Form.Select></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}><Button variant="secondary" onClick={() => setShowBlacklistModal(false)}>Cancel</Button><Button style={{ background: colors.gradient, border: 'none', borderRadius: 30 }} onClick={handleAddToBlacklist}>Add to Blacklist</Button></Modal.Footer>
      </Modal>

      <Modal show={!!showDeleteConfirm} onHide={() => setShowDeleteConfirm(null)} centered>
        <Modal.Header closeButton style={styles.modalHeader}><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body><p>Are you sure you want to delete this user? This action cannot be undone.</p></Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button><Button variant="danger" onClick={() => handleDeleteUser(showDeleteConfirm)}>Delete</Button></Modal.Footer>
      </Modal>
    </div>
  );
};

const styles = {
  page: { background: colors.gradientLight, minHeight: '100vh' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: colors.gradientLight },
  loadingLogo: { width: 60, height: 60, borderRadius: '50%', background: colors.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 24 },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 200 },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 }, navCenter: { display: 'flex', gap: 4 }, navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  searchBox: { position: 'relative' }, searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b', fontSize: 14 },
  searchInput: { background: colors.light, border: 'none', borderRadius: 20, padding: '8px 16px 8px 36px', fontSize: 15, outline: 'none', width: 240 },
  navTab: { width: 100, height: 48, background: 'transparent', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', textDecoration: 'none' },
  navTabActive: { background: colors.light }, navTabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: colors.primary, borderRadius: '2px 2px 0 0' },
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }, navIconInner: { width: 40, height: 40, borderRadius: '50%', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: colors.danger, color: '#fff', borderRadius: 10, fontSize: 11, padding: '1px 5px' },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1440, margin: '0 auto' },
  leftSidebar: { width: 280, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: colors.text, fontWeight: 500, fontSize: 15, marginBottom: 8 },
  sidebarNavItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 500, fontSize: 14, color: colors.text },
  sidebarLinkText: { fontSize: 14, fontWeight: 500, color: colors.text, flex: 1 },
  sidebarCount: { fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 12, minWidth: 24, textAlign: 'center' },
  sidebarDivider: { borderTop: `1px solid ${colors.border}`, margin: '12px 0' }, sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px', marginBottom: 4 },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, lineHeight: 1.6, textAlign: 'center' },
  adminToolBtn: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', width: '100%', fontSize: 14, color: colors.text },
  feedCol: { flex: 1, maxWidth: 800, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  headerCard: { background: '#fff', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, border: `1px solid ${colors.border}` },
  headerTitle: { fontSize: 22, fontWeight: 700, color: colors.text }, headerDesc: { fontSize: 13, color: '#65676b' },
  addUserBtn: { marginLeft: 'auto', background: colors.gradient, border: 'none', borderRadius: 30, padding: '8px 20px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, color: '#fff' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 },
  statCard: { background: '#fff', borderRadius: 12, padding: '16px', display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${colors.border}`, cursor: 'pointer' },
  statIcon: { width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statNumber: { fontSize: 24, fontWeight: 700, color: colors.text }, statLabel: { fontSize: 13, color: '#65676b' },
  filtersBar: { background: '#fff', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 12, border: `1px solid ${colors.border}` },
  filterGroup: { flex: 2, position: 'relative' }, filterIcon: { position: 'absolute', left: 12, color: '#65676b', fontSize: 14 },
  filterInput: { width: '100%', padding: '8px 12px 8px 36px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, outline: 'none' },
  filterSelect: { flex: 1, padding: '8px 12px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, background: '#fff' },
  tableCard: { background: '#fff', borderRadius: 12, overflow: 'hidden', border: `1px solid ${colors.border}` },
  tableHeader: { padding: '14px 16px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: 15, color: colors.text },
  tableCount: { fontSize: 13, fontWeight: 400, color: '#65676b' }, tableContainer: { overflowX: 'auto' }, table: { width: '100%', borderCollapse: 'collapse' },
  tableTh: { textAlign: 'left', padding: '12px 16px', background: colors.light, borderBottom: `1px solid ${colors.border}`, fontSize: 13, fontWeight: 600, color: colors.text },
  tableTd: { padding: '12px 16px', borderBottom: `1px solid ${colors.light}`, fontSize: 14 },
  userCell: { display: 'flex', alignItems: 'center', gap: 10 }, userName: { fontWeight: 500, color: colors.text }, contactCell: { lineHeight: 1.4 }, phoneText: { color: '#65676b' },
  actionButtons: { display: 'flex', gap: 8 }, editBtn: { background: colors.light, border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: colors.primary },
  deleteBtn: { background: colors.light, border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: colors.danger },
  pagination: { padding: '16px', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 },
  pageBtn: { padding: '6px 12px', borderRadius: 6, border: `1px solid ${colors.border}`, background: '#fff', cursor: 'pointer', fontSize: 13 },
  pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' }, pageNumbers: { display: 'flex', gap: 6 },
  pageNumber: { width: 32, height: 32, borderRadius: 6, border: `1px solid ${colors.border}`, background: '#fff', cursor: 'pointer', fontSize: 13 },
  pageNumberActive: { background: colors.gradient, color: '#fff', borderColor: colors.primary },
  rightSidebar: { width: 300, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16, border: `1px solid ${colors.border}` },
  rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${colors.border}`, color: colors.text },
  quickActionBtn: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: colors.light, cursor: 'pointer', width: '100%', marginBottom: 8, fontSize: 14, color: colors.text },
  statusItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, borderBottom: `1px solid ${colors.light}` }, statusValue: { color: colors.text },
  tipsCard: { background: colors.light, borderRadius: 12, padding: '16px', marginBottom: 16, border: `1px solid ${colors.accent}` }, tipsList: { paddingLeft: 20, fontSize: 13, color: colors.text, lineHeight: 1.8 },
  modalHeader: { borderBottom: `1px solid ${colors.border}` }, modalTitle: { fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', color: colors.text },
  modalBody: { padding: '20px' }, modalFooter: { borderTop: `1px solid ${colors.border}`, padding: '16px 20px' },
  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, color: '#65676b' },
};

export default AdminDashboard;
