import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button, Badge } from 'react-bootstrap';
import { 
  FaUserPlus, FaSearch, FaUsers, FaEnvelope, FaCircle, FaHome,
  FaBell, FaFacebookMessenger, FaEllipsisH, FaUserFriends, 
  FaBriefcase, FaStore, FaPlayCircle, FaBookmark, FaCalendarAlt,
  FaMapMarkerAlt, FaFilter, FaUserCheck, FaUserClock, FaGlobe
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import FollowButton from '../components/Common/FollowButton';
import toast from 'react-hot-toast';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

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
        } catch {
          statuses[p._id] = false;
        }
      }
      setFollowingStatus(statuses);
    } catch (err) {
      console.error(err);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  const updateOnlineStatus = useCallback(async () => {
    try {
      await fetch('https://kazi-linda.onrender.com/api/social/online', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchPeople();
    updateOnlineStatus();
    const interval = setInterval(() => {
      updateOnlineStatus();
      fetchPeople();
    }, 30000);
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
    if (filter === 'online') {
      filtered = filtered.filter(p => p.isOnline);
    }
    if (filter === 'workers') {
      filtered = filtered.filter(p => p.role === 'worker');
    }
    if (filter === 'employers') {
      filtered = filtered.filter(p => p.role === 'employer');
    }
    if (filter === 'following') {
      filtered = filtered.filter(p => followingStatus[p._id]);
    }
    return filtered;
  };

  const filteredPeople = getFilteredPeople();
  const onlineCount = people.filter(p => p.isOnline).length;
  const workerCount = people.filter(p => p.role === 'worker').length;
  const employerCount = people.filter(p => p.role === 'employer').length;
  const followingCount = Object.values(followingStatus).filter(Boolean).length;

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'discover', icon: FaUsers, label: 'Discover', link: '/discover' },
    { id: 'friends', icon: FaUserFriends, label: 'Friends', link: '/friends' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
  ];

  const leftLinks = [
    { icon: FaUsers, label: 'All Users', count: people.length, color: KL_BRAND, active: true },
    { icon: FaCircle, label: 'Online Now', count: onlineCount, color: '#45bd62' },
    { icon: FaUserCheck, label: 'Following', count: followingCount, color: '#1877f2' },
    { icon: FaBriefcase, label: 'Workers', count: workerCount, color: '#7c3aed' },
    { icon: FaStore, label: 'Employers', count: employerCount, color: '#e41e3f' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Users', icon: FaUsers },
    { value: 'online', label: 'Online Now', icon: FaCircle },
    { value: 'workers', label: 'Workers', icon: FaBriefcase },
    { value: 'employers', label: 'Employers', icon: FaStore },
    { value: 'following', label: 'Following', icon: FaUserCheck },
  ];

  if (loading && people.length === 0) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingLogo}>KL</div>
        <div className="spinner-border mt-3" style={{ color: KL_BRAND }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ════════════ TOP NAV ════════════ */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link to="/" style={styles.logoBox}>
            <span style={styles.logoText}>KL</span>
          </Link>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input 
              style={styles.searchInput} 
              placeholder="Search people..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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

      {/* ════════════ BODY (3-COLUMN LAYOUT) ════════════ */}
      <div style={styles.body}>
        {/* ── LEFT SIDEBAR ── */}
        <aside style={styles.leftSidebar}>
          <Link to={`/profile/${user?._id}`} style={styles.sidebarProfileLink}>
            <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={36} />
            <span style={styles.sidebarLinkText}>{user?.name || 'User'}</span>
          </Link>

          {leftLinks.map(({ icon: Icon, label, count, color, active }) => (
            <button 
              key={label} 
              style={{
                ...styles.sidebarNavItem,
                ...(active ? styles.sidebarNavItemActive : {}),
              }}
              onClick={() => {
                if (label === 'All Users') setFilter('all');
                if (label === 'Online Now') setFilter('online');
                if (label === 'Following') setFilter('following');
                if (label === 'Workers') setFilter('workers');
                if (label === 'Employers') setFilter('employers');
              }}
            >
              <span style={{ ...styles.sidebarIconWrap, background: color + '22' }}>
                <Icon size={18} color={color} />
              </span>
              <span style={styles.sidebarLinkText}>{label}</span>
              {count > 0 && (
                <span style={{ ...styles.sidebarCount, background: color + '22', color }}>{count}</span>
              )}
            </button>
          ))}

          <div style={styles.sidebarDivider} />
          
          <div style={styles.sidebarSectionTitle}>Suggested Filters</div>
          <div style={styles.filterChips}>
            <button 
              style={{ ...styles.filterChip, ...(filter === 'all' ? styles.filterChipActive : {}) }}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              style={{ ...styles.filterChip, ...(filter === 'online' ? styles.filterChipActive : {}) }}
              onClick={() => setFilter('online')}
            >
              <FaCircle size={10} color="#45bd62" /> Online
            </button>
            <button 
              style={{ ...styles.filterChip, ...(filter === 'following' ? styles.filterChipActive : {}) }}
              onClick={() => setFilter('following')}
            >
              Following
            </button>
          </div>

          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>
            Connect · Network · Grow<br />
            © {new Date().getFullYear()} KaziLinda
          </div>
        </aside>

        {/* ── MAIN FEED (DISCOVER PEOPLE) ── */}
        <main style={styles.feedCol}>
          {/* Header Card */}
          <div style={styles.headerCard}>
            <div style={styles.headerIcon}>
              <FaUsers size={32} color={KL_BRAND} />
            </div>
            <div>
              <h1 style={styles.headerTitle}>Discover People</h1>
              <p style={styles.headerDesc}>
                Connect with workers, employers, and professionals from around the world
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={styles.filterBar}>
            <div style={styles.filterGroup}>
              <FaSearch style={styles.filterIcon} />
              <input 
                type="text" 
                style={styles.filterInput} 
                placeholder="Search by name, role, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={styles.filterTabs}>
              {filterOptions.map(opt => (
                <button
                  key={opt.value}
                  style={{
                    ...styles.filterTab,
                    ...(filter === opt.value ? styles.filterTabActive : {}),
                  }}
                  onClick={() => setFilter(opt.value)}
                >
                  <opt.icon size={14} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div style={styles.resultsCount}>
            <FaUsers size={14} color="#65676b" />
            <span>{filteredPeople.length} people found</span>
          </div>

          {/* People Grid */}
          {filteredPeople.length === 0 ? (
            <div style={styles.emptyState}>
              <FaUsers size={64} color={KL_BRAND} />
              <h3>No people found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button style={styles.clearBtn} onClick={() => { setSearchTerm(''); setFilter('all'); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={styles.peopleGrid}>
              {filteredPeople.map(person => (
                <div key={person._id} style={styles.personCard}>
                  <div style={styles.personAvatarWrapper}>
                    <ClickableAvatar 
                      userId={person._id} 
                      src={person.profilePicture} 
                      size={80} 
                    />
                    {person.isOnline && (
                      <div style={styles.onlineDot}>
                        <FaCircle size={14} color="#45bd62" />
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.personInfo}>
                    <Link to={`/profile/${person._id}`} style={styles.personName}>
                      {person.name}
                    </Link>
                    <Badge style={styles.roleBadge}>{person.role || 'Member'}</Badge>
                    {person.currentCountry && (
                      <div style={styles.personLocation}>
                        <FaMapMarkerAlt size={12} color="#65676b" />
                        <span>{person.currentCountry}</span>
                      </div>
                    )}
                    {person.bio && (
                      <p style={styles.personBio}>{person.bio.substring(0, 80)}...</p>
                    )}
                  </div>
                  
                  <div style={styles.personActions}>
                    {followingStatus[person._id] ? (
                      <Button 
                        size="sm" 
                        variant="outline-secondary" 
                        disabled
                        style={styles.followingBtn}
                      >
                        <FaUserCheck /> Following
                      </Button>
                    ) : (
                      <FollowButton 
                        userId={person._id}
                        isFollowingProp={false}
                        onFollowChange={(newStatus) => handleFollowChange(person._id, newStatus)}
                        token={token}
                      />
                    )}
                    <Button 
                      as={Link} 
                      to={`/messages?user=${person._id}`} 
                      size="sm" 
                      style={styles.messageBtn}
                    >
                      <FaEnvelope /> Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside style={styles.rightSidebar}>
          {/* Connections Stats */}
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}>
              <FaUserFriends color={KL_BRAND} />
              <span>Your Network</span>
            </div>
            <div style={styles.networkStat}>
              <div>
                <div style={styles.networkNumber}>{followingCount}</div>
                <div style={styles.networkLabel}>Following</div>
              </div>
              <div>
                <div style={styles.networkNumber}>{people.filter(p => p.isOnline).length}</div>
                <div style={styles.networkLabel}>Online Now</div>
              </div>
              <div>
                <div style={styles.networkNumber}>{people.length}</div>
                <div style={styles.networkLabel}>Available</div>
              </div>
            </div>
          </div>

          {/* Popular Countries */}
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}>
              <FaGlobe color={KL_BRAND} />
              <span>Popular Locations</span>
            </div>
            <div style={styles.countryList}>
              {['Kenya', 'UAE', 'Saudi Arabia', 'Qatar', 'UK'].map(country => (
                <button 
                  key={country} 
                  style={styles.countryItem}
                  onClick={() => setSearchTerm(country)}
                >
                  <FaMapMarkerAlt size={12} color={KL_BRAND} />
                  <span>{country}</span>
                  <Badge style={styles.countryCount}>
                    {people.filter(p => p.currentCountry === country).length}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div style={styles.tipsCard}>
            <h4>💡 Pro Tip</h4>
            <p>Follow people in your industry to build your professional network and discover more opportunities!</p>
          </div>

          <div style={styles.sidebarFooter}>
            Connect with confidence<br />
            © {new Date().getFullYear()} KaziLinda
          </div>
        </aside>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   STYLES (Facebook-style)
══════════════════════════════════════════ */
const styles = {
  page: {
    background: '#f0f2f5',
    minHeight: '100vh',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },

  // NAVIGATION
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

  // BODY LAYOUT
  body: {
    display: 'flex', paddingTop: 56,
    maxWidth: 1400, margin: '0 auto',
  },

  // LEFT SIDEBAR
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
    fontWeight: 500, fontSize: 15, marginBottom: 8,
  },
  sidebarNavItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 8px', borderRadius: 8,
    border: 'none', background: 'transparent',
    cursor: 'pointer', width: '100%', textAlign: 'left',
    fontWeight: 500, fontSize: 14, color: '#050505',
  },
  sidebarNavItemActive: { background: KL_BRAND_LIGHT },
  sidebarIconWrap: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  sidebarLinkText: { fontSize: 14, fontWeight: 500, color: '#050505', flex: 1 },
  sidebarCount: {
    fontSize: 12, fontWeight: 600, padding: '2px 8px',
    borderRadius: 12, minWidth: 24, textAlign: 'center',
  },
  sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' },
  sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px', marginBottom: 4 },
  filterChips: { display: 'flex', gap: 8, padding: '8px 8px', flexWrap: 'wrap' },
  filterChip: {
    padding: '6px 12px', borderRadius: 20, border: '1px solid #dddfe2',
    background: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex',
    alignItems: 'center', gap: 6,
  },
  filterChipActive: { background: KL_BRAND_LIGHT, borderColor: KL_BRAND, color: KL_BRAND },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, lineHeight: 1.6, textAlign: 'center' },

  // MAIN FEED
  feedCol: {
    flex: 1, maxWidth: 680, margin: '0 16px', padding: '16px 0',
    minWidth: 0,
  },

  // HEADER CARD
  headerCard: {
    background: '#fff', borderRadius: 12, padding: '20px',
    display: 'flex', alignItems: 'center', gap: 16,
    marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  headerIcon: {
    width: 56, height: 56, borderRadius: '50%', background: KL_BRAND_LIGHT,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#050505' },
  headerDesc: { fontSize: 13, color: '#65676b', margin: 0 },

  // FILTER BAR
  filterBar: {
    background: '#fff', borderRadius: 12, padding: '16px',
    marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  filterGroup: {
    position: 'relative', marginBottom: 12,
  },
  filterIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b' },
  filterInput: {
    width: '100%', padding: '10px 12px 10px 36px',
    border: '1px solid #dddfe2', borderRadius: 8, fontSize: 14,
    outline: 'none',
  },
  filterTabs: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  filterTab: {
    padding: '6px 12px', borderRadius: 20, border: 'none',
    background: '#f0f2f5', fontSize: 13, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  filterTabActive: { background: KL_BRAND, color: '#fff' },
  resultsCount: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 13, color: '#65676b', marginBottom: 12,
  },

  // PEOPLE GRID
  peopleGrid: {
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  personCard: {
    background: '#fff', borderRadius: 12, padding: '16px',
    display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,.2)',
    flexWrap: 'wrap',
  },
  personAvatarWrapper: { position: 'relative', flexShrink: 0 },
  onlineDot: { position: 'absolute', bottom: 2, right: 2 },
  personInfo: { flex: 1, minWidth: 150 },
  personName: {
    fontSize: 16, fontWeight: 600, color: '#050505',
    textDecoration: 'none', display: 'block', marginBottom: 4,
  },
  roleBadge: { background: '#e4e6eb', color: '#050505', fontSize: 11, padding: '2px 8px', marginRight: 6 },
  personLocation: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#65676b', marginTop: 4 },
  personBio: { fontSize: 12, color: '#65676b', marginTop: 6, marginBottom: 0 },
  personActions: { display: 'flex', gap: 8, flexShrink: 0 },
  followingBtn: { opacity: 0.7 },
  messageBtn: { background: '#e4e6eb', border: 'none', color: '#050505' },

  // EMPTY STATE
  emptyState: {
    textAlign: 'center', padding: '60px 20px',
    background: '#fff', borderRadius: 12,
    color: '#65676b',
  },
  clearBtn: {
    background: KL_BRAND, border: 'none', borderRadius: 6,
    padding: '8px 20px', marginTop: 16, color: '#fff',
    cursor: 'pointer',
  },

  // RIGHT SIDEBAR
  rightSidebar: {
    width: 300, flexShrink: 0,
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
    fontSize: 15, fontWeight: 600, marginBottom: 12,
    paddingBottom: 8, borderBottom: '1px solid #dddfe2',
  },
  networkStat: {
    display: 'flex', justifyContent: 'space-around', textAlign: 'center',
  },
  networkNumber: { fontSize: 24, fontWeight: 700, color: KL_BRAND },
  networkLabel: { fontSize: 12, color: '#65676b' },
  countryList: { display: 'flex', flexDirection: 'column', gap: 8 },
  countryItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px', borderRadius: 8, border: 'none',
    background: 'transparent', cursor: 'pointer',
    fontSize: 14,
  },
  countryCount: { marginLeft: 'auto', background: '#e4e6eb', color: '#050505' },
  tipsCard: {
    background: KL_BRAND_LIGHT, borderRadius: 12, padding: '16px',
    marginBottom: 16,
  },

  // LOADING
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

export default Discover;