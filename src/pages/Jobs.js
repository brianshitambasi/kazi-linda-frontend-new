import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { jobAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
// eslint-disable-next-line no-unused-vars
import { Container, Row, Card, Button, Spinner, Badge, Form } from "react-bootstrap";
import { 
  FaMapMarkerAlt, FaMoneyBillWave, FaSearch, 
  FaHome, FaBell, FaFacebookMessenger, FaEllipsisH, FaUsers, 
  FaShieldAlt, FaBriefcase  // ← Added FaBriefcase here
} from 'react-icons/fa';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import toast from 'react-hot-toast';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [countries, setCountries] = useState([]);
  const [activeNav, setActiveNav] = useState('jobs');

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const res = await jobAPI.getAll();
      const jobsData = res.data.jobs || [];
      setJobs(jobsData);
      setFilteredJobs(jobsData);
      const uniqueCountries = [...new Set(jobsData.map(job => job.country).filter(Boolean))];
      setCountries(uniqueCountries);
    } catch (err) { toast.error('Failed to load jobs'); } 
    finally { setLoading(false); }
  };

  const filterJobs = useCallback(() => {
    let filtered = [...jobs];
    if (searchTerm) filtered = filtered.filter(job => job.title?.toLowerCase().includes(searchTerm.toLowerCase()) || job.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (countryFilter) filtered = filtered.filter(job => job.country === countryFilter);
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, countryFilter]);

  useEffect(() => { filterJobs(); }, [filterJobs]);

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
    { id: 'verify', icon: FaShieldAlt, label: 'Verify', link: '/verify' },
    { id: 'community', icon: FaUsers, label: 'Community', link: '/social' },
  ];

  if (loading) return <div style={styles.loadingWrap}><div style={styles.loadingLogo}>KL</div><Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} /></div>;

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}><Link to="/" style={styles.logoBox}><span style={styles.logoText}>KL</span></Link><div style={styles.searchBox}><FaSearch style={styles.searchIcon} /><input style={styles.searchInput} placeholder="Search jobs..." /></div></div>
        <div style={styles.navCenter}>{navTabs.map(tab => (<Link key={tab.id} to={tab.link} style={{ ...styles.navTab, ...(activeNav === tab.id ? styles.navTabActive : {}) }} onClick={() => setActiveNav(tab.id)}><tab.icon size={24} style={{ color: activeNav === tab.id ? KL_BRAND : '#65676b' }} />{activeNav === tab.id && <div style={styles.navTabLine} />}</Link>))}</div>
        <div style={styles.navRight}><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaEllipsisH size={18} /></div></button><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaFacebookMessenger size={18} /></div></button><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaBell size={18} /></div><span style={styles.badge}>3</span></button><ClickableAvatar userId={user?._id} src={user?.profilePicture} size={40} /></div>
      </nav>

      <div style={styles.body}>
        <aside style={styles.leftSidebar}>
          <Link to={`/profile/${user?._id}`} style={styles.sidebarProfileLink}><ClickableAvatar userId={user?._id} src={user?.profilePicture} size={36} /><span>{user?.name}</span></Link>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarSectionTitle}>Job Categories</div>
          {['Construction', 'Domestic Work', 'Driving', 'Nursing', 'Hospitality'].map(cat => (<button key={cat} style={styles.sidebarNavItem}><FaBriefcase size={14} /> {cat}</button>))}
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>© {new Date().getFullYear()} KaziLinda</div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.headerCard}><div style={styles.headerIcon}><FaBriefcase size={32} color={KL_BRAND} /></div><div><h1 style={styles.headerTitle}>Find Your Next Job</h1><p style={styles.headerDesc}>Browse verified job opportunities from trusted employers</p></div></div>

          <div style={styles.filterBar}>
            <div style={styles.filterGroup}><FaSearch style={styles.filterIcon} /><input type="text" style={styles.filterInput} placeholder="Search by job title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
            <select style={styles.filterSelect} value={countryFilter} onChange={e => setCountryFilter(e.target.value)}><option value="">All Countries</option>{countries.map(c => <option key={c} value={c}>{c}</option>)}</select>
          </div>

          {filteredJobs.length === 0 ? (<div style={styles.emptyState}><FaBriefcase size={48} color={KL_BRAND} /><p>No jobs found</p><button style={styles.clearBtn} onClick={() => { setSearchTerm(''); setCountryFilter(''); }}>Clear filters</button></div>) : (
            <div style={styles.jobsGrid}>{filteredJobs.map(job => (<div key={job._id} style={styles.jobCard}><div style={styles.jobHeader}><h3 style={styles.jobTitle}>{job.title}</h3>{job.isVerified && <span style={styles.verifiedBadge}>✓ Verified</span>}</div><p style={styles.jobDesc}>{job.description?.substring(0, 100)}...</p><div style={styles.jobDetails}><span><FaMapMarkerAlt size={12} /> {job.country}</span><span><FaMoneyBillWave size={12} /> {job.salary} {job.salaryCurrency}</span></div><Button as={Link} to={`/jobs/${job._id}`} style={styles.jobBtn}>View Details</Button></div>))}</div>
          )}
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}><div style={styles.rightCardHeader}><FaShieldAlt color={KL_BRAND} /><span>Safety Tip</span></div><p style={{ fontSize: 13 }}>Always verify employer credentials before accepting a job offer. Never pay upfront fees.</p></div>
          <div style={styles.rightCard}><div style={styles.rightCardHeader}><FaUsers color={KL_BRAND} /><span>Top Countries</span></div>{['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait'].map(c => (<div key={c} style={styles.countryItem}>{c}<Badge bg="secondary">{Math.floor(Math.random() * 100)} jobs</Badge></div>))}</div>
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
  body: { display: 'flex', paddingTop: 56, maxWidth: 1200, margin: '0 auto' },
  leftSidebar: { width: 260, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: '#050505' },
  sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' }, sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px' },
  sidebarNavItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 8, border: 'none', background: 'transparent', width: '100%', fontSize: 14 },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, textAlign: 'center' },
  feedCol: { flex: 1, maxWidth: 600, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  headerCard: { background: '#fff', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 },
  headerIcon: { width: 56, height: 56, borderRadius: '50%', background: KL_BRAND_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 700 }, headerDesc: { fontSize: 13, color: '#65676b' },
  filterBar: { display: 'flex', gap: 12, marginBottom: 16 },
  filterGroup: { flex: 2, position: 'relative' }, filterIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b' },
  filterInput: { width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #dddfe2', borderRadius: 8 },
  filterSelect: { flex: 1, padding: '10px 12px', border: '1px solid #dddfe2', borderRadius: 8, background: '#fff' },
  jobsGrid: { display: 'flex', flexDirection: 'column', gap: 12 },
  jobCard: { background: '#fff', borderRadius: 12, padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,.2)' },
  jobHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  jobTitle: { fontSize: 18, fontWeight: 600, margin: 0 }, verifiedBadge: { background: '#45bd62', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 10 },
  jobDesc: { fontSize: 14, color: '#65676b', marginBottom: 12 }, jobDetails: { display: 'flex', gap: 16, fontSize: 13, color: '#65676b', marginBottom: 16 },
  jobBtn: { background: KL_BRAND, border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, width: '100%', color: '#fff' },
  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12 },
  clearBtn: { background: KL_BRAND, border: 'none', borderRadius: 6, padding: '8px 20px', marginTop: 16, color: '#fff' },
  rightSidebar: { width: 300, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16 },
  rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #dddfe2' },
  countryItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 },
};

export default Jobs;