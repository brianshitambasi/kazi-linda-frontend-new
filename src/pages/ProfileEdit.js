import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Spinner, Form, Badge } from 'react-bootstrap';
import { 
  FaUserCircle, FaSave, FaTimes, FaArrowLeft, FaHome,
  FaBell, FaFacebookMessenger, FaEllipsisH, FaSearch,
  FaBriefcase, FaUsers, FaGlobe, FaEnvelope,
// eslint-disable-next-line no-unused-vars
  FaCheckCircle, FaEdit, FaLinkedin
} from 'react-icons/fa';
import { profileAPI } from '../services/api';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import ClickableAvatar from '../components/Common/ClickableAvatar';
import toast from 'react-hot-toast';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const ProfileEdit = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeNav, setActiveNav] = useState('profile');
  const [formData, setFormData] = useState({
    bio: '',
    countryOfOrigin: 'Kenya',
    currentCountry: '',
    currentCity: '',
    skills: [],
    experience: '',
    phone: '',
    website: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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
        experience: res.data.experience || '',
        phone: res.data.phone || '',
        website: res.data.website || ''
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
      setShowSuccess(true);
      toast.success('Profile updated successfully!');
      setTimeout(() => {
        setShowSuccess(false);
        window.location.href = `/profile/${profile?._id}`;
      }, 1500);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'profile', icon: FaUserCircle, label: 'Profile', link: `/profile/${profile?._id}` },
    { id: 'friends', icon: FaUsers, label: 'Friends', link: '/friends' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
  ];

  const leftLinks = [
    { icon: FaUserCircle, label: 'Edit Profile', color: KL_BRAND, active: true },
    { icon: FaEdit, label: 'Change Password', color: '#7c3aed' },
    { icon: FaBell, label: 'Notification Settings', color: '#1877f2' },
    { icon: FaEnvelope, label: 'Privacy Settings', color: '#e41e3f' },
  ];

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingLogo}>KL</div>
        <Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ════════════ TOP NAV ════════════ */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link to="/" style={styles.logoBox}>
            <span style={styles.logoText}>KL</span>
          </Link>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input style={styles.searchInput} placeholder="Search KaziLinda..." />
          </div>
        </div>

        <div style={styles.navCenter}>
          {navTabs.map(tab => (
            <Link
              key={tab.id}
              to={tab.link}
              style={{
                ...styles.navTab,
                ...(activeNav === tab.id ? styles.navTabActive : {}),
              }}
              onClick={() => setActiveNav(tab.id)}
            >
              <tab.icon size={24} style={{ color: activeNav === tab.id ? KL_BRAND : '#65676b' }} />
              {activeNav === tab.id && <div style={styles.navTabLine} />}
            </Link>
          ))}
        </div>

        <div style={styles.navRight}>
          <button style={styles.navIconBtn}>
            <div style={styles.navIconInner}>
              <FaEllipsisH size={18} color="#050505" />
            </div>
          </button>
          <button style={styles.navIconBtn}>
            <div style={styles.navIconInner}>
              <FaFacebookMessenger size={18} color="#050505" />
            </div>
          </button>
          <button style={styles.navIconBtn}>
            <div style={styles.navIconInner}>
              <FaBell size={18} color="#050505" />
            </div>
            <span style={styles.badge}>3</span>
          </button>
          <ClickableAvatar userId={profile?._id} src={profile?.profilePicture} size={40} />
        </div>
      </nav>

      {/* ════════════ BODY (3-COLUMN LAYOUT) ════════════ */}
      <div style={styles.body}>
        {/* ── LEFT SIDEBAR ── */}
        <aside style={styles.leftSidebar}>
          <Link to={`/profile/${profile?._id}`} style={styles.sidebarProfileLink}>
            <ClickableAvatar userId={profile?._id} src={profile?.profilePicture} size={36} />
            <span style={styles.sidebarLinkText}>{profile?.name || 'User'}</span>
            <Badge bg="secondary" style={styles.roleBadgeSmall}>{profile?.role}</Badge>
          </Link>

          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarSectionTitle}>Settings</div>

          {leftLinks.map(({ icon: Icon, label, color, active }) => (
            <button 
              key={label} 
              style={{
                ...styles.sidebarNavItem,
                ...(active ? styles.sidebarNavItemActive : {}),
              }}
            >
              <span style={{ ...styles.sidebarIconWrap, background: color + '22' }}>
                <Icon size={18} color={color} />
              </span>
              <span style={styles.sidebarLinkText}>{label}</span>
            </button>
          ))}

          <div style={styles.sidebarDivider} />
          
          <div style={styles.sidebarSectionTitle}>Profile Visibility</div>
          <div style={styles.visibilityItem}>
            <FaGlobe size={14} color="#65676b" />
            <span>Public profile</span>
            <Badge bg="success" style={styles.visibilityBadge}>Active</Badge>
          </div>

          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarFooter}>
            Your information is secure<br />
            © {new Date().getFullYear()} KaziLinda
          </div>
        </aside>

        {/* ── MAIN FEED (EDIT PROFILE FORM) ── */}
        <main style={styles.feedCol}>
          {/* Success Message */}
          {showSuccess && (
            <div style={styles.successAlert}>
              <FaCheckCircle size={20} color="#45bd62" />
              <span>Profile updated successfully! Redirecting...</span>
            </div>
          )}

          {/* Header Card */}
          <div style={styles.headerCard}>
            <Link to={`/profile/${profile?._id}`} style={styles.backLink}>
              <FaArrowLeft /> Back to Profile
            </Link>
            <h1 style={styles.headerTitle}>Edit Profile</h1>
            <p style={styles.headerDesc}>Update your personal information and preferences</p>
          </div>

          {/* Profile Picture Card */}
          <div style={styles.profilePictureCard}>
            <div style={styles.avatarSection}>
              <div className="position-relative d-inline-block">
                {profile?.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    style={styles.profileAvatar}
                  />
                ) : (
                  <FaUserCircle size={120} style={styles.avatarPlaceholder} />
                )}
                <div style={styles.cameraIconWrapper}>
                  <ProfilePictureUpload
                    onUpdate={(newUrl) => {
                      setProfile({ ...profile, profilePicture: newUrl });
                      toast.success('Profile picture updated!');
                    }}
                    currentImage={profile?.profilePicture}
                  />
                </div>
              </div>
              <div style={styles.avatarText}>
                <h4>{profile?.name}</h4>
                <p style={styles.avatarHint}>Click the camera icon to change your profile photo</p>
              </div>
            </div>
          </div>

          {/* Edit Form Card */}
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h3>Personal Information</h3>
              <p>Update your details and professional background</p>
            </div>

            <Form>
              {/* Bio */}
              <Form.Group className="mb-4">
                <Form.Label style={styles.formLabel}>Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  style={styles.textarea}
                />
                <small style={styles.helperText}>Share your background, experience, and what you're looking for</small>
              </Form.Group>

              <div style={styles.formRow}>
                <div style={styles.formCol}>
                  <Form.Group className="mb-4">
                    <Form.Label style={styles.formLabel}>Country of Origin</Form.Label>
                    <Form.Control
                      type="text"
                      name="countryOfOrigin"
                      value={formData.countryOfOrigin}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </Form.Group>
                </div>
                <div style={styles.formCol}>
                  <Form.Group className="mb-4">
                    <Form.Label style={styles.formLabel}>Current Country</Form.Label>
                    <Form.Control
                      type="text"
                      name="currentCountry"
                      value={formData.currentCountry}
                      onChange={handleInputChange}
                      placeholder="e.g., United Arab Emirates"
                      style={styles.input}
                    />
                  </Form.Group>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formCol}>
                  <Form.Group className="mb-4">
                    <Form.Label style={styles.formLabel}>Current City</Form.Label>
                    <Form.Control
                      type="text"
                      name="currentCity"
                      value={formData.currentCity}
                      onChange={handleInputChange}
                      placeholder="e.g., Dubai"
                      style={styles.input}
                    />
                  </Form.Group>
                </div>
                <div style={styles.formCol}>
                  <Form.Group className="mb-4">
                    <Form.Label style={styles.formLabel}>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g., +254 700 000000"
                      style={styles.input}
                    />
                  </Form.Group>
                </div>
              </div>

              {/* Skills */}
              <Form.Group className="mb-4">
                <Form.Label style={styles.formLabel}>Skills</Form.Label>
                <div style={styles.skillInputGroup}>
                  <Form.Control
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g., Carpentry, Plumbing, Painting"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    style={styles.skillInput}
                  />
                  <Button style={styles.addSkillBtn} onClick={addSkill}>
                    Add
                  </Button>
                </div>
                <div style={styles.skillsContainer}>
                  {formData.skills.map((skill, idx) => (
                    <Badge
                      key={idx}
                      style={styles.skillBadge}
                    >
                      {skill}
                      <FaTimes 
                        size={10} 
                        style={styles.removeSkillIcon}
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                  {formData.skills.length === 0 && (
                    <small style={styles.helperText}>No skills added yet. Add your professional skills above.</small>
                  )}
                </div>
              </Form.Group>

              {/* Experience */}
              <Form.Group className="mb-4">
                <Form.Label style={styles.formLabel}>Experience</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="e.g., 7 years in construction industry, 3 years as a nanny in Saudi Arabia..."
                  style={styles.textarea}
                />
              </Form.Group>

              {/* Website/Social */}
              <Form.Group className="mb-4">
                <Form.Label style={styles.formLabel}>Website / Portfolio</Form.Label>
                <Form.Control
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourportfolio.com"
                  style={styles.input}
                />
              </Form.Group>

              {/* Action Buttons */}
              <div style={styles.actionButtons}>
                <Link to={`/profile/${profile?._id}`} style={styles.cancelBtn}>
                  <FaTimes className="me-2" /> Cancel
                </Link>
                <Button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Spinner animation="border" size="sm" style={{ color: '#fff' }} />
                  ) : (
                    <><FaSave className="me-2" /> Save Changes</>
                  )}
                </Button>
              </div>
            </Form>
          </div>
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside style={styles.rightSidebar}>
          {/* Profile Tips */}
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}>
              <FaEdit color={KL_BRAND} />
              <span>Profile Tips</span>
            </div>
            <ul style={styles.tipsList}>
              <li>✓ Add a profile photo to get more visibility</li>
              <li>✓ List all your skills to attract employers</li>
              <li>✓ Include your experience for credibility</li>
              <li>✓ Keep your location up to date</li>
              <li>✓ Complete your bio to stand out</li>
            </ul>
          </div>

          {/* Visibility Preview */}
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}>
              <FaGlobe color={KL_BRAND} />
              <span>Profile Preview</span>
            </div>
            <div style={styles.previewItem}>
              <strong>Name:</strong> {profile?.name}
            </div>
            <div style={styles.previewItem}>
              <strong>Role:</strong> {profile?.role}
            </div>
            <div style={styles.previewItem}>
              <strong>Skills:</strong> {formData.skills.length} listed
            </div>
            <div style={styles.previewItem}>
              <strong>Location:</strong> {formData.currentCity || 'Not set'}
            </div>
          </div>

          {/* Help Card */}
          <div style={styles.helpCard}>
            <h4>Need Help?</h4>
            <p>Contact our support team if you need assistance with your profile</p>
            <Button style={styles.helpBtn}>
              Contact Support
            </Button>
          </div>

          <div style={styles.sidebarFooter}>
            Profile last updated: {new Date().toLocaleDateString()}<br />
            © {new Date().getFullYear()} KaziLinda
          </div>
        </aside>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   STYLES (Facebook-style)
