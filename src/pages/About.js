import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Card, Button } from 'react-bootstrap';
import { 
  FaShieldAlt, FaUsers, FaGlobeAfrica, FaHandsHelping, FaCheckCircle, 
  FaHeart, FaHome, FaSearch, FaBell, FaFacebookMessenger, FaEllipsisH,
  FaBriefcase, FaUserPlus, FaBuilding, FaFlag
} from 'react-icons/fa';
import ClickableAvatar from '../components/Common/ClickableAvatar';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const About = () => {
  const { user, token } = useAuth();
  const [activeNav, setActiveNav] = React.useState('about');

  const values = [
    { icon: FaShieldAlt, title: 'Safety First', desc: 'We prioritize worker safety above all else', color: KL_BRAND },
    { icon: FaUsers, title: 'Community', desc: 'Building a supportive worker community', color: '#1877f2' },
    { icon: FaGlobeAfrica, title: 'Global Reach', desc: 'Connecting Kenyans to opportunities worldwide', color: '#45bd62' },
    { icon: FaHandsHelping, title: 'Support', desc: '24/7 emergency support for all workers', color: '#e41e3f' }
  ];

  const stats = [
    { number: '5000+', label: 'Workers Protected', icon: FaUsers },
    { number: '50+', label: 'Countries Served', icon: FaGlobeAfrica },
    { number: '1000+', label: 'Verified Jobs', icon: FaBriefcase },
    { number: '98%', label: 'Satisfaction Rate', icon: FaHeart }
  ];

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'about', icon: FaBuilding, label: 'About', link: '/about' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
    { id: 'verify', icon: FaShieldAlt, label: 'Verify', link: '/verify' },
  ];

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link to="/" style={styles.logoBox}><span style={styles.logoText}>KL</span></Link>
          <div style={styles.searchBox}><FaSearch style={styles.searchIcon} /><input style={styles.searchInput} placeholder="Search..." /></div>
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
          {user ? (
            <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={40} />
          ) : (
            <Link to="/login" style={styles.loginBtn}>Login</Link>
          )}
        </div>
      </nav>

      <div style={styles.body}>
        <aside style={styles.leftSidebar}>
          {user ? (
            <Link to={`/profile/${user?._id}`} style={styles.sidebarProfileLink}>
              <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={36} />
              <span>{user?.name?.split(' ')[0] || 'User'}</span>
            </Link>
          ) : (
            <div style={styles.sidebarGuest}>
              <FaUsers size={36} color={KL_BRAND} />
              <span>Guest User</span>
            </div>
          )}
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarSectionTitle}>Quick Links</div>
          <Link to="/" style={styles.sidebarNavItem}><FaHome /> Home</Link>
          <Link to="/jobs" style={styles.sidebarNavItem}><FaBriefcase /> Browse Jobs</Link>
          <Link to="/verify" style={styles.sidebarNavItem}><FaShieldAlt /> Verify Employer</Link>
          <Link to="/register" style={styles.sidebarNavItem}><FaUserPlus /> Join Now</Link>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>© {new Date().getFullYear()} KaziLinda</div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.heroCard}>
            <div style={styles.heroIcon}><FaFlag size={48} color={KL_BRAND} /></div>
            <h1 style={styles.heroTitle}>About KAZI LINDA</h1>
            <p style={styles.heroSubtitle}>Safe Jobs for Kenyans at Home and Abroad</p>
          </div>

          <div style={styles.missionCard}>
            <div style={styles.missionContent}>
              <h2>Our Mission</h2>
              <p>KAZI LINDA was founded with a single mission: to protect Kenyan workers from exploitation while helping them find legitimate employment opportunities both locally and internationally.</p>
              <p>We believe that every worker deserves dignity, fair treatment, and a safe working environment. Our platform connects job seekers with verified employers and provides tools to report abuse, verify employers, and access emergency support when needed.</p>
              <div><FaCheckCircle color={KL_BRAND} /> Verify employers before you accept a job</div>
              <div><FaCheckCircle color={KL_BRAND} /> Access emergency support 24/7</div>
              <div><FaCheckCircle color={KL_BRAND} /> Connect with a community of workers</div>
            </div>
            <div style={styles.missionQuote}>
              <FaHeart size={50} color={KL_BRAND} />
              <h3>Protecting Kenyan Workers</h3>
              <p>"Every worker deserves to return home safely"</p>
            </div>
          </div>

          <div style={styles.statsGrid}>
            {stats.map((stat, idx) => (
              <div key={idx} style={styles.statCard}>
                <stat.icon size={32} color={KL_BRAND} />
                <h2>{stat.number}</h2>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>

          <h2 style={styles.sectionTitle}>Our Core Values</h2>
          <div style={styles.valuesGrid}>
            {values.map((value, idx) => (
              <div key={idx} style={styles.valueCard}>
                <div style={{ ...styles.valueIcon, background: value.color + '22' }}>
                  <value.icon size={32} color={value.color} />
                </div>
                <h4>{value.title}</h4>
                <p>{value.desc}</p>
              </div>
            ))}
          </div>

          <h2 style={styles.sectionTitle}>How KAZI LINDA Works</h2>
          <div style={styles.stepsGrid}>
            <div style={styles.stepCard}><div style={styles.stepNumber}>1</div><h4>Find Jobs</h4><p>Browse verified job listings from trusted employers</p></div>
            <div style={styles.stepCard}><div style={styles.stepNumber}>2</div><h4>Verify Employer</h4><p>Check employer legitimacy before accepting an offer</p></div>
            <div style={styles.stepCard}><div style={styles.stepNumber}>3</div><h4>Stay Safe</h4><p>Access emergency support and daily check-ins</p></div>
          </div>

          <div style={styles.ctaCard}>
            <h3>Ready to find safe employment?</h3>
            <p>Join thousands of Kenyans who trust KAZI LINDA</p>
            <Button as={Link} to="/register" style={styles.ctaBtn}>Register Now</Button>
          </div>
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}><FaShieldAlt color={KL_BRAND} /><span>Why Choose Us?</span></div>
            <ul style={styles.whyList}>
              <li>✓ 100% Free for workers</li>
              <li>✓ Verified employers only</li>
              <li>✓ 24/7 emergency support</li>
              <li>✓ Worker community network</li>
            </ul>
          </div>
          <div style={styles.contactCard}>
            <h4>📞 Need Help?</h4>
            <p>Contact our support team for assistance</p>
            <Button style={styles.contactBtn}>Contact Support</Button>
          </div>
        </aside>
      </div>
    </div>
  );
};

