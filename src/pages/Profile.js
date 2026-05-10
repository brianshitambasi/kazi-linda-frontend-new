import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Badge, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import FollowButton from '../components/Common/FollowButton';
import { 
  FaUserCircle, FaMapMarkerAlt, FaEnvelope, FaEdit, FaCamera, 
  FaThumbsUp, FaComment, FaShare, FaEllipsisH, FaHeart, FaHome,
  FaBell, FaFacebookMessenger, FaSearch, FaUsers, FaBriefcase,
  FaUserFriends, FaBookmark, FaClock, FaGlobe, FaCalendarAlt,
  FaImage, FaSmile, FaPaperPlane
} from 'react-icons/fa';
import { profileAPI } from '../services/api';
import toast from 'react-hot-toast';
import moment from 'moment';

const KL_BRAND = '#f39c12';
const KL_BRAND_DARK = '#d68910';  // ← ADD THIS - fixes the error!
const KL_BRAND_LIGHT = '#fef9e7';

const Profile = () => {
  const { userId } = useParams();
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [activeNav, setActiveNav] = useState('profile');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');

  const fileInputRef = React.useRef(null);

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'profile', icon: FaUserCircle, label: 'Profile', link: `/profile/${user?._id}` },
    { id: 'friends', icon: FaUsers, label: 'Friends', link: '/friends' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
  ];

  const fetchProfile = useCallback(async () => {
    try {
      const id = userId || user?._id;
      const res = await profileAPI.getPublicProfile(id);
      setProfile(res.data);
      setFollowersCount(res.data.followers?.length || 0);
      setFollowingCount(res.data.following?.length || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId, user]);

  const fetchUserPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const id = userId || user?._id;
      const res = await fetch(`https://kazi-linda.onrender.com/api/social/user-posts/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [userId, user, token]);

  const fetchFollowers = async () => {
    try {
      const id = userId || user?._id;
      const res = await fetch(`https://kazi-linda.onrender.com/api/social/followers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setFollowersList(data);
      setShowFollowersModal(true);
    } catch (err) {
      toast.error('Failed to load followers');
    }
  };

  const fetchFollowing = async () => {
    try {
      const id = userId || user?._id;
      const res = await fetch(`https://kazi-linda.onrender.com/api/social/following/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setFollowingList(data);
      setShowFollowingModal(true);
    } catch (err) {
      toast.error('Failed to load following');
    }
  };

  const updateFollowStatus = useCallback(async () => {
    if (!userId || userId === user?._id) return;
    try {
      const res = await fetch(`https://kazi-linda.onrender.com/api/social/following/check/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setIsFollowing(data.following);
      await fetchProfile();
    } catch (err) {
      console.error(err);
    }
  }, [userId, user, token, fetchProfile]);

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
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUserPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      toast.error('Please write something');
      return;
    }
    setPosting(true);
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/posts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost }),
      });
      if (res.ok) {
        toast.success('Post shared!');
        setNewPost('');
        setShowPostModal(false);
        fetchUserPosts();
      }
    } catch (err) {
      toast.error('Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await fetch(`https://kazi-linda.onrender.com/api/social/posts/${selectedPost._id}/comment`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText }),
      });
      setCommentText('');
      setShowCommentModal(false);
      fetchUserPosts();
      toast.success('Comment added!');
    } catch {
      toast.error('Failed to add comment');
    }
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

  const leftLinks = [
    { icon: FaUserFriends, label: 'Friends', count: followersCount, color: KL_BRAND },
    { icon: FaBookmark, label: 'Saved Posts', color: '#7c3aed' },
    { icon: FaClock, label: 'Memories', color: KL_BRAND },
    { icon: FaCalendarAlt, label: 'Events', color: '#e41e3f' },
  ];

  const isOwnProfile = !userId || userId === user?._id;

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingLogo}>KL</div>
        <Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={styles.page}>
        <div style={styles.emptyState}>
          <FaUserCircle size={64} color={KL_BRAND} />
          <h3>User not found</h3>
          <Button as={Link} to="/" style={styles.primaryBtn}>Go Home</Button>
        </div>
      </div>
    );
  }

  const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);

  return (
    <div style={styles.page}>
      {/* Navigation - same as other pages */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link to="/" style={styles.logoBox}>
            <span style={styles.logoText}>KL</span>
          </Link>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input style={styles.searchInput} placeholder="Search KaziLinda..." />
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
          <ClickableAvatar userId={user?._id} src={user?.profilePicture} name={user?.name} size={40} />
        </div>
      </nav>

      <div style={styles.body}>
        {/* Left Sidebar */}
        <aside style={styles.leftSidebar}>
          <Link to={`/profile/${user?._id}`} style={styles.sidebarProfileLink}>
            <ClickableAvatar userId={user?._id} src={user?.profilePicture} name={user?.name} size={36} />
            <span style={styles.sidebarLinkText}>{user?.name || 'User'}</span>
          </Link>

          {leftLinks.map(({ icon: Icon, label, count, color }) => (
            <button key={label} style={styles.sidebarNavItem}>
              <span style={{ ...styles.sidebarIconWrap, background: color + '22' }}>
                <Icon size={18} color={color} />
              </span>
              <span style={styles.sidebarLinkText}>{label}</span>
              {count !== undefined && count > 0 && (
                <span style={styles.sidebarCount}>{count}</span>
              )}
            </button>
          ))}

          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarSectionTitle}>Intro</div>
          {profile.bio && <div style={styles.bioText}>{profile.bio}</div>}
          {profile.currentCountry && (
            <div style={styles.infoItem}>
              <FaMapMarkerAlt size={14} color="#65676b" />
              <span>Lives in {profile.currentCountry}</span>
            </div>
          )}
          {profile.work && (
            <div style={styles.infoItem}>
              <FaBriefcase size={14} color="#65676b" />
              <span>Works at {profile.work}</span>
            </div>
          )}

          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>
            Privacy · Terms · Safety<br />
            © {new Date().getFullYear()} KaziLinda
          </div>
        </aside>

        {/* Main Feed */}
        <main style={styles.feedCol}>
          {/* Cover Photo */}
          <div style={styles.coverSection}>
            {profile.coverPhoto ? (
              <img src={profile.coverPhoto} alt="Cover" style={styles.coverImage} />
            ) : (
              <div style={styles.coverPlaceholder}>
                <div style={styles.coverGradient}></div>
              </div>
            )}
            {isOwnProfile && (
              <>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleCoverUpload} 
                  disabled={uploadingCover} 
                />
                <button 
                  style={styles.editCoverBtn} 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={uploadingCover}
                >
                  <FaCamera /> {uploadingCover ? 'Uploading...' : 'Edit Cover'}
                </button>
              </>
            )}
          </div>

          {/* Profile Info Card */}
          <div style={styles.profileInfoCard}>
            <div style={styles.avatarSection}>
              <ClickableAvatar 
                userId={profile._id} 
                src={profile.profilePicture} 
                size={120} 
                style={styles.profileAvatar}
              />
              {isOwnProfile && (
                <Button as={Link} to="/profile/edit" size="sm" style={styles.editProfileBtn}>
                  <FaEdit /> Edit Profile
                </Button>
              )}
            </div>
            <div style={styles.profileDetails}>
              <h2 style={styles.profileName}>{profile.name}</h2>
              <div style={styles.profileBadges}>
                <Badge bg="secondary" style={styles.roleBadge}>{profile.role}</Badge>
                {profile.currentCountry && (
                  <span style={styles.location}><FaMapMarkerAlt /> {profile.currentCountry}</span>
                )}
              </div>
              <div style={styles.profileStats}>
                <span onClick={fetchFollowers} style={styles.statLink}>
                  <strong>{followersCount}</strong> Followers
                </span>
                <span onClick={fetchFollowing} style={styles.statLink}>
                  <strong>{followingCount}</strong> Following
                </span>
                <span><strong>{posts.length}</strong> Posts</span>
              </div>
            </div>
            <div style={styles.profileActions}>
              {!isOwnProfile && (
                <FollowButton 
                  userId={profile._id} 
                  isFollowingProp={isFollowing} 
                  onFollowChange={handleFollowChange} 
                  token={token} 
                />
              )}
              <Button as={Link} to={`/messages?user=${profile._id}`} style={styles.messageBtn}>
                <FaEnvelope /> Message
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{followersCount}</div>
              <div style={styles.statLabel}>Followers</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{followingCount}</div>
              <div style={styles.statLabel}>Following</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{posts.length}</div>
              <div style={styles.statLabel}>Posts</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{totalLikes}</div>
              <div style={styles.statLabel}>Likes</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{totalComments}</div>
              <div style={styles.statLabel}>Comments</div>
            </div>
          </div>

          {/* Create Post Button */}
          {isOwnProfile && (
            <button style={styles.createPostBtn} onClick={() => setShowPostModal(true)}>
              <FaEdit /> Create Post
            </button>
          )}

          {/* Tabs */}
          <div style={styles.tabsContainer}>
            <button 
              style={{ ...styles.tab, ...(activeTab === 'posts' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('posts')}
            >
              Posts ({posts.length})
            </button>
            <button 
              style={{ ...styles.tab, ...(activeTab === 'photos' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('photos')}
            >
              Photos
            </button>
            <button 
              style={{ ...styles.tab, ...(activeTab === 'about' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
          </div>

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            postsLoading ? (
              <div style={styles.loadingSpinner}>
                <Spinner animation="border" style={{ color: KL_BRAND }} />
              </div>
            ) : posts.length === 0 ? (
              <div style={styles.emptyFeed}>
                <FaHeart size={48} color={KL_BRAND} />
                <h4>No posts yet</h4>
                <p>When {isOwnProfile ? 'you' : profile.name} posts, they'll appear here</p>
                {isOwnProfile && (
                  <button style={styles.createPostBtnSmall} onClick={() => setShowPostModal(true)}>
                    Create Your First Post
                  </button>
                )}
              </div>
            ) : (
              posts.map(post => (
                <div key={post._id} style={styles.postCard}>
                  <div style={styles.postHeader}>
                    <div style={styles.postAuthor}>
                      <ClickableAvatar userId={post.author?._id} src={post.author?.profilePicture} size={40} />
                      <div>
                        <strong style={styles.postAuthorName}>{post.author?.name || profile.name}</strong>
                        <div style={styles.postMeta}>
                          {moment(post.createdAt).fromNow()} · <FaGlobe size={10} color="#65676b" />
                        </div>
                      </div>
                    </div>
                    <button style={styles.moreBtn}>
                      <FaEllipsisH size={18} color="#65676b" />
                    </button>
                  </div>
                  <p style={styles.postContent}>{post.content}</p>
                  {post.media && post.media.length > 0 && (
                    <div style={styles.postMedia}>
                      {post.mediaType === 'video' ? (
                        <video src={post.media[0]} controls style={styles.postMediaEl} />
                      ) : (
                        <img src={post.media[0]} alt="Post" style={styles.postMediaEl} />
                      )}
                    </div>
                  )}
                  <div style={styles.postStats}>
                    <div style={styles.statsLeft}>
                      {post.likes?.length > 0 && (
                        <>
                          <div style={styles.reactionCircle}>👍</div>
                          <span style={styles.statsCount}>{post.likes.length}</span>
                        </>
                      )}
                    </div>
                    <div style={styles.statsRight}>
                      <span 
                        style={styles.statsLink}
                        onClick={() => { setSelectedPost(post); setShowCommentModal(true); }}
                      >
                        {post.comments?.length || 0} comments
                      </span>
                    </div>
                  </div>
                  <div style={styles.postActions}>
                    <button 
                      style={{ ...styles.postActionBtn, color: post.likes?.includes(user?._id) ? KL_BRAND : '#65676b' }}
                      onClick={() => handleLike(post._id)}
                    >
                      <FaThumbsUp size={18} /> Like
                    </button>
                    <button 
                      style={styles.postActionBtn}
                      onClick={() => { setSelectedPost(post); setShowCommentModal(true); }}
                    >
                      <FaComment size={18} /> Comment
                    </button>
                    <button style={styles.postActionBtn}>
                      <FaShare size={18} /> Share
                    </button>
                  </div>
                </div>
              ))
            )
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div style={styles.aboutCard}>
              <h4>About {profile.name}</h4>
              {profile.bio && (
                <div style={styles.aboutSection}>
                  <strong>Bio</strong>
                  <p>{profile.bio}</p>
                </div>
              )}
              {profile.work && (
                <div style={styles.aboutSection}>
                  <strong>Work</strong>
                  <p><FaBriefcase /> {profile.work}</p>
                </div>
              )}
              {profile.currentCountry && (
                <div style={styles.aboutSection}>
                  <strong>Location</strong>
                  <p><FaMapMarkerAlt /> {profile.currentCountry}</p>
                </div>
              )}
              {profile.phone && (
                <div style={styles.aboutSection}>
                  <strong>Contact</strong>
                  <p>📞 {profile.phone}</p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}>
              <FaUserFriends color={KL_BRAND} />
              <span>People You May Know</span>
            </div>
            <div style={styles.suggestionItem}>
              <ClickableAvatar userId="suggestion" size={36} />
              <div>
                <div style={styles.suggestionName}>Suggested User</div>
                <button style={styles.followSuggestionBtn}>Follow</button>
              </div>
            </div>
          </div>

          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}>
              <FaCalendarAlt color="#e41e3f" />
              <span>Birthdays</span>
            </div>
            <div style={styles.birthdayItem}>
              <FaHeart color={KL_BRAND} />
              <span>No birthdays today</span>
            </div>
          </div>

          <div style={styles.adCard}>
            <div style={styles.adContent}>
              <FaBriefcase size={32} color={KL_BRAND} />
              <h4>Find Your Dream Job</h4>
              <p>Browse verified jobs on KaziLinda</p>
              <Button as={Link} to="/jobs" style={styles.adBtn}>View Jobs</Button>
            </div>
          </div>

          <div style={styles.sidebarFooter}>
            © {new Date().getFullYear()} KaziLinda
          </div>
        </aside>
      </div>

      {/* Modals - Create Post, Comment, Followers, Following */}
      <Modal show={showPostModal} onHide={() => setShowPostModal(false)} centered size="lg">
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={styles.modalTitle}>Create Post</Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          <div style={styles.modalPostHeader}>
            <ClickableAvatar userId={user?._id} src={user?.profilePicture} name={user?.name} size={40} />
            <div>
              <strong>{user?.name}</strong>
              <Badge bg="secondary" style={styles.publicBadge}><FaGlobe /> Public</Badge>
            </div>
          </div>
          <textarea
            rows={4}
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            style={styles.postTextarea}
          />
          <div style={styles.modalPostActions}>
            <button style={styles.mediaBtn}><FaImage /> Photo/Video</button>
            <button style={styles.mediaBtn}><FaSmile /> Feeling</button>
          </div>
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <button 
            style={styles.sharePostBtn} 
            onClick={handleCreatePost} 
            disabled={posting || !newPost.trim()}
          >
            {posting ? <Spinner animation="border" size="sm" /> : 'Post'}
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)} centered size="lg">
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title>Comments</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 0 }}>
          <div style={styles.commentPostPreview}>
            <p style={{ margin: 0 }}>{selectedPost?.content}</p>
          </div>
          <div style={styles.commentsList}>
            {selectedPost?.comments?.map(comment => (
              <div key={comment._id} style={styles.commentItem}>
                <ClickableAvatar userId={comment.user?._id} src={comment.user?.profilePicture} size={32} />
                <div style={styles.commentBubble}>
                  <strong>{comment.user?.name}</strong>
                  <p>{comment.text}</p>
                  <small>{moment(comment.createdAt).fromNow()}</small>
                </div>
              </div>
            ))}
            {!selectedPost?.comments?.length && (
              <div style={styles.noComments}>No comments yet. Be the first!</div>
            )}
          </div>
          <div style={styles.commentInputWrapper}>
            <ClickableAvatar userId={user?._id} src={user?.profilePicture} name={user?.name} size={32} />
            <input 
              type="text" 
              placeholder="Write a comment..." 
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddComment()}
              style={styles.commentInput}
            />
            <button onClick={handleAddComment} style={styles.sendCommentBtn}>
              <FaPaperPlane />
            </button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={showFollowersModal} onHide={() => setShowFollowersModal(false)} centered>
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title>Followers ({followersList.length})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {followersList.map(f => (
            <div key={f._id} style={styles.modalUserItem}>
              <ClickableAvatar userId={f._id} src={f.profilePicture} size={40} />
              <Link to={`/profile/${f._id}`} style={styles.modalUserName}>{f.name}</Link>
            </div>
          ))}
          {followersList.length === 0 && <div style={styles.noResults}>No followers yet</div>}
        </Modal.Body>
      </Modal>

      <Modal show={showFollowingModal} onHide={() => setShowFollowingModal(false)} centered>
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title>Following ({followingList.length})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {followingList.map(f => (
            <div key={f._id} style={styles.modalUserItem}>
              <ClickableAvatar userId={f._id} src={f.profilePicture} size={40} />
              <Link to={`/profile/${f._id}`} style={styles.modalUserName}>{f.name}</Link>
            </div>
          ))}
          {followingList.length === 0 && <div style={styles.noResults}>Not following anyone yet</div>}
        </Modal.Body>
      </Modal>
    </div>
  );
};

