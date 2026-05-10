import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../services/api';
import ClickableAvatar from '../Common/ClickableAvatar';
import {
  FaHome, FaBriefcase, FaSignOutAlt, FaUser, FaSignInAlt, FaUserPlus,
  FaTachometerAlt, FaBars, FaTimes, FaInfoCircle, FaEnvelope, FaNewspaper,
  FaSearch, FaBell, FaEllipsisH, FaUsers, FaShieldAlt, FaChevronDown
} from 'react-icons/fa';

const KL_BRAND = '#f39c12';
// Removed unused KL_LIGHT

/* ── nav tabs shown in the CENTER of the bar ── */
const NAV_TABS = [
  { path: '/',          icon: FaHome,        label: 'Home'      },
  { path: '/jobs',      icon: FaBriefcase,   label: 'Jobs'      },
  { path: '/verify',    icon: FaShieldAlt,   label: 'Verify'    },
  { path: '/blacklist', icon: FaUsers,       label: 'Blacklist' },
  { path: '/about',     icon: FaInfoCircle,  label: 'About'     },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const location          = useLocation();
  const [unreadCount, setUnreadCount]     = useState(0);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [profileOpen, setProfileOpen]     = useState(false);
  const [notifOpen, setNotifOpen]         = useState(false);
  const [searchVal, setSearchVal]         = useState('');
  const profileRef = useRef(null);
  const notifRef   = useRef(null);

  /* close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnread();
      const id = setInterval(fetchUnread, 60000);
      return () => clearInterval(id);
    }
  }, [user]);

  const fetchUnread = async () => {
    try {
      const res = await messageAPI.getUnreadCount();
      setUnreadCount(res.data?.count || 0);
    } catch { /* silent */ }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
    setProfileOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    const map = { admin: '/admin/dashboard', employer: '/employer/dashboard', embassy: '/embassy/dashboard', recruiter: '/recruiter/dashboard' };
    return map[user.role] || '/dashboard';
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const userName  = user?.name?.split(' ')[0] || 'User';
  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'KL';

  /* extra tabs only for logged-in users */
  const allTabs = user
    ? [...NAV_TABS, { path: '/news', icon: FaNewspaper, label: 'Feed' }]
    : NAV_TABS;

  return (
    <>
      <nav style={s.nav}>

        {/* ── LEFT: logo + search ── */}
        <div style={s.navLeft}>
          <Link to="/" style={s.logoBox}>
            <span style={s.logoText}>KL</span>
          </Link>

          <div style={s.searchBox}>
            <FaSearch style={s.searchIcon} />
            <input
              style={s.searchInput}
              placeholder="Search KaziLinda…"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
            />
          </div>
        </div>

        {/* ── CENTER: tab icons (desktop) ── */}
        <div style={s.navCenter}>
          {allTabs.map(tab => (
            <Link
              key={tab.path}
              to={tab.path}
              style={{ ...s.navTab, ...(isActive(tab.path) ? s.navTabActive : {}) }}
              title={tab.label}
            >
              <tab.icon
                size={22}
                style={{ color: isActive(tab.path) ? KL_BRAND : '#65676b' }}
              />
              {isActive(tab.path) && <span style={s.navTabLine} />}
            </Link>
          ))}
        </div>

        {/* ── RIGHT: action icons + profile ── */}
        <div style={s.navRight}>

          {/* Messages */}
          {user && (
            <Link to="/messages" style={s.iconBtnLink} title="Messages">
              <div style={s.iconInner}>
                <FaEnvelope size={18} color="#050505" />
              </div>
              {unreadCount > 0 && <span style={s.badge}>{unreadCount}</span>}
            </Link>
          )}

          {/* Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              style={s.iconBtn}
              onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
              title="Notifications"
            >
              <div style={s.iconInner}><FaBell size={18} color="#050505" /></div>
            </button>
            {notifOpen && (
              <div style={s.dropdown}>
                <div style={s.dropdownHeader}>Notifications</div>
                <div style={s.dropdownEmpty}>No new notifications</div>
              </div>
            )}
          </div>

          {/* Menu (ellipsis) */}
          <button style={s.iconBtn} title="Menu">
            <div style={s.iconInner}><FaEllipsisH size={18} color="#050505" /></div>
          </button>

          {/* Profile / Auth */}
          {user ? (
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                style={s.profileBtn}
                onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
              >
                {user.profilePicture ? (
                  <ClickableAvatar userId={user._id} src={user.profilePicture} name={user.name} size={36} showOnline isOnline={user.isOnline} />
                ) : (
                  <div style={s.avatarInitials}>{userInitials}</div>
                )}
                <span style={s.profileName}>{userName}</span>
                <FaChevronDown size={12} color="#65676b" />
              </button>

              {profileOpen && (
                <div style={{ ...s.dropdown, minWidth: 220 }}>
                  {/* Mini profile card */}
                  <div style={s.dropdownProfileCard}>
                    {user.profilePicture ? (
                      <ClickableAvatar userId={user._id} src={user.profilePicture} name={user.name} size={48} />
                    ) : (
                      <div style={{ ...s.avatarInitials, width: 48, height: 48, fontSize: 18 }}>{userInitials}</div>
                    )}
                    <div style={{ marginLeft: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#050505' }}>{user.name}</div>
                      <div style={{ fontSize: 13, color: '#65676b' }}>{user.role || 'Member'}</div>
                    </div>
                  </div>

                  <div style={s.dropdownDivider} />

                  <Link to={getDashboardPath()} style={s.dropdownItem} onClick={() => setProfileOpen(false)}>
                    <span style={{ ...s.dropdownIcon, background: KL_BRAND + '22' }}>
                      <FaTachometerAlt size={14} color={KL_BRAND} />
                    </span>
                    Dashboard
                  </Link>
                  <Link to="/profile/edit" style={s.dropdownItem} onClick={() => setProfileOpen(false)}>
                    <span style={{ ...s.dropdownIcon, background: '#1877f222' }}>
                      <FaUser size={14} color="#1877f2" />
                    </span>
                    Edit Profile
                  </Link>
                  <Link to="/messages" style={s.dropdownItem} onClick={() => setProfileOpen(false)}>
                    <span style={{ ...s.dropdownIcon, background: '#31a24c22' }}>
                      <FaEnvelope size={14} color="#31a24c" />
                    </span>
                    Messages
                    {unreadCount > 0 && (
                      <span style={{ marginLeft: 'auto', background: '#e41e3f', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '1px 6px' }}>
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <div style={s.dropdownDivider} />

                  <button style={{ ...s.dropdownItem, border: 'none', background: 'transparent', width: '100%', cursor: 'pointer', color: '#e41e3f' }} onClick={handleLogout}>
                    <span style={{ ...s.dropdownIcon, background: '#e41e3f22' }}>
                      <FaSignOutAlt size={14} color="#e41e3f" />
                    </span>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login"    style={s.loginBtn}>
                <FaSignInAlt size={14} style={{ marginRight: 6 }} /> Log in
              </Link>
              <Link to="/register" style={s.registerBtn}>
                <FaUserPlus size={14} style={{ marginRight: 6 }} /> Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button style={{ ...s.iconBtn, display: 'none' }} className="kl-mobile-toggle" onClick={() => setMobileOpen(o => !o)}>
            <div style={s.iconInner}>
              {mobileOpen ? <FaTimes size={18} color="#050505" /> : <FaBars size={18} color="#050505" />}
            </div>
          </button>
        </div>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div style={s.mobileDrawer}>
          {allTabs.map(tab => (
            <Link
              key={tab.path}
              to={tab.path}
              style={{ ...s.mobileLink, ...(isActive(tab.path) ? s.mobileLinkActive : {}) }}
              onClick={() => setMobileOpen(false)}
            >
              <tab.icon size={20} color={isActive(tab.path) ? KL_BRAND : '#65676b'} style={{ marginRight: 12 }} />
              {tab.label}
            </Link>
          ))}

          <div style={{ borderTop: '1px solid #dddfe2', margin: '8px 0' }} />

          {user ? (
            <>
              <Link to={getDashboardPath()} style={s.mobileLink} onClick={() => setMobileOpen(false)}>
                <FaTachometerAlt size={20} color={KL_BRAND} style={{ marginRight: 12 }} /> Dashboard
              </Link>
              <Link to="/profile/edit" style={s.mobileLink} onClick={() => setMobileOpen(false)}>
                <FaUser size={20} color="#1877f2" style={{ marginRight: 12 }} /> Edit Profile
              </Link>
              <button style={{ ...s.mobileLink, border: 'none', background: 'transparent', width: '100%', cursor: 'pointer', color: '#e41e3f' }} onClick={handleLogout}>
                <FaSignOutAlt size={20} color="#e41e3f" style={{ marginRight: 12 }} /> Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    style={s.mobileLink} onClick={() => setMobileOpen(false)}>
                <FaSignInAlt size={20} color={KL_BRAND} style={{ marginRight: 12 }} /> Log In
              </Link>
              <Link to="/register" style={s.mobileLink} onClick={() => setMobileOpen(false)}>
                <FaUserPlus size={20} color={KL_BRAND} style={{ marginRight: 12 }} /> Register
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        /* show hamburger on mobile, hide on desktop */
        @media (max-width: 768px) {
          .kl-mobile-toggle { display: flex !important; }
          .kl-nav-center    { display: none !important; }
          .kl-search-box    { display: none !important; }
        }
        /* icon + link hover */
        nav a:hover, nav button:hover { opacity: .88; }
        /* dropdown item hover */
        .kl-dd-item:hover { background: #f0f2f5; }
        /* mobile link hover */
        .kl-mobile-link:hover { background: #f0f2f5; }
        /* nav tab hover */
        .kl-tab:hover { background: #f0f2f5; }
        /* scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-thumb { background: #bcc0c4; border-radius: 4px; }
      `}</style>
    </>
  );
};

/* ════════════ STYLES ════════════ */
const s = {
  nav: {
    position: 'sticky', top: 0, left: 0, right: 0, zIndex: 300,
    height: 56, background: '#fff',
    borderBottom: '1px solid #dddfe2',
    boxShadow: '0 2px 4px rgba(0,0,0,.08)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },

  /* LEFT */
  navLeft: { display: 'flex', alignItems: 'center', gap: 8, flex: 1 },
  logoBox: {
    width: 40, height: 40, borderRadius: '50%', background: '#f39c12',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none', flexShrink: 0,
  },
  logoText: { color: '#fff', fontWeight: 900, fontSize: 17, fontStyle: 'italic' },
  searchBox: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 12, color: '#65676b', fontSize: 13, pointerEvents: 'none' },
  searchInput: {
    background: '#f0f2f5', border: 'none', borderRadius: 20,
    padding: '8px 16px 8px 34px', fontSize: 15, outline: 'none',
    width: 220, color: '#050505',
  },

  /* CENTER */
  navCenter: { display: 'flex', gap: 2, flex: 1, justifyContent: 'center' },
  navTab: {
    position: 'relative',
    width: 80, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, textDecoration: 'none',
    transition: 'background .15s',
  },
  navTabActive: { background: '#fef9e7' },
  navTabLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
    background: '#f39c12', borderRadius: '2px 2px 0 0',
  },

  /* RIGHT */
  navRight: { display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' },
  iconBtn: {
    position: 'relative', background: 'transparent', border: 'none',
    cursor: 'pointer', padding: 0,
  },
  iconBtnLink: {
    position: 'relative', textDecoration: 'none', display: 'flex',
  },
  iconInner: {
    width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: 0, right: 0,
    background: '#e41e3f', color: '#fff', borderRadius: 10,
    fontSize: 11, fontWeight: 700, padding: '1px 5px',
    minWidth: 18, textAlign: 'center',
  },

  profileBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#f0f2f5', border: 'none', borderRadius: 24,
    padding: '4px 10px 4px 4px', cursor: 'pointer',
  },
  profileName: { fontSize: 15, fontWeight: 600, color: '#050505' },
  avatarInitials: {
    width: 36, height: 36, borderRadius: '50%', background: '#f39c12',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
  },

  loginBtn: {
    display: 'inline-flex', alignItems: 'center',
    background: '#fef9e7', color: '#f39c12',
    border: '1px solid #f39c12', borderRadius: 6,
    padding: '6px 14px', fontWeight: 700, fontSize: 14,
    textDecoration: 'none',
  },
  registerBtn: {
    display: 'inline-flex', alignItems: 'center',
    background: '#f39c12', color: '#fff', border: 'none',
    borderRadius: 6, padding: '6px 14px', fontWeight: 700, fontSize: 14,
    textDecoration: 'none',
  },

  /* DROPDOWN */
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: '#fff', borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,.15)',
    minWidth: 180, zIndex: 400, overflow: 'hidden',
    padding: '8px 0',
  },
  dropdownHeader: {
    fontSize: 17, fontWeight: 700, color: '#050505',
    padding: '8px 16px 4px',
  },
  dropdownEmpty: {
    fontSize: 14, color: '#65676b', padding: '8px 16px 12px', textAlign: 'center',
  },
  dropdownProfileCard: {
    display: 'flex', alignItems: 'center', padding: '12px 16px',
  },
  dropdownDivider: { borderTop: '1px solid #f0f2f5', margin: '4px 0' },
  dropdownItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px', fontSize: 15, color: '#050505',
    textDecoration: 'none', cursor: 'pointer',
  },
  dropdownIcon: {
    width: 32, height: 32, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },

  /* MOBILE DRAWER */
  mobileDrawer: {
    position: 'fixed', top: 56, left: 0, right: 0, bottom: 0,
    background: '#fff', zIndex: 250, overflowY: 'auto',
    display: 'flex', flexDirection: 'column', padding: '8px 0',
    boxShadow: '0 4px 12px rgba(0,0,0,.15)',
  },
  mobileLink: {
    display: 'flex', alignItems: 'center',
    padding: '12px 20px', fontSize: 16, fontWeight: 500,
    color: '#050505', textDecoration: 'none',
    borderRadius: 0,
  },
  mobileLinkActive: {
    background: '#fef9e7', color: '#f39c12', fontWeight: 700,
  },
};

export default Navbar;