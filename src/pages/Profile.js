import rateLimiter from "../utils/rateLimit";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import FollowButton from '../components/Common/FollowButton';
import {
  FaMapMarkerAlt, FaEnvelope, FaEdit, FaCamera, FaThumbsUp, FaComment,
  FaShare, FaEllipsisH, FaHeart, FaBell, FaSearch, FaUsers,
  FaBriefcase, FaGlobe, FaUserCircle, FaHome,
  FaFacebookMessenger, FaBriefcase as FaWork, FaLeaf
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import moment from 'moment';
import Logo from '../components/Common/Logo';

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
  textLight: '#fff',
  border: '#A5D6A7'
};

const KL_BRAND = colors.primary;
const KL_BG = colors.gradientLight;

const Profile = () => {
  const { userId } = useParams();
  const { user, token } = useAuth();
  // const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [coverHover, setCoverHover] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProfile = useCallback(async () => {
    try {
      const id = userId || user?._id;
      console.log('Fetching profile for ID:', id);
      
      const res = await rateLimiter.fetch(`https://kazi-linda.onrender.com/api/profile/public/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!res.ok) throw new Error('Profile not found');
      if (res.status === 429) {
        console.log("Rate limited, waiting 5 seconds...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        return fetchProfile();
      }
      const data = await res.json();
      console.log('Profile data received:', data);
      
      setProfile(data);
      console.log("Followers from API:", data.followers);
      console.log("Followers count:", data.followers?.length);
      
      const followers = data.followers || [];
      const following = data.following || [];
      setFollowersCount(Array.isArray(followers) ? followers.length : 0);
      setFollowingCount(Array.isArray(following) ? following.length : 0);
      
      console.log('Followers count:', followers.length, 'Following count:', following.length);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId, user, token]);

  const fetchUserPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const id = userId || user?._id;
      const res = await rateLimiter.fetch(`https://kazi-linda.onrender.com/api/social/user-posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [userId, user, token]);

  const fetchFollowers = async () => {
    try {
      const id = userId || user?._id;
      const res = await fetch(`https://kazi-linda.onrender.com/api/social/followers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFollowersList(data);
      setShowFollowersModal(true);
    } catch { toast.error('Failed to load followers'); }
  };

  const fetchFollowing = async () => {
    try {
      const id = userId || user?._id;
      const res = await fetch(`https://kazi-linda.onrender.com/api/social/following/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFollowingList(data);
      setShowFollowingModal(true);
    } catch { toast.error('Failed to load following'); }
  };

  const updateFollowStatus = useCallback(async () => {
    if (!userId || userId === user?._id) return;
    try {
      const res = await fetch(`https://kazi-linda.onrender.com/api/social/following/check/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIsFollowing(data.following);
    } catch (err) { console.error(err); }
  }, [userId, user, token]);

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
    updateFollowStatus();
  }, [fetchProfile, fetchUserPosts, updateFollowStatus]);

  const handleFollowChange = async (newStatus) => {
    setIsFollowing(newStatus);
    await fetchProfile();
  };

  const handleLike = async (postId) => {
    try {
      await fetch(`https://kazi-linda.onrender.com/api/social/posts/${postId}/like`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      fetchUserPosts();
    } catch (err) { console.error(err); }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'kazi_linda_uploads');
      const uploadRes = await fetch('https://api.cloudinary.com/v1_1/denczbmin/image/upload', {
        method: 'POST',
        body: formData
      });
      const cloudinaryData = await uploadRes.json();
      const response = await fetch('https://kazi-linda.onrender.com/api/profile/cover-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ coverUrl: cloudinaryData.secure_url })
      });
      if (response.ok) {
        toast.success('Cover photo updated!');
        fetchProfile();
      } else {
        toast.error('Failed to update cover photo');
      }
    } catch (err) {
      toast.error('Failed to upload cover');
    } finally {
      setUploadingCover(false);
    }
  };

  const isOwnProfile = !userId || userId === user?._id;

  if (loading) {
    return (
      <div style={s.fullCenter}>
        <div style={s.loadingLogo}>KL</div>
        <Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={s.fullCenter}>
        <FaUserCircle size={72} color={KL_BRAND} />
        <h3 style={{ marginTop: 16 }}>User not found</h3>
        <Link to="/" style={s.primaryBtn}>Go Home</Link>
      </div>
    );
  }

  const displayName = profile.name || 'KaziLinda User';
  const firstName = displayName.split(' ')[0];
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const roleColor = { worker: colors.secondary, employer: colors.primary, recruiter: colors.accent, embassy: colors.warning }[profile.role] || KL_BRAND;

  const TABS = [
    { id: 'posts', label: `Posts (${posts.length})` },
    { id: 'about', label: 'About' },
    { id: 'friends', label: 'Friends' },
  ];

  return (
    <div style={s.page}>
      {/* NAVBAR */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <Logo size={36} />
          <div style={{ position: 'relative' }}>
            <FaSearch style={s.searchIcon} size={13} />
            <input style={s.searchInput} placeholder="Search KaziLinda‚Ä¶" />
          </div>
        </div>
        <div style={s.navCenter}>
          {[
            { to: '/', icon: FaHome, label: 'Home' },
            { to: `/profile/${user?._id}`, icon: FaUserCircle, label: 'Profile' },
            { to: '/jobs', icon: FaBriefcase, label: 'Jobs' },
            { to: '/news', icon: FaUsers, label: 'Feed' },
          ].map(t => (
            <Link key={t.to} to={t.to} style={{ ...s.navTab, ...(window.location.pathname === t.to ? s.navTabActive : {}) }} title={t.label}>
              <t.icon size={22} style={{ color: window.location.pathname === t.to ? KL_BRAND : '#65676b' }} />
            </Link>
          ))}
        </div>
        <div style={s.navRight}>
          <button style={s.iconBtn}><div style={s.iconInner}><FaEllipsisH size={17} /></div></button>
          <button style={s.iconBtn}><div style={s.iconInner}><FaFacebookMessenger size={17} /></div></button>
          <button style={s.iconBtn}>
            <div style={s.iconInner}><FaBell size={17} /></div>
            <span style={s.badge}>3</span>
          </button>
          <ClickableAvatar userId={user?._id} src={user?.profilePicture} name={user?.name} size={38} />
        </div>
      </nav>

      {/* COVER + PROFILE HEADER */}
      <div style={s.coverWrap}>
        <div
          style={s.coverPhoto}
          onMouseEnter={() => isOwnProfile && setCoverHover(true)}
          onMouseLeave={() => setCoverHover(false)}
        >
          {profile?.coverPhoto ? (
            <img src={profile.coverPhoto} alt="Cover" style={s.coverImage} />
          ) : (
            <div style={{ ...s.coverGradient, background: colors.gradient }} />
          )}
          {isOwnProfile && coverHover && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleCoverUpload}
                disabled={uploadingCover}
              />
              <button style={s.editCoverBtn} onClick={() => fileInputRef.current?.click()} disabled={uploadingCover}>
                <FaCamera size={14} style={{ marginRight: 6 }} />
                {uploadingCover ? 'Uploading...' : 'Edit cover photo'}
              </button>
            </>
          )}
        </div>

        <div style={s.profileBar}>
          <div style={s.profileBarInner}>
            <div style={s.profileAvatarWrap}>
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt={displayName} style={s.profileAvatarImg} />
              ) : (
                <div style={{ ...s.profileAvatarFallback, background: colors.gradient }}>{initials}</div>
              )}
            </div>
            <div style={s.profileMeta}>
              <h1 style={s.profileName}>{displayName}</h1>
              <div style={{ ...s.profileRoleBadge, background: roleColor + '18', color: roleColor }}>
                {profile.role || 'Member'}
              </div>
              <div style={s.profileStats}>
                <span style={s.profileStatItem} onClick={fetchFollowers}>
                  <strong>{followersCount}</strong>
                  <span style={s.profileStatLabel}>Followers</span>
                </span>
                <span style={s.profileStatItem} onClick={fetchFollowing}>
                  <strong>{followingCount}</strong>
                  <span style={s.profileStatLabel}>Following</span>
                </span>
                <span style={s.profileStatItem}>
                  <strong>{posts.length}</strong>
                  <span style={s.profileStatLabel}>Posts</span>
                </span>
              </div>
            </div>
            <div style={s.profileActions}>
              {!isOwnProfile && (
                <FollowButton userId={profile._id} isFollowingProp={isFollowing} onFollowChange={handleFollowChange} token={token} />
              )}
              <Link to={`/messages?user=${profile._id}`} style={{ ...s.msgBtn, background: colors.light, color: colors.text }}>
                <FaEnvelope size={15} style={{ marginRight: 6 }} /> Message
              </Link>
              {isOwnProfile && (
                <Link to="/profile/edit" style={{ ...s.editBtn, background: colors.gradient, border: 'none' }}>
                  <FaEdit size={15} style={{ marginRight: 6 }} /> Edit Profile
                </Link>
              )}
            </div>
          </div>
          <div style={s.tabsRow}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                style={{ ...s.tab, ...(activeTab === tab.id ? s.tabActive : {}) }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3-COLUMN BODY */}
      <div style={s.body}>
        {/* LEFT SIDEBAR */}
        <aside style={s.leftSidebar}>
          <div style={s.sideCard}>
            <div style={s.sideCardTitle}>Intro</div>
            {profile.bio && <p style={s.bioText}>{profile.bio}</p>}
            <div style={s.introList}>
              {profile.role && (
                <div style={s.introItem}>
                  <FaWork size={14} color={roleColor} />
                  <span>Works as <strong>{profile.role}</strong></span>
                </div>
              )}
              {profile.currentCountry && (
                <div style={s.introItem}>
                  <FaMapMarkerAlt size={14} color={colors.primary} />
                  <span>Lives in <strong>{profile.currentCountry}</strong></span>
                </div>
              )}
            </div>
          </div>
          {profile.skills?.length > 0 && (
            <div style={s.sideCard}>
              <div style={s.sideCardTitle}>Skills</div>
              <div style={s.skillsWrap}>
                {profile.skills.map(skill => (
                  <span key={skill} style={{ ...s.skillTag, background: colors.light, color: colors.primary, borderColor: colors.accent }}>{skill}</span>
                ))}
              </div>
            </div>
          )}
          <div style={s.sidebarFooter}><FaLeaf /> ¬© {new Date().getFullYear()} KaziLinda</div>
        </aside>

        {/* MAIN FEED */}
        <main style={s.feedCol}>
          {activeTab === 'posts' && (
            postsLoading ? (
              <div style={s.centerSpinner}><Spinner animation="border" style={{ color: KL_BRAND }} /></div>
            ) : posts.length === 0 ? (
              <div style={s.emptyCard}>
                <FaHeart size={52} color={KL_BRAND} />
                <h4 style={{ marginTop: 14 }}>No posts yet</h4>
              </div>
            ) : (
              posts.map(post => (
                <div key={post._id} style={s.postCard}>
                  <div style={s.postHeader}>
                    <div style={s.postAuthorRow}>
                      <ClickableAvatar userId={post.author?._id} src={post.author?.profilePicture} name={post.author?.name} size={42} />
                      <div style={{ marginLeft: 10 }}>
                        <Link to={`/profile/${post.author?._id}`} style={s.postAuthorName}>
                          {post.author?.name}
                        </Link>
                        <div style={s.postMeta}>
                          {moment(post.createdAt).fromNow()} ¬∑ <FaGlobe size={10} color="#65676b" />
                        </div>
                      </div>
                    </div>
                    <button style={s.moreBtn}><FaEllipsisH size={17} color="#65676b" /></button>
                  </div>
                  <div style={s.postContent}>{post.content}</div>
                  {post.media?.length > 0 && (
                    <div style={s.postMedia}>
                      {post.mediaType === 'video'
                        ? <video src={post.media[0]} controls style={s.postMediaEl} />
                        : <img src={post.media[0]} alt="post" style={s.postMediaEl} />}
                    </div>
                  )}
                  <div style={s.postStats}>
                    {post.likes?.length > 0 && <span><span style={s.reactionDot}>Ì±ç</span> {post.likes.length}</span>}
                    <span style={{ marginLeft: 'auto' }}>{post.comments?.length || 0} comments ¬∑ {post.shares?.length || 0} shares</span>
                  </div>
                  <div style={s.postActions}>
                    <button style={s.postActionBtn} onClick={() => handleLike(post._id)}><FaThumbsUp size={17} /> Like</button>
                    <button style={s.postActionBtn}><FaComment size={17} /> Comment</button>
                    <button style={s.postActionBtn}><FaShare size={17} /> Share</button>
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === 'about' && (
            <div style={s.postCard}>
              <div style={s.aboutSection}>
                <div style={s.aboutTitle}>About {displayName}</div>
                {profile.bio && <div style={s.aboutRow}><span style={s.aboutKey}>Bio</span><span style={s.aboutVal}>{profile.bio}</span></div>}
                {profile.role && <div style={s.aboutRow}><span style={s.aboutKey}>Role</span><span style={s.aboutVal}>{profile.role}</span></div>}
                {profile.currentCountry && <div style={s.aboutRow}><span style={s.aboutKey}>Current Country</span><span style={s.aboutVal}>{profile.currentCountry}</span></div>}
                {profile.skills?.length > 0 && (
                  <div style={s.aboutRow}>
                    <span style={s.aboutKey}>Skills</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1 }}>
                      {profile.skills.map(sk => <span key={sk} style={{ ...s.skillTag, background: colors.light, color: colors.primary }}>{sk}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'friends' && (
            <div style={s.postCard}>
              <div style={{ padding: '16px 20px', textAlign: 'center', color: '#65676b' }}>Friends list coming soon</div>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside style={s.rightSidebar}>
          <div style={s.sideCard}>
            <div style={s.sideCardTitle}>About {firstName}</div>
            <p style={{ fontSize: 14, color: '#65676b', lineHeight: 1.6 }}>{profile.bio || 'No bio yet.'}</p>
          </div>
          {followersCount > 0 && (
            <div style={s.sideCard}>
              <div style={s.sideCardTitle}>Followers <span style={s.sideCardCount}>{followersCount}</span></div>
              <button style={{ ...s.viewAllBtn, background: colors.light, color: colors.text }} onClick={fetchFollowers}>View all followers</button>
            </div>
          )}
        </aside>
      </div>

      {/* MODALS */}
      <Modal show={showFollowersModal} onHide={() => setShowFollowersModal(false)} centered>
        <Modal.Header closeButton style={{ ...s.modalHeader, borderBottomColor: colors.border }}>
          <Modal.Title style={{ fontWeight: 700, color: colors.text }}>Followers ({followersList.length})</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: 420, overflowY: 'auto' }}>
          {followersList.length === 0 ? <div style={s.modalEmpty}>No followers yet</div> :
            followersList.map(f => (
              <div key={f._id} style={s.modalUserRow}>
                <ClickableAvatar userId={f._id} src={f.profilePicture} name={f.name} size={42} />
                <Link to={`/profile/${f._id}`} style={{ ...s.modalUserName, color: colors.text }} onClick={() => setShowFollowersModal(false)}>{f.name}</Link>
              </div>
            ))
          }
        </Modal.Body>
      </Modal>

      <Modal show={showFollowingModal} onHide={() => setShowFollowingModal(false)} centered>
        <Modal.Header closeButton style={{ ...s.modalHeader, borderBottomColor: colors.border }}>
          <Modal.Title style={{ fontWeight: 700, color: colors.text }}>Following ({followingList.length})</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: 420, overflowY: 'auto' }}>
          {followingList.length === 0 ? <div style={s.modalEmpty}>Not following anyone yet</div> :
            followingList.map(f => (
              <div key={f._id} style={s.modalUserRow}>
                <ClickableAvatar userId={f._id} src={f.profilePicture} name={f.name} size={42} />
                <Link to={`/profile/${f._id}`} style={{ ...s.modalUserName, color: colors.text }} onClick={() => setShowFollowingModal(false)}>{f.name}</Link>
              </div>
            ))
          }
        </Modal.Body>
      </Modal>
    </div>
  );
};

const s = {
  page: { background: KL_BG, minHeight: '100vh', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif", color: '#050505' },
  fullCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: KL_BG },
  loadingLogo: { width: 60, height: 60, borderRadius: '50%', background: colors.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 24 },
  primaryBtn: { display: 'inline-block', marginTop: 20, background: colors.gradient, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 15, textDecoration: 'none', cursor: 'pointer' },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 300, boxShadow: '0 2px 4px rgba(0,0,0,.08)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  navCenter: { display: 'flex', gap: 2 },
  navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  navTabActive: { background: colors.light },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b', pointerEvents: 'none' },
  searchInput: { background: colors.light, border: 'none', borderRadius: 20, padding: '8px 16px 8px 34px', fontSize: 15, outline: 'none', width: 220, color: '#050505' },
  navTab: { width: 90, height: 48, background: 'transparent', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  iconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 },
  iconInner: { width: 40, height: 40, borderRadius: '50%', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: colors.danger, color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '1px 5px', minWidth: 18, textAlign: 'center' },
  coverWrap: { paddingTop: 56 },
  coverPhoto: { height: 350, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 16, background: colors.gradient },
  coverImage: { width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 },
  coverGradient: { width: '100%', height: '100%', background: colors.gradient },
  editCoverBtn: { display: 'flex', alignItems: 'center', background: '#fff', color: '#050505', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.2)', zIndex: 1 },
  profileBar: { background: '#fff', borderBottom: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,.08)' },
  profileBarInner: { maxWidth: 1100, margin: '0 auto', padding: '0 24px 16px', display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', position: 'relative' },
  profileAvatarWrap: { position: 'relative', marginTop: -60, flexShrink: 0 },
  profileAvatarImg: { width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,.2)' },
  profileAvatarFallback: { width: 120, height: 120, borderRadius: '50%', background: colors.gradient, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 40, boxShadow: '0 2px 8px rgba(0,0,0,.2)' },
  profileMeta: { flex: 1, paddingBottom: 4 },
  profileName: { fontSize: 30, fontWeight: 800, marginBottom: 4, color: colors.text },
  profileRoleBadge: { display: 'inline-block', borderRadius: 20, padding: '3px 12px', fontSize: 13, fontWeight: 700, marginBottom: 10, textTransform: 'capitalize' },
  profileStats: { display: 'flex', gap: 20 },
  profileStatItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: colors.text },
  profileStatLabel: { fontSize: 13, color: '#65676b', fontWeight: 400 },
  profileActions: { display: 'flex', gap: 10, alignItems: 'center', paddingBottom: 4 },
  msgBtn: { display: 'inline-flex', alignItems: 'center', background: colors.light, color: colors.text, border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 15, textDecoration: 'none', cursor: 'pointer' },
  editBtn: { display: 'inline-flex', alignItems: 'center', background: colors.gradient, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 15, textDecoration: 'none', cursor: 'pointer' },
  tabsRow: { maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 4, borderTop: `1px solid ${colors.border}` },
  tab: { padding: '14px 16px', border: 'none', background: 'transparent', fontSize: 15, fontWeight: 600, color: '#65676b', cursor: 'pointer', position: 'relative', borderRadius: '8px 8px 0 0' },
  tabActive: { color: colors.primary, borderBottom: `3px solid ${colors.primary}` },
  body: { display: 'flex', maxWidth: 1100, margin: '20px auto', padding: '0 16px', gap: 16 },
  leftSidebar: { width: 280, flexShrink: 0, position: 'sticky', top: 72, height: 'fit-content' },
  sideCard: { background: '#fff', borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,.15)', padding: '16px 16px', marginBottom: 16, border: `1px solid ${colors.border}` },
  sideCardTitle: { fontSize: 18, fontWeight: 700, color: colors.text, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sideCardCount: { fontSize: 14, color: '#65676b', fontWeight: 400 },
  bioText: { fontSize: 15, color: '#050505', lineHeight: 1.6, marginBottom: 12 },
  introList: { display: 'flex', flexDirection: 'column', gap: 10 },
  introItem: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#050505' },
  skillsWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  skillTag: { background: colors.light, color: colors.primary, border: `1px solid ${colors.accent}`, borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 600 },
  sidebarFooter: { fontSize: 12, color: '#65676b', textAlign: 'center', padding: '8px 0' },
  viewAllBtn: { width: '100%', background: colors.light, color: colors.text, border: 'none', borderRadius: 8, padding: '8px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 8 },
  feedCol: { flex: 1, minWidth: 0 },
  centerSpinner: { textAlign: 'center', padding: 48 },
  emptyCard: { background: '#fff', borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,.15)', textAlign: 'center', padding: '48px 24px' },
  postCard: { background: '#fff', borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,.15)', marginBottom: 16, overflow: 'hidden', border: `1px solid ${colors.border}` },
  postHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 0' },
  postAuthorRow: { display: 'flex', alignItems: 'center' },
  postAuthorName: { fontWeight: 700, fontSize: 15, color: colors.text, textDecoration: 'none', display: 'block' },
  postMeta: { fontSize: 13, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 },
  moreBtn: { width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  postContent: { padding: '10px 16px 12px', fontSize: 15, lineHeight: 1.5, color: '#050505' },
  postMedia: { background: '#1a1a1a', maxHeight: 500, overflow: 'hidden', display: 'flex', justifyContent: 'center' },
  postMediaEl: { width: '100%', maxHeight: 500, objectFit: 'contain' },
  postStats: { display: 'flex', alignItems: 'center', padding: '8px 16px', gap: 8 },
  reactionDot: { fontSize: 14 },
  postActions: { display: 'flex', padding: '4px 8px' },
  postActionBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#65676b', borderRadius: 4 },
  aboutSection: { padding: '16px 20px' },
  aboutTitle: { fontSize: 20, fontWeight: 700, marginBottom: 20, color: colors.text },
  aboutRow: { display: 'flex', gap: 16, padding: '12px 0', borderBottom: `1px solid ${colors.light}`, alignItems: 'flex-start' },
  aboutKey: { minWidth: 120, fontSize: 14, fontWeight: 700, color: '#65676b', flexShrink: 0 },
  aboutVal: { fontSize: 15, color: '#050505', flex: 1 },
  rightSidebar: { width: 280, flexShrink: 0, position: 'sticky', top: 72, height: 'fit-content' },
  modalHeader: { borderBottom: `1px solid ${colors.border}` },
  modalUserRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderBottom: `1px solid ${colors.light}` },
  modalUserName: { fontSize: 15, fontWeight: 600, color: colors.text, textDecoration: 'none' },
  modalEmpty: { textAlign: 'center', padding: '32px 16px', color: '#65676b', fontSize: 15 },
};

export default Profile;
