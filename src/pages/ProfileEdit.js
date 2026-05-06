import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Image, Spinner } from 'react-bootstrap';
import { FaUserCircle, FaSave, FaTimes } from 'react-icons/fa';
import { profileAPI } from '../services/api';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import toast from 'react-hot-toast';

const ProfileEdit = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    countryOfOrigin: 'Kenya',
    currentCountry: '',
    currentCity: '',
    skills: [],
    experience: ''
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileAPI.getProfile();
      setProfile(res.data);
      setFormData({
        bio: res.data.bio || '',
        countryOfOrigin: res.data.countryOfOrigin || 'Kenya',
        currentCountry: res.data.currentCountry || '',
        currentCity: res.data.currentCity || '',
        skills: res.data.skills || [],
        experience: res.data.experience || ''
      });
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileAPI.updateProfile(formData);
      toast.success('Profile updated successfully!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
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
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white fw-bold">
              <h4 className="mb-0">Edit Profile</h4>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <div className="position-relative d-inline-block">
                  {profile?.profilePicture ? (
                    <Image
                      src={profile.profilePicture}
                      roundedCircle
                      width="120"
                      height="120"
                      className="border mb-2"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <FaUserCircle size={120} className="text-muted mb-2" />
                  )}
                  <ProfilePictureUpload
                    onUpdate={(newUrl) => {
                      setProfile({ ...profile, profilePicture: newUrl });
                      toast.success('Profile picture updated!');
                    }}
                    currentImage={profile?.profilePicture}
                  />
                </div>
                <small className="text-muted d-block mt-2">Click the camera icon to change your photo</small>
              </div>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country of Origin</Form.Label>
                      <Form.Control
                        type="text"
                        name="countryOfOrigin"
                        value={formData.countryOfOrigin}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Country</Form.Label>
                      <Form.Control
                        type="text"
                        name="currentCountry"
                        value={formData.currentCountry}
                        onChange={handleInputChange}
                        placeholder="e.g., United Arab Emirates"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Current City</Form.Label>
                  <Form.Control
                    type="text"
                    name="currentCity"
                    value={formData.currentCity}
                    onChange={handleInputChange}
                    placeholder="e.g., Dubai"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Skills</Form.Label>
                  <div className="d-flex mb-2">
                    <Form.Control
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="e.g., Carpentry, Plumbing, Painting"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button variant="outline-warning" onClick={addSkill} className="ms-2">
                      Add
                    </Button>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {formData.skills.map((skill, idx) => (
                      <Button
                        key={idx}
                        variant="secondary"
                        size="sm"
                        className="d-flex align-items-center gap-1"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} <FaTimes size={12} />
                      </Button>
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Experience</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="e.g., 7 years in construction industry..."
                  />
                </Form.Group>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button variant="secondary" onClick={() => window.history.back()}>
                    Cancel
                  </Button>
                  <Button variant="warning" onClick={handleSave} disabled={saving}>
                    {saving ? <Spinner animation="border" size="sm" /> : <><FaSave className="me-2" /> Save Changes</>}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileEdit;
