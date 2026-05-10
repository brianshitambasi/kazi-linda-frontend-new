import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import {
  FaShieldAlt, FaBriefcase, FaUsers, FaGlobeAfrica,
  FaArrowRight, FaStar, FaMapMarkerAlt, FaMoneyBillWave,
  FaSearch, FaCheckCircle, FaBell, FaEllipsisH, 
  FaHome, FaCalendarAlt, FaUserFriends, FaBookmark, FaClock, FaChevronDown,
  FaThumbsUp, FaComment, FaShare
} from 'react-icons/fa';
import { jobAPI } from '../services/api';

const KL_BRAND = '#f39c12';
const KL_DARK  = '#d68910';
const KL_LIGHT = '#fef9e7';
const KL_BG    = '#f0f2f5';

/* ── tiny Card wrapper ── */
const Card = ({ style, children, ...rest }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 1px 2px rgba(0,0,0,.2)',
      overflow: 'hidden',
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

const Stars = ({ n }) => (
  <span>
    {[...Array(5)].map((_, i) => (
      <FaStar key={i} size={14} color={i < n ? KL_BRAND : '#ccc'} />
    ))}
  </span>
);

/* ════════════════════════════════════════ */
const Home = () => {
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [stats, setStats]           = useState({ jobs: 0, workers: 1000, rating: 4.8 });
  const [activeNav, setActiveNav]   = useState('home');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await jobAPI.getAll();
      setRecentJobs(res.data.jobs?.slice(0, 3) || []);
      setStats(prev => ({ ...prev, jobs: res.data.total || 0 }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: FaBriefcase,   title: 'Verified Jobs',         desc: 'Every listing vetted for your safety',      color: '#1877f2' },
    { icon: FaShieldAlt,   title: 'Employer Verification', desc: 'Instantly check if an employer is legit',   color: '#e41e3f' },
    { icon: FaGlobeAfrica, title: 'Global Opportunities',  desc: 'Kenya, Gulf, Europe & more',                color: '#31a24c' },
    { icon: FaUsers,       title: 'Worker Community',      desc: 'Connect, share, and protect each other',    color: KL_BRAND  },
  ];

  const testimonials = [
    { name: 'Mary Wanjiku', role: 'House Help · Riyadh',  text: 'KAZI LINDA helped me find a legitimate job abroad. I feel safe!', rating: 5, color: '#1877f2' },
    { name: 'John Kamau',   role: 'Driver · Dubai',       text: 'The blacklist feature saved me from a scam employer. Amazing!',   rating: 5, color: '#31a24c' },
    { name: 'Sarah Otieno', role: 'Nanny · Nairobi',      text: 'Very easy to use and incredibly helpful for first-time workers.', rating: 4, color: '#7c3aed' },
  ];

  const navTabs = [
    { id: 'home',   icon: FaHome,        label: 'Home'      },
    { id: 'jobs',   icon: FaBriefcase,   label: 'Jobs'      },
    { id: 'verify', icon: FaShieldAlt,   label: 'Verify'    },
    { id: 'groups', icon: FaUsers,       label: 'Community' },
    { id: 'events', icon: FaCalendarAlt, label: 'Events'    },
  ];

  const leftLinks = [
    { icon: FaBriefcase,   label: 'Browse Jobs',     color: '#1877f2', to: '/jobs'     },
    { icon: FaShieldAlt,   label: 'Verify Employer', color: '#e41e3f', to: '/verify'   },
    { icon: FaGlobeAfrica, label: 'Abroad Jobs',     color: '#31a24c', to: '/jobs'     },
    { icon: FaUserFriends, label: 'Community',       color: KL_BRAND,  to: '/social'   },
    { icon: FaBookmark,    label: 'Saved Jobs',      color: '#7c3aed', to: '/saved'    },
    { icon: FaClock,       label: 'Recent Activity', color: '#0891b2', to: '/activity' },
  ];

  if (loading) {
    return (
      <div style={s.loadingWrap}>
        <div style={s.loadingLogo}>KL</div>
        <Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} />
      </div>
    );
  }

  return (
    <div style={s.page}>

      {/* ══ TOP NAV ══ */}
      <nav style={s.nav}>
        {/* Left */}
        <div style={s.navLeft}>
          <Link to="/" style={s.logoBox}><span style={s.logoText}>KL</span></Link>
          <div style={s.searchWrap}>
            <FaSearch style={s.searchIcon} />
            <input style={s.searchInput} placeholder="Search KaziLinda" />
          </div>
        </div>

        {/* Center tabs */}
        <div style={s.navCenter}>
          {navTabs.map(tab => (
            <button
              key={tab.id}
              style={{ ...s.navTab, ...(activeNav === tab.id ? s.navTabActive : {}) }}
              onClick={() => setActiveNav(tab.id)}
              title={tab.label}
            >
              <tab.icon size={22} style={{ color: activeNav === tab.id ? KL_BRAND : '#65676b' }} />
              {activeNav === tab.id && <div style={s.navTabLine} />}
            </button>
          ))}
        </div>

        {/* Right */}
        <div style={s.navRight}>
          <button style={s.navIconBtn}>
            <div style={s.navIconInner}><FaEllipsisH size={17} color="#050505" /></div>
          </button>
          <button style={s.navIconBtn}>
            <div style={s.navIconInner}><FaBell size={17} color="#050505" /></div>
            <span style={s.badge}>3</span>
          </button>
          <Link to="/register" style={s.registerBtn}>Register</Link>
          <Link to="/login"    style={s.loginBtn}>Log in</Link>
        </div>
      </nav>

      {/* ══ BODY ══ */}
      <div style={s.body}>

        {/* ── LEFT SIDEBAR ── */}
        <aside style={s.leftSidebar}>
          {leftLinks.map(({ icon: Icon, label, color, to }) => (
            <Link key={label} to={to} style={s.sidebarLink}>
              <span style={{ ...s.sidebarIconWrap, background: color + '22' }}>
                <Icon size={17} color={color} />
              </span>
              <span style={s.sidebarLinkText}>{label}</span>
            </Link>
          ))}

          <button style={s.seeMoreBtn}>
            <span style={s.seeMoreIcon}><FaChevronDown size={13} color="#050505" /></span>
            See more
          </button>

          <div style={s.divider} />
          <div style={s.sidebarSectionTitle}>Quick Stats</div>

          {[
            { label: 'Verified Jobs',     value: `${stats.jobs}+`, color: '#1877f2' },
            { label: 'Workers Protected', value: '1,000+',         color: '#31a24c' },
            { label: 'User Rating',       value: `${stats.rating}★`, color: KL_BRAND },
          ].map(({ label, value, color }) => (
            <div key={label} style={s.statRow}>
              <span style={{ ...s.statValue, color }}>{value}</span>
              <span style={s.statLabel}>{label}</span>
            </div>
          ))}

          <div style={s.divider} />
          <div style={s.sidebarFooter}>
            Privacy · Terms · Advertising<br />
            © {new Date().getFullYear()} KaziLinda
          </div>
        </aside>

        {/* ── MAIN FEED ── */}
        <main style={s.feedCol}>

          {/* HERO */}
          <Card style={{ marginBottom: 16 }}>
            <div style={s.heroInner}>
              <FaShieldAlt size={56} color={KL_BRAND} style={{ marginBottom: 12 }} />
              <h1 style={s.heroTitle}>KAZI LINDA</h1>
              <p style={s.heroSub}>Safe Jobs for Kenyans at Home and Abroad</p>
              <p style={s.heroDesc}>
                Find verified jobs, protect yourself from exploitation,
                and stay safe wherever you work.
              </p>
              <div style={s.heroBtns}>
                <Link to="/jobs"   style={s.heroBtnPrimary}>
                  <FaBriefcase style={{ marginRight: 8 }} /> Find Jobs
                  <FaArrowRight style={{ marginLeft: 8 }} />
                </Link>
                <Link to="/verify" style={s.heroBtnSecondary}>
                  <FaShieldAlt style={{ marginRight: 8 }} /> Verify Employer
                </Link>
              </div>
            </div>
          </Card>

          {/* Stats row */}
          <div style={s.statsRow}>
            {[
              { value: `${stats.jobs}+`, label: 'Verified Jobs' },
              { value: '1,000+',         label: 'Workers Protected' },
              { value: `${stats.rating}★`, label: 'User Rating' },
            ].map(({ value, label }) => (
              <Card key={label} style={{ flex: 1, textAlign: 'center', padding: 20 }}>
                <div style={s.statBig}>{value}</div>
                <div style={s.statSmall}>{label}</div>
              </Card>
            ))}
          </div>

          {/* Why KaziLinda */}
          <Card style={{ marginBottom: 16 }}>
            <div style={s.sectionHeader}>
              <span style={s.sectionTitle}>Why Choose KaziLinda?</span>
            </div>
            <div style={s.featuresGrid}>
              {features.map(({ icon: Icon, title, desc, color }) => (
                <div key={title} style={s.featureItem}>
                  <div style={{ ...s.featureIcon, background: color + '18' }}>
                    <Icon size={26} color={color} />
                  </div>
                  <div style={s.featureTitle}>{title}</div>
                  <div style={s.featureDesc}>{desc}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Jobs */}
          <Card style={{ marginBottom: 16 }}>
            <div style={s.sectionHeader}>
              <span style={s.sectionTitle}>Recent Job Opportunities</span>
              <Link to="/jobs" style={s.seeAllLink}>
                See all <FaArrowRight size={11} />
              </Link>
            </div>
            {recentJobs.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: '#65676b' }}>
                No jobs available right now.
              </div>
            )}
            {recentJobs.map((job, i) => (
              <div
                key={job._id}
                style={{ ...s.jobRow, borderTop: i === 0 ? 'none' : '1px solid #f0f2f5' }}
              >
                <div style={s.jobIconWrap}>
                  <FaBriefcase size={22} color={KL_BRAND} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.jobTitle}>{job.title}</div>
                  <div style={s.jobMeta}>
                    <FaMapMarkerAlt size={11} color="#65676b" style={{ marginRight: 4 }} />
                    {job.country}
                    <FaMoneyBillWave size={11} color="#65676b" style={{ marginLeft: 12, marginRight: 4 }} />
                    {job.salary} {job.salaryCurrency}
                  </div>
                  <div style={s.jobDesc}>{job.description?.substring(0, 90)}…</div>
                </div>
                <Link to={`/jobs/${job._id}`} style={s.jobViewBtn}>View</Link>
              </div>
            ))}
          </Card>

          {/* Testimonials styled as FB posts */}
          <div style={{ ...s.sectionHeader, paddingLeft: 0, marginBottom: 12 }}>
            <span style={{ ...s.sectionTitle, fontSize: 20 }}>What Workers Say</span>
          </div>

          {testimonials.map((t, i) => (
            <Card key={i} style={{ marginBottom: 16 }}>
              <div style={s.postHeader}>
                <div style={{ ...s.testAvatar, background: t.color }}>
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ marginLeft: 10 }}>
                  <div style={s.postAuthor}>{t.name}</div>
                  <div style={s.postMeta}>{t.role} · Verified Worker</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <Stars n={t.rating} />
                </div>
              </div>
              <div style={s.postContent}>"{t.text}"</div>
              <div style={s.postStats}>
                <span style={{ fontSize: 14, color: '#65676b' }}>
                  <FaThumbsUp size={12} color="#1877f2" style={{ marginRight: 4 }} />
                  {[48, 124, 37][i]} people found this helpful
                </span>
              </div>
              <div style={s.postActions}>
                <button style={s.postActionBtn}><FaThumbsUp size={16} style={{ marginRight: 6 }} /> Helpful</button>
                <button style={s.postActionBtn}><FaComment  size={16} style={{ marginRight: 6 }} /> Comment</button>
                <button style={s.postActionBtn}><FaShare    size={16} style={{ marginRight: 6 }} /> Share</button>
              </div>
            </Card>
          ))}

          {/* CTA */}
          <Card style={{ marginBottom: 24 }}>
            <div style={s.ctaInner}>
              <FaCheckCircle size={48} color={KL_BRAND} style={{ marginBottom: 12 }} />
              <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
                Ready to find safe employment?
              </h3>
              <p style={{ color: '#65676b', marginBottom: 20 }}>
                Join thousands of Kenyans who have found secure jobs through KaziLinda.
              </p>
              <Link to="/register" style={s.heroBtnPrimary}>
                Register Now <FaArrowRight style={{ marginLeft: 8 }} />
              </Link>
            </div>
          </Card>
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside style={s.rightSidebar}>

          {/* Job search widget */}
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <div style={s.sidebarSectionTitle}>Quick Job Search</div>
            <input style={s.widgetInput} placeholder="Job title or keyword…" />
            <input style={{ ...s.widgetInput, marginTop: 8 }} placeholder="Country or city…" />
            <Link
              to="/jobs"
              style={{ ...s.heroBtnPrimary, display: 'flex', justifyContent: 'center', marginTop: 12, textDecoration: 'none', borderRadius: 6 }}
            >
              <FaSearch style={{ marginRight: 6 }} /> Search Jobs
            </Link>
          </Card>

          {/* Highlights */}
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <div style={s.sidebarSectionTitle}>Platform Highlights</div>
            {[
              { icon: FaShieldAlt,   label: 'Employer blacklist',    color: '#e41e3f' },
              { icon: FaCheckCircle, label: 'Contract verification',  color: '#31a24c' },
              { icon: FaUsers,       label: 'Peer support groups',   color: '#7c3aed' },
              { icon: FaGlobeAfrica, label: '15+ countries covered', color: '#0891b2' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} style={s.highlightRow}>
                <div style={{ ...s.highlightIcon, background: color + '18' }}>
                  <Icon size={14} color={color} />
                </div>
                <span style={{ fontSize: 14, color: '#050505' }}>{label}</span>
              </div>
            ))}
          </Card>

          {/* Trending destinations */}
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <div style={s.sidebarSectionTitle}>Trending Destinations</div>
            {[
              { country: 'Saudi Arabia',        jobs: 142, flag: '🇸🇦' },
              { country: 'United Arab Emirates',jobs: 98,  flag: '🇦🇪' },
              { country: 'Qatar',               jobs: 76,  flag: '🇶🇦' },
              { country: 'Canada',              jobs: 54,  flag: '🇨🇦' },
              { country: 'Germany',             jobs: 41,  flag: '🇩🇪' },
            ].map(({ country, jobs, flag }) => (
              <div key={country} style={s.destinationRow}>
                <span style={{ fontSize: 22 }}>{flag}</span>
                <div style={{ flex: 1, marginLeft: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#050505' }}>{country}</div>
                  <div style={{ fontSize: 12, color: '#65676b' }}>{jobs} open positions</div>
                </div>
                <Link to="/jobs" style={{ fontSize: 13, color: KL_BRAND, textDecoration: 'none', fontWeight: 600 }}>
                  View →
                </Link>
              </div>
            ))}
          </Card>

          <div style={s.rsFooter}>
            Privacy · Terms · Advertising<br />
            © {new Date().getFullYear()} KaziLinda
          </div>
        </aside>
      </div>

      <style>{`
        /* hover states */
        nav button:hover { background: #f0f2f5 !important; }
        /* scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-thumb { background: #bcc0c4; border-radius: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        /* responsive */
        @media (max-width: 1100px) { aside:last-of-type { display: none !important; } }
        @media (max-width: 768px)  { aside:first-of-type { display: none !important; } }
      `}</style>
    </div>
  );
};