const styles = {
  page: {
    background: '#f0f2f5',
    minHeight: '100vh',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
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
    borderRadius: 6, fontWeight: 600, marginTop: 16,
  },
  emptyState: {
    textAlign: 'center', padding: '100px 20px',
    background: '#fff', minHeight: '100vh',
  },
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
  body: {
    display: 'flex', paddingTop: 56,
    maxWidth: 1440, margin: '0 auto',
  },
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
    padding: '10px 8px', borderRadius: 8,
    border: 'none', background: 'transparent',
    cursor: 'pointer', width: '100%', textAlign: 'left',
    fontWeight: 500, fontSize: 14, color: '#050505',
  },
  sidebarIconWrap: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  sidebarLinkText: { fontSize: 14, fontWeight: 500, color: '#050505', flex: 1 },
  sidebarCount: {
    fontSize: 12, fontWeight: 600, padding: '2px 8px',
    borderRadius: 12, background: KL_BRAND_LIGHT, color: KL_BRAND,
  },
  sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' },
  sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px', marginBottom: 4 },
  bioText: { fontSize: 14, color: '#65676b', padding: '8px 8px', lineHeight: 1.4 },
  infoItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', fontSize: 14, color: '#65676b' },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, lineHeight: 1.6, textAlign: 'center' },
  feedCol: {
    flex: 1, maxWidth: 680, margin: '0 16px', padding: '16px 0',
    minWidth: 0,
  },
  coverSection: {
    position: 'relative', height: 280, borderRadius: '12px 12px 0 0',
    overflow: 'hidden', background: `linear-gradient(135deg, ${KL_BRAND} 0%, ${KL_BRAND_DARK} 100%)`,
  },
  coverImage: { width: '100%', height: '100%', objectFit: 'cover' },
  coverPlaceholder: { 
    height: '100%', 
    background: `linear-gradient(135deg, ${KL_BRAND} 0%, ${KL_BRAND_DARK} 100%)` 
  },
  coverGradient: { height: '100%' },
  editCoverBtn: {
    position: 'absolute', bottom: 16, right: 16,
    background: '#fff', border: 'none', borderRadius: 8,
    padding: '8px 16px', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
  },
  profileInfoCard: {
    background: '#fff', borderRadius: '0 0 12px 12px',
    padding: '0 20px 20px', marginBottom: 16,
    position: 'relative', boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  avatarSection: { position: 'relative', marginTop: -60, marginBottom: 12 },
  profileAvatar: { border: '4px solid #fff', borderRadius: '50%' },
  editProfileBtn: {
    position: 'absolute', bottom: 0, right: 0,
    background: '#e4e6eb', border: 'none', borderRadius: 20,
    fontSize: 12, padding: '4px 12px',
  },
  profileDetails: { marginBottom: 16 },
  profileName: { fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#050505' },
  profileBadges: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' },
  roleBadge: { background: '#e4e6eb', color: '#050505', padding: '6px 12px', borderRadius: 20, fontSize: 13 },
  location: { fontSize: 14, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 },
  profileStats: { display: 'flex', gap: 24 },
  statLink: { fontSize: 14, color: '#65676b', cursor: 'pointer' },
  profileActions: { display: 'flex', gap: 12, marginTop: 8 },
  messageBtn: {
    background: '#e4e6eb', border: 'none', borderRadius: 8,
    padding: '8px 16px', fontSize: 14, fontWeight: 500,
    color: '#050505',
  },
  statsRow: {
    display: 'flex', gap: 16, justifyContent: 'space-between',
    background: '#fff', borderRadius: 12, padding: '16px 20px',
    marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  statCard: { textAlign: 'center', flex: 1 },
  statNumber: { fontSize: 20, fontWeight: 700, color: KL_BRAND, marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#65676b' },
  createPostBtn: {
    width: '100%', padding: '12px', background: KL_BRAND,
    color: '#fff', border: 'none', borderRadius: 10,
    fontWeight: 600, fontSize: 15, marginBottom: 16,
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  createPostBtnSmall: {
    background: KL_BRAND, border: 'none', borderRadius: 8,
    padding: '8px 20px', color: '#fff', fontWeight: 500,
    marginTop: 12, cursor: 'pointer',
  },
  tabsContainer: {
    display: 'flex', gap: 8, background: '#fff', borderRadius: 12,
    padding: '0 16px', marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  tab: {
    padding: '14px 0', border: 'none', background: 'transparent',
    fontSize: 15, fontWeight: 600, color: '#65676b',
    cursor: 'pointer', position: 'relative',
  },
  tabActive: { color: KL_BRAND, borderBottom: `3px solid ${KL_BRAND}` },
  postCard: {
    background: '#fff', borderRadius: 12, marginBottom: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,.2)', overflow: 'hidden',
  },
  postHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px',
  },
  postAuthor: { display: 'flex', alignItems: 'center', gap: 10 },
  postAuthorName: { fontSize: 14, color: '#050505' },
  postMeta: { fontSize: 12, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 },
  moreBtn: {
    width: 32, height: 32, borderRadius: '50%', border: 'none',
    background: 'transparent', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  postContent: { padding: '0 16px 12px', fontSize: 14, lineHeight: 1.5, color: '#050505' },
  postMedia: { maxHeight: 400, overflow: 'hidden', background: '#1a1a1a' },
  postMediaEl: { width: '100%', maxHeight: 400, objectFit: 'contain' },
  postStats: {
    display: 'flex', justifyContent: 'space-between', padding: '8px 16px',
    borderBottom: '1px solid #dddfe2',
  },
  statsLeft: { display: 'flex', alignItems: 'center', gap: 4 },
  statsCount: { fontSize: 13, color: '#65676b' },
  statsRight: { display: 'flex', gap: 12 },
  statsLink: { fontSize: 13, color: '#65676b', cursor: 'pointer' },
  reactionCircle: {
    width: 18, height: 18, borderRadius: '50%', background: KL_BRAND,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, color: '#fff',
  },
  postActions: {
    display: 'flex', padding: '4px 8px',
  },
  postActionBtn: {
    flex: 1, padding: '8px 0', border: 'none', background: 'transparent',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, color: '#65676b',
  },
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
    fontSize: 15, fontWeight: 600, marginBottom: 12,
    paddingBottom: 8, borderBottom: '1px solid #dddfe2',
  },
  suggestionItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' },
  suggestionName: { fontSize: 13, fontWeight: 500, marginBottom: 4 },
  followSuggestionBtn: {
    background: KL_BRAND, border: 'none', borderRadius: 4,
    padding: '2px 12px', fontSize: 11, color: '#fff', cursor: 'pointer',
  },
  birthdayItem: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 },
  adCard: {
    background: `linear-gradient(135deg, ${KL_BRAND_LIGHT} 0%, #fff 100%)`,
    borderRadius: 12, padding: '20px', textAlign: 'center',
    marginBottom: 16,
  },
  adBtn: { background: KL_BRAND, border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 13 },
  aboutCard: {
    background: '#fff', borderRadius: 12, padding: '20px',
    boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  aboutSection: { marginBottom: 20 },
  modalHeader: { borderBottom: '1px solid #dddfe2', background: '#fff' },
  modalTitle: { fontSize: 18, fontWeight: 600 },
  modalBody: { padding: '20px' },
  modalFooter: { borderTop: '1px solid #dddfe2', padding: '16px 20px' },
  modalPostHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  publicBadge: { background: '#e4e6eb', color: '#050505', fontSize: 11, marginLeft: 8 },
  postTextarea: {
    width: '100%', border: 'none', outline: 'none',
    fontSize: 16, resize: 'none', fontFamily: 'inherit',
  },
  modalPostActions: { display: 'flex', gap: 12, marginTop: 16, borderTop: '1px solid #dddfe2', paddingTop: 16 },
  mediaBtn: {
    background: '#f0f2f5', border: 'none', borderRadius: 8,
    padding: '8px 12px', fontSize: 13, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  sharePostBtn: {
    background: KL_BRAND, border: 'none', borderRadius: 6,
    padding: '8px 24px', color: '#fff', fontWeight: 600, width: '100%',
  },
  commentPostPreview: { padding: '16px', borderBottom: '1px solid #dddfe2', background: '#fafafa' },
  commentsList: { padding: '16px', maxHeight: 300, overflowY: 'auto' },
  commentItem: { display: 'flex', gap: 10, marginBottom: 16 },
  commentBubble: { background: '#f0f2f5', borderRadius: 18, padding: '8px 12px', flex: 1 },
  commentInputWrapper: { display: 'flex', gap: 10, padding: '16px', borderTop: '1px solid #dddfe2' },
  commentInput: { flex: 1, border: 'none', background: '#f0f2f5', borderRadius: 20, padding: '8px 16px', outline: 'none' },
  sendCommentBtn: {
    background: KL_BRAND, border: 'none', borderRadius: '50%',
    width: 36, height: 36, display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#fff',
  },
  modalUserItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' },
  modalUserName: { fontSize: 14, fontWeight: 500, color: '#050505', textDecoration: 'none' },
  noComments: { textAlign: 'center', padding: '20px', color: '#65676b' },
  noResults: { textAlign: 'center', padding: '20px', color: '#65676b' },
  emptyFeed: {
    textAlign: 'center', padding: '60px 20px',
    background: '#fff', borderRadius: 12,
    color: '#65676b',
  },
  loadingSpinner: { textAlign: 'center', padding: '40px' },
};

export default Profile;