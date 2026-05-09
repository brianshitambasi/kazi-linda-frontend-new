import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ClickableAvatar from "../components/Common/ClickableAvatar";
import { Container, Card, Spinner, Table, Badge, Button } from 'react-bootstrap';
import { 
  FaUsers, FaFlag, FaCheckCircle, FaGlobe, FaHome, FaSearch, 
  FaBell, FaFacebookMessenger, FaEllipsisH, FaBriefcase, FaShieldAlt,
  FaUserFriends, FaBuilding, FaEnvelope, FaPhoneAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const EmbassyDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState({ totalWorkers: 0, activeCases: 0, resolvedCases: 0, countries: 0 });
  const [activeNav, setActiveNav] = useState('embassy');

  useEffect(() => {
    setTimeout(() => {
      setWorkers([
        { _id: '1', name: 'John Worker', email: 'john@worker.com', phone: '0712345678', currentCountry: 'Saudi Arabia', isActive: true, profilePicture: '', role: 'worker' },
        { _id: '2', name: 'Mary Wanjiku', email: 'mary@worker.com', phone: '0723456789', currentCountry: 'UAE', isActive: true, profilePicture: '', role: 'worker' }
      ]);
      setStats({ totalWorkers: 1250, activeCases: 8, resolvedCases: 45, countries: 12 });
      setLoading(false);
    }, 1000);
  }, []);

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'embassy', icon: FaBuilding, label: 'Dashboard', link: '/embassy/dashboard' },
    { id: 'workers', icon: FaUsers, label: 'Workers', link: '/embassy/workers' },
    { id: 'reports', icon: FaFlag, label: 'Reports', link: '/embassy/reports' },
  ];

  if (loading) return <div style={styles.loadingWrap}><div style={styles.loadingLogo}>KL</div><Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} /></div>;

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link to="/" style={styles.logoBox}><span style={styles.logoText}>KL</span></Link>
          <div style={styles.searchBox}><FaSearch style={styles.searchIcon} /><input style={styles.searchInput} placeholder="Search workers..." /></div>
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
          <div style={styles.sidebarSectionTitle}>Embassy Tools</div>
          <button style={styles.sidebarNavItem}><FaUsers /> Registered Workers</button>
          <button style={styles.sidebarNavItem}><FaFlag /> Incident Reports</button>
          <button style={styles.sidebarNavItem}><FaShieldAlt /> Safety Alerts</button>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>Diplomatic Mission Support<br />© {new Date().getFullYear()} KaziLinda</div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.headerCard}>
            <div style={styles.headerIcon}><FaBuilding size={32} color={KL_BRAND} /></div>
            <div><h1 style={styles.headerTitle}>Embassy Dashboard</h1><p style={styles.headerDesc}>Welcome, {user?.name}. Monitor and assist Kenyan workers abroad.</p></div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}><FaUsers size={28} color={KL_BRAND} /><h2 style={styles.statNumber}>{stats.totalWorkers}</h2><p>Registered Workers</p></div>
            <div style={styles.statCard}><FaFlag size={28} color="#e41e3f" /><h2 style={styles.statNumber}>{stats.activeCases}</h2><p>Active Cases</p></div>
            <div style={styles.statCard}><FaCheckCircle size={28} color="#45bd62" /><h2 style={styles.statNumber}>{stats.resolvedCases}</h2><p>Resolved Cases</p></div>
            <div style={styles.statCard}><FaGlobe size={28} color={KL_BRAND} /><h2 style={styles.statNumber}>{stats.countries}</h2><p>Countries Covered</p></div>
          </div>

          <div style={styles.tableCard}>
            <div style={styles.tableHeader}><h3>Registered Workers</h3><span style={styles.tableCount}>{workers.length} workers</span></div>
            <table style={styles.table}>
              <thead><tr><th>Worker</th><th>Contact</th><th>Country</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {workers.map(w => (
                  <tr key={w._id}>
                    <td><div style={styles.workerCell}><ClickableAvatar userId={w._id} src={w.profilePicture} size={36} /><strong>{w.name}</strong></div></td>
                    <td><div><FaEnvelope size={12} /> {w.email}<br /><FaPhoneAlt size={12} /> {w.phone}</div></td>
                    <td>{w.currentCountry}</td>
                    <td><Badge bg={w.isActive ? 'success' : 'danger'}>{w.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td><Button size="sm" style={styles.viewBtn} as={Link} to={`/profile/${w._id}`}>View Profile</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}><FaShieldAlt color={KL_BRAND} /><span>Emergency Contacts</span></div>
            <div style={styles.emergencyContact}><strong>24/7 Helpline:</strong> <span style={styles.helpline}>+254 700 000000</span></div>
            <div style={styles.emergencyContact}><strong>Email:</strong> emergency@kazilinda.com</div>
          </div>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}><FaFlag color={KL_BRAND} /><span>Recent Alerts</span></div>
            <div style={styles.alertItem}>⚠️ New incident reported in Saudi Arabia</div>
            <div style={styles.alertItem}>⚠️ Worker welfare check requested</div>
          </div>
          <div style={styles.resourceCard}>
            <h4>📋 Resources</h4>
            <ul><li>Worker Rights Guide</li><li>Emergency Protocol</li><li>Embassy Contact List</li></ul>
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
  navTabActive: { background: KL_BRAND_LIGHT }, navTabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: KL_BRAND },
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' },
  navIconInner: { width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: '#e41e3f', color: '#fff', borderRadius: 10, fontSize: 11, padding: '1px 5px' },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1400, margin: '0 auto' },
  leftSidebar: { width: 260, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: '#050505' },
  sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' }, sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px' },
  sidebarNavItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 8, border: 'none', background: 'transparent', width: '100%', fontSize: 14 },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, textAlign: 'center' },
  feedCol: { flex: 1, maxWidth: 800, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  headerCard: { background: '#fff', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 },
  headerIcon: { width: 56, height: 56, borderRadius: '50%', background: KL_BRAND_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 700 }, headerDesc: { fontSize: 13, color: '#65676b' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 12, padding: '20px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,.2)' },
  statNumber: { fontSize: 32, fontWeight: 700, color: KL_BRAND, marginTop: 12, marginBottom: 4 },
  tableCard: { background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,.2)' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  tableCount: { fontSize: 13, color: '#65676b' }, table: { width: '100%', borderCollapse: 'collapse' },
  workerCell: { display: 'flex', alignItems: 'center', gap: 10 }, viewBtn: { background: KL_BRAND, border: 'none' },
  rightSidebar: { width: 300, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16 },
  rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #dddfe2' },
  emergencyContact: { padding: '8px 0', fontSize: 13 }, helpline: { fontWeight: 700, color: KL_BRAND, fontSize: 16, display: 'block', marginTop: 4 },
  alertItem: { padding: '8px 0', fontSize: 13, borderBottom: '1px solid #f0f2f5' },
  resourceCard: { background: KL_BRAND_LIGHT, borderRadius: 12, padding: '16px' },
};

export default EmbassyDashboard;