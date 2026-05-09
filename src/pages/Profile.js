import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Button, Badge, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import FollowButton from '../components/Common/FollowButton';
import { 
  FaUserCircle, FaMapMarkerAlt, FaEnvelope, FaEdit, FaCamera, 
  FaThumbsUp, FaComment, FaShare, FaEllipsisH, FaHeart
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [uploadingCover, setUploadingCover] = useState(false);

  const fileInputRef = React.useRef(null);

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
    if (showFollowersModal) fetchFollowers();
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
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p>Loading profile...</p>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="text-center mt-5">
        <h3>User not found</h3>
        <Button as={Link} to="/" variant="warning">Go Home</Button>
      </Container>
    );
  }

  const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);

  return (
    <div className="profile-page">
      {/* Cover Photo */}
      <div className="cover-section">
        {profile.coverPhoto ? <img src={profile.coverPhoto} alt="Cover" className="cover-image" /> : <div className="cover-placeholder"><div className="cover-gradient"></div></div>}
        {isOwnProfile && (
          <>
            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} disabled={uploadingCover} />
            <Button size="sm" className="edit-cover-btn" onClick={() => fileInputRef.current?.click()} disabled={uploadingCover}>
              <FaCamera /> {uploadingCover ? 'Uploading...' : 'Edit Cover'}
            </Button>
          </>
        )}
      </div>

      {/* Profile Info */}
      <Container>
        <div className="profile-header">
          <div className="avatar-section">
            {profile.profilePicture ? <img src={profile.profilePicture} alt="Profile" className="profile-avatar" /> : <FaUserCircle className="profile-avatar-placeholder" />}
            {isOwnProfile && <Button size="sm" className="edit-profile-btn" as={Link} to="/profile/edit"><FaEdit /> Edit Profile</Button>}
          </div>
          <div className="profile-info">
            <h2>{profile.name}</h2>
            <div className="profile-badges">
              <Badge bg="secondary">{profile.role}</Badge>
              {profile.currentCountry && <span className="location"><FaMapMarkerAlt /> {profile.currentCountry}</span>}
            </div>
            <div className="profile-stats">
              <span onClick={fetchFollowers}><strong>{followersCount}</strong> Followers</span>
              <span onClick={fetchFollowing}><strong>{followingCount}</strong> Following</span>
              <span><strong>{posts.length}</strong> Posts</span>
            </div>
          </div>
          <div className="profile-actions">
            {!isOwnProfile && (
              <FollowButton 
                userId={profile._id} 
                isFollowingProp={isFollowing} 
                onFollowChange={handleFollowChange} 
                token={token} 
              />
            )}
            <Button variant="outline-primary" as={Link} to={`/messages?user=${profile._id}`}><FaEnvelope /> Message</Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card"><div className="stat-number">{followersCount}</div><div>Followers</div></div>
          <div className="stat-card"><div className="stat-number">{followingCount}</div><div>Following</div></div>
          <div className="stat-card"><div className="stat-number">{posts.length}</div><div>Posts</div></div>
          <div className="stat-card"><div className="stat-number">{totalLikes}</div><div>Likes</div></div>
          <div className="stat-card"><div className="stat-number">{totalComments}</div><div>Comments</div></div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button className={activeTab === 'posts' ? 'active' : ''} onClick={() => setActiveTab('posts')}>Posts ({posts.length})</button>
          <button className={activeTab === 'photos' ? 'active' : ''} onClick={() => setActiveTab('photos')}>Photos</button>
          <button className={activeTab === 'videos' ? 'active' : ''} onClick={() => setActiveTab('videos')}>Videos</button>
          <button className={activeTab === 'about' ? 'active' : ''} onClick={() => setActiveTab('about')}>About</button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'posts' && (
            postsLoading ? <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div> :
            posts.length === 0 ? <div className="text-center py-5"><FaHeart size={50} className="text-muted mb-3" /><h6>No posts yet</h6></div> :
            posts.map(post => (
              <Card key={post._id} className="mb-3 post-card">
                <Card.Body>
                  <div className="post-header">
                    <div className="post-author">
                      <ClickableAvatar userId={post.author?._id} src={post.author?.profilePicture} size={40} className="me-2" />
                      <div><strong>{post.author?.name || profile.name}</strong><div className="text-muted small">{moment(post.createdAt).fromNow()}</div></div>
                    </div>
                    <FaEllipsisH className="text-muted" />
                  </div>
                  <p className="post-content">{post.content}</p>
                  {post.media && post.media.length > 0 && (
                    <div className="post-media">
                      {post.mediaType === 'video' ? (
                        <video src={post.media[0]} controls className="w-100 rounded" style={{ maxHeight: '400px', background: 'black' }} />
                      ) : (
                        <img src={post.media[0]} alt="Post" className="w-100 rounded" style={{ maxHeight: '500px', objectFit: 'cover' }} />
                      )}
                    </div>
                  )}
                  <div className="post-actions">
                    <Button variant="link" onClick={() => handleLike(post._id)}><FaThumbsUp className={post.likes?.includes(user?._id) ? 'text-primary' : ''} /> {post.likes?.length || 0}</Button>
                    <Button variant="link"><FaComment /> {post.comments?.length || 0}</Button>
                    <Button variant="link"><FaShare /> {post.shares?.length || 0}</Button>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      </Container>

      {/* Modals */}
      <Modal show={showFollowersModal} onHide={() => setShowFollowersModal(false)}>
        <Modal.Header closeButton><Modal.Title>Followers ({followersList.length})</Modal.Title></Modal.Header>
        <Modal.Body>{followersList.map(f => (<div key={f._id} className="d-flex align-items-center mb-2"><ClickableAvatar userId={f._id} src={f.profilePicture} size={40} className="me-2" /><Link to={`/profile/${f._id}`}>{f.name}</Link></div>))}</Modal.Body>
      </Modal>

      <Modal show={showFollowingModal} onHide={() => setShowFollowingModal(false)}>
        <Modal.Header closeButton><Modal.Title>Following ({followingList.length})</Modal.Title></Modal.Header>
        <Modal.Body>{followingList.map(f => (<div key={f._id} className="d-flex align-items-center mb-2"><ClickableAvatar userId={f._id} src={f.profilePicture} size={40} className="me-2" /><Link to={`/profile/${f._id}`}>{f.name}</Link></div>))}</Modal.Body>
      </Modal>

      <style>{`
        .profile-page { background: #f0f2f5; min-height: 100vh; }
        .cover-section { position: relative; height: 300px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); overflow: hidden; }
        .cover-image { width: 100%; height: 100%; object-fit: cover; }
        .cover-placeholder { height: 100%; background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); }
        .edit-cover-btn { position: absolute; bottom: 20px; right: 20px; background: white; border: none; border-radius: 8px; padding: 8px 16px; }
        .profile-header { display: flex; align-items: flex-end; gap: 30px; margin-top: -60px; margin-bottom: 20px; padding: 0 20px; flex-wrap: wrap; }
        .profile-avatar { width: 150px; height: 150px; border: 4px solid white; border-radius: 50%; object-fit: cover; }
        .profile-avatar-placeholder { width: 150px; height: 150px; color: #ccc; background: white; border-radius: 50%; border: 4px solid white; }
        .edit-profile-btn { position: absolute; bottom: 10px; right: 10px; background: white; border: none; border-radius: 20px; font-size: 12px; padding: 4px 12px; }
        .profile-info { flex: 1; padding-bottom: 20px; }
        .profile-stats { display: flex; gap: 30px; margin-top: 10px; cursor: pointer; }
        .stats-row { display: flex; gap: 20px; justify-content: space-around; background: white; border-radius: 8px; padding: 15px; margin: 20px 0; flex-wrap: wrap; }
        .stat-number { font-size: 24px; font-weight: bold; color: #f39c12; }
        .profile-tabs { background: white; border-radius: 8px; padding: 0 16px; display: flex; gap: 8px; flex-wrap: wrap; margin: 20px 0; }
        .profile-tabs button { background: none; border: none; padding: 12px 20px; font-weight: 500; color: #65676b; cursor: pointer; }
        .profile-tabs button.active { color: #f39c12; border-bottom: 3px solid #f39c12; }
        .tab-content { padding: 20px 0; }
        .post-card { border: none; border-radius: 8px; margin-bottom: 16px; }
        .post-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .post-author { display: flex; align-items: center; gap: 10px; }
        .post-actions { display: flex; gap: 20px; border-top: 1px solid #e4e6eb; padding-top: 12px; }
        .post-actions button { color: #65676b; text-decoration: none; font-size: 14px; padding: 0; }
        .post-actions button:hover { color: #f39c12; }
        @media (max-width: 768px) {
          .profile-header { flex-direction: column; align-items: center; text-align: center; margin-top: -80px; }
          .profile-info { text-align: center; }
          .profile-stats { justify-content: center; }
          .stats-row { gap: 10px; }
        }
      `}</style>
    </div>
  );
};

export default Profile;
