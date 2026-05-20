import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button, Badge } from 'react-bootstrap';
import { 
  FaSearch, FaUsers, FaEnvelope, FaCircle, FaHome,
  FaBell, FaFacebookMessenger, FaEllipsisH, FaUserFriends, 
  FaBriefcase, FaMapMarkerAlt, FaUserCheck
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import FollowButton from '../components/Common/FollowButton';

const KL_BRAND = '#f39c12';

const Discover = () => {
  const { user, token } = useAuth();
  const [people, setPeople] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('discover');
  const [followingStatus, setFollowingStatus] = useState({});

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/people', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const filteredData = Array.isArray(data) ? data.filter(p => p._id !== user?._id) : [];
      setPeople(filteredData);
      
      const statuses = {};
      for (const p of filteredData) {
        try {
          const r = await fetch(`https://kazi-linda.onrender.com/api/social/following/check/${p._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const d = await r.json();
          statuses[p._id] = d.following;
        } catch { statuses[p._id] = false; }
      }
      setFollowingStatus(statuses);
    } catch (err) { setPeople([]); } finally { setLoading(false); }
  }, [token, user]);

  const updateOnlineStatus = useCallback(async () => {
    try {
      await fetch('https://kazi-linda.onrender.com/api/social/online', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => {
    fetchPeople();
    updateOnlineStatus();
    const interval = setInterval(() => { updateOnlineStatus(); fetchPeople(); }, 30000);
    return () => clearInterval(interval);
  }, [fetchPeople, updateOnlineStatus]);

  const handleFollowChange = async (userId, newStatus) => {
    setFollowingStatus({ ...followingStatus, [userId]: newStatus });
    await fetchPeople();
  };

  const getFilteredPeople = () => {
    let filtered = [...people];
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.currentCountry?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filter === 'online') filtered = filtered.filter(p => p.isOnline);
    if (filter === 'workers') filtered = filtered.filter(p => p.role === 'worker');
    if (filter === 'employers') filtered = filtered.filter(p => p.role === 'employer');
    if (filter === 'following') filtered = filtered.filter(p => followingStatus[p._id]);
    return filtered;
  };

  const filteredPeople = getFilteredPeople();
  const onlineCount = people.filter(p => p.isOnline).length;
  const followingCount = Object.values(followingStatus).filter(Boolean).length;

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'discover', icon: FaUsers, label: 'Discover', link: '/discover' },
    { id: 'friends', icon: FaUserFriends, label: 'Friends', link: '/friends' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Users', icon: FaUsers },
    { value: 'online', label: 'Online Now', icon: FaCircle },
    { value: 'workers', label: 'Workers', icon: FaBriefcase },
    { value: 'employers', label: 'Employers', icon: FaBriefcase },
    { value: 'following', label: 'Following', icon: FaUserCheck },
  ];

  if (loading && people.length === 0) {
    return <div style={styles.loadingWrap}><div style={styles.loadingLogo}>KL</div><div className="spinner-border mt-3" style={{ color: KL_BRAND }} /></div>;
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}><Link to="/" style={styles.logoBox}><span style={styles.logoText}>KL</span></Link><div style={styles.searchBox}><FaSearch style={styles.searchIcon} /><input style={styles.searchInput} placeholder="Search people..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div></div>
        <div style={styles.navCenter}>{navTabs.map(tab => (<Link key={tab.id} to={tab.link} style={{ ...styles.navTab, ...(activeNav === tab.id ? styles.navTabActive : {}) }} onClick={() => setActiveNav(tab.id)}><tab.icon size={24} style={{ color: activeNav === tab.id ? KL_BRAND : '#65676b' }} />{activeNav === tab.id && <div style={styles.navTabLine} />}</Link>))}</div>
        <div style={styles.navRight}><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaEllipsisH size={18} /></div></button><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaFacebookMessenger size={18} /></div></button><button style={styles.navIconBtn}><div style={styles.navIconInner}><FaBell size={18} /></div><span style={styles.badge}>3</span></button><ClickableAvatar userId={user?._id} src={user?.profilePicture} size={40} /></div>
      </nav>

      <div style={styles.body}>
        <aside style={styles.leftSidebar}>
          <Link to={`/profile/${user?._id}`} style={styles.sidebarProfileLink}><ClickableAvatar userId={user?._id} src={user?.profilePicture} size={36} /><span style={styles.sidebarLinkText}>{user?.name}</span></Link>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarSectionTitle}>People</div>
          <button style={styles.sidebarNavItem} onClick={() => setFilter('all')}><FaUsers /> All Users ({people.length})</button>
          <button style={styles.sidebarNavItem} onClick={() => setFilter('online')}><FaCircle /> Online ({onlineCount})</button>
          <button style={styles.sidebarNavItem} onClick={() => setFilter('following')}><FaUserCheck /> Following ({followingCount})</button>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>Connect Â· Network Â· Grow<br />Â© {new Date().getFullYear()} KaziLinda</div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.headerCard}><div style={styles.headerIcon}><FaUsers size={32} color={KL_BRAND} /></div><div><h1 style={styles.headerTitle}>Discover People</h1><p style={styles.headerDesc}>Connect with workers and employers</p></div></div>
          <div style={styles.filterBar}><div style={styles.filterGroup}><FaSearch style={styles.filterIcon} /><input type="text" style={styles.filterInput} placeholder="Search by name, role, or location..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div><div style={styles.filterTabs}>{filterOptions.map(opt => (<button key={opt.value} style={{ ...styles.filterTab, ...(filter === opt.value ? styles.filterTabActive : {}) }} onClick={() => setFilter(opt.value)}><opt.icon size={14} /><span>{opt.label}</span></button>))}</div></div>
          <div style={styles.resultsCount}><FaUsers size={14} /><span>{filteredPeople.length} people found</span></div>
          {filteredPeople.length === 0 ? (<div style={styles.emptyState}><FaUsers size={64} color={KL_BRAND} /><h3>No people found</h3><button style={styles.clearBtn} onClick={() => { setSearchTerm(''); setFilter('all'); }}>Clear Filters</button></div>) : (<div style={styles.peopleGrid}>{filteredPeople.map(person => (<div key={person._id} style={styles.personCard}><div style={styles.personAvatarWrapper}><ClickableAvatar userId={person._id} src={person.profilePicture} size={80} />{person.isOnline && <div style={styles.onlineDot}><FaCircle size={14} color="#45bd62" /></div>}</div><div style={styles.personInfo}><Link to={`/profile/${person._id}`} style={styles.personName}>{person.name}</Link><Badge style={styles.roleBadge}>{person.role || 'Member'}</Badge>{person.currentCountry && <div style={styles.personLocation}><FaMapMarkerAlt size={12} /> {person.currentCountry}</div>}</div><div style={styles.personActions}>{followingStatus[person._id] ? (<Button size="sm" variant="outline-secondary" disabled style={styles.followingBtn}><FaUserCheck /> Following</Button>) : (<FollowButton userId={person._id} isFollowingProp={false} onFollowChange={(newStatus) => handleFollowChange(person._id, newStatus)} token={token} />)}<Button as={Link} to={`/messages?user=${person._id}`} size="sm" style={styles.messageBtn}><FaEnvelope /> Message</Button></div></div>))}</div>)}
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}><div style={styles.rightCardHeader}><FaUserFriends color={KL_BRAND} /><span>Your Network</span></div><div style={styles.networkStat}><div><div style={styles.networkNumber}>{followingCount}</div><div>Following</div></div><div><div style={styles.networkNumber}>{people.filter(p => p.isOnline).length}</div><div>Online Now</div></div><div><div style={styles.networkNumber}>{people.length}</div><div>Available</div></div></div></div>
          <div style={styles.rightCard}><div style={styles.rightCardHeader}><FaMapMarkerAlt color={KL_BRAND} /><span>Popular Locations</span></div><div style={styles.countryList}>{['Kenya', 'UAE', 'Saudi Arabia', 'Qatar', 'UK'].map(country => (<button key={country} style={styles.countryItem} onClick={() => setSearchTerm(country)}><span>{country}</span><Badge style={styles.countryCount}>{people.filter(p => p.currentCountry === country).length}</Badge></button>))}</div></div>
          <div style={styles.tipsCard}><h4>í²¡ Pro Tip</h4><p>Follow people in your industry to build your professional network!</p></div>
          <div style={styles.sidebarFooter}>Connect with confidence<br />Â© {new Date().getFullYear()} KaziLinda</div>
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
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }, navIconInner: { width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: '#e41e3f', color: '#fff', borderRadius: 10, fontSize: 11, padding: '1px 5px' },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1400, margin: '0 auto' }, leftSidebar: { width: 280, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: '#050505' }, sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' },
  sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px' }, sidebarNavItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 8, border: 'none', background: 'transparent', width: '100%', fontSize: 14 },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, textAlign: 'center' }, feedCol: { flex: 1, maxWidth: 680, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  headerCard: { background: '#fff', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: 700 }, headerDesc: { fontSize: 13, color: '#65676b' },
  filterBar: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16 }, filterGroup: { position: 'relative', marginBottom: 12 },
  filterIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b' }, filterInput: { width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #dddfe2', borderRadius: 8 },
  filterTabs: { display: 'flex', gap: 8, flexWrap: 'wrap' }, filterTab: { padding: '6px 12px', borderRadius: 20, border: 'none', background: '#f0f2f5', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 },
  filterTabActive: { background: KL_BRAND, color: '#fff' }, resultsCount: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#65676b', marginBottom: 12 },
  peopleGrid: { display: 'flex', flexDirection: 'column', gap: 12 }, personCard: { background: '#fff', borderRadius: 12, padding: '16px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  personAvatarWrapper: { position: 'relative', flexShrink: 0 }, onlineDot: { position: 'absolute', bottom: 2, right: 2 }, personInfo: { flex: 1, minWidth: 150 },
  personName: { fontSize: 16, fontWeight: 600, color: '#050505', textDecoration: 'none', display: 'block', marginBottom: 4 }, roleBadge: { background: '#e4e6eb', color: '#050505', fontSize: 11, padding: '2px 8px', marginRight: 6 },
  personLocation: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#65676b', marginTop: 4 }, personActions: { display: 'flex', gap: 8, flexShrink: 0 },
  followingBtn: { opacity: 0.7 }, messageBtn: { background: '#e4e6eb', border: 'none', color: '#050505' },
  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12 }, clearBtn: { background: KL_BRAND, border: 'none', borderRadius: 6, padding: '8px 20px', marginTop: 16, color: '#fff' },
  rightSidebar: { width: 300, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16 }, rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #dddfe2' },
  networkStat: { display: 'flex', justifyContent: 'space-around', textAlign: 'center' }, networkNumber: { fontSize: 24, fontWeight: 700, color: KL_BRAND },
  countryList: { display: 'flex', flexDirection: 'column', gap: 8 }, countryItem: { display: 'flex', justifyContent: 'space-between', padding: '8px', borderRadius: 8, border: 'none', background: 'transparent', fontSize: 14, cursor: 'pointer' },
};

export default Discover;
