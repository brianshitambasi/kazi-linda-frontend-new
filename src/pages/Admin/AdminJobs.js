import React, { useState, useEffect, useCallback } from 'react';
import { Button, Spinner, Modal, Badge, Row, Col } from 'react-bootstrap';
import { 
  FaBriefcase, FaTrash, FaCheckCircle, FaTimesCircle, FaEye, FaSearch,
  FaHome, FaBell, FaFacebookMessenger, FaEllipsisH, FaBuilding,
  FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaFilter
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import ClickableAvatar from '../../components/Common/ClickableAvatar';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import moment from 'moment';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const AdminJobs = () => {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [countries, setCountries] = useState([]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/admin/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
      setFilteredJobs(Array.isArray(data) ? data : []);
      const uniqueCountries = [...new Set((Array.isArray(data) ? data : []).map(j => j.country).filter(Boolean))];
      setCountries(uniqueCountries);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    let filtered = [...jobs];
    if (searchTerm) {
      filtered = filtered.filter(j => 
        j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.employerId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'verified') filtered = filtered.filter(j => j.isVerified);
      if (statusFilter === 'unverified') filtered = filtered.filter(j => !j.isVerified);
      if (statusFilter === 'active') filtered = filtered.filter(j => j.isActive);
      if (statusFilter === 'inactive') filtered = filtered.filter(j => !j.isActive);
    }
    if (countryFilter) {
      filtered = filtered.filter(j => j.country === countryFilter);
    }
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter, countryFilter]);

  const handleDeleteJob = async (jobId) => {
    try {
      const res = await fetch(`https://kazi-linda.onrender.com/api/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Job deleted successfully');
        fetchJobs();
      } else {
        toast.error('Failed to delete job');
      }
    } catch (err) {
      toast.error('Error deleting job');
    } finally {
      setShowDeleteModal(null);
    }
  };

  const handleVerifyJob = async (jobId) => {
    try {
      const res = await fetch(`https://kazi-linda.onrender.com/api/admin/jobs/${jobId}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Job verified successfully');
        fetchJobs();
      } else {
        toast.error('Failed to verify job');
      }
    } catch (err) {
      toast.error('Error verifying job');
    } finally {
      setShowVerifyModal(null);
    }
  };

  const stats = {
    total: jobs.length,
    verified: jobs.filter(j => j.isVerified).length,
    unverified: jobs.filter(j => !j.isVerified).length,
    active: jobs.filter(j => j.isActive).length,
    inactive: jobs.filter(j => !j.isActive).length
  };

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingLogo}>KL</div>
        <Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} />
      </div>
    );
  }

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/admin/jobs' },
  ];

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link to="/" style={styles.logoBox}><span style={styles.logoText}>KL</span></Link>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input style={styles.searchInput} placeholder="Search jobs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div style={styles.navCenter}>
          {navTabs.map(tab => (
            <Link key={tab.id} to={tab.link} style={{ ...styles.navTab, ...(tab.id === 'jobs' ? styles.navTabActive : {}) }}>
              <tab.icon size={24} style={{ color: tab.id === 'jobs' ? KL_BRAND : '#65676b' }} />
              {tab.id === 'jobs' && <div style={styles.navTabLine} />}
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
            <span style={styles.sidebarLinkText}>{user?.name || 'Admin'}</span>
            <Badge bg="warning" style={styles.adminBadge}>Admin</Badge>
          </Link>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarSectionTitle}>Job Moderation</div>
          <button style={styles.sidebarNavItem}><FaBriefcase /> All Jobs ({stats.total})</button>
          <button style={styles.sidebarNavItem}><FaCheckCircle /> Verified ({stats.verified})</button>
          <button style={styles.sidebarNavItem}><FaTimesCircle /> Pending ({stats.unverified})</button>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>Job Moderation Panel<br />© {new Date().getFullYear()} KaziLinda</div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.headerCard}>
            <div style={styles.headerIcon}><FaBriefcase size={32} color={KL_BRAND} /></div>
            <div><h1 style={styles.headerTitle}>Job Moderation</h1><p style={styles.headerDesc}>Review, verify, and manage all job postings</p></div>
          </div>

          <Row className="g-3 mb-4">
            <Col md={3}><div style={styles.statCard}><h3>{stats.total}</h3><p>Total Jobs</p></div></Col>
            <Col md={3}><div style={{ ...styles.statCard, borderBottom: '3px solid #45bd62' }}><h3 style={{ color: '#45bd62' }}>{stats.verified}</h3><p>Verified</p></div></Col>
            <Col md={3}><div style={{ ...styles.statCard, borderBottom: `3px solid ${KL_BRAND}` }}><h3 style={{ color: KL_BRAND }}>{stats.unverified}</h3><p>Pending Verification</p></div></Col>
            <Col md={3}><div style={{ ...styles.statCard, borderBottom: '3px solid #1877f2' }}><h3 style={{ color: '#1877f2' }}>{stats.active}</h3><p>Active Jobs</p></div></Col>
          </Row>

          <div style={styles.filtersBar}>
            <div style={styles.filterGroup}>
              <FaFilter style={styles.filterIcon} />
              <select style={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Jobs</option>
                <option value="verified">Verified</option>
                <option value="unverified">Pending Verification</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <select style={styles.filterSelect} value={countryFilter} onChange={e => setCountryFilter(e.target.value)}>
              <option value="">All Countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <span>Job Listings</span>
              <span style={styles.tableCount}>{filteredJobs.length} jobs</span>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr><th>Job Title</th><th>Employer</th><th>Location</th><th>Salary</th><th>Posted</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredJobs.map(job => (
                    <tr key={job._id}>
                      <td><strong>{job.title}</strong><br /><small style={{ color: '#65676b' }}>{job.description?.substring(0, 60)}...</small></td>
                      <td><div style={styles.employerCell}><FaBuilding size={14} /> {job.employerId?.name || 'Unknown'}</div></td>
                      <td><FaMapMarkerAlt size={12} /> {job.country}</td>
                      <td><FaMoneyBillWave size={12} /> {job.salary} {job.salaryCurrency}</td>
                      <td><FaClock size={12} /> {moment(job.createdAt).format('MMM D, YYYY')}</td>
                      <td>{job.isVerified ? <Badge bg="success">✓ Verified</Badge> : <Badge bg="warning">Pending</Badge>}</td>
                      <td><div style={styles.actionButtons}>
                        <button style={styles.viewBtn} onClick={() => { setSelectedJob(job); setShowJobModal(true); }} title="View"><FaEye /></button>
                        {!job.isVerified && <button style={styles.verifyBtn} onClick={() => setShowVerifyModal(job)} title="Verify"><FaCheckCircle /></button>}
                        <button style={styles.deleteBtn} onClick={() => setShowDeleteModal(job)} title="Delete"><FaTrash /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}><FaBriefcase color={KL_BRAND} /><span>Quick Stats</span></div>
            <div style={styles.quickStat}><span>Average Salary</span><span>${Math.round(jobs.reduce((a,b) => a + (b.salary || 0), 0) / jobs.length || 0)}</span></div>
            <div style={styles.quickStat}><span>Top Country</span><span>{countries[0] || 'N/A'}</span></div>
            <div style={styles.quickStat}><span>Most Active</span><span>{jobs.filter(j => j.isActive).length} jobs</span></div>
          </div>
        </aside>
      </div>

      {/* Job Details Modal */}
      <Modal show={showJobModal} onHide={() => setShowJobModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Job Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <>
              <h4>{selectedJob.title}</h4>
              <Badge bg={selectedJob.isVerified ? 'success' : 'warning'}>{selectedJob.isVerified ? 'Verified' : 'Pending Verification'}</Badge>
              <hr />
              <p><strong>Description:</strong> {selectedJob.description}</p>
              <p><strong>Employer:</strong> {selectedJob.employerId?.name}</p>
              <p><strong>Location:</strong> {selectedJob.country}, {selectedJob.city}</p>
              <p><strong>Salary:</strong> {selectedJob.salary} {selectedJob.salaryCurrency}</p>
              <p><strong>Contract Duration:</strong> {selectedJob.contractDuration} months</p>
              <p><strong>Benefits:</strong> {selectedJob.benefits?.join(', ') || 'None'}</p>
              <p><strong>Requirements:</strong> {selectedJob.requirements?.join(', ') || 'None'}</p>
              <p><strong>Posted:</strong> {moment(selectedJob.createdAt).format('MMMM D, YYYY')}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowJobModal(false)}>Close</Button></Modal.Footer>
      </Modal>

      {/* Verify Modal */}
      <Modal show={!!showVerifyModal} onHide={() => setShowVerifyModal(null)} centered>
        <Modal.Header closeButton><Modal.Title>Verify Job</Modal.Title></Modal.Header>
        <Modal.Body><p>Are you sure you want to verify <strong>{showVerifyModal?.title}</strong>? This will mark the job as verified and trusted.</p></Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowVerifyModal(null)}>Cancel</Button><Button style={{ background: KL_BRAND, border: 'none' }} onClick={() => handleVerifyJob(showVerifyModal._id)}>Verify</Button></Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={!!showDeleteModal} onHide={() => setShowDeleteModal(null)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Job</Modal.Title></Modal.Header>
        <Modal.Body><p>Are you sure you want to delete <strong>{showDeleteModal?.title}</strong>? This action cannot be undone.</p></Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowDeleteModal(null)}>Cancel</Button><Button variant="danger" onClick={() => handleDeleteJob(showDeleteModal._id)}>Delete</Button></Modal.Footer>
      </Modal>
    </div>
  );
};

