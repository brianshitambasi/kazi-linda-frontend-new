import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Spinner, Alert, Row, Col, Card, Image } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaSave, FaArrowLeft, FaCamera, FaHome, FaBell, FaFacebookMessenger, FaEllipsisH, FaSearch, FaBuilding, FaMapMarkerAlt, FaBriefcase, FaGlobe } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import toast from 'react-hot-toast';

const ProfileEdit = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    countryOfOrigin: 'Kenya',
    currentCountry: '',
    currentCity: '',
    skills: [],
    experience: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileAPI.getProfile(token);
      setFormData({
        name: res.name || '',
        bio: res.bio || '',
        phone: res.phone || '',
        countryOfOrigin: res.countryOfOrigin || 'Kenya',
        currentCountry: res.currentCountry || '',
        currentCity: res.currentCity || '',
        skills: res.skills || [],
        experience: res.experience || ''
      });
      setPreview(res.profilePicture);
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const handleProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setProfilePicture(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadProfilePicture = async () => {
    if (!profilePicture) return null;
    
    const formData = new FormData();
    formData.append('file', profilePicture);
    formData.append('upload_preset', 'kazi_linda_uploads');
    
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/denczbmin/image/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let profilePictureUrl = preview;
      if (profilePicture) {
        const uploadedUrl = await uploadProfilePicture();
        if (uploadedUrl) profilePictureUrl = uploadedUrl;
      }
      
      const updateData = {
        ...formData,
        profilePicture: profilePictureUrl
      };
      
      await profileAPI.updateProfile(updateData, token);
      toast.success('Profile updated successfully!');
      navigate('/profile/' + user._id);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingLogo}>KL</div>
        <Spinner animation="border" style={{ color: '#f39c12', marginTop: 16 }} />
      </div>
    );
  }

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
    { id: 'verify', icon: FaBuilding, label: 'Verify', link: '/verify' },
  ];

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <a href="/" style={styles.logoBox}>
            <span style={styles.logoText}>KL</span>
          </a>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input style={styles.searchInput} placeholder="Search KaziLinda..." />
          </div>
        </div>
        <div style={styles.navCenter}>
          {navTabs.map(tab => (
            <a key={tab.id} href={tab.link} style={styles.navTab}>
              <tab.icon size={22} style={{ color: '#65676b' }} />
            </a>
          ))}
        </div>
        <div style={styles.navRight}>
          <button style={styles.navIconBtn}><div style={styles.navIconInner}><FaEllipsisH size={18} /></div></button>
          <button style={styles.navIconBtn}><div style={styles.navIconInner}><FaFacebookMessenger size={18} /></div></button>
          <button style={styles.navIconBtn}><div style={styles.navIconInner}><FaBell size={18} /></div><span style={styles.badge}>3</span></button>
          <ClickableAvatar userId={user?._id} src={user?.profilePicture} name={user?.name} size={40} />
        </div>
      </nav>

      <div style={styles.body}>
        <aside style={styles.leftSidebar}>
          <div style={styles.sidebarProfileLink}>
            <ClickableAvatar userId={user?._id} src={user?.profilePicture} name={user?.name} size={36} />
            <span style={styles.sidebarLinkText}>{user?.name}</span>
          </div>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarSectionTitle}>Settings</div>
          <button style={styles.sidebarNavItem}><FaUser /> Edit Profile</button>
          <button style={styles.sidebarNavItem}><FaEnvelope /> Privacy</button>
          <button style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>© {new Date().getFullYear()} KaziLinda</div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.headerCard}>
            <div style={styles.headerIcon}><FaUser size={32} color="#f39c12" /></div>
            <div><h1 style={styles.headerTitle}>Edit Profile</h1><p style={styles.headerDesc}>Update your personal information</p></div>
          </div>

          <div style={styles.formCard}>
            <div style={styles.avatarSection}>
              <div className="position-relative d-inline-block">
                {preview ? (
                  <Image src={preview} roundedCircle width="100" height="100" style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={styles.avatarPlaceholder}><FaUser size={50} /></div>
                )}
                <label style={styles.cameraBtn}>
                  <FaCamera />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePicture} />
                </label>
              </div>
              <p style={styles.avatarHint}>Click the camera icon to change your profile photo</p>
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Bio</Form.Label>
                <Form.Control as="textarea" rows={3} name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control name="phone" value={formData.phone} onChange={handleChange} placeholder="+254 700 000000" />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><FaGlobe /> Country of Origin</Form.Label>
                    <Form.Select name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleChange}>
                      <option>Kenya</option><option>Uganda</option><option>Tanzania</option><option>Rwanda</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><FaMapMarkerAlt /> Current Country</Form.Label>
                    <Form.Control name="currentCountry" value={formData.currentCountry} onChange={handleChange} placeholder="e.g., UAE" />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Current City</Form.Label>
                <Form.Control name="currentCity" value={formData.currentCity} onChange={handleChange} placeholder="e.g., Dubai" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Skills</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="e.g., Carpentry" onKeyPress={e => e.key === 'Enter' && addSkill()} />
                  <Button variant="outline-warning" onClick={addSkill}>Add</Button>
                </div>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill, i) => (
                    <span key={i} className="badge bg-secondary p-2" style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)}>
                      {skill} ✕
                    </span>
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Experience</Form.Label>
                <Form.Control as="textarea" rows={2} name="experience" value={formData.experience} onChange={handleChange} placeholder="Your work experience..." />
              </Form.Group>

              <div className="d-flex gap-2 justify-content-end">
                <Button variant="secondary" onClick={() => navigate(-1)}>
                  <FaArrowLeft /> Cancel
                </Button>
                <Button variant="warning" type="submit" disabled={saving}>
                  {saving ? <Spinner animation="border" size="sm" /> : <><FaSave /> Save Changes</>}
                </Button>
              </div>
            </Form>
          </div>
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}>
            <h6>Profile Tips</h6>
            <ul style={{ paddingLeft: 20, fontSize: 13 }}>
              <li>Add a profile photo to get more visibility</li>
              <li>List all your skills to attract employers</li>
              <li>Include your experience for credibility</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

