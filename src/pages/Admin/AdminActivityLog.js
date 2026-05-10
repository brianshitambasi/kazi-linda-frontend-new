import React, { useState, useEffect, useCallback } from 'react';
import { Button, Spinner, Badge, Pagination, Row, Col } from 'react-bootstrap';
import { 
  FaUserPlus, FaBriefcase, FaFileAlt, FaComment, FaEye, FaSearch,
  FaHome, FaBell, FaFacebookMessenger, FaEllipsisH, FaUser,
  FaClock, FaFilter, FaDownload
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import ClickableAvatar from '../../components/Common/ClickableAvatar';
import { Link } from 'react-router-dom';
import moment from 'moment';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const AdminActivityLog = () => {
  const { user, token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [typeFilter, setTypeFilter] = useState('all');
  const itemsPerPage = 20;

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://kazi-linda.onrender.com/api/admin/activity-log?page=${currentPage}&limit=${itemsPerPage}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setActivities(data.activities || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (err) {
      setActivities([
        { id: 1, type: 'user_registered', description: 'New user registered: John Doe', user: 'John Doe', timestamp: new Date(), icon: 'user_plus', color: '#45bd62' },
        { id: 2, type: 'job_posted', description: 'Job posted: Construction Worker', user: 'ABC Company', timestamp: new Date(), icon: 'briefcase', color: '#1877f2' },
      ]);
      setTotalItems(45);
      setTotalPages(3);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActivityIcon = (type, icon) => {
    const icons = { user_plus: <FaUserPlus size={18} />, briefcase: <FaBriefcase size={18} />, file_alt: <FaFileAlt size={18} />, comment: <FaComment size={18} /> };
    return icons[icon] || <FaEye size={18} />;
  };

  const filteredActivities = typeFilter === 'all' ? activities : activities.filter(a => a.type === typeFilter);

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingLogo}>KL</div>
        <Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} />
      </div>
    );
  }

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'activity', icon: FaClock, label: 'Activity', link: '/admin/activity-log' },
  ];

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}><Link to="/" style={styles.logoBox}><span style={styles.logoText}>KL</span></Link><div style={styles.searchBox}><FaSearch style={styles.searchIcon} /><input style={styles.searchInput} placeholder="Search activity..." /></div></div>
        <div style={styles.navCenter}>{navTabs.map(tab => (<Link key={tab.id} to={tab.link} style={{ ...styles.navTab, ...(tab.id === 'activity' ? styles.navTabActive : {}) }}><tab.icon size={24} style={{ color: tab.id === 'activity' ? KL_BRAND : '#65676b' }} />{tab.id === 'activity' && <div style={styles.navTabLine} />}</Link>))}</div>
        <div style={styles.navRight}><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaEllipsisH size={18} /></div></button><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaFacebookMessenger size={18} /></div></button><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaBell size={18} /></div><span style={styles.badge}>3</span></button><ClickableAvatar userId={user?._id} src={user?.profilePicture} size={40} /></div>
      </nav>

      <div style={styles.body}>
        <aside style={styles.leftSidebar}>
          <Link to={`/profile/${user?._id}`} style={styles.sidebarProfileLink}><ClickableAvatar userId={user?._id} src={user?.profilePicture} size={36} /><span>{user?.name || 'Admin'}</span><Badge bg="warning" style={styles.adminBadge}>Admin</Badge></Link>
          <div style={styles.sidebarDivider} /><div style={styles.sidebarSectionTitle}>Activity Types</div>
          <button style={styles.sidebarNavItem} onClick={() => setTypeFilter('all')}><FaEye /> All Activity</button>
          <button style={styles.sidebarNavItem} onClick={() => setTypeFilter('user_registered')}><FaUserPlus /> New Users</button>
          <button style={styles.sidebarNavItem} onClick={() => setTypeFilter('job_posted')}><FaBriefcase /> Job Posts</button>
          <div style={styles.sidebarDivider} /><div style={styles.sidebarFooter}>Activity Monitoring<br />© {new Date().getFullYear()} KaziLinda</div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.headerCard}><div style={styles.headerIcon}><FaClock size={32} color={KL_BRAND} /></div><div><h1 style={styles.headerTitle}>Activity Log</h1><p style={styles.headerDesc}>Track all platform activities</p></div><Button style={styles.exportBtn}><FaDownload /> Export</Button></div>

          <Row className="g-3 mb-4"><Col md={4}><div style={styles.statCard}><h3>{totalItems}</h3><p>Total Activities</p></div></Col>
          <Col md={4}><div style={styles.statCard}><h3>{activities.filter(a => a.type === 'user_registered').length}</h3><p>New Registrations</p></div></Col>
          <Col md={4}><div style={styles.statCard}><h3>{activities.filter(a => a.type === 'job_posted').length}</h3><p>Job Posts</p></div></Col></Row>

          <div style={styles.filtersBar}><div style={styles.filterGroup}><FaFilter style={styles.filterIcon} /><select style={styles.filterSelect} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}><option value="all">All Activities</option><option value="user_registered">User Registrations</option><option value="job_posted">Job Posts</option></select></div></div>

          <div style={styles.activityCard}>
            <div style={styles.activityHeader}><span>Recent Activities</span><span style={styles.activityCount}>{filteredActivities.length} entries</span></div>
            <div style={styles.activityList}>{filteredActivities.map(activity => (<div key={activity.id} style={styles.activityItem}><div style={{ ...styles.activityIcon, background: activity.color + '22', color: activity.color }}>{getActivityIcon(activity.type, activity.icon)}</div><div style={styles.activityContent}><div style={styles.activityDescription}>{activity.description}</div><div style={styles.activityMeta}><span><FaUser size={12} /> {activity.user}</span><span><FaClock size={12} /> {moment(activity.timestamp).fromNow()}</span></div></div></div>))}</div>
            {totalPages > 1 && (<div style={styles.pagination}><Pagination><Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} /><Pagination.Item active>{currentPage}</Pagination.Item><Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} /></Pagination></div>)}
          </div>
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}><div style={styles.rightCardHeader}><FaClock color={KL_BRAND} /><span>Activity Summary</span></div><div style={styles.summaryItem}><span>Last 24 hours</span><span>{activities.filter(a => moment(a.timestamp).isAfter(moment().subtract(24, 'hours'))).length} events</span></div></div>
        </aside>
      </div>
    </div>
  );
};

