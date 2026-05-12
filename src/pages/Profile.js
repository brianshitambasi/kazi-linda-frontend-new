import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import FollowButton from '../components/Common/FollowButton';
import {
  FaMapMarkerAlt, FaEnvelope, FaEdit, FaCamera, FaThumbsUp, FaComment,
  FaShare, FaEllipsisH, FaHeart, FaBell, FaSearch, FaUsers,
  FaBriefcase, FaGlobe, FaUserCircle, FaHome, FaPhone, FaLanguage,
  FaCalendarAlt, FaFacebookMessenger, FaBriefcase as FaWork
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import moment from 'moment';

const KL_BRAND = '#f39c12';
const KL_LIGHT = '#fef9e7';
const KL_BG = '#f0f2f5';

const Profile = () => {
  const { userId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

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
      
      const res = await fetch(`https://kazi-linda.onrender.com/api/profile/public/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!res.ok) throw new Error('Profile not found');
      const data = await res.json();
      console.log('Profile data received:', data);
      
      setProfile(data);
      
      const followers = data.followers || [];
      const following = data.following || [];
      setFollowersCount(followers.length);
      setFollowingCount(following.length);
      
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
      const res = await fetch(`https://kazi-linda.onrender.com/api/social/user-posts/${id}`, {
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
  const roleColor = { worker: '#31a24c', employer: '#1877f2', recruiter: '#7c3aed', embassy: '#e41e3f' }[profile.role] || KL_BRAND;

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
          <Link to="/" style={s.logoBox}><span style={s.logoText}>KL</span></Link>
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
            <Link key={t.to} to={t.to} style={s.navTab} title={t.label}>
              <t.icon size={22} color="#65676b" />
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
            <div style={s.coverGradient} />
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
                <div style={s.profileAvatarFallback}>{initials}</div>
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
              <Link to={`/messages?user=${profile._id}`} style={s.msgBtn}>
                <FaEnvelope size={15} style={{ marginRight: 6 }} /> Message
              </Link>
              {isOwnProfile && (
                <Link to="/profile/edit" style={s.editBtn}>
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
                  <FaMapMarkerAlt size={14} color="#65676b" />
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
                  <span key={skill} style={s.skillTag}>{skill}</span>
                ))}
              </div>
            </div>
          )}
          <div style={s.sidebarFooter}>¬© {new Date().getFullYear()} KaziLinda</div>
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
                      {profile.skills.map(sk => <span key={sk} style={s.skillTag}>{sk}</span>)}
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
              <button style={s.viewAllBtn} onClick={fetchFollowers}>View all followers</button>
            </div>
          )}
        </aside>
      </div>

      {/* MODALS */}
      <Modal show={showFollowersModal} onHide={() => setShowFollowersModal(false)} centered>
        <Modal.Header closeButton style={s.modalHeader}>
          <Modal.Title style={{ fontWeight: 700 }}>Followers ({followersList.length})</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: 420, overflowY: 'auto' }}>
          {followersList.length === 0 ? <div style={s.modalEmpty}>No followers yet</div> :
            followersList.map(f => (
              <div key={f._id} style={s.modalUserRow}>
                <ClickableAvatar userId={f._id} src={f.profilePicture} name={f.name} size={42} />
                <Link to={`/profile/${f._id}`} style={s.modalUserName} onClick={() => setShowFollowersModal(false)}>{f.name}</Link>
              </div>
            ))
          }
        </Modal.Body>
      </Modal>

      <Modal show={showFollowingModal} onHide={() => setShowFollowingModal(false)} centered>
        <Modal.Header closeButton style={s.modalHeader}>
          <Modal.Title style={{ fontWeight: 700 }}>Following ({followingList.length})</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: 420, overflowY: 'auto' }}>
          {followingList.length === 0 ? <div style={s.modalEmpty}>Not following anyone yet</div> :
            followingList.map(f => (
              <div key={f._id} style={s.modalUserRow}>
                <ClickableAvatar userId={f._id} src={f.profilePicture} name={f.name} size={42} />
                <Link to={`/profile/${f._id}`} style={s.modalUserName} onClick={() => setShowFollowingModal(false)}>{f.name}</Link>
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
  loadingLogo: { width: 60, height: 60, borderRadius: '50%', background: KL_BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 24 },
  primaryBtn: { display: 'inline-block', marginTop: 20, background: KL_BRAND, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 15, textDecoration: 'none', cursor: 'pointer' },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: '1px solid #dddfe2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 300, boxShadow: '0 2px 4px rgba(0,0,0,.08)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  navCenter: { display: 'flex', gap: 2 },
  navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  logoBox: { width: 40, height: 40, borderRadius: '50%', background: KL_BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  logoText: { color: '#fff', fontWeight: 900, fontSize: 17, fontStyle: 'italic' },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b', pointerEvents: 'none' },
  searchInput: { background: '#f0f2f5', border: 'none', borderRadius: 20, padding: '8px 16px 8px 34px', fontSize: 15, outline: 'none', width: 220, color: '#050505' },
  navTab: { width: 90, height: 48, background: 'transparent', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  iconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 },
  iconInner: { width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: '#e41e3f', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '1px 5px', minWidth: 18, textAlign: 'center' },
  coverWrap: { paddingTop: 56 },
  coverPhoto: { height: 350, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 16, background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)' },
  coverImage: { width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 },
  coverGradient: { width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' },
  editCoverBtn: { display: 'flex', alignItems: 'center', background: '#fff', color: '#050505', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.2)', zIndex: 1 },
  profileBar: { background: '#fff', borderBottom: '1px solid #dddfe2', boxShadow: '0 2px 4px rgba(0,0,0,.08)' },
  profileBarInner: { maxWidth: 1100, margin: '0 auto', padding: '0 24px 16px', display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', position: 'relative' },
  profileAvatarWrap: { position: 'relative', marginTop: -60, flexShrink: 0 },
  profileAvatarImg: { width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,.2)' },
  profileAvatarFallback: { width: 120, height: 120, borderRadius: '50%', background: KL_BRAND, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 40, boxShadow: '0 2px 8px rgba(0,0,0,.2)' },
  profileMeta: { flex: 1, paddingBottom: 4 },
  profileName: { fontSize: 30, fontWeight: 800, marginBottom: 4, color: '#050505' },
  profileRoleBadge: { display: 'inline-block', borderRadius: 20, padding: '3px 12px', fontSize: 13, fontWeight: 700, marginBottom: 10, textTransform: 'capitalize' },
  profileStats: { display: 'flex', gap: 20 },
  profileStatItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', fontSize: 15, fontWeight: 700 },
  profileStatLabel: { fontSize: 13, color: '#65676b', fontWeight: 400 },
  profileActions: { display: 'flex', gap: 10, alignItems: 'center', paddingBottom: 4 },
  msgBtn: { display: 'inline-flex', alignItems: 'center', background: '#e4e6eb', color: '#050505', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 15, textDecoration: 'none', cursor: 'pointer' },
  editBtn: { display: 'inline-flex', alignItems: 'center', background: KL_BRAND, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 15, textDecoration: 'none', cursor: 'pointer' },
  tabsRow: { maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 4, borderTop: '1px solid #dddfe2' },
  tab: { padding: '14px 16px', border: 'none', background: 'transparent', fontSize: 15, fontWeight: 600, color: '#65676b', cursor: 'pointer', position: 'relative', borderRadius: '8px 8px 0 0' },
  tabActive: { color: KL_BRAND, borderBottom: `3px solid ${KL_BRAND}` },
  body: { display: 'flex', maxWidth: 1100, margin: '20px auto', padding: '0 16px', gap: 16 },
  leftSidebar: { width: 280, flexShrink: 0, position: 'sticky', top: 72, height: 'fit-content' },
  sideCard: { background: '#fff', borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,.15)', padding: '16px 16px', marginBottom: 16 },
  sideCardTitle: { fontSize: 18, fontWeight: 700, color: '#050505', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sideCardCount: { fontSize: 14, color: '#65676b', fontWeight: 400 },
  bioText: { fontSize: 15, color: '#050505', lineHeight: 1.6, marginBottom: 12 },
  introList: { display: 'flex', flexDirection: 'column', gap: 10 },
  introItem: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#050505' },
  skillsWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  skillTag: { background: KL_LIGHT, color: '#d68910', border: '1px solid #f7c96633', borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 600 },
  sidebarFooter: { fontSize: 12, color: '#65676b', textAlign: 'center', padding: '8px 0' },
  viewAllBtn: { width: '100%', background: '#e4e6eb', color: '#050505', border: 'none', borderRadius: 8, padding: '8px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 8 },
  feedCol: { flex: 1, minWidth: 0 },
  centerSpinner: { textAlign: 'center', padding: 48 },
  emptyCard: { background: '#fff', borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,.15)', textAlign: 'center', padding: '48px 24px' },
  postCard: { background: '#fff', borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,.15)', marginBottom: 16, overflow: 'hidden' },
  postHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 0' },
  postAuthorRow: { display: 'flex', alignItems: 'center' },
  postAuthorName: { fontWeight: 700, fontSize: 15, color: '#050505', textDecoration: 'none', display: 'block' },
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
  aboutTitle: { fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#050505' },
  aboutRow: { display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid #f0f2f5', alignItems: 'flex-start' },
  aboutKey: { minWidth: 120, fontSize: 14, fontWeight: 700, color: '#65676b', flexShrink: 0 },
  aboutVal: { fontSize: 15, color: '#050505', flex: 1 },
  rightSidebar: { width: 280, flexShrink: 0, position: 'sticky', top: 72, height: 'fit-content' },
  modalHeader: { borderBottom: '1px solid #dddfe2' },
  modalUserRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderBottom: '1px solid #f0f2f5' },
  modalUserName: { fontSize: 15, fontWeight: 600, color: '#050505', textDecoration: 'none' },
  modalEmpty: { textAlign: 'center', padding: '32px 16px', color: '#65676b', fontSize: 15 },
};

export default Profile;
