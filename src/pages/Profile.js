import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Image, Button, Badge, Tabs, Tab, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { 
  FaUserCircle, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaCertificate, 
  FaLanguage, FaCalendarAlt, FaEnvelope, FaUserPlus, FaUserCheck,
  FaGlobe, FaUsers, FaCamera
} from 'react-icons/fa';
import { profileAPI } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { userId } = useParams();
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  const fetchProfile = useCallback(async () => {
    try {
      const id = userId || user?._id;
      const res = await profileAPI.getPublicProfile(id);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId, user]);

  const checkFollowStatus = useCallback(async () => {
    if (!userId || userId === user?._id) return;
    try {
      const res = await fetch(`https://kazi-linda.onrender.com/api/social/following/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setIsFollowing(data.following);
    } catch (err) {
      console.error(err);
    }
  }, [userId, user, token]);

  useEffect(() => {
    fetchProfile();
    checkFollowStatus();
  }, [fetchProfile, checkFollowStatus]);

  const handleFollow = async () => {
    try {
      await fetch('https://kazi-linda.onrender.com/api/social/follow', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ followingId: userId })
      });
      setIsFollowing(true);
      toast.success('Now following!');
    } catch (err) {
      toast.error('Failed to follow');
    }
  };

  const getStatusColor = (status) => {
    const colors = { looking: 'success', working: 'primary', available: 'info', busy: 'warning', away: 'secondary' };
    return colors[status] || 'secondary';
  };

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

  const isOwnProfile = !userId || userId === user?._id;

  return (
    <div className="facebook-profile">
      {/* Cover Photo */}
      <div className="cover-photo">
        {profile.coverPhoto ? (
          <Image src={profile.coverPhoto} fluid className="cover-image" />
        ) : (
          <div className="cover-image default-cover"></div>
        )}
        {isOwnProfile && (
          <Button variant="light" size="sm" className="edit-cover">
            <FaCamera className="me-1" /> Edit Cover
          </Button>
        )}
      </div>

      {/* Profile Info Section */}
      <Container>
        <div className="profile-info-section">
          <div className="profile-avatar">
            {profile.profilePicture ? (
              <Image src={profile.profilePicture} roundedCircle className="avatar-image" />
            ) : (
              <FaUserCircle className="avatar-placeholder" />
            )}
            {isOwnProfile && (
              <Button variant="light" size="sm" className="edit-avatar" as={Link} to="/profile/edit">
                <FaCamera /> Update
              </Button>
            )}
          </div>
          
          <div className="profile-details">
            <h2>{profile.name}</h2>
            <div className="profile-meta">
              <Badge bg={getStatusColor(profile.currentStatus)} className="me-2">
                {profile.currentStatus || 'Available'}
              </Badge>
              <Badge bg="secondary">{profile.role}</Badge>
              {profile.currentCountry && (
                <span className="text-muted ms-3">
                  <FaMapMarkerAlt className="me-1" /> {profile.currentCountry}
                  {profile.currentCity && `, ${profile.currentCity}`}
                </span>
              )}
            </div>
            <div className="profile-stats">
              <div><strong>{profile.followers?.length || 0}</strong> Followers</div>
              <div><strong>{profile.following?.length || 0}</strong> Following</div>
            </div>
          </div>
          
          <div className="profile-actions">
            {!isOwnProfile && (
              <Button variant="primary" onClick={handleFollow} className="me-2">
                {isFollowing ? <FaUserCheck className="me-1" /> : <FaUserPlus className="me-1" />}
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
            <Button variant="outline-primary" as={Link} to={`/messages?user=${profile._id}`}>
              <FaEnvelope className="me-1" /> Message
            </Button>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs activeKey={activeTab} onSelect={setActiveTab} className="profile-tabs">
          <Tab eventKey="about" title="About">
            <div className="tab-content">
              <Row>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <h6>Bio</h6>
                      <p>{profile.bio || 'No bio added yet'}</p>
                      <hr />
                      <h6>Contact Info</h6>
                      <p><FaEnvelope className="me-2" /> {profile.email}</p>
                      <h6>Location</h6>
                      <p><FaMapMarkerAlt className="me-2" /> From: {profile.countryOfOrigin || 'Not specified'}</p>
                      <p><FaGlobe className="me-2" /> Lives in: {profile.currentCountry || 'Not specified'}</p>
                      <h6>Joined</h6>
                      <p><FaCalendarAlt className="me-2" /> {new Date(profile.createdAt).toLocaleDateString()}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <h6><FaBriefcase className="me-2" /> Skills</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {profile.skills?.map((skill, i) => (
                          <Badge key={i} bg="info">{skill}</Badge>
                        ))}
                        {!profile.skills?.length && <p className="text-muted">No skills added</p>}
                      </div>
                      <hr />
                      <h6><FaLanguage className="me-2" /> Languages</h6>
                      {profile.languages?.map((lang, i) => (
                        <Badge key={i} bg="success" className="me-2 mb-2">{lang.name} - {lang.proficiency}</Badge>
                      ))}
                      {!profile.languages?.length && <p className="text-muted">No languages added</p>}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              {profile.education?.length > 0 && (
                <Card className="mb-3">
                  <Card.Body>
                    <h6><FaGraduationCap className="me-2" /> Education</h6>
                    {profile.education.map((edu, i) => (
                      <div key={i} className="mb-2">
                        <strong>{edu.degree}</strong> at {edu.institution}<br />
                        <small className="text-muted">{edu.year}</small>
                        {edu.description && <p className="mt-1">{edu.description}</p>}
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              )}
              
              {profile.certifications?.length > 0 && (
                <Card>
                  <Card.Body>
                    <h6><FaCertificate className="me-2" /> Certifications</h6>
                    {profile.certifications.map((cert, i) => (
                      <div key={i}>
                        <strong>{cert.name}</strong> - {cert.issuer}
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              )}
            </div>
          </Tab>
          
          <Tab eventKey="posts" title="Posts">
            <div className="tab-content text-center py-5">
              <FaUsers size={50} className="text-muted mb-3" />
              <p>Posts will appear here</p>
            </div>
          </Tab>
          
          <Tab eventKey="photos" title="Photos">
            <div className="tab-content text-center py-5">
              <FaCamera size={50} className="text-muted mb-3" />
              <p>Photos will appear here</p>
            </div>
          </Tab>
          
          <Tab eventKey="friends" title="Friends">
            <div className="tab-content text-center py-5">
              <FaUsers size={50} className="text-muted mb-3" />
              <p>Friends list will appear here</p>
            </div>
          </Tab>
        </Tabs>
      </Container>

      <style>{`
        .facebook-profile {
          background: #f0f2f5;
          min-height: 100vh;
        }
        .cover-photo {
          position: relative;
          height: 300px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .cover-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .default-cover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          height: 100%;
        }
        .edit-cover {
          position: absolute;
          bottom: 20px;
          right: 20px;
        }
        .profile-info-section {
          display: flex;
          align-items: flex-end;
          gap: 30px;
          margin-top: -60px;
          margin-bottom: 20px;
          padding: 0 20px;
        }
        .profile-avatar {
          position: relative;
        }
        .avatar-image {
          width: 168px;
          height: 168px;
          border: 4px solid white;
          border-radius: 50%;
          object-fit: cover;
        }
        .avatar-placeholder {
          width: 168px;
          height: 168px;
          color: #ccc;
          background: white;
          border-radius: 50%;
          border: 4px solid white;
        }
        .edit-avatar {
          position: absolute;
          bottom: 10px;
          right: 10px;
          border-radius: 20px;
        }
        .profile-details {
          flex: 1;
          padding-bottom: 20px;
        }
        .profile-details h2 {
          margin-bottom: 10px;
        }
        .profile-meta {
          margin-bottom: 10px;
        }
        .profile-stats {
          display: flex;
          gap: 20px;
        }
        .profile-actions {
          padding-bottom: 20px;
        }
        .profile-tabs {
          margin-top: 20px;
        }
        .profile-tabs .nav-link {
          color: #65676b;
          font-weight: 500;
          border: none;
        }
        .profile-tabs .nav-link.active {
          color: #f39c12;
          border-bottom: 3px solid #f39c12;
        }
        .tab-content {
          padding: 20px 0;
        }
        @media (max-width: 768px) {
          .profile-info-section {
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin-top: -80px;
          }
          .profile-details {
            text-align: center;
          }
          .profile-stats {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