const styles = {
  page: { background: '#f0f2f5', minHeight: '100vh' },
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
  loginBtn: { background: KL_BRAND, color: '#fff', padding: '8px 16px', borderRadius: 6, textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1400, margin: '0 auto' },
  leftSidebar: { width: 260, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: '#050505' },
  sidebarGuest: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 8 },
  sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' }, sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px' },
  sidebarNavItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: '#050505', fontSize: 14 },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, textAlign: 'center' },
  feedCol: { flex: 1, maxWidth: 680, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  heroCard: { background: '#fff', borderRadius: 12, padding: '32px', textAlign: 'center', marginBottom: 20 },
  heroIcon: { marginBottom: 16 }, heroTitle: { fontSize: 32, fontWeight: 700, marginBottom: 8 }, heroSubtitle: { fontSize: 16, color: '#65676b' },
  missionCard: { background: '#fff', borderRadius: 12, padding: '24px', display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' },
  missionContent: { flex: 2 }, missionQuote: { flex: 1, background: KL_BRAND_LIGHT, borderRadius: 12, padding: '24px', textAlign: 'center' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 12, padding: '20px', textAlign: 'center' },
  sectionTitle: { fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 20 },
  valuesGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 },
  valueCard: { background: '#fff', borderRadius: 12, padding: '20px', textAlign: 'center' },
  valueIcon: { width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 },
  stepCard: { background: '#fff', borderRadius: 12, padding: '24px', textAlign: 'center' },
  stepNumber: { width: 40, height: 40, borderRadius: '50%', background: KL_BRAND, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 700 },
  ctaCard: { background: KL_BRAND_LIGHT, borderRadius: 12, padding: '32px', textAlign: 'center' },
  ctaBtn: { background: KL_BRAND, border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 600 },
  rightSidebar: { width: 300, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16 },
  rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #dddfe2' },
  whyList: { listStyle: 'none', padding: 0, fontSize: 13, lineHeight: 2 },
  contactCard: { background: KL_BRAND_LIGHT, borderRadius: 12, padding: '16px', textAlign: 'center' }, contactBtn: { background: KL_BRAND, border: 'none', borderRadius: 6, padding: '8px 16px', width: '100%', marginTop: 12 },
};

export default About;