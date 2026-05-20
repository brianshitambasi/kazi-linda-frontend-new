import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Table, Badge, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { 
  FaCheck, FaTimes, FaEye, FaHome, FaSearch, FaBell, 
  FaFacebookMessenger, FaEllipsisH, FaBriefcase, FaShieldAlt, 
  FaUsers, FaUserCheck, FaClock, FaEnvelope, FaLeaf
} from 'react-icons/fa';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import toast from 'react-hot-toast';
import Logo from '../components/Common/Logo';

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
  textLight: '#fff',
  border: '#A5D6A7'
};

const KL_BRAND = colors.primary;

const EmployerApplications = () => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [activeNav, setActiveNav] = useState('applications');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/employers/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, status) => {
    try {
      await fetch(`https://kazi-linda.onrender.com/api/employers/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, feedback })
      });
      toast.success(`Application ${status}`);
      fetchApplications();
      setShowModal(false);
      setFeedback('');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'accepted': return <Badge bg="success" className="px-3 py-2 rounded-pill">✅ Accepted</Badge>;
      case 'rejected': return <Badge bg="danger" className="px-3 py-2 rounded-pill">❌ Rejected</Badge>;
      case 'reviewing': return <Badge bg="info" className="px-3 py-2 rounded-pill">��� Reviewing</Badge>;
      default: return <Badge bg="warning" className="px-3 py-2 rounded-pill">⏳ Pending</Badge>;
    }
  };

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/employer/dashboard' },
    { id: 'applications', icon: FaUsers, label: 'Applications', link: '/employer/applications' },
    { id: 'verify', icon: FaShieldAlt, label: 'Verify', link: '/verify' },
  ];

  const pendingCount = applications.filter(a => a.status === 'pending' || a.status === 'reviewing').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  if (loading) return <div style={styles.loadingWrap}><div style={styles.loadingLogo}>KL</div><Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} /></div>;

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Logo size={36} />
          <div style={styles.searchBox}><FaSearch style={styles.searchIcon} /><input style={styles.searchInput} placeholder="Search applications..." /></div>
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
            <span>{user?.name}</span>
          </Link>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarSectionTitle}>Applications Summary</div>
          <div style={styles.statsSummary}>
            <div><span style={styles.statValue}>{applications.length}</span><span>Total</span></div>
            <div><span style={{ ...styles.statValue, color: colors.warning }}>{pendingCount}</span><span>Pending</span></div>
            <div><span style={{ ...styles.statValue, color: colors.secondary }}>{acceptedCount}</span><span>Accepted</span></div>
            <div><span style={{ ...styles.statValue, color: colors.danger }}>{rejectedCount}</span><span>Rejected</span></div>
          </div>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}><FaLeaf /> Review applications carefully<br />© {new Date().getFullYear()} KaziLinda</div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.headerCard}>
            <div style={styles.headerIcon}><FaUsers size={32} color={KL_BRAND} /></div>
            <div><h1 style={styles.headerTitle}>Job Applications</h1><p style={styles.headerDesc}>Review and manage applications from workers</p></div>
          </div>

          <div style={styles.statsRow}>
            <div style={styles.statCardSmall}><div style={styles.statNumberSmall}>{applications.length}</div><div>Total</div></div>
            <div style={styles.statCardSmall}><div style={{ ...styles.statNumberSmall, color: colors.warning }}>{pendingCount}</div><div>Pending</div></div>
            <div style={styles.statCardSmall}><div style={{ ...styles.statNumberSmall, color: colors.secondary }}>{acceptedCount}</div><div>Accepted</div></div>
            <div style={styles.statCardSmall}><div style={{ ...styles.statNumberSmall, color: colors.danger }}>{rejectedCount}</div><div>Rejected</div></div>
          </div>

          <div style={styles.tableCard}>
            {applications.length === 0 ? (
              <div style={styles.emptyState}><FaUsers size={48} color={KL_BRAND} /><p>No applications received yet</p><p style={styles.emptySubtext}>When workers apply to your jobs, they'll appear here</p></div>
            ) : (
              <div className="table-responsive">
                <table style={styles.table}>
                  <thead className="bg-light">
                    <tr>
                      <th>Worker</th>
                      <th>Job Title</th>
                      <th>Skills</th>
                      <th>Applied On</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app._id}>
                        <td><div style={styles.workerCell}><ClickableAvatar userId={app.workerId?._id} src={app.workerId?.profilePicture} size={36} /><div><strong>{app.workerId?.name}</strong><br /><small>{app.workerId?.email}</small></div></div></td>
                        <td><div><strong>{app.jobId?.title}</strong><br /><small>{app.jobId?.country}</small></div></td>
                        <td><div style={styles.skillsContainer}>{app.workerId?.skills?.slice(0, 3).map((s, i) => (<Badge key={i} bg="light" text="dark" className="me-1 rounded-pill">{s}</Badge>))}</div></td>
                        <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                        <td>{getStatusBadge(app.status)}</td>
                        <td><Button size="sm" variant="outline-primary" onClick={() => { setSelectedApp(app); setShowModal(true); }}><FaEye /> Review</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}><FaUserCheck color={KL_BRAND} /><span>Review Tips</span></div>
            <ul style={styles.tipsList}>
              <li>✓ Check worker's skills match job requirements</li>
              <li>✓ Review their experience carefully</li>
              <li>✓ Provide constructive feedback</li>
              <li>✓ Respond within 5-7 business days</li>
            </ul>
          </div>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}><FaClock color={KL_BRAND} /><span>Response Time</span></div>
            <p style={{ fontSize: 13 }}>Employers who respond quickly have a 40% higher chance of finding quality workers.</p>
          </div>
          <div style={styles.helpCard}>
            <h4><FaLeaf /> Need Help?</h4>
            <p>Contact support for assistance with reviewing applications</p>
            <Button style={styles.helpBtn}>Contact Support</Button>
          </div>
        </aside>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: colors.gradient, color: '#fff', borderBottom: 'none' }}>
          <Modal.Title style={styles.modalTitle}>Review Application</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: colors.light }}>
          {selectedApp && (
            <>
              <div style={styles.modalUserInfo}>
                <ClickableAvatar userId={selectedApp.workerId?._id} src={selectedApp.workerId?.profilePicture} size={60} />
                <div><h4 style={{ color: colors.text }}>{selectedApp.workerId?.name}</h4><p><FaEnvelope /> {selectedApp.workerId?.email}</p></div>
              </div>
              <div style={styles.modalSection}><strong>Skills:</strong> <div>{selectedApp.workerId?.skills?.map((s, i) => (<Badge key={i} bg="secondary" className="me-1 rounded-pill">{s}</Badge>))}</div></div>
              <div style={styles.modalSection}><strong>Experience:</strong> <p className="text-muted">{selectedApp.workerId?.experience || 'Not provided'}</p></div>
              <div style={styles.modalSection}><strong>Job Applied For:</strong> <p className="fw-semibold">{selectedApp.jobId?.title} - {selectedApp.jobId?.country}</p></div>
              <hr />
              <Form.Group><Form.Label>Feedback (optional)</Form.Label><Form.Control as="textarea" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Add feedback for the applicant..." style={{ borderRadius: 12 }} /></Form.Group>
              <div style={styles.modalActions}>
                <Button variant="success" onClick={() => updateStatus(selectedApp._id, 'accepted')}><FaCheck /> Accept</Button>
                <Button variant="danger" onClick={() => updateStatus(selectedApp._id, 'rejected')}><FaTimes /> Reject</Button>
              </div>
            </>
          )}
        </Modal.Body>
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
  logoBox: { width: 40, height: 40, borderRadius: '50%', background: colors.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  logoText: { color: '#fff', fontWeight: 900, fontSize: 18 }, searchBox: { position: 'relative' }, searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b' },
  searchInput: { background: colors.light, border: 'none', borderRadius: 20, padding: '8px 16px 8px 36px', fontSize: 15, outline: 'none', width: 240 },
  navTab: { width: 100, height: 48, background: 'transparent', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', textDecoration: 'none' },
  navTabActive: { background: colors.light }, navTabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: colors.primary, borderRadius: '2px 2px 0 0' },
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' },
  navIconInner: { width: 40, height: 40, borderRadius: '50%', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: colors.danger, color: '#fff', borderRadius: 10, fontSize: 11, padding: '1px 5px' },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1400, margin: '0 auto' },
  leftSidebar: { width: 260, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: colors.text },
  sidebarDivider: { borderTop: `1px solid ${colors.border}`, margin: '12px 0' }, sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px' },
  statsSummary: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, padding: '8px', textAlign: 'center' },
  statValue: { fontSize: 24, fontWeight: 700, color: colors.primary, display: 'block' },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, textAlign: 'center' },
  feedCol: { flex: 1, maxWidth: 800, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  headerCard: { background: '#fff', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, border: `1px solid ${colors.border}` },
  headerIcon: { width: 56, height: 56, borderRadius: '50%', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 700, color: colors.text }, headerDesc: { fontSize: 13, color: '#65676b' },
  statsRow: { display: 'flex', gap: 12, marginBottom: 16 },
  statCardSmall: { background: '#fff', borderRadius: 10, padding: '12px', textAlign: 'center', flex: 1, border: `1px solid ${colors.border}` },
  statNumberSmall: { fontSize: 20, fontWeight: 700, color: colors.primary },
  tableCard: { background: '#fff', borderRadius: 12, overflow: 'auto', padding: '16px', border: `1px solid ${colors.border}` },
  table: { width: '100%', borderCollapse: 'collapse' },
  workerCell: { display: 'flex', alignItems: 'center', gap: 10 },
  skillsContainer: { display: 'flex', flexWrap: 'wrap', gap: 4 },
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#65676b' }, emptySubtext: { fontSize: 13, marginTop: 8 },
  rightSidebar: { width: 300, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16, border: `1px solid ${colors.border}` },
  rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${colors.border}` },
  tipsList: { listStyle: 'none', padding: 0, margin: 0, fontSize: 13, lineHeight: 2 },
  helpCard: { background: colors.light, borderRadius: 12, padding: '16px', textAlign: 'center' }, helpBtn: { background: colors.gradient, border: 'none', borderRadius: 6, padding: '8px 16px', width: '100%', marginTop: 12, color: '#fff' },
  modalHeader: { borderBottom: `1px solid ${colors.border}` }, modalTitle: { fontSize: 18, fontWeight: 600 }, modalBody: { padding: '20px' },
  modalUserInfo: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }, modalSection: { marginBottom: 16 }, modalActions: { display: 'flex', gap: 12, marginTop: 20 },
};

export default EmployerApplications;