══════════════════════════════════════════ */
const styles = {
  page: {
    background: '#f0f2f5',
    minHeight: '100vh',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },

  // NAVIGATION
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
    borderRadius: 10, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', position: 'relative',
    textDecoration: 'none',
  },
  navTabActive: { background: KL_BRAND_LIGHT },
  navTabLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
    background: KL_BRAND, borderRadius: '2px 2px 0 0',
  },
  navIconBtn: {
    position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer',
  },
  navIconInner: {
    width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: 0, right: 0,
    background: '#e41e3f', color: '#fff', borderRadius: 10,
    fontSize: 11, fontWeight: 700, padding: '1px 5px',
  },

  // BODY LAYOUT
  body: {
    display: 'flex', paddingTop: 56,
    maxWidth: 1200, margin: '0 auto',
  },

  // LEFT SIDEBAR
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
    fontWeight: 500, fontSize: 15, marginBottom: 8,
  },
  roleBadgeSmall: { fontSize: 10, padding: '2px 6px', background: '#e4e6eb', color: '#050505' },
  sidebarNavItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 8px', borderRadius: 8,
    border: 'none', background: 'transparent',
    cursor: 'pointer', width: '100%', textAlign: 'left',
    fontWeight: 500, fontSize: 14, color: '#050505',
  },
  sidebarNavItemActive: { background: KL_BRAND_LIGHT },
  sidebarIconWrap: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  sidebarLinkText: { fontSize: 14, fontWeight: 500, color: '#050505', flex: 1 },
  sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' },
  sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px', marginBottom: 4 },
  visibilityItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 8px', fontSize: 14, color: '#050505',
  },
  visibilityBadge: { fontSize: 10, padding: '2px 8px', marginLeft: 'auto', background: '#45bd62' },
  sidebarFooter: { fontSize: 11, color: '#65676b', padding: 8, lineHeight: 1.6, textAlign: 'center' },

  // MAIN FEED
  feedCol: {
    flex: 1, maxWidth: 600, margin: '0 16px', padding: '16px 0',
    minWidth: 0,
  },

  // SUCCESS ALERT
  successAlert: {
    background: '#45bd62', color: '#fff', padding: '12px 16px',
    borderRadius: 8, marginBottom: 16, display: 'flex',
    alignItems: 'center', gap: 10, fontSize: 14,
  },

  // HEADER CARD
  headerCard: {
    background: '#fff', borderRadius: 12, padding: '20px',
    marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  backLink: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    color: KL_BRAND, textDecoration: 'none', fontSize: 13,
    marginBottom: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: 700, marginBottom: 4, color: '#050505' },
  headerDesc: { fontSize: 13, color: '#65676b', margin: 0 },

  // PROFILE PICTURE CARD
  profilePictureCard: {
    background: '#fff', borderRadius: 12, padding: '20px',
    marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  avatarSection: {
    display: 'flex', alignItems: 'center', gap: 20,
    flexWrap: 'wrap',
  },
  profileAvatar: {
    width: 120, height: 120, borderRadius: '50%',
    objectFit: 'cover', border: '3px solid #fff',
  },
  avatarPlaceholder: { color: '#ccc' },
  cameraIconWrapper: {
    position: 'absolute', bottom: 0, right: 0,
  },
  avatarText: { flex: 1 },
  avatarHint: { fontSize: 13, color: '#65676b', marginTop: 4 },

  // FORM CARD
  formCard: {
    background: '#fff', borderRadius: 12, padding: '20px',
    marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  formHeader: {
    marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #dddfe2',
  },
  formLabel: { fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#050505' },
  input: {
    border: '1px solid #dddfe2', borderRadius: 8, padding: '10px 12px',
    fontSize: 14, width: '100%',
  },
  textarea: {
    border: '1px solid #dddfe2', borderRadius: 8, padding: '10px 12px',
    fontSize: 14, width: '100%', resize: 'vertical',
  },
  helperText: { fontSize: 12, color: '#65676b', marginTop: 4, display: 'block' },
  formRow: { display: 'flex', gap: 16, marginBottom: 0 },
  formCol: { flex: 1 },

  // SKILLS
  skillInputGroup: { display: 'flex', gap: 8, marginBottom: 12 },
  skillInput: { flex: 1, border: '1px solid #dddfe2', borderRadius: 8, padding: '8px 12px' },
  addSkillBtn: {
    background: KL_BRAND, border: 'none', borderRadius: 8,
    padding: '8px 16px', fontSize: 13, fontWeight: 500,
  },
  skillsContainer: {
    display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8,
  },
  skillBadge: {
    background: '#e4e6eb', color: '#050505', padding: '6px 12px',
    borderRadius: 20, fontSize: 12, fontWeight: 500,
    display: 'inline-flex', alignItems: 'center', gap: 8,
  },
  removeSkillIcon: { cursor: 'pointer', marginLeft: 4 },

  // ACTION BUTTONS
  actionButtons: {
    display: 'flex', justifyContent: 'flex-end', gap: 12,
    marginTop: 24, paddingTop: 16, borderTop: '1px solid #dddfe2',
  },
  cancelBtn: {
    background: '#e4e6eb', border: 'none', borderRadius: 8,
    padding: '10px 20px', fontSize: 14, fontWeight: 500,
    textDecoration: 'none', color: '#050505',
    display: 'inline-flex', alignItems: 'center',
  },
  saveBtn: {
    background: KL_BRAND, border: 'none', borderRadius: 8,
    padding: '10px 24px', fontSize: 14, fontWeight: 600,
    display: 'inline-flex', alignItems: 'center', color: '#fff',
  },

  // RIGHT SIDEBAR
  rightSidebar: {
    width: 300, flexShrink: 0,
    padding: '12px 8px',
    position: 'sticky', top: 56, height: 'calc(100vh - 56px)',
    overflowY: 'auto',
  },
  rightCard: {
    background: '#fff', borderRadius: 12, padding: '16px',
    marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  rightCardHeader: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 15, fontWeight: 600, marginBottom: 12,
    paddingBottom: 8, borderBottom: '1px solid #dddfe2',
  },
  tipsList: {
    listStyle: 'none', padding: 0, margin: 0,
    fontSize: 13, lineHeight: 1.8, color: '#050505',
  },
  previewItem: {
    padding: '8px 0', fontSize: 13, borderBottom: '1px solid #f0f2f5',
  },
  helpCard: {
    background: `linear-gradient(135deg, ${KL_BRAND}22 0%, #fff 100%)`,
    borderRadius: 12, padding: '20px', textAlign: 'center',
    marginBottom: 16,
  },
  helpBtn: {
    background: KL_BRAND, border: 'none', borderRadius: 6,
    padding: '8px 16px', fontSize: 13, marginTop: 12, width: '100%',
  },

  // LOADING
  loadingWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100vh', background: '#f0f2f5',
  },
  loadingLogo: {
    width: 60, height: 60, borderRadius: '50%', background: KL_BRAND,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 900, fontSize: 24, fontStyle: 'italic',
  },
};

export default ProfileEdit;