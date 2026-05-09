import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { 
  FaUser, FaEnvelope, FaPhone, FaLock, FaUserPlus, FaCheckCircle, 
  FaBuilding, FaBriefcase, FaShieldAlt, FaFacebook, FaGoogle,
  FaHome, FaSearch, FaBell, FaFacebookMessenger, FaEllipsisH
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import ClickableAvatar from '../components/Common/ClickableAvatar';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const Register = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '',
    role: 'worker'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({ 
        name: form.name, 
        email: form.email, 
        phone: form.phone, 
        password: form.password,
        role: form.role
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'worker', label: 'Job Seeker', icon: FaBriefcase, desc: 'Looking for employment opportunities', color: KL_BRAND },
    { value: 'employer', label: 'Employer', icon: FaBuilding, desc: 'Hire workers for your business', color: '#45bd62' },
    { value: 'recruiter', label: 'Recruiter', icon: FaUserPlus, desc: 'Recruitment agency representative', color: '#1877f2' },
    { value: 'embassy', label: 'Embassy Staff', icon: FaShieldAlt, desc: 'Government/Embassy personnel', color: '#e41e3f' }
  ];

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
    { id: 'community', icon: FaUserPlus, label: 'Community', link: '/social' },
  ];

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
              style={styles.navTab}
            >
              <tab.icon size={24} style={{ color: '#65676b' }} />
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
          <Link to="/login" style={styles.loginBtn}>Login</Link>
        </div>
      </nav>

      {/* ════════════ BODY ════════════ */}
      <div style={styles.body}>
        {/* Left Sidebar - Benefits */}
        <aside style={styles.leftSidebar}>
          <div style={styles.benefitsCard}>
            <h3 style={styles.benefitsTitle}>Why join KAZI LINDA?</h3>
            <ul style={styles.benefitsList}>
              <li>✓ Access to verified jobs</li>
              <li>✓ Employer verification system</li>
              <li>✓ Worker community support</li>
              <li>✓ Real-time job alerts</li>
              <li>✓ Resume building tools</li>
              <li>✓ Direct messaging with employers</li>
              <li>✓ Safety tips and resources</li>
              <li>✓ 24/7 support team</li>
            </ul>
          </div>

          <div style={styles.statsCard}>
            <div style={styles.statNumber}>1000+</div>
            <div style={styles.statLabel}>Workers Placed</div>
            <div style={styles.statNumber}>500+</div>
            <div style={styles.statLabel}>Verified Employers</div>
            <div style={styles.statNumber}>4.8★</div>
            <div style={styles.statLabel}>User Rating</div>
          </div>
        </aside>

        {/* ── MAIN FEED (REGISTRATION FORM) ── */}
        <main style={styles.feedCol}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <div style={styles.headerIcon}>
                <FaUserPlus size={32} color={KL_BRAND} />
              </div>
              <h1 style={styles.formTitle}>Create Account</h1>
              <p style={styles.formSubtitle}>Join thousands of Kenyans finding safe jobs</p>
            </div>

            {error && (
              <Alert variant="danger" style={styles.errorAlert}>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              {/* Name */}
              <Form.Group style={styles.formGroup}>
                <Form.Label style={styles.formLabel}>
                  <FaUser style={styles.labelIcon} /> Full Name
                </Form.Label>
                <Form.Control 
                  name="name" 
                  onChange={handleChange} 
                  placeholder="Enter your full name" 
                  required 
                  style={styles.formInput}
                />
              </Form.Group>

              {/* Email */}
              <Form.Group style={styles.formGroup}>
                <Form.Label style={styles.formLabel}>
                  <FaEnvelope style={styles.labelIcon} /> Email Address
                </Form.Label>
                <Form.Control 
                  name="email" 
                  type="email" 
                  onChange={handleChange} 
                  placeholder="your@email.com" 
                  required 
                  style={styles.formInput}
                />
              </Form.Group>

              {/* Phone */}
              <Form.Group style={styles.formGroup}>
                <Form.Label style={styles.formLabel}>
                  <FaPhone style={styles.labelIcon} /> Phone Number
                </Form.Label>
                <Form.Control 
                  name="phone" 
                  onChange={handleChange} 
                  placeholder="0712345678" 
                  required 
                  style={styles.formInput}
                />
              </Form.Group>
              
              {/* Role Selection */}
              <Form.Group style={styles.formGroup}>
                <Form.Label style={styles.formLabel}>I am a:</Form.Label>
                <div style={styles.roleGrid}>
                  {roleOptions.map(role => (
                    <button
                      key={role.value}
                      type="button"
                      style={{
                        ...styles.roleBtn,
                        ...(form.role === role.value ? styles.roleBtnActive : {}),
                        borderColor: form.role === role.value ? role.color : '#dddfe2',
                      }}
                      onClick={() => setForm({ ...form, role: role.value })}
                    >
                      <role.icon size={20} color={form.role === role.value ? role.color : '#65676b'} />
                      <div>
                        <div style={styles.roleLabel}>{role.label}</div>
                        <div style={styles.roleDesc}>{role.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </Form.Group>
              
              {/* Password */}
              <Form.Group style={styles.formGroup}>
                <Form.Label style={styles.formLabel}>
                  <FaLock style={styles.labelIcon} /> Password
                </Form.Label>
                <div style={styles.passwordWrapper}>
                  <Form.Control 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    onChange={handleChange} 
                    placeholder="Create password (min. 6 characters)" 
                    required 
                    style={styles.formInput}
                  />
                  <button 
                    type="button" 
                    style={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </Form.Group>

              {/* Confirm Password */}
              <Form.Group style={styles.formGroup}>
                <Form.Label style={styles.formLabel}>
                  <FaCheckCircle style={styles.labelIcon} /> Confirm Password
                </Form.Label>
                <Form.Control 
                  name="confirmPassword" 
                  type="password" 
                  onChange={handleChange} 
                  placeholder="Confirm your password" 
                  required 
                  style={styles.formInput}
                />
              </Form.Group>

              {/* Submit Button */}
              <Button 
                type="submit" 
                style={styles.registerBtn} 
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" style={{ color: '#fff' }} />
                ) : (
                  <>Sign Up as {roleOptions.find(r => r.value === form.role)?.label}</>
                )}
              </Button>

              {/* Divider */}
              <div style={styles.divider}>
                <span style={styles.dividerLine}></span>
                <span style={styles.dividerText}>or</span>
                <span style={styles.dividerLine}></span>
              </div>

              {/* Social Registration */}
              <div style={styles.socialButtons}>
                <button style={styles.socialBtn}>
                  <FaGoogle size={20} /> Google
                </button>
                <button style={styles.socialBtn}>
                  <FaFacebook size={20} /> Facebook
                </button>
              </div>
            </Form>

            {/* Login Link */}
            <div style={styles.loginLink}>
              Already have an account? <Link to="/login" style={styles.loginLinkText}>Log in</Link>
            </div>
          </div>

          {/* Terms */}
          <div style={styles.termsText}>
            By signing up, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
          </div>
        </main>

        {/* Right Sidebar - Testimonials */}
        <aside style={styles.rightSidebar}>
          <div style={styles.testimonialCard}>
            <div style={styles.testimonialHeader}>
              <span>⭐ 4.8</span>
              <span>Trusted by thousands</span>
            </div>
            <div style={styles.testimonialItem}>
              <p>"KaziLinda helped me find a legitimate job in Dubai. The verification process gave me peace of mind."</p>
              <div style={styles.testimonialAuthor}>
                <strong>— Mary Wanjiku</strong>
                <span>House Help in Dubai</span>
              </div>
            </div>
            <div style={styles.testimonialItem}>
              <p>"As an employer, I found reliable and vetted workers quickly. The platform is easy to use!"</p>
              <div style={styles.testimonialAuthor}>
                <strong>— James Mwangi</strong>
                <span>Employer, Nairobi</span>
              </div>
            </div>
          </div>

          <div style={styles.securityCard}>
            <FaShieldAlt size={32} color={KL_BRAND} />
            <h4>Your Safety First</h4>
            <p>All employers are verified before they can post jobs. We monitor all activities to prevent scams.</p>
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
  loginBtn: {
    background: KL_BRAND, color: '#fff', padding: '8px 16px',
    borderRadius: 6, textDecoration: 'none', fontSize: 14,
    fontWeight: 600,
  },

  // BODY LAYOUT
  body: {
    display: 'flex', paddingTop: 56,
    maxWidth: 1280, margin: '0 auto',
  },

  // LEFT SIDEBAR
  leftSidebar: {
    width: 280, flexShrink: 0,
    padding: '20px 12px',
    position: 'sticky', top: 56, height: 'calc(100vh - 56px)',
    overflowY: 'auto',
  },
  benefitsCard: {
    background: '#fff', borderRadius: 12, padding: '20px',
    marginBottom: 20, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  benefitsTitle: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#050505' },
  benefitsList: {
    listStyle: 'none', padding: 0, margin: 0,
    fontSize: 14, lineHeight: 2.2, color: '#65676b',
  },
  statsCard: {
    background: KL_BRAND_LIGHT, borderRadius: 12, padding: '20px',
    textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  statNumber: { fontSize: 28, fontWeight: 700, color: KL_BRAND, marginBottom: 4, marginTop: 12 },
  statLabel: { fontSize: 13, color: '#65676b', marginBottom: 16 },

  // MAIN FEED
  feedCol: {
    flex: 1, maxWidth: 500, margin: '0 16px', padding: '20px 0',
    minWidth: 0,
  },
  formCard: {
    background: '#fff', borderRadius: 12, padding: '28px',
    boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  formHeader: { textAlign: 'center', marginBottom: 28 },
  headerIcon: {
    width: 64, height: 64, borderRadius: '50%', background: KL_BRAND_LIGHT,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  formTitle: { fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#050505' },
  formSubtitle: { fontSize: 14, color: '#65676b' },
  errorAlert: { marginBottom: 20, borderRadius: 8 },
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#050505', display: 'flex', alignItems: 'center', gap: 6 },
  labelIcon: { fontSize: 14, color: KL_BRAND },
  formInput: {
    border: '1px solid #dddfe2', borderRadius: 8, padding: '10px 12px',
    fontSize: 15, width: '100%',
    '&:focus': { borderColor: KL_BRAND, outline: 'none' },
  },
  passwordWrapper: { position: 'relative' },
  passwordToggle: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: KL_BRAND, cursor: 'pointer',
    fontSize: 12, fontWeight: 500,
  },
  roleGrid: { display: 'flex', flexDirection: 'column', gap: 10 },
  roleBtn: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
    border: '1px solid #dddfe2', borderRadius: 10, background: '#fff',
    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
  },
  roleBtnActive: { background: KL_BRAND_LIGHT, borderColor: KL_BRAND },
  roleLabel: { fontSize: 14, fontWeight: 600, color: '#050505' },
  roleDesc: { fontSize: 12, color: '#65676b' },
  registerBtn: {
    background: KL_BRAND, border: 'none', borderRadius: 8,
    padding: '12px', fontSize: 16, fontWeight: 700, width: '100%',
    marginTop: 8, color: '#fff',
  },
  divider: { display: 'flex', alignItems: 'center', margin: '24px 0', gap: 12 },
  dividerLine: { flex: 1, height: 1, background: '#dddfe2' },
  dividerText: { fontSize: 13, color: '#65676b' },
  socialButtons: { display: 'flex', gap: 12, marginBottom: 24 },
  socialBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: '10px', border: '1px solid #dddfe2', borderRadius: 8,
    background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500,
  },
  loginLink: { textAlign: 'center', fontSize: 14, marginTop: 16 },
  loginLinkText: { color: KL_BRAND, textDecoration: 'none', fontWeight: 600 },
  termsText: { textAlign: 'center', fontSize: 11, color: '#65676b', marginTop: 16 },

  // RIGHT SIDEBAR
  rightSidebar: {
    width: 300, flexShrink: 0,
    padding: '20px 12px',
    position: 'sticky', top: 56, height: 'calc(100vh - 56px)',
    overflowY: 'auto',
  },
  testimonialCard: {
    background: '#fff', borderRadius: 12, padding: '20px',
    marginBottom: 20, boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  },
  testimonialHeader: {
    display: 'flex', justifyContent: 'space-between',
    paddingBottom: 12, marginBottom: 16, borderBottom: '1px solid #dddfe2',
    fontWeight: 600, color: KL_BRAND,
  },
  testimonialItem: {
    marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f0f2f5',
  },
  testimonialAuthor: { fontSize: 12, color: '#65676b', marginTop: 8 },
  securityCard: {
    background: `linear-gradient(135deg, ${KL_BRAND_LIGHT} 0%, #fff 100%)`,
    borderRadius: 12, padding: '20px', textAlign: 'center',
  },
};

export default Register;