const styles = {
  page: { background: '#f0f2f5', minHeight: '100vh' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' },
  loadingLogo: { width: 60, height: 60, borderRadius: '50%', background: KL_BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 24 },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: '1px solid #dddfe2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 200 },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 }, navCenter: { display: 'flex', gap: 4 }, navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  logoBox: { width: 40, height: 40, borderRadius: '50%', background: KL_BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  logoText: { color: '#fff', fontWeight: 900, fontSize: 18 }, searchBox: { position: 'relative' }, searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b' },
  searchInput: { background: '#f0f2f5', border: 'none', borderRadius: 20, padding: '8px 16px 8px 36px', fontSize: 15, outline: 'none', width: 240 },
  navTab: { width: 100, height: 48, background: 'transparent', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', textDecoration: 'none' },
  navTabActive: { background: KL_BRAND_LIGHT }, navTabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: KL_BRAND },
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }, navIconInner: { width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: '#e41e3f', color: '#fff', borderRadius: 10, fontSize: 11, padding: '1px 5px' },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1400, margin: '0 auto' }, leftSidebar: { width: 260, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: '#050505' },
  adminBadge: { fontSize: 10, padding: '2px 6px', background: KL_BRAND, color: '#fff' }, sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' },
  sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px' }, sidebarNavItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8, border: 'none', background: 'transparent', width: '100%', fontSize: 14 },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, textAlign: 'center' }, feedCol: { flex: 1, maxWidth: 900, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  headerCard: { background: '#fff', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 },
  headerIcon: { width: 56, height: 56, borderRadius: '50%', background: KL_BRAND_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 700 }, headerDesc: { fontSize: 13, color: '#65676b' },
  statCard: { background: '#fff', borderRadius: 12, padding: '16px', textAlign: 'center' },
  filtersBar: { background: '#fff', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 12 },
  filterGroup: { flex: 1, position: 'relative' }, filterIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b', fontSize: 14 },
  filterSelect: { width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #dddfe2', borderRadius: 8, fontSize: 14, background: '#fff' },
  tableCard: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,.2)' },
  tableHeader: { padding: '14px 16px', borderBottom: '1px solid #dddfe2', display: 'flex', justifyContent: 'space-between', fontWeight: 600 },
  tableCount: { fontSize: 13, fontWeight: 400, color: '#65676b' }, tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', '& th, & td': { padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #f0f2f5' } },
  employerCell: { display: 'flex', alignItems: 'center', gap: 6 }, actionButtons: { display: 'flex', gap: 8 },
  viewBtn: { background: '#e4e6eb', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#1877f2' },
  verifyBtn: { background: '#e4e6eb', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#45bd62' },
  deleteBtn: { background: '#e4e6eb', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#e41e3f' },
  rightSidebar: { width: 300, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16 },
  rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #dddfe2' },
  quickStat: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, borderBottom: '1px solid #f0f2f5' },
};

export default AdminJobs;
