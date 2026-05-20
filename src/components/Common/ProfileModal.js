import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Image, Tabs, Tab, Badge, Row, Col, Card, Spinner } from 'react-bootstrap';
import { 
  FaUserCircle, FaMapMarkerAlt, FaStar, FaGraduationCap, FaCertificate, 
  FaLanguage, FaBriefcase, FaHeart, FaUsers, FaCamera, FaCalendarAlt,
  FaPhone, FaEnvelope, FaGlobe, FaLeaf
} from 'react-icons/fa';
import { profileAPI } from '../services/api';
import ProfilePictureUpload from './ProfilePictureUpload';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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
  border: '#A5D6A7'
};

const ProfileModal = ({ userId, show, onHide, onSendMessage }) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await profileAPI.getPublicProfile(userId);
      setProfile(res.data);
    } catch (err) {
      console.error('Profile fetch error:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (show && userId) {
      fetchProfile();
    }
  }, [show, userId, fetchProfile]);

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} style={{ color: colors.warning }} size={16} />);
      } else {
        stars.push(<FaStar key={i} className="text-muted" size={16} />);
      }
    }
    return stars;
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'looking': { bg: colors.secondary, text: 'Open to work' },
      'working': { bg: colors.primary, text: 'Currently working' },
      'available': { bg: colors.secondary, text: 'Available' },
      'departed': { bg: colors.warning, text: 'Departed' },
      'returned': { bg: colors.accent, text: 'Returned' },
      'distress': { bg: colors.danger, text: 'Need help!' }
    };
    const config = statusConfig[status] || { bg: '#6c757d', text: status || 'Unknown' };
    return <Badge style={{ background: config.bg, padding: '6px 12px', borderRadius: 20 }}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Body className="text-center py-5">
          <Spinner animation="border" style={{ color: colors.primary }} />
          <p className="mt-2" style={{ color: colors.text }}>Loading profile...</p>
        </Modal.Body>
      </Modal>
    );
  }

  if (!profile) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="profile-modal">
      {/* Cover Photo */}
      <div className="profile-cover" style={{
        height: '150px',
        background: colors.gradient,
        position: 'relative',
        borderRadius: '12px 12px 0 0'
      }}>
        <Button 
          variant="light" 
          size="sm" 
          className="position-absolute bottom-0 end-0 m-3"
          style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.9)' }}
        >
          <FaCamera className="me-1" /> Edit Cover
        </Button>
      </div>

      {/* Profile Picture */}
      <div className="position-relative" style={{ marginTop: '-50px', padding: '0 20px' }}>
        <div className="d-flex align-items-end justify-content-between flex-wrap">
          <div className="d-flex align-items-center">
            <div className="position-relative d-inline-block">
              {profile.profilePicture ? (
                <Image 
                  src={profile.profilePicture} 
                  roundedCircle 
                  width="100" 
                  height="100" 
                  className="border border-3 border-white shadow"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="bg-white rounded-circle border border-3 border-white shadow d-flex align-items-center justify-content-center" 
                     style={{ width: '100px', height: '100px', background: colors.light }}>
                  <FaUserCircle size={90} style={{ color: colors.primary }} />
                </div>
              )}
              {currentUser?._id === profile._id && (
                <ProfilePictureUpload 
                  onUpdate={(newUrl) => {
                    setProfile({ ...profile, profilePicture: newUrl });
                    toast.success('Profile picture updated!');
                  }}
                  currentImage={profile.profilePicture}
                  buttonSize="sm"
                />
              )}
            </div>
            <div className="ms-3">
              <h3 className="mb-0" style={{ color: colors.text }}>{profile.name}</h3>
              <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
                <Badge style={{ background: colors.primary, padding: '6px 12px', borderRadius: 20 }} className="text-capitalize">{profile.role || 'Worker'}</Badge>
                {getStatusBadge(profile.currentStatus)}
              </div>
            </div>
          </div>
          
          <div className="mt-3 mt-sm-0">
            <div className="d-flex gap-2">
              <Button onClick={() => onSendMessage && onSendMessage(profile)} style={{ background: colors.gradient, border: 'none', borderRadius: 30, padding: '8px 20px' }}>
                <FaHeart className="me-2" /> Message
              </Button>
              <Button variant="outline-secondary" style={{ borderRadius: 30, borderColor: colors.border, color: colors.text }}>
                <FaUsers className="me-2" /> Follow
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-4 py-2 border-bottom mt-3" style={{ background: colors.light, borderBottomColor: colors.border }}>
        <Row className="text-center">
          <Col>
            <div className="fw-bold h5 mb-0" style={{ color: colors.text }}>{profile.totalRatings || 0}</div>
            <small className="text-muted">Reviews</small>
          </Col>
          <Col>
            <div className="fw-bold h5 mb-0" style={{ color: colors.text }}>{profile.skills?.length || 0}</div>
            <small className="text-muted">Skills</small>
          </Col>
          <Col>
            <div className="fw-bold h5 mb-0" style={{ color: colors.text }}>{profile.languages?.length || 0}</div>
            <small className="text-muted">Languages</small>
          </Col>
          <Col>
            <div className="fw-bold h5 mb-0" style={{ color: colors.text }}>{profile.education?.length || 0}</div>
            <small className="text-muted">Education</small>
          </Col>
          <Col>
            <div className="fw-bold h5 mb-0" style={{ color: colors.text }}>{profile.certifications?.length || 0}</div>
            <small className="text-muted">Certifications</small>
          </Col>
        </Row>
      </div>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="px-4 pt-2" style={{ borderBottomColor: colors.border }}>
        {/* About Tab */}
        <Tab eventKey="about" title="About">
          <div className="py-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {/* Bio */}
            <Card className="mb-3 border-0 shadow-sm" style={{ borderRadius: 12 }}>
              <Card.Body>
                <h6 className="fw-bold mb-3" style={{ color: colors.text }}>About</h6>
                <p className="text-muted">{profile.bio || 'No bio provided yet'}</p>
                
                <hr style={{ borderColor: colors.border }} />
                
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt style={{ color: colors.primary, marginRight: 12 }} />
                    <span>Joined {formatDate(profile.createdAt)}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaMapMarkerAlt style={{ color: colors.primary, marginRight: 12 }} />
                    <span>From {profile.countryOfOrigin || 'Not specified'}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaGlobe style={{ color: colors.primary, marginRight: 12 }} />
                    <span>Currently in {profile.currentCountry || 'Not specified'}{profile.currentCity ? `, ${profile.currentCity}` : ''}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaStar style={{ color: colors.warning, marginRight: 12 }} />
                    <span>{getRatingStars(profile.rating)} ({profile.totalRatings || 0} reviews)</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <Card className="mb-3 border-0 shadow-sm" style={{ borderRadius: 12 }}>
                <Card.Body>
                  <h6 className="fw-bold mb-3" style={{ color: colors.text }}>Skills & Expertise</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {profile.skills.map((skill, idx) => (
                      <Badge key={idx} style={{ background: colors.accent, color: colors.text, padding: '6px 12px', borderRadius: 20 }}>
                        <FaBriefcase className="me-1" size={12} /> {skill}
                      </Badge>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Languages */}
            {profile.languages?.length > 0 && (
              <Card className="mb-3 border-0 shadow-sm" style={{ borderRadius: 12 }}>
                <Card.Body>
                  <h6 className="fw-bold mb-3" style={{ color: colors.text }}>Languages</h6>
                  {profile.languages.map((lang, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span><FaLanguage style={{ color: colors.primary, marginRight: 8 }} /> <strong style={{ color: colors.text }}>{lang.name}</strong></span>
                        <Badge style={{ background: colors.primary, padding: '4px 10px', borderRadius: 20 }} className="text-capitalize">{lang.proficiency}</Badge>
                      </div>
                      <div className="progress mt-1" style={{ height: '4px', background: colors.light, borderRadius: 2 }}>
                        <div 
                          className="progress-bar" 
                          style={{ 
                            width: lang.proficiency === 'native' ? '100%' : 
                                   lang.proficiency === 'fluent' ? '90%' :
                                   lang.proficiency === 'intermediate' ? '60%' : '30%',
                            background: colors.primary,
                            borderRadius: 2
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            )}

            {/* Education */}
            {profile.education?.length > 0 && (
              <Card className="mb-3 border-0 shadow-sm" style={{ borderRadius: 12 }}>
                <Card.Body>
                  <h6 className="fw-bold mb-3" style={{ color: colors.text }}>Education</h6>
                  {profile.education.map((edu, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="d-flex">
                        <FaGraduationCap style={{ color: colors.primary, marginRight: 8, marginTop: 2 }} />
                        <div>
                          <div><strong style={{ color: colors.text }}>{edu.degree}</strong></div>
                          <div className="text-muted small">{edu.institution}</div>
                          <div className="text-muted small">{edu.year}</div>
                          {edu.description && <div className="text-muted small mt-1">{edu.description}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            )}

            {/* Certifications */}
            {profile.certifications?.length > 0 && (
              <Card className="mb-3 border-0 shadow-sm" style={{ borderRadius: 12 }}>
                <Card.Body>
                  <h6 className="fw-bold mb-3" style={{ color: colors.text }}>Certifications</h6>
                  {profile.certifications.map((cert, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="d-flex">
                        <FaCertificate style={{ color: colors.primary, marginRight: 8, marginTop: 2 }} />
                        <div>
                          <div><strong style={{ color: colors.text }}>{cert.name}</strong></div>
                          <div className="text-muted small">{cert.issuer}</div>
                          {cert.date && <div className="text-muted small">Issued: {new Date(cert.date).toLocaleDateString()}</div>}
                          {cert.expiryDate && <div className="text-muted small">Expires: {new Date(cert.expiryDate).toLocaleDateString()}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            )}
          </div>
        </Tab>

        {/* Contact Tab */}
        <Tab eventKey="contact" title="Contact">
          <div className="py-3">
            <Card className="border-0 shadow-sm" style={{ borderRadius: 12 }}>
              <Card.Body>
                <h6 className="fw-bold mb-3" style={{ color: colors.text }}>Contact Information</h6>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center">
                    <FaEnvelope style={{ color: colors.primary, marginRight: 12 }} size={18} />
                    <span>{profile.email || 'Not provided'}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaPhone style={{ color: colors.primary, marginRight: 12 }} size={18} />
                    <span>{profile.phone || 'Not provided'}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Tab>
      </Tabs>

      <Modal.Footer className="border-0" style={{ background: colors.light }}>
        <Button variant="secondary" onClick={onHide} style={{ borderRadius: 30, padding: '8px 24px' }}>Close</Button>
      </Modal.Footer>

      <style>{`
        .profile-modal .modal-content {
          border-radius: 16px;
          overflow: hidden;
        }
        .profile-modal .nav-tabs {
          border-bottom: none;
        }
        .profile-modal .nav-tabs .nav-link {
          border: none;
          color: #65676b;
          font-weight: 500;
          padding: 8px 16px;
        }
        .profile-modal .nav-tabs .nav-link:hover {
          background-color: ${colors.light};
          border-radius: 8px;
        }
        .profile-modal .nav-tabs .nav-link.active {
          color: ${colors.primary};
          border-bottom: 3px solid ${colors.primary};
          background: none;
        }
      `}</style>
    </Modal>
  );
};

export default ProfileModal;
