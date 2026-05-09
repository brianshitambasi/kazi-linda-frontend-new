import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Spinner } from 'react-bootstrap';
import { 
  FaShieldAlt, FaBriefcase, FaUsers, FaGlobeAfrica, FaArrowRight, 
  FaStar, FaMapMarkerAlt, FaMoneyBillWave,
  FaHome, FaSearch, FaBell, FaFacebookMessenger, FaEllipsisH,
  FaUserFriends, FaBookmark, FaCalendarAlt, FaUserPlus, FaEnvelope, FaHeart
} from 'react-icons/fa';
import { jobAPI } from '../services/api';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import { useAuth } from '../context/AuthContext';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const Home = () => {
  const { user } = useAuth();
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ jobs: 0, workers: 1247, countries: 15, rating: 4.8 });
  const [activeNav, setActiveNav] = useState('home');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const jobsRes = await jobAPI.getAll();
      setRecentJobs(jobsRes.data.jobs?.slice(0, 5) || []);
      setStats(prev => ({ ...prev, jobs: jobsRes.data.total || 0 }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: FaBriefcase, title: 'Verified Jobs', desc: 'All jobs are vetted for your safety', color: KL_BRAND },
    { icon: FaShieldAlt, title: 'Employer Verification', desc: 'Check employer legitimacy before applying', color: '#e41e3f' },
    { icon: FaGlobeAfrica, title: 'Global Opportunities', desc: 'Jobs in Kenya, Gulf countries, Europe', color: '#1877f2' },
    { icon: FaUsers, title: 'Worker Community', desc: 'Connect with other workers and share experiences', color: '#45bd62' }
  ];

  const testimonials = [
    { name: 'Mary Wanjiku', role: 'House Help in Riyadh', text: 'KAZI LINDA helped me find a legitimate job! I feel safe and secure.', rating: 5, daysAgo: 2 },
    { name: 'John Kamau', role: 'Driver in Dubai', text: 'The blacklist feature saved me from a scam! Highly recommended.', rating: 5, daysAgo: 5 },
    { name: 'Sarah Otieno', role: 'Nanny in Nairobi', text: 'Easy to use and very helpful! Found a great family to work with.', rating: 4, daysAgo: 1 }
  ];

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
    { id: 'verify', icon: FaShieldAlt, label: 'Verify', link: '/verify' },
    { id: 'community', icon: FaUsers, label: 'Community', link: '/social' },
  ];

  const leftLinks = [
    { icon: FaBriefcase, label: 'Browse Jobs', color: KL_BRAND, link: '/jobs' },
    { icon: FaShieldAlt, label: 'Verify Employer', color: '#e41e3f', link: '/verify' },
    { icon: FaUserFriends, label: 'Worker Community', color: '#1877f2', link: '/social' },
    { icon: FaBookmark, label: 'Saved Jobs', color: '#7c3aed', link: '/saved-jobs' },
    { icon: FaCalendarAlt, label: 'Job Events', color: KL_BRAND, link: '/events' },
  ];

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
          <Link to="/" style={styles.logoBox}>
            <span style={styles.logoText}>KL</span>
          </Link>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input style={styles.searchInput} placeholder="Search KaziLinda..." />
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
            <span style={styles.sidebarLinkText}>{user?.name || 'Guest User'}</span>
          </Link>

          {leftLinks.map(({ icon: Icon, label, color, link }) => (
            <Link key={label} to={link} style={styles.sidebarNavItem}>
              <span style={{ ...styles.sidebarIconWrap, background: color + '22' }}>
                <Icon size={18} color={color} />
              </span>
              <span style={styles.sidebarLinkText}>{label}</span>
            </Link>
          ))}

          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarSectionTitle}>Top Countries</div>
          {['Saudi Arabia', 'UAE', 'Qatar', 'Kenya'].map(country => (
            <button key={country} style={styles.sidebarNavItem}>
              <span style={styles.countryFlag}>🌍</span>
              <span style={styles.sidebarLinkText}>{country}</span>
            </button>
          ))}

          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>
            Privacy · Terms · Safety Tips<br />
            © {new Date().getFullYear()} KaziLinda
          </div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.heroCard}>
            <div style={styles.heroIcon}>
              <FaShieldAlt size={48} color={KL_BRAND} />
            </div>
            <h1 style={styles.heroTitle}>Welcome back, {user?.name?.split(' ')[0] || 'Job Seeker'}!</h1>
            <p style={styles.heroDesc}>
              Find verified jobs, protect yourself from exploitation, and stay safe wherever you work.
            </p>
            <div style={styles.heroButtons}>
              <Button as={Link} to="/jobs" style={styles.primaryBtn}>
                <FaBriefcase className="me-2" /> Find Jobs
              </Button>
              <Button as={Link} to="/verify" style={styles.outlineBtn}>
                <FaShieldAlt className="me-2" /> Verify Employer
              </Button>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <h3 style={styles.statNumber}>{stats.jobs}+</h3>
              <p style={styles.statLabel}>Verified Jobs</p>
            </div>
            <div style={styles.statItem}>
              <h3 style={styles.statNumber}>{stats.workers}+</h3>
              <p style={styles.statLabel}>Workers</p>
            </div>
            <div style={styles.statItem}>
              <h3 style={styles.statNumber}>{stats.countries}</h3>
              <p style={styles.statLabel}>Countries</p>
            </div>
            <div style={styles.statItem}>
              <h3 style={styles.statNumber}>{stats.rating}</h3>
              <p style={styles.statLabel}>Rating ★</p>
            </div>
          </div>

          <div style={styles.sectionHeader}>
            <h3>Why Choose KAZI LINDA?</h3>
          </div>
          <div style={styles.featuresGrid}>
            {features.map((feature, idx) => (
              <div key={idx} style={styles.featureItem}>
                <div style={{ ...styles.featureIcon, backgroundColor: feature.color + '22' }}>
                  <feature.icon size={24} color={feature.color} />
                </div>
                <div>
                  <h4 style={styles.featureTitle}>{feature.title}</h4>
                  <p style={styles.featureDesc}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.sectionHeader}>
            <h3>Recent Job Opportunities</h3>
            <Link to="/jobs" style={styles.seeAllLink}>See All <FaArrowRight size={12} /></Link>
          </div>

          {recentJobs.map(job => (
            <div key={job._id} style={styles.jobCard}>
              <div style={styles.jobHeader}>
                <div>
                  <h4 style={styles.jobTitle}>{job.title}</h4>
                  <div style={styles.jobMeta}>
                    <span><FaMapMarkerAlt size={12} /> {job.country || 'Kenya'}</span>
                    <span><FaMoneyBillWave size={12} /> {job.salary} {job.salaryCurrency}</span>
                  </div>
                </div>
                <span style={styles.verifiedBadge}>Verified</span>
              </div>
              <p style={styles.jobDesc}>{job.description?.substring(0, 120)}...</p>
              <div style={styles.jobActions}>
                <Button as={Link} to={`/jobs/${job._id}`} style={styles.jobBtn}>
                  View Details
                </Button>
                <button style={styles.saveBtn}>Save</button>
              </div>
            </div>
          ))}

          {recentJobs.length === 0 && (
            <div style={styles.emptyFeed}>
              <FaBriefcase size={48} color={KL_BRAND} />
              <p>No jobs available at the moment. Check back soon!</p>
            </div>
          )}
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}>
              <FaStar color={KL_BRAND} />
              <span>Worker Testimonials</span>
            </div>
            {testimonials.map((t, idx) => (
              <div key={idx} style={styles.testimonialItem}>
                <div style={styles.testimonialStars}>
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} color={i < t.rating ? KL_BRAND : '#dddfe2'} size={12} />
                  ))}
                </div>
                <p style={styles.testimonialText}>"{t.text}"</p>
                <div style={styles.testimonialAuthor}>
                  <strong>{t.name}</strong>
                  <span style={styles.testimonialRole}>{t.role}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}>
              <FaShieldAlt color={KL_BRAND} />
              <span>Safety Tips</span>
            </div>
            <ul style={styles.tipsList}>
              <li>✓ Never pay upfront fees</li>
              <li>✓ Verify employer credentials</li>
              <li>✓ Check contract details</li>
              <li>✓ Keep emergency contacts</li>
            </ul>
          </div>

          <div style={styles.getStartedCard}>
            <h4>Ready to find safe employment?</h4>
            <p>Join thousands of Kenyans who have found secure jobs through KAZI LINDA.</p>
            <Button as={Link} to="/register" style={styles.getStartedBtn}>
              Register Now
            </Button>
          </div>

          <div style={styles.sidebarFooter}>
            © {new Date().getFullYear()} KaziLinda
          </div>
        </aside>
      </div>
    </div>
  );
};

