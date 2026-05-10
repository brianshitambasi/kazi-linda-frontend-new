import React, { useState, useEffect, useCallback } from 'react';
import { Button, Spinner, Modal, Form, Badge, Row, Col } from 'react-bootstrap';
import { 
  FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaEye, FaSearch,
  FaHome, FaBell, FaFacebookMessenger, FaEllipsisH, FaBuilding,
  FaUser, FaClock, FaFlag, FaFilter
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import ClickableAvatar from '../../components/Common/ClickableAvatar';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import moment from 'moment';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const AdminReports = () => {
  const { user, token } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [resolution, setResolution] = useState('');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/admin/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
      setFilteredReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    let filtered = [...reports];
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.employerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.complaint?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter]);

  const handleResolveReport = async (reportId) => {
    try {
      const res = await fetch(`https://kazi-linda.onrender.com/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved', resolution })
      });
      if (res.ok) {
        toast.success('Report resolved');
        fetchReports();
        setShowReportModal(false);
        setResolution('');
      } else {
        toast.error('Failed to resolve report');
      }
    } catch (err) {
      toast.error('Error resolving report');
    }
  };

  const handleRejectReport = async (reportId) => {
    try {
      const res = await fetch(`https://kazi-linda.onrender.com/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', resolution })
      });
      if (res.ok) {
        toast.success('Report rejected');
        fetchReports();
        setShowReportModal(false);
        setResolution('');
      } else {
        toast.error('Failed to reject report');
      }
    } catch (err) {
      toast.error('Error rejecting report');
    }
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    rejected: reports.filter(r => r.status === 'rejected').length
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'resolved': return <Badge bg="success">✓ Resolved</Badge>;
      case 'rejected': return <Badge bg="danger">✗ Rejected</Badge>;
      default: return <Badge bg="warning">⏳ Pending</Badge>;
    }
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
    { id: 'reports', icon: FaExclamationTriangle, label: 'Reports', link: '/admin/reports' },
  ];

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link to="/" style={styles.logoBox}><span style={styles.logoText}>KL</span></Link>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input style={styles.searchInput} placeholder="Search reports..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div style={styles.navCenter}>
          {navTabs.map(tab => (
            <Link key={tab.id} to={tab.link} style={{ ...styles.navTab, ...(tab.id === 'reports' ? styles.navTabActive : {}) }}>
              <tab.icon size={24} style={{ color: tab.id === 'reports' ? KL_BRAND : '#65676b' }} />
              {tab.id === 'reports' && <div style={styles.navTabLine} />}
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
          <div style={styles.sidebarSectionTitle}>Reports</div>
          <button style={styles.sidebarNavItem}><FaExclamationTriangle /> All Reports ({stats.total})</button>
          <button style={styles.sidebarNavItem}><FaClock /> Pending ({stats.pending})</button>
          <button style={styles.sidebarNavItem}><FaCheckCircle /> Resolved ({stats.resolved})</button>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>Report Moderation<br />© {new Date().getFullYear()} KaziLinda</div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.headerCard}>
            <div style={styles.headerIcon}><FaExclamationTriangle size={32} color={KL_BRAND} /></div>
            <div><h1 style={styles.headerTitle}>Reports Management</h1><p style={styles.headerDesc}>Review and resolve user complaints about employers</p></div>
          </div>

          <Row className="g-3 mb-4">
            <Col md={3}><div style={styles.statCard}><h3>{stats.total}</h3><p>Total Reports</p></div></Col>
            <Col md={3}><div style={{ ...styles.statCard, borderBottom: '3px solid #f7b928' }}><h3 style={{ color: '#f7b928' }}>{stats.pending}</h3><p>Pending Review</p></div></Col>
            <Col md={3}><div style={{ ...styles.statCard, borderBottom: '3px solid #45bd62' }}><h3 style={{ color: '#45bd62' }}>{stats.resolved}</h3><p>Resolved</p></div></Col>
            <Col md={3}><div style={{ ...styles.statCard, borderBottom: '3px solid #e41e3f' }}><h3 style={{ color: '#e41e3f' }}>{stats.rejected}</h3><p>Rejected</p></div></Col>
          </Row>

          <div style={styles.filtersBar}>
            <div style={styles.filterGroup}>
              <FaFilter style={styles.filterIcon} />
              <select style={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Reports</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <span>Reports List</span>
              <span style={styles.tableCount}>{filteredReports.length} reports</span>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr><th>Employer</th><th>Complaint</th><th>Reported By</th><th>Date</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {filteredReports.map(report => (
                    <tr key={report._id}>
                      <td><div style={styles.employerCell}><FaBuilding size={14} /> {report.employerName}</div></td>
                      <td><div style={styles.complaintCell}>{report.complaint?.substring(0, 80)}...</div></td>
                      <td><div style={styles.userCell}><FaUser size={12} /> {report.reportedBy?.name || 'Anonymous'}</div></td>
                      <td><FaClock size={12} /> {moment(report.date).format('MMM D, YYYY')}</td>
                      <td>{getStatusBadge(report.status)}</td>
                      <td><button style={styles.viewBtn} onClick={() => { setSelectedReport(report); setShowReportModal(true); }}><FaEye /> Review</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}><FaFlag color={KL_BRAND} /><span>Report Guidelines</span></div>
            <ul style={styles.guidelinesList}>
              <li>✓ Investigate complaints thoroughly</li>
              <li>✓ Contact both parties if needed</li>
              <li>✓ Take action against violating employers</li>
              <li>✓ Update blacklist accordingly</li>
            </ul>
          </div>
        </aside>
      </div>

      <Modal show={showReportModal} onHide={() => setShowReportModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Review Report</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedReport && (
            <>
              <h5>Employer: {selectedReport.employerName}</h5>
              <hr />
              <p><strong>Complaint:</strong></p>
              <div style={styles.complaintBox}>{selectedReport.complaint}</div>
              <p><strong>Reported by:</strong> {selectedReport.reportedBy?.name || 'Anonymous'}</p>
              <p><strong>Date:</strong> {moment(selectedReport.date).format('MMMM D, YYYY h:mm A')}</p>
              <hr />
              <Form.Group>
                <Form.Label>Resolution Notes</Form.Label>
                <Form.Control as="textarea" rows={3} value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Add resolution notes..." />
              </Form.Group>
              <div style={styles.modalActions}>
                <Button variant="success" onClick={() => handleResolveReport(selectedReport._id)}><FaCheckCircle /> Resolve</Button>
                <Button variant="danger" onClick={() => handleRejectReport(selectedReport._id)}><FaTimesCircle /> Reject</Button>
              </div>
            </>
          )}
        </Modal.Body>
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
  employerCell: { display: 'flex', alignItems: 'center', gap: 6 }, complaintCell: { maxWidth: 300, fontSize: 13, color: '#65676b' },
  userCell: { display: 'flex', alignItems: 'center', gap: 6 }, viewBtn: { background: '#e4e6eb', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', color: KL_BRAND, fontSize: 13 },
  rightSidebar: { width: 300, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16 },
  rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #dddfe2' },
  guidelinesList: { listStyle: 'none', padding: 0, fontSize: 13, lineHeight: 2 },
  complaintBox: { background: '#f8f9fa', padding: '12px', borderRadius: 8, marginBottom: 16 },
  modalActions: { display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' },
};

export default AdminReports;