/* ════════════════ STYLES ════════════════ */
const s = {
  page: {
    background: KL_BG, minHeight: '100vh',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    color: '#050505',
  },

  /* NAV */
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, height: 56,
    background: '#fff', borderBottom: '1px solid #dddfe2',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', zIndex: 200, boxShadow: '0 2px 4px rgba(0,0,0,.08)',
  },
  navLeft:   { display: 'flex', alignItems: 'center', gap: 8, flex: 1 },
  navCenter: { display: 'flex', gap: 2, flex: 1, justifyContent: 'center' },
  navRight:  { display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' },
  logoBox: {
    width: 40, height: 40, borderRadius: '50%', background: KL_BRAND,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none', flexShrink: 0,
  },
  logoText: { color: '#fff', fontWeight: 900, fontSize: 17, fontStyle: 'italic' },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 12, color: '#65676b', fontSize: 13 },
  searchInput: {
    background: '#f0f2f5', border: 'none', borderRadius: 20,
    padding: '8px 16px 8px 34px', fontSize: 15, outline: 'none', width: 220, color: '#050505',
  },
  navTab: {
    width: 90, height: 48, border: 'none', background: 'transparent', borderRadius: 10,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  navTabActive: { background: KL_LIGHT },
  navTabLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
    background: KL_BRAND, borderRadius: '2px 2px 0 0',
  },
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 },
  navIconInner: {
    width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: 0, right: 0, background: '#e41e3f', color: '#fff',
    borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '1px 5px', minWidth: 18, textAlign: 'center',
  },
  registerBtn: {
    background: KL_BRAND, color: '#fff', border: 'none', borderRadius: 6,
    padding: '6px 16px', fontWeight: 700, textDecoration: 'none', fontSize: 15,
  },
  loginBtn: {
    background: '#e7f3ff', color: '#1877f2', border: 'none', borderRadius: 6,
    padding: '6px 16px', fontWeight: 700, textDecoration: 'none', fontSize: 15,
  },

  /* BODY */
  body: { display: 'flex', paddingTop: 56, maxWidth: 1440, margin: '0 auto' },

  /* LEFT SIDEBAR */
  leftSidebar: {
    width: 280, flexShrink: 0, padding: '12px 8px',
    position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto',
  },
  sidebarLink: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '8px',
    borderRadius: 8, textDecoration: 'none', color: '#050505',
    fontWeight: 500, fontSize: 15, marginBottom: 2,
  },
  sidebarIconWrap: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sidebarLinkText: { fontSize: 15, fontWeight: 500 },
  seeMoreBtn: {
    display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderRadius: 8,
    border: 'none', background: 'transparent', cursor: 'pointer', width: '100%',
    fontSize: 15, fontWeight: 500, color: '#050505',
  },
  seeMoreIcon: {
    width: 36, height: 36, borderRadius: '50%', background: '#e4e6eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  divider: { borderTop: '1px solid #dddfe2', margin: '8px 0' },
  sidebarSectionTitle: { fontSize: 17, fontWeight: 700, color: '#65676b', padding: '4px 8px', marginBottom: 8 },
  statRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px' },
  statValue: { fontSize: 20, fontWeight: 700, minWidth: 70 },
  statLabel: { fontSize: 14, color: '#65676b' },
  sidebarFooter: { fontSize: 12, color: '#65676b', padding: 8, lineHeight: 1.8 },

  /* FEED */
  feedCol: { flex: 1, maxWidth: 590, margin: '0 auto', padding: '16px 8px', minWidth: 0 },

  /* HERO */
  heroInner: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    padding: '40px 24px',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff',
  },
  heroTitle: { fontSize: 48, fontWeight: 900, marginBottom: 8, letterSpacing: -1 },
  heroSub:   { fontSize: 20, fontWeight: 600, marginBottom: 10, color: KL_BRAND },
  heroDesc:  { fontSize: 16, color: '#ccc', marginBottom: 24, maxWidth: 440 },
  heroBtns:  { display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  heroBtnPrimary: {
    display: 'inline-flex', alignItems: 'center', background: KL_BRAND, color: '#fff',
    border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 16,
    textDecoration: 'none', cursor: 'pointer',
  },
  heroBtnSecondary: {
    display: 'inline-flex', alignItems: 'center', background: 'transparent', color: '#fff',
    border: '2px solid rgba(255,255,255,.4)', borderRadius: 8, padding: '10px 22px',
    fontWeight: 700, fontSize: 16, textDecoration: 'none', cursor: 'pointer',
  },

  /* STATS ROW */
  statsRow: { display: 'flex', gap: 12, marginBottom: 16 },
  statBig:  { fontSize: 32, fontWeight: 800, color: KL_BRAND, lineHeight: 1 },
  statSmall:{ fontSize: 14, color: '#65676b', marginTop: 4 },

  /* SECTION */
  sectionHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px 10px',
  },
  sectionTitle: { fontSize: 20, fontWeight: 700, color: '#050505' },
  seeAllLink: {
    fontSize: 14, color: KL_BRAND, textDecoration: 'none', fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 4,
  },

  /* FEATURES */
  featuresGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
    padding: '0 8px 16px',
  },
  featureItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', padding: '16px 12px',
  },
  featureIcon: {
    width: 56, height: 56, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  featureTitle: { fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#050505' },
  featureDesc:  { fontSize: 13, color: '#65676b', lineHeight: 1.5 },

  /* JOBS */
  jobRow: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px' },
  jobIconWrap: {
    width: 48, height: 48, borderRadius: 8, background: KL_LIGHT,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  jobTitle: { fontSize: 16, fontWeight: 700, color: '#050505', marginBottom: 4 },
  jobMeta:  { fontSize: 13, color: '#65676b', display: 'flex', alignItems: 'center', marginBottom: 4 },
  jobDesc:  { fontSize: 14, color: '#65676b' },
  jobViewBtn: {
    background: KL_LIGHT, color: KL_DARK, border: `1px solid ${KL_BRAND}`,
    borderRadius: 6, padding: '6px 14px', fontWeight: 700, fontSize: 14,
    textDecoration: 'none', flexShrink: 0, alignSelf: 'center',
  },

  /* TESTIMONIAL POSTS */
  postHeader: { display: 'flex', alignItems: 'center', padding: '12px 16px 0' },
  testAvatar: {
    width: 42, height: 42, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0,
  },
  postAuthor:  { fontSize: 15, fontWeight: 700, color: '#050505' },
  postMeta:    { fontSize: 13, color: '#65676b' },
  postContent: { padding: '10px 16px 12px', fontSize: 16, lineHeight: 1.6, color: '#050505' },
  postStats:   { padding: '6px 16px', borderBottom: '1px solid #f0f2f5', borderTop: '1px solid #f0f2f5' },
  postActions: { display: 'flex', padding: '4px 8px' },
  postActionBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    padding: '6px 0', borderRadius: 4, border: 'none', background: 'transparent',
    cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#65676b',
  },

  /* CTA */
  ctaInner: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', padding: '36px 24px', background: '#f0f2f5',
  },

  /* RIGHT SIDEBAR */
  rightSidebar: {
    width: 280, flexShrink: 0, padding: '12px 8px',
    position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto',
  },
  widgetInput: {
    width: '100%', background: '#f0f2f5', border: 'none',
    borderRadius: 8, padding: '8px 12px', fontSize: 15, outline: 'none', color: '#050505',
  },
  highlightRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' },
  highlightIcon: {
    width: 30, height: 30, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  destinationRow: {
    display: 'flex', alignItems: 'center', padding: '8px 0',
    borderBottom: '1px solid #f0f2f5',
  },
  rsFooter: { fontSize: 12, color: '#65676b', padding: '12px 4px', textAlign: 'center', lineHeight: 1.8 },

  /* LOADING */
  loadingWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100vh', background: KL_BG,
  },
  loadingLogo: {
    width: 64, height: 64, borderRadius: '50%', background: KL_BRAND,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 900, fontSize: 26, fontStyle: 'italic',
  },
};

export default Home;