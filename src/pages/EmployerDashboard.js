import React, { useState, useEffect } from 'react';
import ClickableAvatar from "../components/Common/ClickableAvatar";
import { useAuth } from '../context/AuthContext';
import { jobAPI } from '../services/api';
import { Container, Card, Button, Form, Table, Modal, Spinner, Badge, Row, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaHome, FaSearch, FaBell, FaFacebookMessenger, FaEllipsisH, FaUsers, FaBriefcase, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const EmployerDashboard = () => {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', country: 'Saudi Arabia', city: '', salary: '', salaryCurrency: 'SAR', contractDuration: 24, requirements: [], benefits: [] });
  const [reqInput, setReqInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');
  const [activeNav, setActiveNav] = useState('employer');

  useEffect(() => { if (user && user.role === 'employer') fetchMyJobs(); else setLoading(false); }, [user]);

  const fetchMyJobs = async () => {
    try { const res = await jobAPI.getMyJobs(); setJobs(res.data || []); } 
    catch (err) { setJobs([]); } 
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) await jobAPI.update(editingJob._id, formData);
      else await jobAPI.create(formData);
      toast.success(editingJob ? 'Job updated' : 'Job posted');
      setShowModal(false); resetForm(); fetchMyJobs();
    } catch (err) { toast.error('Failed to save job'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this job?')) {
      try { await jobAPI.delete(id); toast.success('Job deleted'); fetchMyJobs(); } 
      catch (err) { toast.error('Failed to delete'); }
    }
  };

  const addRequirement = () => { if (reqInput.trim()) setFormData({ ...formData, requirements: [...formData.requirements, reqInput.trim()] }); setReqInput(''); };
  const removeRequirement = (index) => setFormData({ ...formData, requirements: formData.requirements.filter((_, i) => i !== index) });
  const addBenefit = () => { if (benefitInput.trim()) setFormData({ ...formData, benefits: [...formData.benefits, benefitInput.trim()] }); setBenefitInput(''); };
  const removeBenefit = (index) => setFormData({ ...formData, benefits: formData.benefits.filter((_, i) => i !== index) });
  const resetForm = () => setFormData({ title: '', description: '', country: 'Saudi Arabia', city: '', salary: '', salaryCurrency: 'SAR', contractDuration: 24, requirements: [], benefits: [] });

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'employer', icon: FaBriefcase, label: 'Dashboard', link: '/employer/dashboard' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
  ];

  if (!user || user.role !== 'employer') return <Container className="py-5 text-center"><Badge bg="warning">Only employers can access this page.</Badge></Container>;
  if (loading) return <div style={styles.loadingWrap}><div style={styles.loadingLogo}>KL</div><Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} /></div>;

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}><Link to="/" style={styles.logoBox}><span style={styles.logoText}>KL</span></Link><div style={styles.searchBox}><FaSearch style={styles.searchIcon} /><input style={styles.searchInput} placeholder="Search..." /></div></div>
        <div style={styles.navCenter}>{navTabs.map(tab => (<Link key={tab.id} to={tab.link} style={{ ...styles.navTab, ...(activeNav === tab.id ? styles.navTabActive : {}) }} onClick={() => setActiveNav(tab.id)}><tab.icon size={24} style={{ color: activeNav === tab.id ? KL_BRAND : '#65676b' }} />{activeNav === tab.id && <div style={styles.navTabLine} />}</Link>))}</div>
        <div style={styles.navRight}><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaEllipsisH size={18} /></div></button><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaFacebookMessenger size={18} /></div></button><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaBell size={18} /></div><span style={styles.badge}>3</span></button><ClickableAvatar userId={user._id} src={user.profilePicture} size={40} /></div>
      </nav>

      <div style={styles.body}>
        <aside style={styles.leftSidebar}>
          <Link to={`/profile/${user._id}`} style={styles.sidebarProfileLink}><ClickableAvatar userId={user._id} src={user.profilePicture} size={36} /><span>{user.name}</span></Link>
          <div style={styles.sidebarDivider} />
          <button style={styles.sidebarNavItem}><FaBriefcase /> My Jobs</button>
          <button style={styles.sidebarNavItem}><FaUsers /> Applications</button>
          <button style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>© {new Date().getFullYear()} KaziLinda</div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.headerCard}><div><h1>Employer Dashboard</h1><p>Manage your job postings</p></div><Button style={styles.postBtn} onClick={() => { resetForm(); setEditingJob(null); setShowModal(true); }}><FaPlus /> Post New Job</Button></div>

          {jobs.length === 0 ? (<div style={styles.emptyState}><p>No jobs yet.</p><Button variant="warning" onClick={() => { resetForm(); setShowModal(true); }}>Post Your First Job</Button></div>) : (
            <div style={styles.tableCard}>
              <table style={styles.table}><thead><tr><th>Title</th><th>Country</th><th>Salary</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{jobs.map(job => (<tr key={job._id}><td>{job.title}</td><td>{job.country}</td><td>{job.salary} {job.salaryCurrency}</td><td><Badge bg={job.isActive ? 'success' : 'secondary'}>{job.isActive ? 'Active' : 'Inactive'}</Badge></td>
              <td><Button size="sm" variant="outline-warning" className="me-2" onClick={() => { setEditingJob(job); setFormData(job); setShowModal(true); }}><FaEdit /></Button><Button size="sm" variant="outline-danger" onClick={() => handleDelete(job._id)}><FaTrash /></Button></td></tr>))}</tbody></table>
            </div>
          )}
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.statsCard}><h4>Quick Stats</h4><div>Total Jobs: {jobs.length}</div><div>Active Jobs: {jobs.filter(j => j.isActive).length}</div><div>Applications: 0</div></div>
          <div style={styles.tipCard}><h4>💡 Tip</h4><p>Complete your employer profile to attract more qualified candidates.</p><Button as={Link} to="/profile/edit" size="sm" style={styles.tipBtn}>Edit Profile</Button></div>
        </aside>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg"><Modal.Header closeButton><Modal.Title>{editingJob ? 'Edit Job' : 'Post Job'}</Modal.Title></Modal.Header><Modal.Body>
        <Form onSubmit={handleSubmit}><Row><Col md={6}><Form.Group><Form.Label>Title</Form.Label><Form.Control value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></Form.Group></Col><Col md={6}><Form.Group><Form.Label>Country</Form.Label><Form.Control value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} required /></Form.Group></Col></Row>
        <Form.Group><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required /></Form.Group>
        <Row><Col md={6}><Form.Group><Form.Label>Requirements</Form.Label><div className="d-flex"><Form.Control value={reqInput} onChange={e => setReqInput(e.target.value)} /><Button type="button" onClick={addRequirement}>Add</Button></div><div className="d-flex flex-wrap gap-2 mt-2">{formData.requirements.map((r, i) => (<Badge key={i} bg="secondary" onClick={() => removeRequirement(i)}>{r} ✕</Badge>))}</div></Form.Group></Col>
        <Col md={6}><Form.Group><Form.Label>Benefits</Form.Label><div className="d-flex"><Form.Control value={benefitInput} onChange={e => setBenefitInput(e.target.value)} /><Button type="button" onClick={addBenefit}>Add</Button></div><div className="d-flex flex-wrap gap-2 mt-2">{formData.benefits.map((b, i) => (<Badge key={i} bg="success" onClick={() => removeBenefit(i)}>{b} ✕</Badge>))}</div></Form.Group></Col></Row>
        <div className="d-flex justify-content-end gap-2 mt-3"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" style={{ background: KL_BRAND, border: 'none' }}>{editingJob ? 'Update' : 'Post'}</Button></div></Form>
      </Modal.Body></Modal>
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
  sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' }, sidebarNavItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 8, border: 'none', background: 'transparent', width: '100%', fontSize: 14 },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, textAlign: 'center' },
  feedCol: { flex: 1, maxWidth: 680, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  headerCard: { background: '#fff', borderRadius: 12, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  postBtn: { background: KL_BRAND, border: 'none', borderRadius: 8, padding: '10px 20px' },
  tableCard: { background: '#fff', borderRadius: 12, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' }, emptyState: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12 },
  rightSidebar: { width: 280, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  statsCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16 },
  tipCard: { background: KL_BRAND_LIGHT, borderRadius: 12, padding: '16px' }, tipBtn: { background: KL_BRAND, border: 'none', marginTop: 8 },
};

export default EmployerDashboard;