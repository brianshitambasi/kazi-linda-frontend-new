import React, { useState, useEffect, useCallback } from 'react';
import { Spinner, Modal, Form, InputGroup, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import FollowButton from '../components/Common/FollowButton';
import StoriesBar from '../components/Stories/StoriesBar';
import {
  FaHeart, FaComment, FaShare, FaSmile, FaImage,
  FaEllipsisH, FaGlobe, FaPaperPlane, FaThumbsUp, FaLaughBeam,
  FaSadTear, FaAngry, FaRegSmile, FaVideo, FaHome, FaStore,
  FaUsers, FaPlayCircle, FaBell, FaFacebookMessenger, FaSearch,
  FaChevronDown, FaUserFriends, FaBookmark, FaCalendarAlt, FaClock
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import moment from 'moment';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const reactionsList = [
  { type: 'like',  icon: FaThumbsUp,  color: '#1877f2', label: 'Like',  emoji: '👍' },
  { type: 'love',  icon: FaHeart,     color: '#f33e58', label: 'Love',  emoji: '❤️' },
  { type: 'haha',  icon: FaLaughBeam, color: '#f7b928', label: 'Haha',  emoji: '😂' },
  { type: 'wow',   icon: FaRegSmile,  color: '#f7b928', label: 'Wow',   emoji: '😮' },
  { type: 'sad',   icon: FaSadTear,   color: '#1877f2', label: 'Sad',   emoji: '😢' },
  { type: 'angry', icon: FaAngry,     color: '#e41e3f', label: 'Angry', emoji: '😡' },
];

const NewsFeed = () => {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState(null);
  const [reactionHover, setReactionHover] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [followingStatus, setFollowingStatus] = useState({});
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareText, setShareText] = useState('');
  const [reactions, setReactions] = useState({});
  const [activeNav, setActiveNav] = useState('home');
  const reactionTimers = React.useRef({});

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/feed', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching feed:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/suggestions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSuggestedUsers(Array.isArray(data) ? data.slice(0, 6) : []);
      const statuses = {};
      for (const u of data) {
        try {
          const r = await fetch(
            `https://kazi-linda.onrender.com/api/social/following/check/${u._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const d = await r.json();
          statuses[u._id] = d.following;
        } catch {
          statuses[u._id] = false;
        }
      }
      setFollowingStatus(statuses);
    } catch (err) {
      console.error(err);
      setSuggestedUsers([]);
    }
  }, [token]);

  const fetchOnlineFriends = useCallback(async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/online-friends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOnlineFriends(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching online friends:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchFeed();
    fetchSuggestions();
    fetchOnlineFriends();
    const interval = setInterval(fetchFeed, 30000);
    return () => clearInterval(interval);
  }, [fetchFeed, fetchSuggestions, fetchOnlineFriends]);

  const handleCreatePost = async () => {
    if (!newPost.trim()) { toast.error('Please write something'); return; }
    setPosting(true);
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/posts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost }),
      });
      const post = await res.json();
      setPosts([post, ...posts]);
      setNewPost('');
      toast.success('Post shared!');
    } catch {
      toast.error('Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const handleReaction = async (postId, reactionType) => {
    try {
      await fetch(`https://kazi-linda.onrender.com/api/social/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setReactions({ ...reactions, [postId]: reactionType });
      setShowReactionMenu(null);
      fetchFeed();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await fetch(
        `https://kazi-linda.onrender.com/api/social/posts/${selectedPost._id}/comment`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: commentText }),
        }
      );
      setCommentText('');
      setShowCommentModal(false);
      fetchFeed();
      toast.success('Comment added!');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleShare = async () => {
    try {
      await fetch('https://kazi-linda.onrender.com/api/social/posts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: shareText || `Shared a post from ${selectedPost?.author?.name}`,
          originalPost: selectedPost?._id,
        }),
      });
      setShowShareModal(false);
      setShareText('');
      fetchFeed();
      toast.success('Post shared!');
    } catch {
      toast.error('Failed to share');
    }
  };

  const openReaction = (postId) => {
    clearTimeout(reactionTimers.current[postId]);
    setShowReactionMenu(postId);
  };
  const closeReaction = (postId) => {
    reactionTimers.current[postId] = setTimeout(() => setShowReactionMenu(null), 300);
  };

  const getReaction = (postId) => reactions[postId] || null;
  const activeReaction = (postId) => reactionsList.find(r => r.type === getReaction(postId));

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingLogo}>KL</div>
        <Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} />
      </div>
    );
  }

  const navTabs = [
    { id: 'home',        icon: FaHome,        label: 'Home' },
    { id: 'watch',       icon: FaPlayCircle,  label: 'Watch' },
    { id: 'marketplace', icon: FaStore,       label: 'Market' },
    { id: 'groups',      icon: FaUsers,       label: 'Groups' },
    { id: 'gaming',      icon: FaCalendarAlt, label: 'Events' },
  ];

  const leftLinks = [
    { icon: FaUserFriends, label: 'Friends',   color: '#1877f2' },
    { icon: FaStore,       label: 'Marketplace', color: '#e41e3f' },
    { icon: FaPlayCircle,  label: 'Watch',     color: '#7c3aed' },
    { icon: FaBookmark,    label: 'Saved',     color: '#7c3aed' },
    { icon: FaCalendarAlt, label: 'Events',    color: KL_BRAND },
    { icon: FaClock,       label: 'Memories',  color: KL_BRAND },
  ];

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link to="/" style={styles.logoBox}>
            <span style={styles.logoText}>KL</span>
          </Link>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input style={styles.searchInput} placeholder="Search KaziLinda" />
          </div>
        </div>

        <div style={styles.navCenter}>
          {navTabs.map(tab => (
            <button
              key={tab.id}
              style={{
                ...styles.navTab,
                ...(activeNav === tab.id ? styles.navTabActive : {}),
              }}
              onClick={() => setActiveNav(tab.id)}
              title={tab.label}
            >
              <tab.icon size={24} style={{ color: activeNav === tab.id ? KL_BRAND : '#65676b' }} />
              {activeNav === tab.id && <div style={styles.navTabLine} />}
            </button>
          ))}
        </div>

        <div style={styles.navRight}>
          <button style={styles.navIconBtn} title="Menu">
            <div style={styles.navIconInner}>
              <FaEllipsisH size={18} color="#050505" />
            </div>
          </button>
          <button style={styles.navIconBtn} title="Messenger">
            <div style={styles.navIconInner}>
              <FaFacebookMessenger size={18} color="#050505" />
            </div>
            <span style={styles.badge}>3</span>
          </button>
          <button style={styles.navIconBtn} title="Notifications">
            <div style={styles.navIconInner}>
              <FaBell size={18} color="#050505" />
            </div>
            <span style={styles.badge}>9</span>
          </button>
          <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={40} />
        </div>
      </nav>

      <div style={styles.body}>
        <aside style={styles.leftSidebar}>
          <Link to={`/profile/${user?._id}`} style={styles.sidebarProfileLink}>
            <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={36} />
            <span style={styles.sidebarLinkText}>{user?.name}</span>
          </Link>

          {leftLinks.map(({ icon: Icon, label, color }) => (
            <button key={label} style={styles.sidebarNavItem}>
              <span style={{ ...styles.sidebarIconWrap, background: color + '22' }}>
                <Icon size={18} color={color} />
              </span>
              <span style={styles.sidebarLinkText}>{label}</span>
            </button>
          ))}

          <button style={styles.seeMoreBtn}>
            <span style={styles.seeMoreIcon}><FaChevronDown size={14} color="#050505" /></span>
            See more
          </button>

          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarSectionTitle}>Your shortcuts</div>

          {suggestedUsers.slice(0, 3).map(u => (
            <Link key={u._id} to={`/profile/${u._id}`} style={styles.sidebarProfileLink}>
              <ClickableAvatar userId={u._id} src={u.profilePicture} size={36} />
              <span style={styles.sidebarLinkText}>{u.name}</span>
            </Link>
          ))}

          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>
            Privacy · Terms · Advertising<br />
            © {new Date().getFullYear()} KaziLinda
          </div>
        </aside>

        <main style={styles.feedCol}>
          <StoriesBar />

          <div style={styles.card}>
            <div style={styles.createPostTop}>
              <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={40} />
              <div
                style={styles.createPostInput}
                onClick={() => document.getElementById('kl-post-textarea').focus()}
              >
                <textarea
                  id="kl-post-textarea"
                  rows={1}
                  placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  style={styles.createTextarea}
                />
              </div>
            </div>
            <div style={styles.cardDivider} />
            <div style={styles.createPostActions}>
              <button style={styles.cpActionBtn}>
                <FaVideo color="#45bd62" size={20} />
                <span style={{ color: '#45bd62', fontWeight: 600 }}>Live video</span>
              </button>
              <button style={styles.cpActionBtn}>
                <FaImage color="#1877f2" size={20} />
                <span style={{ color: '#1877f2', fontWeight: 600 }}>Photo/Video</span>
              </button>
              <button style={styles.cpActionBtn}>
                <FaSmile color={KL_BRAND} size={20} />
                <span style={{ color: KL_BRAND, fontWeight: 600 }}>Feeling</span>
              </button>
              <button
                style={styles.postBtn}
                onClick={handleCreatePost}
                disabled={posting}
              >
                {posting ? <Spinner animation="border" size="sm" /> : 'Post'}
              </button>
            </div>
          </div>

          {posts.map(post => {
            const reaction = activeReaction(post._id);
            return (
              <div key={post._id} style={styles.card}>
                <div style={styles.postHeader}>
                  <div style={styles.postAuthorRow}>
                    <ClickableAvatar userId={post.author?._id} src={post.author?.profilePicture} size={40} />
                    <div style={{ marginLeft: 8 }}>
                      <Link
                        to={`/profile/${post.author?._id}`}
                        style={styles.postAuthorName}
                      >
                        {post.author?.name}
                      </Link>
                      <div style={styles.postMeta}>
                        {moment(post.createdAt).fromNow()} · <FaGlobe size={10} color="#65676b" />
                      </div>
                    </div>
                  </div>
                  <button style={styles.moreBtn}>
                    <FaEllipsisH size={18} color="#65676b" />
                  </button>
                </div>

                <div style={styles.postContent}>{post.content}</div>

                {post.media?.length > 0 && (
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
                    <span
                      style={{ ...styles.statsLink, marginLeft: 12 }}
                      onClick={() => { setSelectedPost(post); setShowShareModal(true); }}
                    >
                      {post.shares?.length || 0} shares
                    </span>
                  </div>
                </div>

                <div style={styles.postActions}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <button
                      style={{
                        ...styles.postActionBtn,
                        color: reaction ? reaction.color : '#65676b',
                      }}
                      onMouseEnter={() => openReaction(post._id)}
                      onMouseLeave={() => closeReaction(post._id)}
                      onClick={() => handleReaction(post._id, 'like')}
                    >
                      {reaction ? (
                        <>{reaction.emoji} {reaction.label}</>
                      ) : (
                        <><FaThumbsUp size={18} /> Like</>
                      )}
                    </button>

                    {showReactionMenu === post._id && (
                      <div
                        style={styles.reactionPopup}
                        onMouseEnter={() => openReaction(post._id)}
                        onMouseLeave={() => closeReaction(post._id)}
                      >
                        {reactionsList.map(r => (
                          <button
                            key={r.type}
                            style={{
                              ...styles.reactionOption,
                              transform: reactionHover === `${post._id}-${r.type}` ? 'scale(1.35) translateY(-6px)' : 'scale(1)',
                            }}
                            onMouseEnter={() => setReactionHover(`${post._id}-${r.type}`)}
                            onMouseLeave={() => setReactionHover(null)}
                            onClick={() => handleReaction(post._id, r.type)}
                            title={r.label}
                          >
                            <span style={{ fontSize: 28 }}>{r.emoji}</span>
                            {reactionHover === `${post._id}-${r.type}` && (
                              <span style={styles.reactionLabel}>{r.label}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    style={styles.postActionBtn}
                    onClick={() => { setSelectedPost(post); setShowCommentModal(true); }}
                  >
                    <FaComment size={18} /> Comment
                  </button>

                  <button
                    style={styles.postActionBtn}
                    onClick={() => { setSelectedPost(post); setShowShareModal(true); }}
                  >
                    <FaShare size={18} /> Share
                  </button>
                </div>
              </div>
            );
          })}

          {posts.length === 0 && (
            <div style={styles.emptyFeed}>
              <FaGlobe size={48} color={KL_BRAND} />
              <p style={{ marginTop: 12, color: '#65676b' }}>Your feed is empty. Follow people to see posts!</p>
            </div>
          )}
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rsSectionTitle}>People you may know</div>
          {suggestedUsers.map(suggestion => (
            <div key={suggestion._id} style={styles.rsUserRow}>
              <ClickableAvatar userId={suggestion._id} src={suggestion.profilePicture} size={40} />
              <div style={styles.rsUserInfo}>
                <Link to={`/profile/${suggestion._id}`} style={styles.rsUserName}>
                  {suggestion.name}
                </Link>
                <div style={styles.rsUserMeta}>{suggestion.role || 'KaziLinda member'}</div>
              </div>
              <FollowButton
                userId={suggestion._id}
                isFollowingProp={followingStatus[suggestion._id] || false}
                onFollowChange={newStatus => {
                  setFollowingStatus({ ...followingStatus, [suggestion._id]: newStatus });
                  fetchSuggestions();
                }}
                token={token}
              />
            </div>
          ))}
          {suggestedUsers.length === 0 && (
            <div style={styles.rsEmpty}>No suggestions right now</div>
          )}

          <div style={styles.sidebarDivider} />

          <div style={styles.rsSectionTitle}>Online Friends</div>
          {onlineFriends.map(friend => (
            <div key={friend._id} style={styles.rsContactRow}>
              <div style={{ position: 'relative' }}>
                <ClickableAvatar userId={friend._id} src={friend.profilePicture} size={36} showOnline isOnline />
                <span style={styles.onlineDot} />
              </div>
              <Link to={`/profile/${friend._id}`} style={styles.rsContactName}>
                {friend.name}
              </Link>
            </div>
          ))}
          {onlineFriends.length === 0 && (
            <div style={styles.rsEmpty}>No friends online</div>
          )}

          <div style={styles.sidebarDivider} />
          <div style={styles.rsFooter}>© {new Date().getFullYear()} KaziLinda</div>
        </aside>
      </div>

      <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)} centered size="lg">
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={{ fontSize: 20, fontWeight: 700 }}>
            {selectedPost?.author?.name}'s post
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '0 0 16px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #dddfe2' }}>
            <p style={{ margin: 0 }}>{selectedPost?.content}</p>
          </div>
          <div style={{ padding: '12px 16px', maxHeight: 320, overflowY: 'auto' }}>
            {selectedPost?.comments?.map(comment => (
              <div key={comment._id} style={styles.commentItem}>
                <ClickableAvatar userId={comment.user?._id} src={comment.user?.profilePicture} size={32} />
                <div style={styles.commentBubble}>
                  <strong style={{ fontSize: 13 }}>{comment.user?.name}</strong>
                  <p style={{ margin: 0, fontSize: 15 }}>{comment.text}</p>
                  <span style={styles.commentTime}>{moment(comment.createdAt).fromNow()}</span>
                </div>
              </div>
            ))}
            {!selectedPost?.comments?.length && (
              <div style={{ textAlign: 'center', color: '#65676b', padding: 16 }}>
                No comments yet. Be the first!
              </div>
            )}
          </div>
          <div style={{ padding: '0 16px' }}>
            <InputGroup>
              <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={32} />
              <Form.Control
                placeholder="Write a comment…"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                style={{ borderRadius: '20px', marginLeft: 8, background: '#f0f2f5', border: 'none' }}
              />
              <Button
                onClick={handleAddComment}
                style={{ background: KL_BRAND, border: 'none', borderRadius: '50%', width: 36, height: 36, padding: 0, marginLeft: 8 }}
              >
                <FaPaperPlane size={14} />
              </Button>
            </InputGroup>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered>
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={{ fontSize: 20, fontWeight: 700 }}>Share post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={40} />
            <div>
              <strong>{user?.name}</strong>
              <div style={{ fontSize: 13, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 }}>
                <FaGlobe size={11} /> Public
              </div>
            </div>
          </div>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Say something about this…"
            value={shareText}
            onChange={e => setShareText(e.target.value)}
            style={{ border: 'none', outline: 'none', resize: 'none', fontSize: 20, padding: 0 }}
          />
          {selectedPost && (
            <div style={styles.sharePreview}>
              <strong style={{ fontSize: 13 }}>{selectedPost.author?.name}</strong>
              <p style={{ margin: 0, fontSize: 14, color: '#65676b' }}>{selectedPost.content?.slice(0, 120)}…</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ border: 'none' }}>
          <Button
            onClick={handleShare}
            style={{ background: KL_BRAND, border: 'none', borderRadius: 6, fontWeight: 700, width: '100%' }}
          >
            Share now
          </Button>
        </Modal.Footer>
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
    borderRadius: 10, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  navTabActive: { background: KL_BRAND_LIGHT },
  navTabLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
    background: KL_BRAND, borderRadius: '2px 2px 0 0',
  },
  navIconBtn: {
    position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
  },
  navIconInner: {
    width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: 0, right: 0,
    background: '#e41e3f', color: '#fff', borderRadius: 10,
    fontSize: 11, fontWeight: 700, padding: '1px 5px', minWidth: 18, textAlign: 'center',
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
    padding: '8px 8px', borderRadius: 8,
    border: 'none', background: 'transparent',
    cursor: 'pointer', width: '100%',
    fontWeight: 500, fontSize: 15, color: '#050505',
    textAlign: 'left',
  },
  sidebarIconWrap: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  sidebarLinkText: { fontSize: 15, fontWeight: 500, color: '#050505' },
  seeMoreBtn: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: 8, borderRadius: 8, border: 'none', background: 'transparent',
    cursor: 'pointer', width: '100%', fontSize: 15, fontWeight: 500, color: '#050505',
  },
  seeMoreIcon: {
    width: 36, height: 36, borderRadius: '50%', background: '#e4e6eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '8px 0' },
  sidebarSectionTitle: { fontSize: 17, fontWeight: 700, color: '#65676b', padding: '8px 8px', marginBottom: 4 },
  sidebarFooter: { fontSize: 12, color: '#65676b', padding: 8, lineHeight: 1.8 },
  feedCol: {
    flex: 1, maxWidth: 590, margin: '0 auto', padding: '16px 8px',
    minWidth: 0,
  },
  card: {
    background: '#fff', borderRadius: 8,
    boxShadow: '0 1px 2px rgba(0,0,0,.2)',
    marginBottom: 16, overflow: 'hidden',
  },
  cardDivider: { borderTop: '1px solid #dddfe2', margin: 0 },
  createPostTop: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px 12px',
  },
  createPostInput: {
    flex: 1, background: '#f0f2f5', borderRadius: 20, padding: '8px 16px', cursor: 'text',
  },
  createTextarea: {
    background: 'transparent', border: 'none', outline: 'none',
    width: '100%', resize: 'none', fontSize: 17, color: '#050505',
    fontFamily: 'inherit', lineHeight: 1.4,
  },
  createPostActions: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '8px 12px',
  },
  cpActionBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 8, border: 'none', background: 'transparent',
    cursor: 'pointer', fontSize: 15,
  },
  postBtn: {
    background: KL_BRAND, color: '#fff', border: 'none',
    borderRadius: 6, padding: '6px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 15,
  },
  postHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '12px 16px 0',
  },
  postAuthorRow: { display: 'flex', alignItems: 'center' },
  postAuthorName: {
    fontWeight: 600, fontSize: 15, color: '#050505', textDecoration: 'none', display: 'block',
  },
  postMeta: { fontSize: 13, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 },
  moreBtn: {
    width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'transparent',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  postContent: { padding: '10px 16px 12px', fontSize: 15, lineHeight: 1.5, color: '#050505' },
  postMedia: {
    maxHeight: 500, overflow: 'hidden',
    display: 'flex', justifyContent: 'center', background: '#1a1a1a',
  },
  postMediaEl: { maxHeight: 500, width: '100%', objectFit: 'contain' },
  postStats: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 16px', borderBottom: '1px solid #dddfe2',
  },
  statsLeft: { display: 'flex', alignItems: 'center', gap: 4 },
  statsCount: { fontSize: 15, color: '#65676b' },
  statsRight: { display: 'flex', gap: 0 },
  statsLink: { fontSize: 15, color: '#65676b', cursor: 'pointer' },
  reactionCircle: {
    width: 20, height: 20, borderRadius: '50%',
    background: '#1877f2', border: '2px solid #fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11,
  },
  postActions: {
    display: 'flex', padding: '4px 8px',
  },
  postActionBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '6px 0', borderRadius: 4, border: 'none', background: 'transparent',
    cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#65676b',
  },
  reactionPopup: {
    position: 'absolute', bottom: 'calc(100% + 4px)', left: 0,
    background: '#fff', borderRadius: 40,
    boxShadow: '0 2px 12px rgba(0,0,0,.2)',
    display: 'flex', padding: '6px 8px', gap: 4, zIndex: 300,
  },
  reactionOption: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '6px', borderRadius: '50%',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    transition: 'transform .12s',
    position: 'relative',
  },
  reactionLabel: {
    position: 'absolute', bottom: '100%', left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,.75)', color: '#fff',
    fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 6px',
    whiteSpace: 'nowrap', marginBottom: 4,
  },
  commentItem: { display: 'flex', gap: 8, marginBottom: 12 },
  commentBubble: {
    background: '#f0f2f5', borderRadius: 18, padding: '8px 12px', flex: 1,
  },
  commentTime: { fontSize: 12, color: '#65676b' },
  sharePreview: {
    border: '1px solid #dddfe2', borderRadius: 8, padding: '10px 12px', marginTop: 12,
  },
  rightSidebar: {
    width: 280, flexShrink: 0, padding: '12px 8px',
    position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto',
  },
  rsSectionTitle: { fontSize: 17, fontWeight: 700, color: '#65676b', padding: '4px 8px', marginBottom: 8 },
  rsUserRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', borderBottom: '1px solid #f0f2f5' },
  rsUserInfo: { flex: 1, minWidth: 0 },
  rsUserName: { fontSize: 14, fontWeight: 600, color: '#050505', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  rsUserMeta: { fontSize: 12, color: '#65676b' },
  rsContactRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px', borderRadius: 8, cursor: 'pointer', position: 'relative' },
  rsContactName: { fontSize: 15, color: '#050505', textDecoration: 'none', fontWeight: 400 },
  rsEmpty: { fontSize: 14, color: '#65676b', textAlign: 'center', padding: '12px 0' },
  rsFooter: { fontSize: 12, color: '#65676b', padding: '8px', textAlign: 'center' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, background: '#31a24c',
    borderRadius: '50%', border: '2px solid #fff',
  },
  emptyFeed: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: 48, background: '#fff', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  modalHeader: { borderBottom: '1px solid #dddfe2' },
};

export default NewsFeed;