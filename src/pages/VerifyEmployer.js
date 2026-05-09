import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Table, Badge } from 'react-bootstrap';
import { FaSearch, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaBuilding, FaMapMarkerAlt, FaUsers, FaBriefcase, FaStar, FaClock, FaHome, FaBell, FaFacebookMessenger, FaEllipsisH, FaUserFriends } from 'react-icons/fa';
import { employerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import { Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const VerifyEmployer = () => {
  const { user, token } = useAuth();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employerData, setEmployerData] = useState(null);
  const [activeNav, setActiveNav] = useState('verify');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!name || !country) {
      toast.error('Please enter employer name and country');
      return;
    }

    setLoading(true);
    try {
      const res = await employerAPI.verify({ name, country });
      setResult(res.data);
      
      if (res.data.employer?._id) {
        const statsRes = await employerAPI.getStats(res.data.employer._id);
        setEmployerData(statsRes.data);
      } else {
        setEmployerData(null);
      }
    } catch (err) {
      toast.error('Failed to verify employer');
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar key={i} className={i <= fullStars ? 'text-warning' : 'text-muted'} />
      );
    }
    return stars;
  };

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'verify', icon: FaShieldAlt, label: 'Verify', link: '/verify' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
    { id: 'community', icon: FaUserFriends, label: 'Community', link: '/social' },
  ];

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <RouterLink to="/" style={styles.logoBox}>
            <span style={styles.logoText}>KL</span>
          </RouterLink>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input style={styles.searchInput} placeholder="Search employers..." />
          </div>
        </div>

        <div style={styles.navCenter}>
          {navTabs.map(tab => (
            <RouterLink
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
            </RouterLink>
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

      {/* Body */}
      <div style={styles.body}>
        <aside style={styles.leftSidebar}>
          <RouterLink to={`/profile/${user?._id}`} style={styles.sidebarProfileLink}>
            <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={36} />
            <span style={styles.sidebarLinkText}>{user?.name || 'User'}</span>
          </RouterLink>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarSectionTitle}>Verification Tools</div>
          <button style={styles.sidebarNavItem}><FaShieldAlt /> Verify Employer</button>
          <button style={styles.sidebarNavItem}><FaExclamationTriangle /> Report Employer</button>
          <button style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>Safety First · Verify Before You Trust<br />© {new Date().getFullYear()} KaziLinda</div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.headerCard}>
            <div style={styles.headerIcon}>
              <FaShieldAlt size={32} color={KL_BRAND} />
            </div>
            <div>
              <h1 style={styles.headerTitle}>Verify Employer</h1>
              <p style={styles.headerDesc}>Check employer history and track record before accepting a job</p>
            </div>
          </div>

          <div style={styles.formCard}>
            <Form onSubmit={handleVerify}>
              <Form.Group className="mb-3">
                <Form.Label>Employer Name</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><FaBuilding /></span>
                  <Form.Control
                    type="text"
                    placeholder="Enter employer name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Country</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><FaMapMarkerAlt /></span>
                  <Form.Control
                    type="text"
                    placeholder="Enter country"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    required
                  />
                </div>
              </Form.Group>
              <Button style={styles.verifyBtn} type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : <><FaSearch className="me-2" /> Verify Employer</>}
              </Button>
            </Form>
          </div>

          {result && (
            <div style={styles.resultCard}>
              {result.blacklisted ? (
                <div style={styles.blacklistedCard}>
                  <FaExclamationTriangle size={50} color="#e41e3f" />
                  <h3 style={{ color: '#e41e3f' }}>⚠️ BLACKLISTED</h3>
                  <p>Reason: {result.blacklistReason}</p>
                  <hr />
                  <p className="text-muted small">This employer has been reported for workplace violations.</p>
                </div>
              ) : result.employer?._id ? (
                <>
                  <div style={styles.employerInfoCard}>
                    <div className="text-center mb-3">
                      {result.employer.verified ? (
                        <FaCheckCircle size={40} color="#45bd62" />
                      ) : (
                        <FaShieldAlt size={40} color={KL_BRAND} />
                      )}
                      <h3 className="mt-2">{result.employer.name}</h3>
                      <p className="text-muted">{result.employer.companyName || 'Individual Employer'}</p>
                      <div>{getRatingStars(result.employer.rating)}<span className="ms-2">({result.employer.totalRatings} reviews)</span></div>
                    </div>
                    <hr />
                    <Row>
                      <Col md={6}><p><FaMapMarkerAlt className="text-warning me-2" /> Country: {result.employer.country}</p></Col>
                      <Col md={6}><p><FaClock className="text-warning me-2" /> Member since: {new Date(result.employer.memberSince).toLocaleDateString()}</p></Col>
                    </Row>
                  </div>

                  <Row className="g-3 mb-4">
                    <Col md={3}><div style={styles.statCardSmall}><h3 style={{ color: KL_BRAND }}>{employerData?.stats?.totalJobsPosted || 0}</h3><p>Jobs Posted</p></div></Col>
                    <Col md={3}><div style={styles.statCardSmall}><h3 style={{ color: '#45bd62' }}>{employerData?.stats?.hiredCount || 0}</h3><p>Workers Hired</p></div></Col>
                    <Col md={3}><div style={styles.statCardSmall}><h3 style={{ color: KL_BRAND }}>{employerData?.stats?.applicationCount || 0}</h3><p>Applications</p></div></Col>
                    <Col md={3}><div style={styles.statCardSmall}><h3 style={{ color: '#1877f2' }}>{employerData?.stats?.successRate || 0}%</h3><p>Success Rate</p></div></Col>
                  </Row>

                  {result.complaints > 0 && (
                    <Alert variant="danger" className="mt-3">
                      <FaExclamationTriangle className="me-2" />
                      This employer has {result.complaints} complaint{result.complaints !== 1 ? 's' : ''} on record.
                    </Alert>
                  )}
                </>
              ) : (
                <div style={styles.cleanCard}>
                  <FaCheckCircle size={50} color="#45bd62" />
                  <h3 style={{ color: '#45bd62' }}>✓ CLEAN</h3>
                  <p>No blacklist records found for this employer.</p>
                  <p className="text-muted small">This employer is not in our database yet.</p>
                </div>
              )}
            </div>
          )}
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}><FaShieldAlt color={KL_BRAND} /><span>Why Verify?</span></div>
            <ul style={styles.tipsList}>
              <li>✓ Protect yourself from scams</li>
              <li>✓ Check employer history</li>
              <li>✓ See worker reviews</li>
              <li>✓ Avoid blacklisted employers</li>
            </ul>
          </div>
          <div style={styles.reportCard}>
            <h4>🚨 See something wrong?</h4>
            <p>Report suspicious employers to help protect others</p>
            <Button style={styles.reportBtn}>Report Employer</Button>
          </div>
          <div style={styles.sidebarFooter}>© {new Date().getFullYear()} KaziLinda</div>
        </aside>
      </div>
    </div>
  );
};

