import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Image, Button, Spinner, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { 
  FaHeart, FaComment, FaShare, FaUserPlus, FaSmile, FaImage, 
  FaVideo, FaEllipsisH, FaGlobe, FaUsers
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
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch('https://kazi-linda.onrender.com/api/social/feed', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Feed data:', data); // Debug log
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
      } else {
        setOnlineFriends([]);
      }
    } catch (err) {
      console.error('Error fetching online friends:', err);
      setOnlineFriends([]);
    }
  }, [token]);

  useEffect(() => {
    fetchFeed();
    fetchSuggestions();
    fetchOnlineFriends();
    const interval = setInterval(() => {
      fetchFeed();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchFeed, fetchSuggestions, fetchOnlineFriends]);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    
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

  const handleLike = async (postId) => {
    try {
      await fetch(`https://kazi-linda.onrender.com/api/social/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchFeed();
    } catch (err) {
      console.error(err);
    }
  };

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
    } catch (err) {
      toast.error('Failed to follow');
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
    <div className="newsfeed-container">
      <Container fluid className="px-4">
        <Row>
          {/* Left Sidebar */}
          <Col lg={3} className="d-none d-lg-block">
            <div className="left-sidebar">
              <Card className="mb-3">
                <Card.Body className="text-center">
                  {user?.profilePicture ? (
                    <Image 
                      src={user.profilePicture} 
                      roundedCircle 
                      width="60" 
                      height="60" 
                      className="mb-2 border"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="bg-secondary rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                      <FaUsers size={30} className="text-white" />
                    </div>
                  )}
                  <h6>{user?.name}</h6>
                  <Button as={Link} to="/profile/edit" variant="outline-warning" size="sm">Edit Profile</Button>
                </Card.Body>
              </Card>
              
              <Card>
                <Card.Header className="bg-white fw-bold">Online Friends</Card.Header>
                <Card.Body className="p-0">
                  {onlineFriends.length === 0 ? (
                    <div className="text-center p-3 text-muted small">No friends online</div>
                  ) : (
                    onlineFriends.map(friend => (
                      <div key={friend._id} className="d-flex align-items-center p-2 border-bottom">
                        <div className="position-relative">
                          {friend.profilePicture ? (
                            <Image 
                              src={friend.profilePicture} 
                              roundedCircle 
                              width="32" 
                              height="32" 
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="bg-secondary rounded-circle" style={{ width: '32px', height: '32px' }} />
                          )}
                          <span className="online-dot"></span>
                        </div>
                        <span className="ms-2">{friend.name}</span>
                      </div>
                    ))
                  )}
                </Card.Body>
              </Card>
            </div>
          </Col>

          {/* Main Feed */}
          <Col lg={6}>
            {/* Create Post Card */}
            <Card className="mb-3">
              <Card.Body>
                <div className="d-flex align-items-start">
                  {user?.profilePicture ? (
                    <Image 
                      src={user.profilePicture} 
                      roundedCircle 
                      width="40" 
                      height="40" 
                      className="me-2"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="bg-secondary rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <FaUsers size={20} className="text-white" />
                    </div>
                  )}
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="bg-light border-0"
                  />
                </div>
                <div className="d-flex justify-content-around mt-3 pt-2 border-top">
                  <Button variant="link" className="text-decoration-none text-success"><FaImage className="me-2" /> Photo</Button>
                  <Button variant="link" className="text-decoration-none text-primary"><FaVideo className="me-2" /> Video</Button>
                  <Button variant="link" className="text-decoration-none text-warning"><FaSmile className="me-2" /> Feeling</Button>
                  <Button variant="warning" onClick={handleCreatePost} disabled={posting} size="sm">{posting ? 'Posting...' : 'Post'}</Button>
                </div>
              </Card.Body>
            </Card>

            {/* Posts Feed */}
            {posts.length === 0 ? (
              <Card className="text-center py-5">
                <Card.Body>
                  <FaUsers size={50} className="text-muted mb-3" />
                  <h6>No posts yet</h6>
                  <p className="text-muted">Follow people to see their updates!</p>
                </Card.Body>
              </Card>
            ) : (
              posts.map(post => (
                <Card key={post._id} className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex">
                        {post.author?.profilePicture ? (
                          <Link to={`/profile/${post.author?._id}`}>
                            <Image 
                              src={post.author.profilePicture} 
                              roundedCircle 
                              width="40" 
                              height="40" 
                              className="me-2"
                              style={{ objectFit: 'cover' }}
                            />
                          </Link>
                        ) : (
                          <Link to={`/profile/${post.author?._id}`}>
                            <div className="bg-secondary rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                              <FaUsers size={20} className="text-white" />
                            </div>
                          </Link>
                        )}
                        <div>
                          <Link to={`/profile/${post.author?._id}`} className="text-decoration-none text-dark fw-bold">
                            {post.author?.name}
                          </Link>
                          <div className="text-muted small">
                            {moment(post.createdAt).fromNow()} · <FaGlobe size={10} />
                          </div>
                        </div>
                      </div>
                      <Button variant="link" className="text-muted p-0"><FaEllipsisH /></Button>
                    </div>
                    <p className="mb-3">{post.content}</p>
                    <div className="d-flex justify-content-between border-top pt-2">
                      <div className="d-flex gap-3">
                        <Button 
                          variant="link" 
                          onClick={() => handleLike(post._id)} 
                          className="text-decoration-none p-0"
                        >
                          <FaHeart className={`me-1 ${post.likes?.includes(user?._id) ? 'text-danger' : 'text-muted'}`} />
                          {post.likes?.length || 0}
                        </Button>
                        <Button variant="link" className="text-decoration-none p-0 text-muted">
                          <FaComment className="me-1" /> {post.comments?.length || 0}
                        </Button>
                        <Button variant="link" className="text-decoration-none p-0 text-muted">
                          <FaShare className="me-1" /> {post.shares?.length || 0}
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}
          </Col>

          {/* Right Sidebar */}
          <Col lg={3} className="d-none d-lg-block">
            <Card>
              <Card.Header className="bg-white fw-bold">Suggested for you</Card.Header>
              <Card.Body className="p-0">
                {suggestedUsers.length === 0 ? (
                  <div className="text-center p-3 text-muted small">No suggestions</div>
                ) : (
                  suggestedUsers.map(suggestion => (
                    <div key={suggestion._id} className="d-flex align-items-center p-2 border-bottom">
                      {suggestion.profilePicture ? (
                        <Link to={`/profile/${suggestion._id}`}>
                          <Image 
                            src={suggestion.profilePicture} 
                            roundedCircle 
                            width="40" 
                            height="40" 
                            className="me-2"
                            style={{ objectFit: 'cover' }}
                          />
                        </Link>
                      ) : (
                        <Link to={`/profile/${suggestion._id}`}>
                          <div className="bg-secondary rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <FaUsers size={20} className="text-white" />
                          </div>
                        </Link>
                      )}
                      <div className="flex-grow-1">
                        <Link to={`/profile/${suggestion._id}`} className="text-decoration-none text-dark fw-bold small">
                          {suggestion.name}
                        </Link>
                        <div className="text-muted small">{suggestion.role}</div>
                      </div>
                      <Button size="sm" variant="outline-primary" onClick={() => handleFollow(suggestion._id)}>
                        <FaUserPlus /> Follow
                      </Button>
                    </div>
                  ))
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .newsfeed-container { background: #f0f2f5; min-height: 100vh; padding: 20px 0; }
        .online-dot { position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; background: #31a24c; border-radius: 50%; border: 2px solid white; }
        .left-sidebar { position: sticky; top: 80px; }
      `}</style>
    </div>
  );
};

export default NewsFeed;
