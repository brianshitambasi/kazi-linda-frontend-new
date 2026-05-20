import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Spinner, Badge } from 'react-bootstrap';
import { 
  FaExclamationTriangle, FaMapMarkerAlt, FaCalendar, FaBuilding, 
  FaFlag, FaCheckCircle, FaShieldAlt, FaHome, FaSearch, FaBell, 
  FaFacebookMessenger, FaEllipsisH, FaBriefcase, 
  FaUsers, FaBan, FaEnvelope, FaPhoneAlt, FaFileAlt, FaLeaf
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import Logo from '../components/Common/Logo';
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

const Blacklist = () => {
  const { user, token } = useAuth();
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('blacklist');

  const fetchBlacklist = useCallback(async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/admin/blacklist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBlacklist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load blacklist');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  const getCategoryColor = (category) => {
    switch(category) {
      case 'wage_theft': return colors.danger;
      case 'abuse': return colors.danger;
      case 'document_theft': return colors.warning;
      case 'human_trafficking': return colors.danger;
      default: return '#65676b';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'wage_theft': return 'Ì≤∞';
      case 'abuse': return 'Ì±ä';
      case 'document_theft': return 'Ì≥Ñ';
      case 'human_trafficking': return 'Ì∫´';
      default: return '‚ö†Ô∏è';
    }
  };

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'wage_theft': return 'Wage Theft';
      case 'abuse': return 'Physical Abuse';
      case 'document_theft': return 'Document Theft';
      case 'human_trafficking': return 'Human Trafficking';
      default: return category?.replace('_', ' ') || 'Other';
    }
  };

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'blacklist', icon: FaBan, label: 'Blacklist', link: '/blacklist' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
    { id: 'community', icon: FaUsers, label: 'Community', link: '/social' },
  ];

  const leftLinks = [
    { icon: FaBan, label: 'Blacklisted Employers', count: blacklist.length, color: colors.danger, active: true },
    { icon: FaShieldAlt, label: 'Safety Tips', color: colors.primary },
    { icon: FaFlag, label: 'Report Employer', color: colors.primary },
    { icon: FaEnvelope, label: 'Contact Support', color: colors.accent },
  ];

  const stats = {
    total: blacklist.length,
    wageTheft: blacklist.filter(e => e.category === 'wage_theft').length,
    abuse: blacklist.filter(e => e.category === 'abuse').length,
    documentTheft: blacklist.filter(e => e.category === 'document_theft').length,
    humanTrafficking: blacklist.filter(e => e.category === 'human_trafficking').length,
  };

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingLogo}>KL</div>
        <Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Logo size={36} />
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input style={styles.searchInput} placeholder="Search blacklist..." />
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

      <div style={styles.body}>
        <aside style={styles.leftSidebar}>
          <Link to={`/profile/${user?._id}`} style={styles.sidebarProfileLink}>
            <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={36} />
            <span style={styles.sidebarLinkText}>{user?.name || 'User'}</span>
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
          
          <div style={styles.sidebarSectionTitle}>Safety Resources</div>
          <div style={styles.resourceItem}>
            <FaFileAlt size={14} color={colors.primary} />
            <span>Worker Rights Guide</span>
          </div>
          <div style={styles.resourceItem}>
            <FaPhoneAlt size={14} color={colors.primary} />
            <span>Emergency Contacts</span>
          </div>
          <div style={styles.resourceItem}>
            <FaEnvelope size={14} color={colors.primary} />
            <span>Report a Scam</span>
          </div>

          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>
            <FaLeaf /> Safety First ¬∑ Verify Employers<br />
            ¬© {new Date().getFullYear()} KaziLinda
          </div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.headerCard}>
            <div style={styles.headerIcon}>
              <FaBan size={32} color={KL_BRAND} />
            </div>
            <div>
              <h1 style={styles.headerTitle}>Blacklisted Employers</h1>
              <p style={styles.headerDesc}>
                Stay away from these employers who have been verified and blacklisted for violations
              </p>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: colors.danger + '22' }}>
                <FaBan size={20} color={colors.danger} />
              </div>
              <div>
                <h3 style={styles.statNumber}>{stats.total}</h3>
                <p style={styles.statLabel}>Total Blacklisted</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: colors.danger + '22' }}>
                <span style={{ fontSize: 20 }}>Ì≤∞</span>
              </div>
              <div>
                <h3 style={styles.statNumber}>{stats.wageTheft}</h3>
                <p style={styles.statLabel}>Wage Theft</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: colors.danger + '22' }}>
                <span style={{ fontSize: 20 }}>Ì±ä</span>
              </div>
              <div>
                <h3 style={styles.statNumber}>{stats.abuse}</h3>
                <p style={styles.statLabel}>Physical Abuse</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: colors.warning + '22' }}>
                <span style={{ fontSize: 20 }}>Ì≥Ñ</span>
              </div>
              <div>
                <h3 style={styles.statNumber}>{stats.documentTheft}</h3>
                <p style={styles.statLabel}>Document Theft</p>
              </div>
            </div>
          </div>

          {blacklist.length === 0 ? (
            <div style={styles.emptyState}>
              <FaCheckCircle size={64} color={colors.secondary} />
              <h3>No Blacklisted Employers</h3>
              <p>All reported employers are currently clean.</p>
              <p style={styles.emptySubtext}>Keep reporting suspicious employers to help the community stay safe.</p>
            </div>
          ) : (
            <>
              <div style={styles.warningBanner}>
                <FaExclamationTriangle size={20} color={colors.danger} />
                <span><strong>{blacklist.length}</strong> blacklisted {blacklist.length === 1 ? 'employer' : 'employers'} found. Avoid any contact with these entities.</span>
              </div>

              <div style={styles.blacklistGrid}>
                {blacklist.map(employer => (
                  <div key={employer._id} style={styles.blacklistCard}>
                    <div style={{ ...styles.cardHeader, background: getCategoryColor(employer.category) + '22', borderBottomColor: getCategoryColor(employer.category) }}>
                      <div style={styles.cardHeaderContent}>
                        <span style={styles.categoryIcon}>{getCategoryIcon(employer.category)}</span>
                        <span style={{ ...styles.categoryLabel, color: getCategoryColor(employer.category) }}>
                          {getCategoryLabel(employer.category)}
                        </span>
                      </div>
                      <Badge style={styles.blacklistBadge}>BLACKLISTED</Badge>
                    </div>
                    
                    <div style={styles.cardBody}>
                      <h3 style={styles.employerName}>{employer.employerName}</h3>
                      
                      <div style={styles.infoRow}>
                        <FaBuilding size={14} color="#65676b" />
                        <span style={styles.infoText}>{employer.employerName}</span>
                      </div>
                      
                      <div style={styles.infoRow}>
                        <FaMapMarkerAlt size={14} color="#65676b" />
                        <span style={styles.infoText}>{employer.country || 'Unknown'}</span>
                      </div>
                      
                      <div style={styles.infoRow}>
                        <FaCalendar size={14} color="#65676b" />
                        <span style={styles.infoText}>Reported: {new Date(employer.reportedAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div style={styles.reasonBox}>
                        <strong>Reason for Blacklisting:</strong>
                        <p style={styles.reasonText}>{employer.reason}</p>
                      </div>
                      
                      {employer.reportedBy && (
                        <div style={styles.reportedBy}>
                          <FaFlag size={12} color="#65676b" />
                          <span>Reported by: {employer.reportedBy}</span>
                        </div>
                      )}
                    </div>
                    
                    <div style={styles.cardFooter}>
                      <button style={styles.reportBtn}>
                        <FaFlag /> Report Related Issue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={styles.safetyNotice}>
            <FaShieldAlt size={32} color={KL_BRAND} />
            <h4>‚ö†Ô∏è Important Notice</h4>
            <p>
              These employers have been verified and blacklisted for violating worker rights. 
              Please avoid any job offers from these entities. If you have been affected by any of these employers, 
              please contact your local embassy or report through our emergency system.
            </p>
            <div style={styles.noticeActions}>
              <button style={styles.emergencyBtn}>Ì∫® Report Emergency</button>
              <button style={styles.contactBtn}>Ì≥û Contact Support</button>
            </div>
          </div>
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}>
              <FaShieldAlt color={KL_BRAND} />
              <span>How to Stay Safe</span>
            </div>
            <ul style={styles.safetyList}>
              <li>‚úì Always verify employer credentials</li>
              <li>‚úì Never pay upfront fees</li>
              <li>‚úì Check blacklist before applying</li>
              <li>‚úì Keep copies of contracts</li>
              <li>‚úì Share your location with family</li>
              <li>‚úì Report suspicious employers</li>
            </ul>
          </div>

          <div style={styles.reportCard}>
            <FaFlag size={32} color={KL_BRAND} />
            <h4>Report an Employer</h4>
            <p>Help protect other workers by reporting suspicious or abusive employers</p>
            <button style={styles.reportNowBtn}>
              Report Now
            </button>
          </div>

          <div style={styles.helplineCard}>
            <h4>ÔøΩÔøΩ Emergency Helpline</h4>
            <p>If you're in immediate danger, contact:</p>
            <div style={styles.helplineNumber}>+254 700 000000</div>
            <small>Available 24/7</small>
          </div>

          <div style={styles.sidebarFooter}>
            Last updated: {new Date().toLocaleDateString()}<br />
            ¬© {new Date().getFullYear()} KaziLinda
          </div>
        </aside>
      </div>
    </div>
  );
};

const styles = {
  page: { background: colors.gradientLight, minHeight: '100vh', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: colors.gradientLight },
  loadingLogo: { width: 60, height: 60, borderRadius: '50%', background: colors.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 24, fontStyle: 'italic' },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 200, boxShadow: '0 2px 4px rgba(0,0,0,.08)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 }, navCenter: { display: 'flex', gap: 4 }, navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  searchBox: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 12, color: '#65676b', fontSize: 14 },
  searchInput: { background: colors.light, border: 'none', borderRadius: 20, padding: '8px 16px 8px 36px', fontSize: 15, outline: 'none', width: 240, color: '#050505' },
  navTab: { width: 100, height: 48, border: 'none', background: 'transparent', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', textDecoration: 'none' },
  navTabActive: { background: colors.light },
  navTabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: colors.primary, borderRadius: '2px 2px 0 0' },
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' },
  navIconInner: { width: 40, height: 40, borderRadius: '50%', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: colors.danger, color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '1px 5px' },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1440, margin: '0 auto' },
  leftSidebar: { width: 280, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: colors.text, fontWeight: 500, fontSize: 15, marginBottom: 8 },
  sidebarNavItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 500, fontSize: 14, color: colors.text },
  sidebarNavItemActive: { background: colors.light },
  sidebarIconWrap: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sidebarLinkText: { fontSize: 14, fontWeight: 500, color: colors.text, flex: 1 },
  sidebarCount: { fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 12, minWidth: 24, textAlign: 'center' },
  sidebarDivider: { borderTop: `1px solid ${colors.border}`, margin: '12px 0' },
  sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px', marginBottom: 4 },
  resourceItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', fontSize: 14, color: colors.text },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, lineHeight: 1.6, textAlign: 'center' },
  feedCol: { flex: 1, maxWidth: 680, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  headerCard: { background: '#fff', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)', border: `1px solid ${colors.border}` },
  headerIcon: { width: 56, height: 56, borderRadius: '50%', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 700, marginBottom: 4, color: colors.text },
  headerDesc: { fontSize: 13, color: '#65676b', margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 },
  statCard: { background: '#fff', borderRadius: 12, padding: '12px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 2px rgba(0,0,0,.2)', border: `1px solid ${colors.border}` },
  statIcon: { width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statNumber: { fontSize: 20, fontWeight: 700, marginBottom: 0, color: colors.text },
  statLabel: { fontSize: 11, color: '#65676b', margin: 0 },
  warningBanner: { background: colors.light, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, borderLeft: `4px solid ${colors.primary}` },
  blacklistGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 },
  blacklistCard: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,.2)', border: `1px solid ${colors.border}` },
  cardHeader: { padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid' },
  cardHeaderContent: { display: 'flex', alignItems: 'center', gap: 8 },
  categoryIcon: { fontSize: 18 },
  categoryLabel: { fontSize: 13, fontWeight: 600 },
  blacklistBadge: { background: colors.danger, fontSize: 10, padding: '4px 8px' },
  cardBody: { padding: '16px' },
  employerName: { fontSize: 18, fontWeight: 700, marginBottom: 12, color: colors.text },
  infoRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: '#65676b' },
  infoText: { color: '#65676b' },
  reasonBox: { background: colors.light, borderRadius: 8, padding: '10px', marginTop: 12, marginBottom: 12 },
  reasonText: { fontSize: 13, color: colors.text, marginTop: 4, marginBottom: 0 },
  reportedBy: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#65676b' },
  cardFooter: { padding: '12px 16px', borderTop: `1px solid ${colors.border}` },
  reportBtn: { width: '100%', padding: '8px', background: 'transparent', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', color: colors.text },
  safetyNotice: { background: '#fff', borderRadius: 12, padding: '20px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,.2)', border: `1px solid ${colors.border}` },
  noticeActions: { display: 'flex', gap: 12, marginTop: 16, justifyContent: 'center' },
  emergencyBtn: { background: colors.danger, border: 'none', borderRadius: 6, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 600 },
  contactBtn: { background: colors.gradient, border: 'none', borderRadius: 6, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 600 },
  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, color: '#65676b', border: `1px solid ${colors.border}` },
  emptySubtext: { fontSize: 13, marginTop: 8 },
  rightSidebar: { width: 320, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)', border: `1px solid ${colors.border}` },
  rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${colors.border}` },
  safetyList: { listStyle: 'none', padding: 0, margin: 0, fontSize: 13, lineHeight: 2, color: colors.text },
  reportCard: { background: colors.light, borderRadius: 12, padding: '20px', textAlign: 'center', marginBottom: 16, border: `1px solid ${colors.accent}` },
  reportNowBtn: { background: colors.gradient, border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 600, marginTop: 12, width: '100%', color: '#fff' },
  helplineCard: { background: colors.danger, borderRadius: 12, padding: '16px', textAlign: 'center', color: '#fff' },
  helplineNumber: { fontSize: 24, fontWeight: 700, margin: '8px 0' },
};

export default Blacklist;