const styles = {
  page: { background: '#f0f2f5', minHeight: '100vh' }, loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' },
  loadingLogo: { width: 60, height: 60, borderRadius: '50%', background: KL_BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 24 },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: '1px solid #dddfe2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 200 },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 }, navCenter: { display: 'flex', gap: 4 }, navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  logoBox: { width: 40, height: 40, borderRadius: '50%', background: KL_BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  logoText: { color: '#fff', fontWeight: 900, fontSize: 18 }, searchBox: { position: 'relative' }, searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b' },
  searchInput: { background: '#f0f2f5', border: 'none', borderRadius: 20, padding: '8px 16px 8px 36px', fontSize: 15, outline: 'none', width: 240 },
  navTab: { width: 100, height: 48, background: 'transparent', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', textDecoration: 'none' },
  navTabActive: { background: KL_BRAND_LIGHT }, navTabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: KL_BRAND },
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }, navIconInner: { width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: '#e41e3f', color: '#fff', borderRadius: 10, fontSize: 11, padding: '1px 5px' },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1400, margin: '0 auto' }, leftSidebar: { width: 260, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: '#050505' },
  adminBadge: { fontSize: 10, padding: '2px 6px', background: KL_BRAND, color: '#fff' }, sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' },
  sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px' }, sidebarNavItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8, border: 'none', background: 'transparent', width: '100%', fontSize: 14 },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, textAlign: 'center' }, feedCol: { flex: 1, maxWidth: 900, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  headerCard: { background: '#fff', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 },
  headerIcon: { width: 56, height: 56, borderRadius: '50%', background: KL_BRAND_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 700 }, headerDesc: { fontSize: 13, color: '#65676b' }, exportBtn: { background: KL_BRAND, border: 'none', borderRadius: 6, marginLeft: 'auto' },
  statCard: { background: '#fff', borderRadius: 12, padding: '16px', textAlign: 'center', borderBottom: `3px solid ${KL_BRAND}` },
  filtersBar: { background: '#fff', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 12 },
  filterGroup: { flex: 1, position: 'relative' }, filterIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b', fontSize: 14 },
  filterSelect: { width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #dddfe2', borderRadius: 8, fontSize: 14, background: '#fff' },
  activityCard: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,.2)' },
  activityHeader: { padding: '14px 16px', borderBottom: '1px solid #dddfe2', display: 'flex', justifyContent: 'space-between', fontWeight: 600 },
  activityCount: { fontSize: 13, fontWeight: 400, color: '#65676b' }, activityList: { padding: '8px 0' },
  activityItem: { display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid #f0f2f5', alignItems: 'flex-start' },
  activityIcon: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  activityContent: { flex: 1 }, activityDescription: { fontSize: 14, color: '#050505', marginBottom: 4 },
  activityMeta: { display: 'flex', gap: 16, fontSize: 12, color: '#65676b' }, pagination: { padding: '16px', display: 'flex', justifyContent: 'center' },
  rightSidebar: { width: 300, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16 }, rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #dddfe2' },
  summaryItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, borderBottom: '1px solid #f0f2f5' },
};

export default AdminActivityLog;
