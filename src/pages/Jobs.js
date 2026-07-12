import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { jobAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Row, Card, Button, Spinner, Badge, Col } from "react-bootstrap";
import { 
  FaMapMarkerAlt, FaMoneyBillWave, FaSearch, 
  FaHome, FaBell, FaFacebookMessenger, FaEllipsisH, FaUsers, 
  FaShieldAlt, FaBriefcase, FaLeaf, FaClock, FaStar, FaBookmark,
  FaRegBookmark
} from 'react-icons/fa';
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

const Jobs = () => {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [countries, setCountries] = useState([]);
  const [activeNav, setActiveNav] = useState('jobs');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await jobAPI.getAll();
      const jobsData = res.data.jobs || [];
      setJobs(jobsData);
      setFilteredJobs(jobsData);
      const uniqueCountries = [...new Set(jobsData.map(job => job.country).filter(Boolean))];
      setCountries(uniqueCountries);
    } catch (err) { toast.error('Failed to load jobs'); } 
    finally { setLoading(false); }
  }, []);

  const fetchAppliedJobs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/applications/my-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAppliedJobs(Array.isArray(data) ? data.map(app => app.jobId?._id) : []);
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchBookmarks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/bookmarks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBookmarkedJobs(Array.isArray(data) ? data.map(job => job._id) : []);
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => { 
    fetchJobs(); 
    if (user) {
      fetchAppliedJobs();
      fetchBookmarks();
    }
  }, [fetchJobs, fetchAppliedJobs, fetchBookmarks, user]);

  const filterJobs = useCallback(() => {
    let filtered = [...jobs];
    if (searchTerm) filtered = filtered.filter(job => 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (countryFilter) filtered = filtered.filter(job => job.country === countryFilter);
    if (selectedCategory) filtered = filtered.filter(job => job.category === selectedCategory);
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, countryFilter, selectedCategory]);

  useEffect(() => { filterJobs(); }, [filterJobs]);

  const handleQuickApply = async (jobId) => {
    if (!user) {
      toast.error('Please login to apply');
      return;
    }
    try {
      const res = await fetch(`https://kazi-linda.onrender.com/api/applications/quick-apply/${jobId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Applied successfully!');
        setAppliedJobs([...appliedJobs, jobId]);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to apply');
      }
    } catch (err) {
      toast.error('Error applying');
    }
  };

  const handleBookmark = async (jobId) => {
    if (!user) {
      toast.error('Please login to save jobs');
      return;
    }
    try {
      const isBookmarked = bookmarkedJobs.includes(jobId);
      const method = isBookmarked ? 'DELETE' : 'POST';
      const res = await fetch(`https://kazi-linda.onrender.com/api/bookmarks/${jobId}`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (isBookmarked) {
          setBookmarkedJobs(bookmarkedJobs.filter(id => id !== jobId));
          toast.info('Bookmark removed');
        } else {
          setBookmarkedJobs([...bookmarkedJobs, jobId]);
          toast.success('Job saved!');
        }
      }
    } catch (err) {
      toast.error('Error');
    }
  };

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
    { id: 'verify', icon: FaShieldAlt, label: 'Verify', link: '/verify' },
    { id: 'community', icon: FaUsers, label: 'Community', link: '/social' },
  ];

  const categories = ['All', 'Construction', 'Domestic', 'Driving', 'Nursing', 'Hospitality', 'Education', 'Security', 'Agriculture', 'Engineering', 'Technology'];

  if (loading) return <div style={styles.loadingWrap}><div style={styles.loadingLogo}>KL</div><Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} /></div>;

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Logo size={36} variant="minimal" />
          <div style={styles.searchBox}><FaSearch style={styles.searchIcon} /><input style={styles.searchInput} placeholder="Search jobs..." /></div>
        </div>
        <div style={styles.navCenter}>{navTabs.map(tab => (<Link key={tab.id} to={tab.link} style={{ ...styles.navTab, ...(activeNav === tab.id ? styles.navTabActive : {}) }} onClick={() => setActiveNav(tab.id)}><tab.icon size={24} style={{ color: activeNav === tab.id ? KL_BRAND : '#65676b' }} />{activeNav === tab.id && <div style={styles.navTabLine} />}</Link>))}</div>
        <div style={styles.navRight}><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaEllipsisH size={18} /></div></button><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaFacebookMessenger size={18} /></div></button><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaBell size={18} /></div><span style={styles.badge}>3</span></button><ClickableAvatar userId={user?._id} src={user?.profilePicture} size={40} /></div>
      </nav>

      <div style={styles.body}>
        <aside style={styles.leftSidebar}>
          <Link to={`/profile/${user?._id}`} style={styles.sidebarProfileLink}><ClickableAvatar userId={user?._id} src={user?.profilePicture} size={36} /><span>{user?.name}</span></Link>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarSectionTitle}>Job Categories</div>
          {categories.filter(c => c !== 'All').map(cat => (
            <button key={cat} style={styles.sidebarNavItem} onClick={() => setSelectedCategory(cat.toLowerCase())}>
              <FaBriefcase size={14} /> {cat}
            </button>
          ))}
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}><FaLeaf /> © {new Date().getFullYear()} KaziLinda</div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.headerCard}>
            <div style={styles.headerIcon}><FaBriefcase size={32} color={KL_BRAND} /></div>
            <div><h1 style={styles.headerTitle}>Find Your Next Job</h1><p style={styles.headerDesc}>Browse verified job opportunities from trusted employers</p></div>
          </div>

          <div style={styles.filterBar}>
            <div style={styles.filterGroup}><FaSearch style={styles.filterIcon} /><input type="text" style={styles.filterInput} placeholder="Search by job title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
            <select style={styles.filterSelect} value={countryFilter} onChange={e => setCountryFilter(e.target.value)}><option value="">All Countries</option>{countries.map(c => <option key={c} value={c}>{c}</option>)}</select>
          </div>

          <div style={styles.categoryBar}>
            {categories.map(cat => (
              <button key={cat} style={{
                ...styles.categoryBtn,
                ...(selectedCategory === (cat === 'All' ? '' : cat.toLowerCase()) ? styles.categoryBtnActive : {})
              }} onClick={() => setSelectedCategory(cat === 'All' ? '' : cat.toLowerCase())}>
                {cat}
              </button>
            ))}
          </div>

          {filteredJobs.length === 0 ? (
            <div style={styles.emptyState}><FaBriefcase size={48} color={KL_BRAND} /><p>No jobs found</p><button style={styles.clearBtn} onClick={() => { setSearchTerm(''); setCountryFilter(''); setSelectedCategory(''); }}>Clear filters</button></div>
          ) : (
            <Row style={styles.jobsGrid}>
              {filteredJobs.map(job => {
                const isApplied = appliedJobs.includes(job._id);
                const isBookmarked = bookmarkedJobs.includes(job._id);
                return (
                  <Col lg={6} xl={4} key={job._id} style={{ marginBottom: 20 }}>
                    <Card style={styles.jobCard}>
                      <div style={styles.cardHeader}>
                        <h3 style={styles.jobTitle}>{job.title}</h3>
                        {job.isVerified && <span style={styles.verifiedBadge}>✓ Verified</span>}
                      </div>
                      <p style={styles.jobDesc}>{job.description?.substring(0, 80)}...</p>
                      <div style={styles.jobDetails}>
                        <div style={styles.detailItem}><FaMapMarkerAlt size={12} /> {job.country}</div>
                        <div style={styles.detailItem}><FaMoneyBillWave size={12} /> {job.salary} {job.salaryCurrency}</div>
                        <div style={styles.detailItem}><FaClock size={12} /> {job.contractDuration} months</div>
                      </div>
                      <div style={styles.cardFooter}>
                        <div style={styles.buttonGroup}>
                          <Button as={Link} to={`/jobs/${job._id}`} style={styles.viewBtn}>View Details</Button>
                          <Button 
                            style={{ ...styles.quickApplyBtn, ...(isApplied ? styles.appliedBtn : {}) }}
                            onClick={() => handleQuickApply(job._id)}
                            disabled={isApplied}
                          >
                            {isApplied ? '✓ Applied' : '⚡ Quick Apply'}
                          </Button>
                        </div>
                        <button 
                          style={styles.bookmarkBtn}
                          onClick={() => handleBookmark(job._id)}
                        >
                          {isBookmarked ? <FaBookmark color={colors.primary} /> : <FaRegBookmark />}
                        </button>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}><FaShieldAlt color={KL_BRAND} /><span>Safety Tip</span></div>
            <p style={{ fontSize: 13 }}>Always verify employer credentials before accepting a job offer. Never pay upfront fees.</p>
          </div>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}><FaUsers color={KL_BRAND} /><span>Top Countries</span></div>
            {['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait'].map(c => (
              <div key={c} style={styles.countryItem}>
                {c}
                <Badge style={{ background: colors.light, color: colors.text }}>{Math.floor(Math.random() * 100)} jobs</Badge>
              </div>
            ))}
          </div>
          <div style={styles.tipCard}>
            <FaStar size={24} color={colors.warning} />
            <h5 style={{ marginTop: 8 }}>Pro Tip</h5>
            <p>Complete your profile to get matched with the best jobs!</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

const styles = {
  page: { background: colors.gradientLight, minHeight: '100vh' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: colors.gradientLight },
  loadingLogo: { width: 60, height: 60, borderRadius: '50%', background: colors.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 24 },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 200 },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 }, navCenter: { display: 'flex', gap: 4 }, navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  searchBox: { position: 'relative' }, searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b' },
  searchInput: { background: colors.light, border: 'none', borderRadius: 20, padding: '8px 16px 8px 36px', fontSize: 15, outline: 'none', width: 240 },
  navTab: { width: 100, height: 48, background: 'transparent', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', textDecoration: 'none' },
  navTabActive: { background: colors.light }, navTabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: colors.primary },
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' },
  navIconInner: { width: 40, height: 40, borderRadius: '50%', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: colors.danger, color: '#fff', borderRadius: 10, fontSize: 11, padding: '1px 5px' },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1400, margin: '0 auto' },
  leftSidebar: { width: 260, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: colors.text },
  sidebarDivider: { borderTop: `1px solid ${colors.border}`, margin: '12px 0' }, sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px' },
  sidebarNavItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 8, border: 'none', background: 'transparent', width: '100%', fontSize: 14, cursor: 'pointer' },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, textAlign: 'center' },
  feedCol: { flex: 1, maxWidth: 900, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  headerCard: { background: '#fff', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, border: `1px solid ${colors.border}` },
  headerIcon: { width: 56, height: 56, borderRadius: '50%', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 700, color: colors.text }, headerDesc: { fontSize: 13, color: '#65676b' },
  filterBar: { display: 'flex', gap: 12, marginBottom: 16, background: '#fff', padding: '16px', borderRadius: 12, border: `1px solid ${colors.border}` },
  filterGroup: { flex: 2, position: 'relative' }, filterIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b' },
  filterInput: { width: '100%', padding: '10px 12px 10px 36px', border: `1px solid ${colors.border}`, borderRadius: 8 },
  filterSelect: { flex: 1, padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: 8, background: '#fff' },
  categoryBar: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' },
  categoryBtn: { padding: '6px 16px', borderRadius: '20px', border: `1px solid ${colors.border}`, background: '#fff', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' },
  categoryBtnActive: { background: colors.primary, color: '#fff', borderColor: colors.primary },
  jobsGrid: { margin: '0 -8px' },
  jobCard: { 
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
    border: `1px solid ${colors.border}`,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 24px rgba(46,125,50,0.15)'
    }
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '16px 16px 0 16px' },
  jobTitle: { fontSize: 18, fontWeight: 700, margin: 0, color: colors.text },
  verifiedBadge: { background: colors.secondary, color: '#fff', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 500 },
  jobDesc: { fontSize: 13, color: '#65676b', marginBottom: 16, lineHeight: 1.5, padding: '0 16px' },
  jobDetails: { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, padding: '0 16px' },
  detailItem: { fontSize: 12, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 },
  cardFooter: { padding: '12px 16px 16px 16px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  buttonGroup: { display: 'flex', gap: '8px', flex: 1 },
  viewBtn: { background: colors.light, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '6px 12px', fontSize: 13, flex: 1 },
  quickApplyBtn: { background: colors.gradient, border: 'none', borderRadius: 10, padding: '6px 12px', fontSize: 13, color: '#fff', flex: 1 },
  appliedBtn: { background: '#6c757d', cursor: 'default' },
  bookmarkBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '0 8px' },
  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12 },
  clearBtn: { background: colors.gradient, border: 'none', borderRadius: 6, padding: '8px 20px', marginTop: 16, color: '#fff' },
  rightSidebar: { width: 300, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16, border: `1px solid ${colors.border}` },
  rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${colors.border}` },
  countryItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 },
  tipCard: { background: colors.light, borderRadius: 12, padding: '16px', textAlign: 'center', border: `1px solid ${colors.accent}` },
};

export default Jobs;
