import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Image, Button, Badge, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { 
  FaUserCircle, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaCertificate, 
  FaLanguage, FaCalendarAlt, FaEnvelope, FaUserPlus, FaUserCheck,
  FaGlobe, FaCamera, FaHeart, FaComment, FaShare, FaThumbsUp, FaEdit,
  FaUsers, FaVideo, FaImage, FaEllipsisH
} from 'react-icons/fa';
import { profileAPI } from '../services/api';
import toast from 'react-hot-toast';
import moment from 'moment';

const Profile = () => {
  const { userId } = useParams();
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  const fetchProfile = useCallback(async () => {
    try {
      const id = userId || user?._id;
      const res = await profileAPI.getPublicProfile(id);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile');
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

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [fetchProfile, fetchUserPosts]);

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

  const getStatusColor = (status) => {
    const colors = { looking: 'success', working: 'primary', available: 'info', busy: 'warning', away: 'secondary' };
    return colors[status] || 'secondary';
  };

  const isOwnProfile = !userId || userId === user?._id;

  const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="text-center mt-5">
        <h3>User not found</h3>
      </Container>
    );
  }

  return (
    <div className="facebook-profile">
      {/* Cover Photo */}
      <div className="cover-photo">
        {profile.coverPhoto ? (
          <img src={profile.coverPhoto} alt="Cover" className="cover-image" />
        ) : (
          <div className="cover-image default-cover"></div>
        )}
        {isOwnProfile && (
          <Button variant="light" size="sm" className="edit-cover" as={Link} to="/profile/edit">
            <FaCamera className="me-1" /> Edit Cover
          </Button>
        )}
      </div>

      {/* Profile Info Section */}
      <Container>
        <div className="profile-info-section">
          <div className="profile-avatar">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" className="avatar-image" />
            ) : (
              <FaUserCircle className="avatar-placeholder" />
            )}
            {isOwnProfile && (
              <Button variant="light" size="sm" className="edit-avatar" as={Link} to="/profile/edit">
                <FaEdit /> Edit Profile
              </Button>
            )}
          </div>
          
          <div className="profile-details">
            <h2>{profile.name}</h2>
            <div className="profile-meta">
              <Badge bg={getStatusColor(profile.currentStatus)} className="me-2">
                {profile.currentStatus || 'Available'}
              </Badge>
              <Badge bg="secondary" className="me-2">{profile.role}</Badge>
              {profile.currentCountry && (
                <span className="text-muted">
                  <FaMapMarkerAlt className="me-1" /> {profile.currentCountry}
                  {profile.currentCity && `, ${profile.currentCity}`}
                </span>
              )}
            </div>
            <div className="profile-stats">
              <div style={{ cursor: 'pointer' }} onClick={fetchFollowers}>
                <strong>{profile.followers?.length || 0}</strong> Followers
              </div>
              <div style={{ cursor: 'pointer' }} onClick={fetchFollowing}>
                <strong>{profile.following?.length || 0}</strong> Following
              </div>
              <div><strong>{posts.length}</strong> Posts</div>
            </div>
          </div>
          
          <div className="profile-actions">
            {!isOwnProfile && (
              <Button variant="primary" className="me-2">
                <FaUserPlus className="me-1" /> Follow
              </Button>
            )}
            <Button variant="outline-primary" as={Link} to={`/messages?user=${profile._id}`}>
              <FaEnvelope className="me-1" /> Message
            </Button>
            {isOwnProfile && (
              <Button variant="outline-secondary" as={Link} to="/profile/edit">
                <FaEdit className="me-1" /> Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-number">{profile.followers?.length || 0}</div>
            <div className="stat-label">Followers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{profile.following?.length || 0}</div>
            <div className="stat-label">Following</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{posts.length}</div>
            <div className="stat-label">Posts</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalLikes}</div>
            <div className="stat-label">Total Likes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalComments}</div>
            <div className="stat-label">Comments</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
            Posts ({posts.length})
          </button>
          <button className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>About</button>
          <button className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`} onClick={() => setActiveTab('photos')}>
            Photos ({posts.filter(p => p.mediaType !== 'video' && p.media?.length > 0).length})
          </button>
          <button className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveTab('videos')}>
            Videos ({posts.filter(p => p.mediaType === 'video' && p.media?.length > 0).length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'posts' && (
            postsLoading ? (
              <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
            ) : posts.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <FaImage size={50} className="mb-3" />
                <h6>No posts yet</h6>
                <p>When {isOwnProfile ? 'you' : profile.name?.split(' ')[0]} posts, they'll appear here.</p>
                {isOwnProfile && <Button as={Link} to="/news" variant="warning">Create Your First Post</Button>}
              </div>
            ) : (
              posts.map(post => (
                <Card key={post._id} className="mb-3 shadow-sm post-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        {profile.profilePicture ? (
                          <img src={profile.profilePicture} className="rounded-circle me-2" width="40" height="40" style={{ objectFit: 'cover' }} />
                        ) : (
                          <FaUserCircle size={40} className="me-2" />
                        )}
                        <div>
                          <strong>{profile.name}</strong>
                          <div className="text-muted small">{moment(post.createdAt).fromNow()}</div>
                        </div>
                      </div>
                      <Button variant="link" className="text-muted p-0"><FaEllipsisH /></Button>
                    </div>
                    
                    <p className="mb-3">{post.content}</p>
                    
                    {post.media && post.media.length > 0 && (
                      <div className="mb-3">
                        {post.mediaType === 'video' ? (
                          <video src={post.media[0]} controls className="w-100 rounded" style={{ maxHeight: '400px' }} />
                        ) : (
                          <img src={post.media[0]} alt="Post" className="img-fluid rounded" />
                        )}
                      </div>
                    )}
                    
                    <div className="d-flex justify-content-between pt-2 border-top">
                      <div className="d-flex gap-3">
                        <Button variant="link" onClick={() => handleLike(post._id)} className="text-decoration-none p-0">
                          <FaThumbsUp className={`me-1 ${post.likes?.includes(user?._id) ? 'text-primary' : 'text-muted'}`} />
                          <span>{post.likes?.length || 0}</span>
                        </Button>
                        <Button variant="link" className="text-decoration-none p-0 text-muted">
                          <FaComment className="me-1" /> <span>{post.comments?.length || 0}</span>
                        </Button>
                        <Button variant="link" className="text-decoration-none p-0 text-muted">
                          <FaShare className="me-1" /> <span>{post.shares?.length || 0}</span>
                        </Button>
                      </div>
                    </div>
                    
                    {post.comments?.length > 0 && (
                      <div className="mt-3 pt-2 border-top">
                        {post.comments.slice(0, 2).map(comment => (
                          <div key={comment._id} className="mb-2">
                            <strong>{comment.user?.name}</strong>
                            <span className="text-muted ms-2">{comment.text}</span>
                          </div>
                        ))}
                        {post.comments.length > 2 && (
                          <Button variant="link" size="sm" className="text-muted p-0 mt-1">
                            View all {post.comments.length} comments
                          </Button>
                        )}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ))
            )
          )}

          {activeTab === 'about' && (
            <Row>
              <Col md={6}>
                <Card className="mb-3"><Card.Body>
                  <h6>Bio</h6><p>{profile.bio || 'No bio added yet'}</p>
                  <hr /><h6>Contact Info</h6><p><FaEnvelope className="me-2" /> {profile.email}</p>
                  <h6>Location</h6><p><FaMapMarkerAlt className="me-2" /> {profile.currentCountry || 'Not specified'}{profile.currentCity && `, ${profile.currentCity}`}</p>
                  <h6>Joined</h6><p><FaCalendarAlt className="me-2" /> {new Date(profile.createdAt).toLocaleDateString()}</p>
                </Card.Body></Card>
              </Col>
              <Col md={6}>
                <Card className="mb-3"><Card.Body>
                  <h6><FaBriefcase className="me-2" /> Skills</h6>
                  <div className="d-flex flex-wrap gap-2">{profile.skills?.map((s, i) => (<Badge key={i} bg="info">{s}</Badge>))}</div>
                  <hr /><h6><FaLanguage className="me-2" /> Languages</h6>
                  {profile.languages?.map((l, i) => (<Badge key={i} bg="success" className="me-2 mb-2">{l.name} - {l.proficiency}</Badge>))}
                </Card.Body></Card>
              </Col>
            </Row>
          )}

          {activeTab === 'photos' && (
            <div className="photos-grid">
              <Row>
                {posts.filter(p => p.mediaType !== 'video' && p.media?.length > 0).map(post => (
                  <Col md={4} lg={3} key={post._id} className="mb-3">
                    <img src={post.media[0]} alt="Post" className="photo-thumb" />
                  </Col>
                ))}
                {posts.filter(p => p.mediaType !== 'video' && p.media?.length > 0).length === 0 && (
                  <div className="text-center py-5 text-muted"><FaImage size={50} className="mb-3" /><p>No photos yet</p></div>
                )}
              </Row>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="videos-grid">
              <Row>
                {posts.filter(p => p.mediaType === 'video' && p.media?.length > 0).map(post => (
                  <Col md={6} lg={4} key={post._id} className="mb-3">
                    <Card className="video-card">
                      <video src={post.media[0]} className="w-100" style={{ height: '180px', objectFit: 'cover' }} />
                      <Card.Body><small className="text-muted">{moment(post.createdAt).fromNow()}</small></Card.Body>
                    </Card>
                  </Col>
                ))}
                {posts.filter(p => p.mediaType === 'video' && p.media?.length > 0).length === 0 && (
                  <div className="text-center py-5 text-muted"><FaVideo size={50} className="mb-3" /><p>No videos yet</p></div>
                )}
              </Row>
            </div>
          )}
        </div>
      </Container>

      {/* Followers/Following Modals */}
      <Modal show={showFollowersModal} onHide={() => setShowFollowersModal(false)}>
        <Modal.Header closeButton><Modal.Title>Followers ({followersList.length})</Modal.Title></Modal.Header>
        <Modal.Body>{followersList.map(f => (<div key={f._id} className="d-flex align-items-center mb-2"><img src={f.profilePicture} className="rounded-circle me-2" width="40" height="40" /><Link to={`/profile/${f._id}`}>{f.name}</Link></div>))}</Modal.Body>
      </Modal>

      <Modal show={showFollowingModal} onHide={() => setShowFollowingModal(false)}>
        <Modal.Header closeButton><Modal.Title>Following ({followingList.length})</Modal.Title></Modal.Header>
        <Modal.Body>{followingList.map(f => (<div key={f._id} className="d-flex align-items-center mb-2"><img src={f.profilePicture} className="rounded-circle me-2" width="40" height="40" /><Link to={`/profile/${f._id}`}>{f.name}</Link></div>))}</Modal.Body>
      </Modal>

      <style>{`
        .facebook-profile { background: #f0f2f5; min-height: 100vh; }
        .cover-photo { position: relative; height: 350px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .cover-image { width: 100%; height: 100%; object-fit: cover; }
        .edit-cover { position: absolute; bottom: 20px; right: 20px; }
        .profile-info-section { display: flex; align-items: flex-end; gap: 30px; margin-top: -60px; margin-bottom: 20px; padding: 0 20px; flex-wrap: wrap; }
        .avatar-image { width: 168px; height: 168px; border: 4px solid white; border-radius: 50%; object-fit: cover; }
        .avatar-placeholder { width: 168px; height: 168px; color: #ccc; background: white; border-radius: 50%; border: 4px solid white; }
        .edit-avatar { position: absolute; bottom: 10px; right: 10px; border-radius: 20px; }
        .profile-details { flex: 1; padding-bottom: 20px; }
        .profile-details h2 { margin-bottom: 8px; }
        .profile-stats { display: flex; gap: 30px; margin: 10px 0; }
        .profile-stats div { cursor: pointer; }
        .profile-stats div:hover { color: #f39c12; }
        .stats-row { display: flex; gap: 20px; justify-content: space-around; background: white; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .stat-card { text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #f39c12; }
        .stat-label { font-size: 12px; color: #65676b; }
        .profile-tabs { background: white; border-radius: 8px; padding: 0 16px; display: flex; gap: 8px; flex-wrap: wrap; }
        .tab-btn { background: none; border: none; padding: 12px 20px; font-weight: 500; color: #65676b; transition: all 0.2s; }
        .tab-btn:hover { background: #f0f2f5; border-radius: 8px; }
        .tab-btn.active { color: #f39c12; border-bottom: 3px solid #f39c12; }
        .tab-content { padding: 20px 0; }
        .photo-thumb { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; cursor: pointer; transition: transform 0.2s; }
        .photo-thumb:hover { transform: scale(1.02); }
        @media (max-width: 768px) {
          .profile-info-section { flex-direction: column; align-items: center; text-align: center; margin-top: -80px; }
          .profile-details { text-align: center; }
          .profile-stats { justify-content: center; }
          .stats-row { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
};

export default Profile;
