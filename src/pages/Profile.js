import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Image, Button, Spinner, Badge, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaMapMarkerAlt, FaEnvelope, FaUsers, FaCamera } from 'react-icons/fa';
import { profileAPI } from '../services/api';

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const targetId = userId || user?._id;
        
        if (!targetId) {
          throw new Error('No user ID found');
        }
        
        const res = await profileAPI.getPublicProfile(targetId);
        setProfile(res.data);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    if (user || userId) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [userId, user]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-2">Loading profile...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button as={Link} to="/" variant="warning">Go Home</Button>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="warning">Profile not found</Alert>
        <Button as={Link} to="/" variant="warning">Go Home</Button>
      </Container>
    );
  }

  const isOwnProfile = !userId || userId === user?._id;

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        {/* Cover Photo */}
        <div className="position-relative" style={{ height: '200px', background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)', borderRadius: '12px 12px 0 0' }}>
          {profile.coverPhoto && <Image src={profile.coverPhoto} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px 12px 0 0' }} />}
        </div>
        
        {/* Profile Picture */}
        <div className="position-relative text-center" style={{ marginTop: '-60px' }}>
          {profile.profilePicture ? (
            <Image 
              src={profile.profilePicture} 
              alt="Profile" 
              roundedCircle 
              width="120" 
              height="120" 
              className="border border-3 border-white shadow"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <FaUserCircle size={120} className="bg-white rounded-circle border border-3 border-white shadow" />
          )}
        </div>
        
        <Card.Body className="text-center pt-3">
          <h2>{profile.name}</h2>
          <div className="mb-2">
            <Badge bg="secondary" className="me-2">{profile.role}</Badge>
            {profile.currentStatus && <Badge bg="info">{profile.currentStatus}</Badge>}
          </div>
          
          {profile.currentCountry && (
            <p className="text-muted">
              <FaMapMarkerAlt className="me-1" /> {profile.currentCountry}
              {profile.currentCity && `, ${profile.currentCity}`}
            </p>
          )}
          
          <div className="d-flex justify-content-center gap-4 mb-3">
            <div><strong>{profile.followers?.length || 0}</strong> Followers</div>
            <div><strong>{profile.following?.length || 0}</strong> Following</div>
            <div><strong>{profile.posts?.length || 0}</strong> Posts</div>
          </div>
          
          {profile.bio && <p className="text-muted">{profile.bio}</p>}
          
          <div className="d-flex gap-2 justify-content-center">
            {!isOwnProfile && (
              <Button variant="primary">
                <FaUsers className="me-2" /> Follow
              </Button>
            )}
            <Button variant="outline-primary" as={Link} to={`/messages?user=${profile._id}`}>
              <FaEnvelope className="me-2" /> Message
            </Button>
            {isOwnProfile && (
              <Button variant="warning" as={Link} to="/profile/edit">
              <FaCamera className="me-2" /> Edit Profile
              </Button>
            )}
          </div>
          
          <hr />
          
          {/* Skills Section */}
          {profile.skills?.length > 0 && (
            <>
              <h6>Skills</h6>
              <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
                {profile.skills.map((skill, i) => (
                  <Badge key={i} bg="info" className="px-3 py-2">{skill}</Badge>
                ))}
              </div>
            </>
          )}
          
          {/* Languages Section */}
          {profile.languages?.length > 0 && (
            <>
              <h6>Languages</h6>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                {profile.languages.map((lang, i) => (
                  <Badge key={i} bg="success" className="px-3 py-2">{lang.name} - {lang.proficiency}</Badge>
                ))}
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;
