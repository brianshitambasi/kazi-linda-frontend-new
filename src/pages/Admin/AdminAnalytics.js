import React, { useState, useEffect, useCallback } from 'react';
import { Button, Spinner, Card, Row, Col, Badge, Form } from 'react-bootstrap';
import { FaUsers, FaBriefcase, FaEnvelope, FaHome, FaBell, FaFacebookMessenger, FaEllipsisH, FaSearch, FaChartLine, FaDownload, FaFileAlt, FaGlobe, FaClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import ClickableAvatar from '../../components/Common/ClickableAvatar';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

const KL_BRAND = '#f39c12';

const AdminAnalytics = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [12, 15, 18, 22, 25, 30, 35],
    jobPosts: [8, 10, 12, 15, 18, 20, 25],
    applications: [25, 30, 35, 40, 45, 50, 60],
    messages: [120, 135, 150, 180, 200, 220, 250],
    posts: [45, 50, 55, 60, 65, 70, 80],
    totalUsers: 1247,
    totalJobs: 342,
    totalApplications: 1256,
    totalMessages: 3450,
    totalPosts: 892,
    activeUsers: 856,
    newUsersThisWeek: 157,
    popularCountries: [{ country: 'Saudi Arabia', count: 89 }, { country: 'UAE', count: 67 }, { country: 'Qatar', count: 45 }]
  });

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, jobsRes] = await Promise.all([
        fetch('https://kazi-linda.onrender.com/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://kazi-linda.onrender.com/api/admin/jobs', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const users = usersRes.ok ? await usersRes.json() : [];
      const jobs = jobsRes.ok ? await jobsRes.json() : [];
      setAnalyticsData(prev => ({ ...prev, totalUsers: users.length, totalJobs: jobs.length }));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const getChartLabels = () => { const today = new Date(); const labels = []; for (let i = 6; i >= 0; i--) { const date = new Date(today); date.setDate(today.getDate() - i); labels.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })); } return labels; };

  const userGrowthData = { labels: getChartLabels(), datasets: [{ label: 'New Users', data: analyticsData.userGrowth, borderColor: KL_BRAND, backgroundColor: KL_BRAND + '20', fill: true, tension: 0.4 }] };
  const activityTrendData = { labels: getChartLabels(), datasets: [{ label: 'Job Posts', data: analyticsData.jobPosts, borderColor: '#45bd62', backgroundColor: '#45bd6220', fill: true }, { label: 'Applications', data: analyticsData.applications, borderColor: '#1877f2', backgroundColor: '#1877f220', fill: true }] };
  const messagesData = { labels: getChartLabels(), datasets: [{ label: 'Messages', data: analyticsData.messages, backgroundColor: KL_BRAND, borderRadius: 8 }] };
  const countryDistributionData = { labels: analyticsData.popularCountries.map(c => c.country), datasets: [{ data: analyticsData.popularCountries.map(c => c.count), backgroundColor: [KL_BRAND, '#45bd62', '#1877f2'], borderWidth: 0 }] };
  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } };

  if (loading) return <div style={styles.loadingWrap}><div style={styles.loadingLogo}>KL</div><Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} /></div>;

  const navTabs = [{ id: 'home', icon: FaHome, label: 'Home', link: '/' }, { id: 'analytics', icon: FaChartLine, label: 'Analytics', link: '/admin/analytics' }];

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}><Link to="/" style={styles.logoBox}><span style={styles.logoText}>KL</span></Link><div style={styles.searchBox}><FaSearch style={styles.searchIcon} /><input style={styles.searchInput} placeholder="Search analytics..." /></div></div>
        <div style={styles.navCenter}>{navTabs.map(tab => (<Link key={tab.id} to={tab.link} style={{ ...styles.navTab, ...(tab.id === 'analytics' ? styles.navTabActive : {}) }}><tab.icon size={24} style={{ color: tab.id === 'analytics' ? KL_BRAND : '#65676b' }} />{tab.id === 'analytics' && <div style={styles.navTabLine} />}</Link>))}</div>
        <div style={styles.navRight}><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaEllipsisH size={18} /></div></button><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaFacebookMessenger size={18} /></div></button><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaBell size={18} /></div><span style={styles.badge}>3</span></button><ClickableAvatar userId={user?._id} src={user?.profilePicture} size={40} /></div>
      </nav>

      <div style={styles.body}>
        <aside style={styles.leftSidebar}>
          <Link to={`/profile/${user?._id}`} style={styles.sidebarProfileLink}><ClickableAvatar userId={user?._id} src={user?.profilePicture} size={36} /><span>{user?.name || 'Admin'}</span><Badge bg="warning" style={styles.adminBadge}>Admin</Badge></Link>
          <div style={styles.sidebarDivider} /><div style={styles.sidebarSectionTitle}>Analytics</div>
          <button style={styles.sidebarNavItem}><FaChartLine /> Dashboard</button><button style={styles.sidebarNavItem}><FaUsers /> Users</button>
          <div style={styles.sidebarFooter}>Real-time Analytics<br />¬© {new Date().getFullYear()} KaziLinda</div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.headerCard}><div style={styles.headerIcon}><FaChartLine size={32} color={KL_BRAND} /></div><div><h1 style={styles.headerTitle}>Analytics Dashboard</h1><p style={styles.headerDesc}>Platform statistics</p></div><div style={{ marginLeft: 'auto' }}><Form.Select value={timeRange} onChange={e => setTimeRange(e.target.value)} style={{ width: 120 }}><option value="week">Last 7 days</option></Form.Select><Button style={styles.exportBtn}><FaDownload /> Export</Button></div></div>

          <Row className="g-3 mb-4"><Col md={3}><div style={styles.statCardLarge}><div style={{ ...styles.statIconLarge, background: KL_BRAND + '22' }}><FaUsers size={28} color={KL_BRAND} /></div><div><h2>{analyticsData.totalUsers}</h2><p>Total Users</p></div></div></Col>
          <Col md={3}><div style={styles.statCardLarge}><div style={{ ...styles.statIconLarge, background: '#45bd6222' }}><FaBriefcase size={28} color="#45bd62" /></div><div><h2>{analyticsData.totalJobs}</h2><p>Total Jobs</p></div></div></Col>
          <Col md={3}><div style={styles.statCardLarge}><div style={{ ...styles.statIconLarge, background: '#1877f222' }}><FaFileAlt size={28} color="#1877f2" /></div><div><h2>{analyticsData.totalApplications}</h2><p>Applications</p></div></div></Col>
          <Col md={3}><div style={styles.statCardLarge}><div style={{ ...styles.statIconLarge, background: '#e41e3f22' }}><FaEnvelope size={28} color="#e41e3f" /></div><div><h2>{analyticsData.totalMessages}</h2><p>Messages</p></div></div></Col></Row>

          <Card style={styles.chartCard}><Card.Header style={styles.chartHeader}><span><FaUsers className="me-2" /> User Growth</span></Card.Header><Card.Body style={{ height: '320px' }}><Line data={userGrowthData} options={chartOptions} /></Card.Body></Card>
          <Card style={styles.chartCard}><Card.Header style={styles.chartHeader}><span><FaChartLine className="me-2" /> Activity Trend</span></Card.Header><Card.Body style={{ height: '380px' }}><Line data={activityTrendData} options={chartOptions} /></Card.Body></Card>
          <Row><Col md={6}><Card style={styles.chartCard}><Card.Header style={styles.chartHeader}><span><FaEnvelope className="me-2" /> Message Volume</span></Card.Header><Card.Body style={{ height: '320px' }}><Bar data={messagesData} options={chartOptions} /></Card.Body></Card></Col>
          <Col md={6}><Card style={styles.chartCard}><Card.Header style={styles.chartHeader}><span><FaGlobe className="me-2" /> Top Countries</span></Card.Header><Card.Body style={{ height: '320px', display: 'flex', justifyContent: 'center' }}><div style={{ width: '280px', height: '280px' }}><Doughnut data={countryDistributionData} options={{ responsive: true }} /></div></Card.Body></Card></Col></Row>
        </main>

        <aside style={styles.rightSidebar}><div style={styles.rightCard}><div style={styles.rightCardHeader}><FaChartLine color={KL_BRAND} /><span>Key Insights</span></div><ul style={styles.insightsList}><li>Ì≥à User growth up 23%</li><li>Ì≤º Job posts increased by 15%</li><li>‚≠ê 4.8/5 platform rating</li></ul></div><div style={styles.rightCard}><div style={styles.rightCardHeader}><FaClock color={KL_BRAND} /><span>Recent Activity</span></div><div style={styles.engagementItem}><span>Post Reactions</span><span>2,847</span></div></div><div style={styles.sidebarFooter}>Updated: {new Date().toLocaleDateString()}<br />¬© {new Date().getFullYear()} KaziLinda</div></aside>
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
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }, navIconInner: { width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: '#e41e3f', color: '#fff', borderRadius: 10, fontSize: 11, padding: '1px 5px' },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1400, margin: '0 auto' }, leftSidebar: { width: 260, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: '#050505' },
  adminBadge: { fontSize: 10, padding: '2px 6px', background: KL_BRAND, color: '#fff' }, sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' },
  sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px' }, sidebarNavItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8, border: 'none', background: 'transparent', width: '100%', fontSize: 14 },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, textAlign: 'center' }, feedCol: { flex: 1, maxWidth: 900, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  headerCard: { background: '#fff', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: 700 }, headerDesc: { fontSize: 13, color: '#65676b' }, exportBtn: { background: KL_BRAND, border: 'none', borderRadius: 6 },
  statCardLarge: { background: '#fff', borderRadius: 12, padding: '16px', display: 'flex', alignItems: 'center', gap: 16 },
  statIconLarge: { width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  chartCard: { background: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden' }, chartHeader: { background: '#fff', borderBottom: '1px solid #dddfe2', fontWeight: 600, padding: '12px 16px' },
  rightSidebar: { width: 300, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16 }, rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #dddfe2' },
  insightsList: { listStyle: 'none', padding: 0, fontSize: 13, lineHeight: 2 }, engagementItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, borderBottom: '1px solid #f0f2f5' },
};

export default AdminAnalytics;