const styles = {
  page: { background: '#f0f2f5', minHeight: '100vh', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: '1px solid #dddfe2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 200, boxShadow: '0 2px 4px rgba(0,0,0,.08)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  navCenter: { display: 'flex', gap: 4 },
  navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  logoBox: { width: 40, height: 40, borderRadius: '50%', background: KL_BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  logoText: { color: '#fff', fontWeight: 900, fontSize: 18, fontStyle: 'italic' },
  searchBox: { position: 'relative' },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b' },
  searchInput: { background: '#f0f2f5', border: 'none', borderRadius: 20, padding: '8px 16px 8px 36px', fontSize: 15, outline: 'none', width: 240 },
  navTab: { width: 100, height: 48, background: 'transparent', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', textDecoration: 'none' },
  navTabActive: { background: KL_BRAND_LIGHT },
  navTabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: KL_BRAND, borderRadius: '2px 2px 0 0' },
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' },
  navIconInner: { width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: '#e41e3f', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '1px 5px' },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1200, margin: '0 auto' },
  leftSidebar: { width: 260, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: '#050505', fontWeight: 500, fontSize: 15 },
  sidebarLinkText: { fontSize: 14, fontWeight: 500, color: '#050505' },
  sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' },
  sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px' },
  sidebarNavItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 500, fontSize: 14 },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, lineHeight: 1.6, textAlign: 'center' },
  feedCol: { flex: 1, maxWidth: 600, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  headerCard: { background: '#fff', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)' },
  headerIcon: { width: 56, height: 56, borderRadius: '50%', background: KL_BRAND_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#050505' },
  headerDesc: { fontSize: 13, color: '#65676b', margin: 0 },
  formCard: { background: '#fff', borderRadius: 12, padding: '24px', marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)' },
  verifyBtn: { background: KL_BRAND, border: 'none', borderRadius: 8, padding: '12px', fontSize: 16, fontWeight: 600, width: '100%', color: '#fff' },
  resultCard: { background: '#fff', borderRadius: 12, padding: '24px', marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)' },
  blacklistedCard: { textAlign: 'center', padding: '20px' },
  cleanCard: { textAlign: 'center', padding: '20px' },
  employerInfoCard: { marginBottom: 20 },
  statCardSmall: { background: '#f8f9fa', borderRadius: 10, padding: '12px', textAlign: 'center' },
  rightSidebar: { width: 300, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)' },
  rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #dddfe2' },
  tipsList: { listStyle: 'none', padding: 0, margin: 0, fontSize: 13, lineHeight: 2 },
  reportCard: { background: KL_BRAND_LIGHT, borderRadius: 12, padding: '16px', textAlign: 'center', marginBottom: 16 },
  reportBtn: { background: KL_BRAND, border: 'none', borderRadius: 6, padding: '8px 16px', width: '100%' },
};

export default VerifyEmployer;