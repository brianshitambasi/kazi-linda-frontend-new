import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaMapMarkerAlt, FaMoneyBillWave, FaBuilding, FaCheckCircle, FaArrowLeft, FaClock, FaShieldAlt, FaHome, FaSearch, FaBell, FaFacebookMessenger, FaEllipsisH, FaUsers, FaBriefcase } from 'react-icons/fa';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import toast from 'react-hot-toast';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [activeNav, setActiveNav] = useState('jobs');

  const fetchJob = useCallback(async () => {
    try { const res = await jobAPI.getById(id); setJob(res.data); } 
    catch (err) { toast.error('Failed to load job details'); } 
    finally { setLoading(false); }
  }, [id]);

  const checkIfApplied = useCallback(async () => {
    if (!user) return;
    try { const res = await applicationAPI.getMy(); setHasApplied(res.data.some(app => app.jobId?._id === id)); } 
    catch (err) { console.error(err); }
  }, [user, id]);

  useEffect(() => { fetchJob(); checkIfApplied(); }, [fetchJob, checkIfApplied]);

  const handleApply = async () => {
    if (!user) { toast.error('Please login to apply'); navigate('/login'); return; }
    setApplying(true);
    try { await applicationAPI.create({ jobId: id }); toast.success('Application submitted!'); setHasApplied(true); } 
    catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); } 
    finally { setApplying(false); }
  };

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
    { id: 'community', icon: FaUsers, label: 'Community', link: '/social' },
  ];

  if (loading) return <div style={styles.loadingWrap}><div style={styles.loadingLogo}>KL</div><Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} /></div>;
  if (!job) return <div style={styles.page}><div style={styles.emptyState}><Alert variant="danger">Job not found</Alert><Button as={Link} to="/jobs">Back to Jobs</Button></div></div>;

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}><Link to="/" style={styles.logoBox}><span style={styles.logoText}>KL</span></Link><div style={styles.searchBox}><FaSearch style={styles.searchIcon} /><input style={styles.searchInput} placeholder="Search..." /></div></div>
        <div style={styles.navCenter}>{navTabs.map(tab => (<Link key={tab.id} to={tab.link} style={{ ...styles.navTab, ...(activeNav === tab.id ? styles.navTabActive : {}) }} onClick={() => setActiveNav(tab.id)}><tab.icon size={24} style={{ color: activeNav === tab.id ? KL_BRAND : '#65676b' }} />{activeNav === tab.id && <div style={styles.navTabLine} />}</Link>))}</div>
        <div style={styles.navRight}><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaEllipsisH size={18} /></div></button><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaFacebookMessenger size={18} /></div></button><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaBell size={18} /></div><span style={styles.badge}>3</span></button><ClickableAvatar userId={user?._id} src={user?.profilePicture} size={40} /></div>
      </nav>

      <div style={styles.body}>
        <aside style={styles.leftSidebar}>
          <Link to={`/profile/${user?._id}`} style={styles.sidebarProfileLink}><ClickableAvatar userId={user?._id} src={user?.profilePicture} size={36} /><span>{user?.name}</span></Link>
          <div style={styles.sidebarDivider} /><div style={styles.sidebarSectionTitle}>Similar Jobs</div>
          <div style={styles.similarJob}>House Help - Saudi Arabia</div><div style={styles.similarJob}>Driver - Dubai</div><div style={styles.similarJob}>Nanny - Qatar</div>
        </aside>

        <main style={styles.feedCol}>
          <Button variant="link" onClick={() => navigate('/jobs')} style={styles.backBtn}><FaArrowLeft /> Back to Jobs</Button>
          <div style={styles.jobCard}>
            <div style={styles.jobHeader}><h1 style={styles.jobTitle}>{job.title}</h1>{job.isVerified && <span style={styles.verifiedBadgeLarge}>✓ Verified Job</span>}</div>
            <div style={styles.jobDetailsGrid}>
              <div><FaMapMarkerAlt color={KL_BRAND} /> {job.country}, {job.city || 'N/A'}</div>
              <div><FaMoneyBillWave color={KL_BRAND} /> {job.salary} {job.salaryCurrency}/month</div>
              <div><FaClock color={KL_BRAND} /> {job.contractDuration} months</div>
              {job.employerId && <div><FaBuilding color={KL_BRAND} /> {job.employerId.name}</div>}
            </div>
            <div><h5>Job Description</h5><p>{job.description}</p></div>
            {job.requirements?.length > 0 && (<><h5>Requirements</h5><ul>{job.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul></>)}
            {job.benefits?.length > 0 && (<><h5>Benefits</h5><ul>{job.benefits.map((b, i) => <li key={i}>⭐ {b}</li>)}</ul></>)}
            {hasApplied ? (<div style={styles.appliedAlert}><FaCheckCircle /> You have already applied for this job.</div>) : (<Button style={styles.applyBtn} onClick={handleApply} disabled={applying}>{applying ? 'Applying...' : 'Apply for this Job'}</Button>)}
            <div style={styles.safetyNotice}><FaShieldAlt /> This job has been verified by KAZI LINDA.</div>
          </div>
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.employerCard}><h5>About Employer</h5><p><FaBuilding /> {job.employerId?.name || 'Verified Employer'}</p><Badge bg="success">✓ Verified</Badge></div>
          <div style={styles.tipCard}><h4>💡 Application Tip</h4><p>Complete your profile before applying to increase your chances.</p><Button as={Link} to="/profile/edit" size="sm" style={styles.tipBtn}>Edit Profile</Button></div>
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
  similarJob: { padding: '8px 8px', fontSize: 14, color: '#65676b', cursor: 'pointer' },
  feedCol: { flex: 1, maxWidth: 600, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  backBtn: { color: KL_BRAND, textDecoration: 'none', marginBottom: 16, padding: 0 },
  jobCard: { background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 1px 2px rgba(0,0,0,.2)' },
  jobHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  jobTitle: { fontSize: 28, fontWeight: 700, margin: 0 }, verifiedBadgeLarge: { background: '#45bd62', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12 },
  jobDetailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 24, padding: 16, background: '#f8f9fa', borderRadius: 8 },
  applyBtn: { background: KL_BRAND, border: 'none', borderRadius: 8, padding: '12px', fontSize: 16, fontWeight: 600, width: '100%', marginTop: 16, color: '#fff' },
  appliedAlert: { background: '#d4edda', color: '#155724', padding: '12px', borderRadius: 8, marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 },
  safetyNotice: { marginTop: 16, padding: '12px', background: KL_BRAND_LIGHT, borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 },
  rightSidebar: { width: 300, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  employerCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16 },
  tipCard: { background: KL_BRAND_LIGHT, borderRadius: 12, padding: '16px', marginBottom: 16 }, tipBtn: { background: KL_BRAND, border: 'none', marginTop: 8 },
  emptyState: { textAlign: 'center', padding: '60px 20px' },
};

export default JobDetail;