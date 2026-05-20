import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationAPI } from '../services/api';
import {Button, Spinner, Badge } from 'react-bootstrap';
import { 
  FaBriefcase, FaMapMarkerAlt, FaCheckCircle, FaHourglassHalf, 
  FaTimesCircle, FaEye, FaHome, FaSearch, FaBell, FaFacebookMessenger, 
  FaEllipsisH, FaUsers, FaShieldAlt, FaClock, FaMoneyBillWave
} from 'react-icons/fa';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import toast from 'react-hot-toast';

const KL_BRAND = '#f39c12';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('applications');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await applicationAPI.getMy();
      setApplications(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'accepted':
        return <Badge bg="success" className="px-3 py-2"><FaCheckCircle className="me-1" /> Accepted</Badge>;
      case 'rejected':
        return <Badge bg="danger" className="px-3 py-2"><FaTimesCircle className="me-1" /> Rejected</Badge>;
      case 'reviewing':
        return <Badge bg="info" className="px-3 py-2"><FaEye className="me-1" /> Reviewing</Badge>;
      default:
        return <Badge bg="warning" className="px-3 py-2 text-dark"><FaHourglassHalf className="me-1" /> Pending</Badge>;
    }
  };

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
    { id: 'applications', icon: FaUsers, label: 'Applications', link: '/applications' },
    { id: 'verify', icon: FaShieldAlt, label: 'Verify', link: '/verify' },
  ];

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
  };

  if (loading) return <div style={styles.loadingWrap}><div style={styles.loadingLogo}>KL</div><Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} /></div>;

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link to="/" style={styles.logoBox}><span style={styles.logoText}>KL</span></Link>
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
            <span>{user?.name?.split(' ')[0] || 'User'}</span>
          </Link>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarSectionTitle}>Application Stats</div>
          <div style={styles.statsSummary}>
            <div><span style={styles.statValue}>{stats.total}</span><span>Total</span></div>
            <div><span style={{ ...styles.statValue, color: '#f7b928' }}>{stats.pending}</span><span>Pending</span></div>
            <div><span style={{ ...styles.statValue, color: '#45bd62' }}>{stats.accepted}</span><span>Accepted</span></div>
            <div><span style={{ ...styles.statValue, color: '#e41e3f' }}>{stats.rejected}</span><span>Rejected</span></div>
          </div>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>Track your job applications<br />© {new Date().getFullYear()} KaziLinda</div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.headerCard}>
            <div style={styles.headerIcon}><FaBriefcase size={32} color={KL_BRAND} /></div>
            <div><h1 style={styles.headerTitle}>My Applications</h1><p style={styles.headerDesc}>Track all your job applications and their status</p></div>
          </div>

          <div style={styles.statsRow}>
            <div style={styles.statCardSmall}><div style={styles.statNumberSmall}>{stats.total}</div><div>Total</div></div>
            <div style={styles.statCardSmall}><div style={{ ...styles.statNumberSmall, color: '#f7b928' }}>{stats.pending}</div><div>Pending</div></div>
            <div style={styles.statCardSmall}><div style={{ ...styles.statNumberSmall, color: '#45bd62' }}>{stats.accepted}</div><div>Accepted</div></div>
            <div style={styles.statCardSmall}><div style={{ ...styles.statNumberSmall, color: '#e41e3f' }}>{stats.rejected}</div><div>Rejected</div></div>
          </div>

          {applications.length === 0 ? (
            <div style={styles.emptyState}>
              <FaBriefcase size={64} color={KL_BRAND} />
              <h3>No applications yet</h3>
              <p>You haven't applied for any jobs yet.</p>
              <Button as={Link} to="/jobs" style={styles.browseBtn}>Browse Jobs</Button>
            </div>
          ) : (
            <div style={styles.applicationsGrid}>
              {applications.map(app => (
                <div key={app._id} style={styles.applicationCard}>
                  <div style={styles.cardHeader}>
                    {getStatusBadge(app.status)}
                    <div style={styles.appliedDate}>
                      <FaClock size={12} /> {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <h3 style={styles.jobTitle}>{app.jobId?.title}</h3>
                  <div style={styles.jobDetail}><FaMapMarkerAlt color={KL_BRAND} /> {app.jobId?.country}, {app.jobId?.city || 'N/A'}</div>
                  <div style={styles.jobDetail}><FaMoneyBillWave color={KL_BRAND} /> Salary: {app.jobId?.salary} {app.jobId?.salaryCurrency}</div>
                  {app.feedback && (
                    <div style={styles.feedbackBox}>
                      <strong>Feedback:</strong> {app.feedback}
                    </div>
                  )}
                  <Button as={Link} to={`/jobs/${app.jobId?._id}`} style={styles.viewBtn}>View Job</Button>
                </div>
              ))}
            </div>
          )}
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}><FaShieldAlt color={KL_BRAND} /><span>Application Tips</span></div>
            <ul style={styles.tipsList}>
              <li>✓ Complete your profile before applying</li>
              <li>✓ Tailor your application to each job</li>
              <li>✓ Follow up after 5-7 days</li>
              <li>✓ Keep your skills updated</li>
            </ul>
          </div>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}><FaClock color={KL_BRAND} /><span>Status Guide</span></div>
            <div style={styles.statusGuide}><Badge bg="warning">Pending</Badge> <span>Waiting for review</span></div>
            <div style={styles.statusGuide}><Badge bg="info">Reviewing</Badge> <span>Employer is reviewing</span></div>
            <div style={styles.statusGuide}><Badge bg="success">Accepted</Badge> <span>Congratulations!</span></div>
            <div style={styles.statusGuide}><Badge bg="danger">Rejected</Badge> <span>Keep trying!</span></div>
          </div>
        </aside>
      </div>
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
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' },
  navIconInner: { width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: '#e41e3f', color: '#fff', borderRadius: 10, fontSize: 11, padding: '1px 5px' },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1400, margin: '0 auto' },
  leftSidebar: { width: 260, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: '#050505' },
  sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' }, sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px' },
  statsSummary: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, padding: '8px', textAlign: 'center' },
  statValue: { fontSize: 24, fontWeight: 700, color: KL_BRAND, display: 'block' },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, textAlign: 'center' },
  feedCol: { flex: 1, maxWidth: 680, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  headerCard: { background: '#fff', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: 700 }, headerDesc: { fontSize: 13, color: '#65676b' },
  statsRow: { display: 'flex', gap: 12, marginBottom: 16 },
  statCardSmall: { background: '#fff', borderRadius: 10, padding: '12px', textAlign: 'center', flex: 1 },
  statNumberSmall: { fontSize: 20, fontWeight: 700, color: KL_BRAND },
  applicationsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 },
  applicationCard: { background: '#fff', borderRadius: 12, padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,.2)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
  appliedDate: { fontSize: 12, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 },
  jobTitle: { fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#050505' },
  jobDetail: { fontSize: 14, color: '#65676b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 },
  feedbackBox: { background: '#f8f9fa', padding: '8px', borderRadius: 8, fontSize: 13, marginTop: 12, marginBottom: 12 },
  viewBtn: { background: KL_BRAND, border: 'none', borderRadius: 8, padding: '8px 16px', width: '100%', fontSize: 14, fontWeight: 500, color: '#fff' },
  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12 },
  browseBtn: { background: KL_BRAND, border: 'none', borderRadius: 8, padding: '10px 24px', marginTop: 16 },
  rightSidebar: { width: 300, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16 },
  rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #dddfe2' },
  tipsList: { listStyle: 'none', padding: 0, margin: 0, fontSize: 13, lineHeight: 2 },
  statusGuide: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', fontSize: 13 },
};

export default Applications;