const styles = {
  page: { background: '#f0f2f5', minHeight: '100vh' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' },
  loadingLogo: { width: 60, height: 60, borderRadius: '50%', background: '#f39c12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 24 },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: '1px solid #dddfe2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 200 },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 }, navCenter: { display: 'flex', gap: 4 }, navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  logoBox: { width: 40, height: 40, borderRadius: '50%', background: '#f39c12', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  logoText: { color: '#fff', fontWeight: 900, fontSize: 18 }, searchBox: { position: 'relative' }, searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b' },
  searchInput: { background: '#f0f2f5', border: 'none', borderRadius: 20, padding: '8px 16px 8px 36px', fontSize: 15, outline: 'none', width: 240 },
  navTab: { width: 100, height: 48, background: 'transparent', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }, navIconInner: { width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: '#e41e3f', color: '#fff', borderRadius: 10, fontSize: 11, padding: '1px 5px' },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1200, margin: '0 auto' },
  leftSidebar: { width: 260, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 8, textDecoration: 'none', color: '#050505' },
  sidebarLinkText: { fontSize: 14, fontWeight: 500 },
  sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' }, sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px' },
  sidebarNavItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8, border: 'none', background: 'transparent', width: '100%', fontSize: 14 },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, textAlign: 'center' },
  feedCol: { flex: 1, maxWidth: 600, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  headerCard: { background: '#fff', borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 },
  headerIcon: { width: 56, height: 56, borderRadius: '50%', background: '#fef9e7', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 700 }, headerDesc: { fontSize: 13, color: '#65676b' },
  formCard: { background: '#fff', borderRadius: 12, padding: '24px', marginBottom: 16 },
  avatarSection: { textAlign: 'center', marginBottom: 24 }, avatarPlaceholder: { width: 100, height: 100, borderRadius: '50%', background: '#e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, background: '#f39c12', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #fff' },
  avatarHint: { fontSize: 12, color: '#65676b', marginTop: 8 },
  rightSidebar: { width: 280, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16 },
};

export default ProfileEdit;
