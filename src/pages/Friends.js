import React, { useState, useEffect, useCallback } from 'react';
import { Container, Button, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { 
  FaUserPlus, FaSearch, FaUserFriends, FaEnvelope, FaHome,
  FaBell, FaFacebookMessenger, FaEllipsisH, FaStore,
  FaPlayCircle, FaUsers, FaBookmark, FaCalendarAlt, FaClock,
  FaUserCheck, FaUserClock, FaGlobe, FaMapMarkerAlt, FaBriefcase
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ClickableAvatar from '../components/Common/ClickableAvatar';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const Friends = () => {
  const { user, token } = useAuth();
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const [activeNav, setActiveNav] = useState('friends');

  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/friends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setFriends(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setFriends([]);
    }
  }, [token]);

  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/suggestions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    }
  }, [token]);

  useEffect(() => {
    Promise.all([fetchFriends(), fetchSuggestions()]).finally(() => setLoading(false));
  }, [fetchFriends, fetchSuggestions]);

  const handleFollow = async (userId) => {
    try {
      await fetch('https://kazi-linda.onrender.com/api/social/follow', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ followingId: userId })
      });
      toast.success('Now following!');
      fetchSuggestions();
      fetchFriends();
    } catch (err) {
      toast.error('Failed to follow');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await fetch('https://kazi-linda.onrender.com/api/social/unfollow', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ followingId: userId })
      });
      toast.success('Unfollowed');
      fetchFriends();
      fetchSuggestions();
    } catch (err) {
      toast.error('Failed to unfollow');
    }
  };

  const filteredFriends = friends.filter(friend => 
    friend.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'friends', icon: FaUserFriends, label: 'Friends', link: '/friends' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
    { id: 'social', icon: FaUsers, label: 'Community', link: '/social' },
  ];

  const leftLinks = [
    { icon: FaUserFriends, label: 'All Friends', count: friends.length, color: KL_BRAND, active: true },
    { icon: FaUserCheck, label: 'Following', count: friends.filter(f => f.status === 'following').length, color: '#45bd62' },
    { icon: FaUserClock, label: 'Follow Requests', count: 0, color: '#1877f2' },
    { icon: FaBookmark, label: 'Saved Profiles', color: '#7c3aed' },
    { icon: FaGlobe, label: 'Discover People', color: '#e41e3f' },
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
              placeholder="Search friends..." 
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
            <span style={styles.sidebarLinkText}>{user?.name || 'Guest User'}</span>
          </Link>

          {leftLinks.map(({ icon: Icon, label, count, color, active }) => (
            <button 
              key={label} 
              style={{
                ...styles.sidebarNavItem,
                ...(active ? styles.sidebarNavItemActive : {}),
              }}
            >
              <span style={{ ...styles.sidebarIconWrap, background: color + '22' }}>
                <Icon size={18} color={color} />
              </span>
              <span style={styles.sidebarLinkText}>{label}</span>
              {count !== undefined && (
                <span style={styles.sidebarCount}>{count}</span>
              )}
            </button>
          ))}

          <div style={styles.sidebarDivider} />
          
          <div style={styles.sidebarSectionTitle}>Friend Activity</div>
          <div style={styles.activityItem}>
            <FaClock size={14} color="#65676b" />
            <span>3 friends joined this week</span>
          </div>
          <div style={styles.activityItem}>
            <FaGlobe size={14} color="#65676b" />
            <span>12 people you may know</span>
          </div>

          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>
            Privacy · Terms · Safety Tips<br />
            © {new Date().getFullYear()} KaziLinda
          </div>
        </aside>

        {/* ── MAIN FEED (FRIENDS LIST) ── */}
        <main style={styles.feedCol}>
          {/* Header Card */}
          <div style={styles.headerCard}>
            <div style={styles.headerIcon}>
              <FaUserFriends size={32} color={KL_BRAND} />
            </div>
            <div>
              <h1 style={styles.headerTitle}>Friends</h1>
              <p style={styles.headerDesc}>
                You have <strong>{friends.length}</strong> {friends.length === 1 ? 'connection' : 'connections'} on KaziLinda
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div style={styles.tabsContainer}>
            <button 
              style={{ ...styles.tab, ...(activeTab === 'friends' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('friends')}
            >
              All Friends ({friends.length})
            </button>
            <button 
              style={{ ...styles.tab, ...(activeTab === 'suggestions' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('suggestions')}
            >
              Suggestions ({suggestions.length})
            </button>
          </div>

          {/* Friends Grid */}
          {activeTab === 'friends' && (
            <>
              {filteredFriends.length === 0 ? (
                <div style={styles.emptyState}>
                  <FaUserFriends size={64} color={KL_BRAND} />
                  <h4>No connections yet</h4>
                  <p>Start following people to see them here!</p>
                  <Button 
                    onClick={() => setActiveTab('suggestions')} 
                    style={styles.primaryBtn}
                  >
                    Find Suggestions
                  </Button>
                </div>
              ) : (
                <div style={styles.friendsGrid}>
                  {filteredFriends.map(friend => (
                    <div key={friend._id} style={styles.friendCard}>
                      <Link to={`/profile/${friend._id}`} style={styles.friendCardLink}>
                        <ClickableAvatar 
                          userId={friend._id} 
                          src={friend.profilePicture} 
                          size={100} 
                        />
                        <h4 style={styles.friendName}>{friend.name}</h4>
                        <div style={styles.friendRole}>
                          <FaBriefcase size={12} /> {friend.role || 'Worker'}
                        </div>
                        {friend.currentCountry && (
                          <div style={styles.friendLocation}>
                            <FaMapMarkerAlt size={12} /> {friend.currentCountry}
                          </div>
                        )}
                        <div style={styles.friendMutual}>
                          <FaUserFriends size={12} /> 3 mutual friends
                        </div>
                      </Link>
                      <div style={styles.friendActions}>
                        <Button 
                          as={Link} 
                          to={`/messages?user=${friend._id}`} 
                          variant="outline-primary" 
                          size="sm"
                          style={styles.messageBtn}
                        >
                          <FaEnvelope /> Message
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleUnfollow(friend._id)}
                          style={styles.unfollowBtn}
                        >
                          Unfollow
                        </Button>
                      </div>
                      <Badge bg="success" style={styles.friendBadge}>Following</Badge>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <>
              {suggestions.length === 0 ? (
                <div style={styles.emptyState}>
                  <FaUserPlus size={64} color={KL_BRAND} />
                  <h4>No suggestions</h4>
                  <p>Check back later for more people to follow!</p>
                </div>
              ) : (
                <div style={styles.suggestionsGrid}>
                  {suggestions.map(suggestion => (
                    <div key={suggestion._id} style={styles.suggestionCard}>
                      <Link to={`/profile/${suggestion._id}`} style={styles.friendCardLink}>
                        <ClickableAvatar 
                          userId={suggestion._id} 
                          src={suggestion.profilePicture} 
                          size={80} 
                        />
                        <h4 style={styles.friendName}>{suggestion.name}</h4>
                        <div style={styles.friendRole}>
                          <FaBriefcase size={12} /> {suggestion.role || 'Worker'}
                        </div>
                        {suggestion.currentCountry && (
                          <div style={styles.friendLocation}>
                            <FaMapMarkerAlt size={12} /> {suggestion.currentCountry}
                          </div>
                        )}
                      </Link>
                      <Button 
                        style={styles.followBtn}
                        onClick={() => handleFollow(suggestion._id)}
                      >
                        <FaUserPlus /> Follow
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside style={styles.rightSidebar}>
          {/* Friend Requests Card */}
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}>
              <FaUserPlus color={KL_BRAND} />
              <span>Friend Requests</span>
            </div>
            <div style={styles.emptyRequests}>
              <p>No pending requests</p>
              <small>When someone follows you, they'll appear here</small>
            </div>
          </div>

          {/* Online Friends */}
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}>
              <FaUserFriends color="#45bd62" />
              <span>Online Friends</span>
            </div>
            {friends.slice(0, 5).map(friend => (
              <div key={friend._id} style={styles.onlineFriend}>
                <div style={styles.onlineAvatar}>
                  <ClickableAvatar userId={friend._id} src={friend.profilePicture} size={36} />
                  <span style={styles.onlineDot} />
                </div>
                <div>
                  <Link to={`/profile/${friend._id}`} style={styles.onlineName}>
                    {friend.name}
                  </Link>
                  <div style={styles.onlineStatus}>Active now</div>
                </div>
              </div>
            ))}
            {friends.length === 0 && (
              <div style={styles.emptyStateSmall}>No friends online</div>
            )}
          </div>

          {/* Invite Card */}
          <div style={styles.inviteCard}>
            <FaUserFriends size={32} color={KL_BRAND} />
            <h4>Invite friends to join</h4>
            <p>Help grow the KaziLinda community</p>
            <Button style={styles.inviteBtn}>
              Send Invites
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
    maxWidth: 1440, margin: '0 auto',
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
    fontWeight: 500, fontSize: 15,
  },
  sidebarNavItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '8px 8px', borderRadius: 8,
    border: 'none', background: 'transparent',
    cursor: 'pointer', width: '100%', textAlign: 'left',
    fontWeight: 500, fontSize: 15, color: '#050505',
  },
  sidebarNavItemActive: { background: KL_BRAND_LIGHT },
  sidebarIconWrap: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  sidebarLinkText: { fontSize: 15, fontWeight: 500, color: '#050505', flex: 1 },
  sidebarCount: { fontSize: 13, color: '#65676b' },
  sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '8px 0' },
  sidebarSectionTitle: { fontSize: 17, fontWeight: 700, color: '#65676b', padding: '8px 8px' },
  sidebarFooter: { fontSize: 12, color: '#65676b', padding: 8, lineHeight: 1.8 },
  activityItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 8px', fontSize: 13, color: '#65676b',
  },

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
    width: 64, height: 64, borderRadius: '50%', background: KL_BRAND_LIGHT,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 700, marginBottom: 4, color: '#050505' },
  headerDesc: { fontSize: 14, color: '#65676b', margin: 0 },

  // TABS
  tabsContainer: {
    display: 'flex', gap: 8, marginBottom: 16,
    borderBottom: '1px solid #dddfe2', padding: '0 4px',
  },
  tab: {
    padding: '12px 16px', border: 'none', background: 'transparent',
    fontSize: 15, fontWeight: 600, color: '#65676b',
    cursor: 'pointer', position: 'relative',
  },
  tabActive: { color: KL_BRAND },
  tabActiveAfter: {
    position: 'absolute', bottom: -1, left: 0, right: 0,
    height: 3, background: KL_BRAND, borderRadius: '2px',
  },

  // FRIENDS GRID
  friendsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  friendCard: {
    background: '#fff', borderRadius: 12, overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(0,0,0,.2)',
    position: 'relative', padding: '16px', textAlign: 'center',
  },
  friendCardLink: { textDecoration: 'none', display: 'block' },
  friendName: { fontSize: 16, fontWeight: 600, marginTop: 12, marginBottom: 4, color: '#050505' },
  friendRole: { fontSize: 13, color: '#65676b', marginBottom: 4 },
  friendLocation: { fontSize: 12, color: '#65676b', marginBottom: 4 },
  friendMutual: { fontSize: 12, color: KL_BRAND, marginTop: 8 },
  friendActions: { display: 'flex', gap: 8, marginTop: 12 },
  messageBtn: { flex: 1, fontSize: 12, padding: '6px 8px' },
  unfollowBtn: { flex: 1, fontSize: 12, padding: '6px 8px' },
  friendBadge: { position: 'absolute', top: 12, right: 12, background: '#45bd62' },

  // SUGGESTIONS GRID
  suggestionsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  suggestionCard: {
    background: '#fff', borderRadius: 12, overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(0,0,0,.2)',
    padding: '16px', textAlign: 'center',
  },
  followBtn: {
    background: KL_BRAND, border: 'none', borderRadius: 6,
    padding: '8px 16px', fontSize: 14, fontWeight: 600,
    width: '100%', marginTop: 12, color: '#fff',
  },

  // RIGHT SIDEBAR
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
  emptyRequests: { textAlign: 'center', padding: '16px', color: '#65676b' },
  onlineFriend: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' },
  onlineAvatar: { position: 'relative' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, background: '#31a24c',
    borderRadius: '50%', border: '2px solid #fff',
  },
  onlineName: { fontSize: 14, fontWeight: 500, color: '#050505', textDecoration: 'none' },
  onlineStatus: { fontSize: 12, color: '#65676b' },
  inviteCard: {
    background: `linear-gradient(135deg, ${KL_BRAND}22 0%, #fff 100%)`,
    borderRadius: 12, padding: '20px', textAlign: 'center',
    marginBottom: 16,
  },
  inviteBtn: {
    background: KL_BRAND, border: 'none', borderRadius: 6,
    padding: '8px 20px', fontWeight: 600, fontSize: 14, width: '100%',
    marginTop: 12,
  },

  // EMPTY STATES
  emptyState: {
    textAlign: 'center', padding: '60px 20px',
    background: '#fff', borderRadius: 12,
    color: '#65676b',
  },
  emptyStateSmall: { textAlign: 'center', padding: '20px', color: '#65676b' },

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
  primaryBtn: {
    background: KL_BRAND, border: 'none', padding: '8px 24px',
    borderRadius: 6, fontWeight: 600,
  },
};

export default Friends;