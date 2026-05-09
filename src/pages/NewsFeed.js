import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Form, Modal, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import FollowButton from '../components/Common/FollowButton';
import StoriesBar from '../components/Stories/StoriesBar';
import { 
  FaHeart, FaComment, FaShare, FaSmile, FaImage, 
  FaEllipsisH, FaGlobe, FaPaperPlane, FaThumbsUp, FaLaughBeam,
  FaSadTear, FaAngry, FaRegSmile
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import moment from 'moment';

const NewsFeed = () => {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [followingStatus, setFollowingStatus] = useState({});
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareText, setShareText] = useState('');
  const [reactions, setReactions] = useState({});

  const reactionsList = [
    { type: 'like', icon: FaThumbsUp, color: 'primary', label: 'Like' },
    { type: 'love', icon: FaHeart, color: 'danger', label: 'Love' },
    { type: 'haha', icon: FaLaughBeam, color: 'warning', label: 'Haha' },
    { type: 'wow', icon: FaRegSmile, color: 'info', label: 'Wow' },
    { type: 'sad', icon: FaSadTear, color: 'info', label: 'Sad' },
    { type: 'angry', icon: FaAngry, color: 'danger', label: 'Angry' }
  ];

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/feed', {
        headers: { 'Authorization': `Bearer ${token}` }
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
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSuggestedUsers(Array.isArray(data) ? data.slice(0, 5) : []);
      
      const statuses = {};
      for (const suggestUser of data) {
        try {
          const checkRes = await fetch(`https://kazi-linda.onrender.com/api/social/following/check/${suggestUser._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const checkData = await checkRes.json();
          statuses[suggestUser._id] = checkData.following;
        } catch (err) {
          statuses[suggestUser._id] = false;
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
        headers: { 'Authorization': `Bearer ${token}` }
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
    const interval = setInterval(() => fetchFeed(), 30000);
    return () => clearInterval(interval);
  }, [fetchFeed, fetchSuggestions, fetchOnlineFriends]);

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      toast.error('Please write something');
      return;
    }
    
    setPosting(true);
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newPost })
      });
      const post = await res.json();
      setPosts([post, ...posts]);
      setNewPost('');
      toast.success('Post shared!');
    } catch (err) {
      toast.error('Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const handleReaction = async (postId, reactionType) => {
    try {
      await fetch(`https://kazi-linda.onrender.com/api/social/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
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
      await fetch(`https://kazi-linda.onrender.com/api/social/posts/${selectedPost._id}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: commentText })
      });
      setCommentText('');
      setShowCommentModal(false);
      fetchFeed();
      toast.success('Comment added!');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleShare = async () => {
    try {
      await fetch('https://kazi-linda.onrender.com/api/social/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          content: shareText || `Shared a post from ${selectedPost?.author?.name}`,
          originalPost: selectedPost?._id
        })
      });
      setShowShareModal(false);
      setShareText('');
      fetchFeed();
      toast.success('Post shared!');
    } catch (err) {
      toast.error('Failed to share');
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
      </Container>
    );
  }

  return (
    <div className="facebook-feed">
      <Container fluid className="px-4">
        <Row>
          {/* Left Sidebar - Online Friends */}
          <Col lg={3} className="d-none d-lg-block">
            <div className="left-sidebar">
              <div className="sidebar-header">
                <strong>Online Friends</strong>
              </div>
              {onlineFriends.map(friend => (
                <div key={friend._id} className="online-friend">
                  <ClickableAvatar userId={friend._id} src={friend.profilePicture} size={36} showOnline={true} isOnline={true} />
                  <Link to={`/profile/${friend._id}`} className="friend-name">{friend.name}</Link>
                </div>
              ))}
              {onlineFriends.length === 0 && (
                <div className="text-muted text-center py-3 small">No friends online</div>
              )}
            </div>
          </Col>

          {/* Main Feed */}
          <Col lg={6}>
            <StoriesBar />
            
            <Card className="create-post-card mb-3">
              <Card.Body>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={40} />
                  <Form.Control
                    as="textarea"
                    rows={1}
                    placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="bg-light border-0 rounded-pill"
                    style={{ resize: 'none' }}
                  />
                </div>
                <div className="d-flex justify-content-around pt-2 border-top">
                  <Button variant="link" className="text-decoration-none text-success">
                    <FaImage className="me-1" /> Photo/Video
                  </Button>
                  <Button variant="link" className="text-decoration-none text-primary">
                    <FaSmile className="me-1" /> Feeling/Activity
                  </Button>
                  <Button variant="warning" onClick={handleCreatePost} disabled={posting} size="sm">
                    {posting ? <Spinner animation="border" size="sm" /> : 'Post'}
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {posts.map(post => (
              <Card key={post._id} className="post-card mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-3">
                    <div className="d-flex gap-2">
                      <ClickableAvatar userId={post.author?._id} src={post.author?.profilePicture} size={40} />
                      <div>
                        <Link to={`/profile/${post.author?._id}`} className="text-decoration-none text-dark fw-bold">
                          {post.author?.name}
                        </Link>
                        <div className="text-muted small">
                          {moment(post.createdAt).fromNow()} · <FaGlobe size={10} className="text-muted" />
                        </div>
                      </div>
                    </div>
                    <Button variant="link" className="text-muted p-0"><FaEllipsisH /></Button>
                  </div>
                  
                  <p className="mb-3">{post.content}</p>
                  
                  {post.media && post.media.length > 0 && (
                    <div className="post-media mb-3">
                      {post.mediaType === 'video' ? (
                        <video src={post.media[0]} controls className="w-100 rounded" />
                      ) : (
                        <img src={post.media[0]} alt="Post" className="w-100 rounded" />
                      )}
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <div className="d-flex align-items-center gap-1">
                      <span className="reaction-summary">
                        {post.likes?.length > 0 && (
                          <>
                            <FaThumbsUp className="text-primary" size={14} />
                            <span className="ms-1 small text-muted">{post.likes?.length}</span>
                          </>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="small text-muted">{post.comments?.length || 0} comments</span>
                      <span className="small text-muted ms-2">{post.shares?.length || 0} shares</span>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-around">
                    <div className="position-relative">
                      <Button 
                        variant="link" 
                        className="text-decoration-none text-muted action-btn"
                        onMouseEnter={() => setShowReactionMenu(post._id)}
                        onMouseLeave={() => setTimeout(() => setShowReactionMenu(null), 300)}
                      >
                        <FaThumbsUp className="me-1" /> Like
                      </Button>
                      {showReactionMenu === post._id && (
                        <div className="reaction-menu" onMouseEnter={() => setShowReactionMenu(post._id)} onMouseLeave={() => setShowReactionMenu(null)}>
                          {reactionsList.map(react => (
                            <button key={react.type} className="reaction-option" onClick={() => handleReaction(post._id, react.type)}>
                              <react.icon className={`text-${react.color}`} size={28} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button variant="link" className="text-decoration-none text-muted action-btn" onClick={() => { setSelectedPost(post); setShowCommentModal(true); }}>
                      <FaComment className="me-1" /> Comment
                    </Button>
                    <Button variant="link" className="text-decoration-none text-muted action-btn" onClick={() => { setSelectedPost(post); setShowShareModal(true); }}>
                      <FaShare className="me-1" /> Share
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </Col>

          {/* Right Sidebar */}
          <Col lg={3} className="d-none d-lg-block">
            <div className="right-sidebar">
              <div className="sidebar-header">
                <strong>Suggested for you</strong>
              </div>
              {suggestedUsers.map(suggestion => (
                <div key={suggestion._id} className="suggested-user">
                  <ClickableAvatar userId={suggestion._id} src={suggestion.profilePicture} size={40} />
                  <div className="user-info">
                    <Link to={`/profile/${suggestion._id}`} className="user-name">{suggestion.name}</Link>
                    <div className="user-meta">{suggestion.role}</div>
                  </div>
                  <FollowButton 
                    userId={suggestion._id} 
                    isFollowingProp={followingStatus[suggestion._id] || false}
                    onFollowChange={(newStatus) => {
                      setFollowingStatus({ ...followingStatus, [suggestion._id]: newStatus });
                      fetchSuggestions();
                    }}
                    token={token}
                  />
                </div>
              ))}
              {suggestedUsers.length === 0 && (
                <div className="text-muted text-center py-3 small">No suggestions</div>
              )}
              
              <div className="sidebar-footer mt-3 text-center">
                <small className="text-muted">© 2024 KAZI LINDA</small>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Comment Modal */}
      <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Comments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPost?.comments?.map(comment => (
            <div key={comment._id} className="mb-3">
              <div className="d-flex gap-2">
                <ClickableAvatar userId={comment.user?._id} src={comment.user?.profilePicture} size={32} />
                <div className="flex-grow-1">
                  <strong>{comment.user?.name}</strong>
                  <p className="mb-0">{comment.text}</p>
                  <small className="text-muted">{moment(comment.createdAt).fromNow()}</small>
                </div>
              </div>
              <hr />
            </div>
          ))}
          <InputGroup>
            <Form.Control
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button variant="warning" onClick={handleAddComment}>
              <FaPaperPlane />
            </Button>
          </InputGroup>
        </Modal.Body>
      </Modal>

      {/* Share Modal */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Share this post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Say something about this post..."
            value={shareText}
            onChange={(e) => setShareText(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowShareModal(false)}>Cancel</Button>
          <Button variant="warning" onClick={handleShare}>Share Now</Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .facebook-feed { background: #f0f2f5; min-height: 100vh; padding: 20px 0; }
        .left-sidebar, .right-sidebar { position: sticky; top: 80px; background: white; border-radius: 10px; padding: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .sidebar-header { padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid #e4e6eb; }
        .online-friend { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
        .friend-name { color: #050505; text-decoration: none; font-size: 14px; font-weight: 500; }
        .friend-name:hover { color: #f39c12; text-decoration: underline; }
        .create-post-card { border: none; border-radius: 10px; }
        .post-card { border: none; border-radius: 10px; transition: box-shadow 0.2s; }
        .post-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
        .action-btn { font-size: 14px; font-weight: 500; padding: 6px 12px; border-radius: 8px; transition: background 0.2s; width: 100%; }
        .action-btn:hover { background: #f0f2f5; }
        .reaction-menu { position: absolute; bottom: 100%; left: 0; background: white; border-radius: 40px; padding: 8px 12px; display: flex; gap: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.15); z-index: 1000; }
        .reaction-option { background: none; border: none; cursor: pointer; padding: 8px; border-radius: 50%; transition: transform 0.1s; }
        .reaction-option:hover { transform: scale(1.2); background: #f0f2f5; }
        .suggested-user { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #e4e6eb; }
        .suggested-user:last-child { border-bottom: none; }
        .user-info { flex: 1; }
        .user-name { color: #050505; text-decoration: none; font-size: 14px; font-weight: 600; }
        .user-name:hover { color: #f39c12; text-decoration: underline; }
        .user-meta { font-size: 12px; color: #65676b; }
        .post-media { max-height: 500px; overflow: hidden; display: flex; justify-content: center; background: #1a1a1a; border-radius: 8px; }
        .post-media img, .post-media video { max-height: 500px; object-fit: contain; }
      `}</style>
    </div>
  );
};

export default NewsFeed;