const styles = {
  page: {
    background: '#f0f2f5',
    minHeight: '100vh',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, height: 56,
    background: '#fff', borderBottom: '1px solid #dddfe2',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', zIndex: 200,
    boxShadow: '0 2px 4px rgba(0,0,0,.08)',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  navCenter: { display: 'flex', gap: 4 },
  navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  logoBox: {
    width: 40, height: 40, borderRadius: '50%',
    background: KL_BRAND,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none',
  },
  logoText: { color: '#fff', fontWeight: 900, fontSize: 18, fontStyle: 'italic' },
  searchBox: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 12, color: '#65676b', fontSize: 14 },
  searchInput: {
    background: '#f0f2f5', border: 'none', borderRadius: 20,
    padding: '8px 16px 8px 36px', fontSize: 15, outline: 'none',
    width: 240, color: '#050505',
  },
  navTab: {
    width: 100, height: 48, border: 'none', background: 'transparent',
    borderRadius: 10, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', position: 'relative',
    textDecoration: 'none',
  },
  navTabActive: { background: KL_BRAND_LIGHT },
  navTabLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
    background: KL_BRAND, borderRadius: '2px 2px 0 0',
  },
  navIconBtn: {
    position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer',
  },
  navIconInner: {
    width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: 0, right: 0,
    background: '#e41e3f', color: '#fff', borderRadius: 10,
    fontSize: 11, fontWeight: 700, padding: '1px 5px',
  },
  body: {
    display: 'flex', paddingTop: 56,
    maxWidth: 1440, margin: '0 auto',
  },
  leftSidebar: {
    width: 280, flexShrink: 0,
    padding: '12px 8px',
    position: 'sticky', top: 56, height: 'calc(100vh - 56px)',
    overflowY: 'auto',
  },
  sidebarProfileLink: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '8px 8px', borderRadius: 8,
    textDecoration: 'none', color: '#050505',
    fontWeight: 500, fontSize: 15,
  },
  sidebarNavItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '8px 8px', borderRadius: 8,
    textDecoration: 'none', color: '#050505',
    fontWeight: 500, fontSize: 15,
  },
  sidebarIconWrap: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  sidebarLinkText: { fontSize: 15, fontWeight: 500, color: '#050505' },
  sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '8px 0' },
  sidebarSectionTitle: { fontSize: 17, fontWeight: 700, color: '#65676b', padding: '8px 8px' },
  sidebarFooter: { fontSize: 12, color: '#65676b', padding: 8, lineHeight: 1.8 },
  countryFlag: { fontSize: 18, width: 36 },
  feedCol: {
    flex: 1, maxWidth: 590, margin: '0 16px', padding: '16px 0',
    minWidth: 0,
  },
  heroCard: {
    background: '#fff', borderRadius: 12, padding: '24px',
    textAlign: 'center', marginBottom: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  heroIcon: { marginBottom: 16 },
  heroTitle: { fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#050505' },
  heroDesc: { color: '#65676b', marginBottom: 20, fontSize: 15 },
  heroButtons: { display: 'flex', gap: 12, justifyContent: 'center' },
  primaryBtn: {
    background: KL_BRAND, border: 'none', borderRadius: 6,
    padding: '8px 20px', fontWeight: 600, fontSize: 14,
  },
  outlineBtn: {
    background: 'transparent', border: `1px solid ${KL_BRAND}`,
    color: KL_BRAND, borderRadius: 6, padding: '8px 20px',
    fontWeight: 600, fontSize: 14,
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12, background: '#fff', borderRadius: 12,
    padding: '16px', marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  statItem: { textAlign: 'center' },
  statNumber: { fontSize: 28, fontWeight: 700, color: KL_BRAND, marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#65676b', margin: 0 },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  seeAllLink: { fontSize: 13, color: KL_BRAND, textDecoration: 'none' },
  featuresGrid: {
    background: '#fff', borderRadius: 12, padding: '16px',
    marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  featureItem: {
    display: 'flex', gap: 12, padding: '12px 0',
    borderBottom: '1px solid #dddfe2',
  },
  featureIcon: {
    width: 48, height: 48, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  featureTitle: { fontSize: 15, fontWeight: 600, marginBottom: 4, color: '#050505' },
  featureDesc: { fontSize: 13, color: '#65676b', margin: 0 },
  jobCard: {
    background: '#fff', borderRadius: 12, padding: '16px',
    marginBottom: 12, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  jobHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12,
  },
  jobTitle: { fontSize: 16, fontWeight: 600, marginBottom: 4, color: '#050505' },
  jobMeta: { display: 'flex', gap: 16, fontSize: 12, color: '#65676b' },
  jobDesc: { fontSize: 14, color: '#65676b', marginBottom: 12, lineHeight: 1.4 },
  jobActions: { display: 'flex', gap: 8 },
  jobBtn: {
    background: KL_BRAND, border: 'none', borderRadius: 6,
    padding: '6px 16px', fontSize: 13, fontWeight: 500,
    textDecoration: 'none', color: '#fff',
  },
  saveBtn: {
    background: '#e4e6eb', border: 'none', borderRadius: 6,
    padding: '6px 16px', fontSize: 13, fontWeight: 500,
    cursor: 'pointer',
  },
  verifiedBadge: {
    background: '#45bd62', color: '#fff', padding: '2px 8px',
    borderRadius: 12, fontSize: 10, fontWeight: 600,
  },
  rightSidebar: {
    width: 320, flexShrink: 0,
    padding: '12px 8px',
    position: 'sticky', top: 56, height: 'calc(100vh - 56px)',
    overflowY: 'auto',
  },
  rightCard: {
    background: '#fff', borderRadius: 12, padding: '16px',
    marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  rightCardHeader: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 16, fontWeight: 600, marginBottom: 12,
    paddingBottom: 8, borderBottom: '1px solid #dddfe2',
  },
  testimonialItem: { padding: '8px 0', borderBottom: '1px solid #f0f2f5' },
  testimonialStars: { marginBottom: 6 },
  testimonialText: { fontSize: 13, color: '#050505', marginBottom: 8, lineHeight: 1.4 },
  testimonialAuthor: { display: 'flex', justifyContent: 'space-between', fontSize: 12 },
  testimonialRole: { color: '#65676b' },
  tipsList: { listStyle: 'none', padding: 0, margin: 0, fontSize: 13, lineHeight: 2 },
  getStartedCard: {
    background: `linear-gradient(135deg, ${KL_BRAND}22 0%, #fff 100%)`,
    borderRadius: 12, padding: '16px', textAlign: 'center',
    marginBottom: 16,
  },
  getStartedBtn: {
    background: KL_BRAND, border: 'none', borderRadius: 6,
    padding: '8px 20px', fontWeight: 600, fontSize: 14, width: '100%',
  },
  emptyFeed: {
    textAlign: 'center', padding: 48, background: '#fff',
    borderRadius: 12, color: '#65676b',
  },
  loadingWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100vh', background: '#f0f2f5',
  },
  loadingLogo: {
    width: 60, height: 60, borderRadius: '50%', background: KL_BRAND,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 900, fontSize: 24, fontStyle: 'italic',
  },
};

export default Home;