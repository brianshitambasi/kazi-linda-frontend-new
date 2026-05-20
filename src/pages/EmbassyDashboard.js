import Logo from "../components/Common/Logo";
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ClickableAvatar from "../components/Common/ClickableAvatar";
import { Spinner, Badge, Button } from 'react-bootstrap';
import { 
  FaUsers, FaFlag, FaCheckCircle, FaGlobe, FaHome, FaSearch, 
  FaBell, FaFacebookMessenger, FaEllipsisH, FaShieldAlt,
  FaBuilding, FaEnvelope, FaPhoneAlt, FaLeaf, FaHeartbeat,
  FaFileAlt, FaHandshake, FaClock
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

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
        { _id: '2', name: 'Mary Wanjiku', email: 'mary@worker.com', phone: '0723456789', currentCountry: 'UAE', isActive: true, profilePicture: '', role: 'worker' },
        { _id: '3', name: 'Peter Omondi', email: 'peter@worker.com', phone: '0734567890', currentCountry: 'Qatar', isActive: true, profilePicture: '', role: 'worker' },
        { _id: '4', name: 'Sarah Muthoni', email: 'sarah@worker.com', phone: '0745678901', currentCountry: 'Kuwait', isActive: true, profilePicture: '', role: 'worker' }
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

  if (loading) return (
    <div style={styles.loadingWrap}>
      <div style={styles.loadingLogo}><FaLeaf /></div>
      <Spinner animation="border" style={{ color: colors.primary, marginTop: 16 }} />
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link to="/" style={styles.logoBox}>
            <Logo size={32} variant="dark" />
          </Link>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input style={styles.searchInput} placeholder="Search workers..." />
          </div>
        </div>
        <div style={styles.navCenter}>
          {navTabs.map(tab => (
            <Link key={tab.id} to={tab.link} style={{ ...styles.navTab, ...(activeNav === tab.id ? styles.navTabActive : {}) }} onClick={() => setActiveNav(tab.id)}>
              <tab.icon size={24} style={{ color: activeNav === tab.id ? colors.primary : '#65676b' }} />
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
        {/* Left Sidebar */}
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
          <button style={styles.sidebarNavItem}><FaHeartbeat /> Welfare Checks</button>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>
            <FaLeaf /> Diplomatic Mission Support<br />
            © {new Date().getFullYear()} KaziLinda
          </div>
        </aside>

        {/* Main Content */}
        <main style={styles.feedCol}>
          <div style={styles.headerCard}>
            <div style={styles.headerIcon}><FaBuilding size={32} color={colors.primary} /></div>
            <div>
              <h1 style={styles.headerTitle}>Embassy Dashboard</h1>
              <p style={styles.headerDesc}>Welcome, {user?.name}. Monitor and assist Kenyan workers abroad.</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}><FaUsers size={28} color={colors.primary} /></div>
              <h2 style={styles.statNumber}>{stats.totalWorkers}</h2>
              <p style={styles.statLabel}>Registered Workers</p>
            </div>
            <div style={{...styles.statCard, borderTopColor: colors.danger}}>
              <div style={styles.statIcon}><FaFlag size={28} color={colors.danger} /></div>
              <h2 style={{...styles.statNumber, color: colors.danger}}>{stats.activeCases}</h2>
              <p style={styles.statLabel}>Active Cases</p>
            </div>
            <div style={{...styles.statCard, borderTopColor: colors.secondary}}>
              <div style={styles.statIcon}><FaCheckCircle size={28} color={colors.secondary} /></div>
              <h2 style={{...styles.statNumber, color: colors.secondary}}>{stats.resolvedCases}</h2>
              <p style={styles.statLabel}>Resolved Cases</p>
            </div>
            <div style={{...styles.statCard, borderTopColor: colors.warning}}>
              <div style={styles.statIcon}><FaGlobe size={28} color={colors.warning} /></div>
              <h2 style={{...styles.statNumber, color: colors.warning}}>{stats.countries}</h2>
              <p style={styles.statLabel}>Countries Covered</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={styles.quickActions}>
            <Button className="action-chip"><FaFileAlt /> Generate Report</Button>
            <Button className="action-chip"><FaHeartbeat /> Welfare Check</Button>
            <Button className="action-chip"><FaHandshake /> Worker Meeting</Button>
            <Button className="action-chip"><FaClock /> Schedule Visit</Button>
          </div>

          {/* Workers Table */}
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3><FaUsers style={{ marginRight: 8 }} /> Registered Workers</h3>
              <span style={styles.tableCount}>{workers.length} active workers</span>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Contact</th>
                    <th>Country</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map(w => (
                    <tr key={w._id}>
                      <td>
                        <div style={styles.workerCell}>
                          <ClickableAvatar userId={w._id} src={w.profilePicture} size={36} />
                          <div>
                            <strong>{w.name}</strong>
                            <span style={styles.workerRole}>{w.role}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div><FaEnvelope size={12} /> {w.email}</div>
                        <div><FaPhoneAlt size={12} /> {w.phone}</div>
                      </td>
                      <td>
                        <Badge style={styles.countryBadge}>{w.currentCountry}</Badge>
                      </td>
                      <td>
                        <Badge bg={w.isActive ? 'success' : 'danger'} className="rounded-pill px-3">
                          {w.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <Button size="sm" style={styles.viewBtn} as={Link} to={`/profile/${w._id}`}>
                          View Profile
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}>
              <FaShieldAlt color={colors.primary} />
              <span>Emergency Contacts</span>
            </div>
            <div style={styles.emergencyContact}>
              <strong>24/7 Helpline:</strong>
              <span style={styles.helpline}>+254 700 000000</span>
            </div>
            <div style={styles.emergencyContact}>
              <strong>Email:</strong> emergency@kazilinda.com
            </div>
            <div style={styles.emergencyContact}>
              <strong>WhatsApp:</strong> +254 700 000001
            </div>
          </div>

          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}>
              <FaFlag color={colors.primary} />
              <span>Recent Alerts</span>
            </div>
            <div style={styles.alertItem}>
              <span className="alert-dot"></span>
              New incident reported in Saudi Arabia
            </div>
            <div style={styles.alertItem}>
              <span className="alert-dot warning"></span>
              Worker welfare check requested
            </div>
            <div style={styles.alertItem}>
              <span className="alert-dot"></span>
              Embassy visit scheduled for next week
            </div>
          </div>

          <div style={styles.resourceCard}>
            <h4><FaLeaf /> Resources</h4>
            <ul>
              <li>Worker Rights Guide</li>
              <li>Emergency Protocol</li>
              <li>Embassy Contact List</li>
              <li>Legal Assistance</li>
              <li>Medical Assistance</li>
            </ul>
          </div>

          <div style={styles.ecoCard}>
            <FaLeaf size={24} color={colors.warning} />
            <div>
              <h5>Green Embassy Initiative</h5>
              <p>We're working towards sustainable diplomatic missions</p>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .action-chip {
          background: ${colors.light};
          border: 1px solid ${colors.border};
          color: ${colors.text};
          border-radius: 30px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.3s;
        }
        .action-chip:hover {
          background: ${colors.primary};
          color: white;
          border-color: ${colors.primary};
        }
        .rounded-pill {
          border-radius: 20px !important;
        }
        .alert-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: ${colors.danger};
          border-radius: 50%;
          margin-right: 8px;
          animation: pulse 1.5s infinite;
        }
        .alert-dot.warning {
          background: ${colors.warning};
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: { background: colors.gradientLight, minHeight: '100vh' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: colors.gradientLight },
  loadingLogo: { width: 60, height: 60, borderRadius: '50%', background: colors.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28 },
  
  nav: { position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 200, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 }, navCenter: { display: 'flex', gap: 4 }, navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  logoBox: { width: 40, height: 40, borderRadius: '50%', background: colors.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  logoText: { color: '#fff', fontWeight: 900, fontSize: 18 }, searchBox: { position: 'relative' }, searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b' },
  searchInput: { background: colors.light, border: 'none', borderRadius: 20, padding: '8px 16px 8px 36px', fontSize: 15, outline: 'none', width: 240, color: '#050505' },
  navTab: { width: 100, height: 48, background: 'transparent', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', textDecoration: 'none' },
  navTabActive: { background: `${colors.primary}10` }, navTabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: colors.primary, borderRadius: '2px 2px 0 0' },
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' },
  navIconInner: { width: 40, height: 40, borderRadius: '50%', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: colors.danger, color: '#fff', borderRadius: 10, fontSize: 11, padding: '1px 5px' },
  
  body: { display: 'flex', paddingTop: 56, maxWidth: 1400, margin: '0 auto' },
  leftSidebar: { width: 260, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: colors.text },
  sidebarDivider: { borderTop: `1px solid ${colors.border}`, margin: '12px 0' },
  sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px' },
  sidebarNavItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 8, border: 'none', background: 'transparent', width: '100%', fontSize: 14, cursor: 'pointer', transition: 'all 0.3s' },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, textAlign: 'center' },
  
  feedCol: { flex: 1, maxWidth: 800, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  headerCard: { background: '#fff', borderRadius: 16, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, border: `1px solid ${colors.border}` },
  headerIcon: { width: 56, height: 56, borderRadius: '50%', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 700, color: colors.text }, headerDesc: { fontSize: 13, color: '#65676b' },
  
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 16, padding: '20px', textAlign: 'center', borderTop: `4px solid ${colors.primary}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  statIcon: { marginBottom: 8 }, statNumber: { fontSize: 32, fontWeight: 700, color: colors.primary, marginTop: 12, marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#65676b', margin: 0 },
  
  quickActions: { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  
  tableCard: { background: '#fff', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: `1px solid ${colors.border}` },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, color: colors.text },
  tableCount: { fontSize: 13, color: '#65676b' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  workerCell: { display: 'flex', alignItems: 'center', gap: 10 },
  workerRole: { fontSize: 11, color: '#65676b', display: 'block' },
  countryBadge: { background: colors.light, color: colors.primary, padding: '4px 12px', borderRadius: 20, fontWeight: 500 },
  viewBtn: { background: colors.primary, border: 'none', borderRadius: 20, padding: '5px 12px', fontSize: 12 },
  
  rightSidebar: { width: 300, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 16, border: `1px solid ${colors.border}` },
  rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${colors.border}` },
  emergencyContact: { padding: '8px 0', fontSize: 13 },
  helpline: { fontWeight: 700, color: colors.primary, fontSize: 16, display: 'block', marginTop: 4 },
  alertItem: { padding: '8px 0', fontSize: 13, borderBottom: `1px solid ${colors.light}`, display: 'flex', alignItems: 'center' },
  resourceCard: { background: colors.light, borderRadius: 16, padding: '16px', marginBottom: 16 },
  ecoCard: { background: colors.gradient, borderRadius: 16, padding: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }
};

export default EmbassyDashboard;
