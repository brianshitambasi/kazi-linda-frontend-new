import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { 
  FaEnvelope, FaLock, FaSignInAlt, FaHome, FaSearch, FaBell, 
  FaFacebookMessenger, FaEllipsisH, FaBriefcase, FaShieldAlt, FaUsers  // ← Added FaBriefcase and FaShieldAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import ClickableAvatar from '../components/Common/ClickableAvatar';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = (role) => {
    switch(role) {
      case 'admin': return '/admin/dashboard';
      case 'employer': return '/employer/dashboard';
      case 'embassy': return '/embassy/dashboard';
      case 'recruiter': return '/recruiter/dashboard';
      default: return '/dashboard';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userData = await login({ email, password });
      toast.success(`Welcome back, ${userData.name}!`);
      navigate(getDashboardPath(userData.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      toast.error('Login failed');
    }
    setLoading(false);
  };

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
    { id: 'verify', icon: FaShieldAlt, label: 'Verify', link: '/verify' },
  ];

  return (
    <div style={styles.page}>
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
            <Link key={tab.id} to={tab.link} style={styles.navTab}>
              <tab.icon size={24} style={{ color: '#65676b' }} />
            </Link>
          ))}
        </div>
        <div style={styles.navRight}>
          <button style={styles.navIconBtn}><div style={styles.navIconInner}><FaEllipsisH size={18} /></div></button>
          <button style={styles.navIconBtn}><div style={styles.navIconInner}><FaFacebookMessenger size={18} /></div></button>
          <button style={styles.navIconBtn}><div style={styles.navIconInner}><FaBell size={18} /></div><span style={styles.badge}>3</span></button>
          <Link to="/register" style={styles.registerBtn}>Register</Link>
        </div>
      </nav>

      <div style={styles.body}>
        <aside style={styles.leftSidebar}>
          <div style={styles.benefitsCard}>
            <h3 style={styles.benefitsTitle}>Welcome Back!</h3>
            <ul style={styles.benefitsList}>
              <li>✓ Access verified jobs</li>
              <li>✓ Connect with employers</li>
              <li>✓ Track applications</li>
              <li>✓ Get safety alerts</li>
            </ul>
          </div>
        </aside>

        <main style={styles.feedCol}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <div style={styles.headerIcon}><FaSignInAlt size={32} color={KL_BRAND} /></div>
              <h1 style={styles.formTitle}>Welcome Back</h1>
              <p style={styles.formSubtitle}>Login to your KAZI LINDA account</p>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group style={styles.formGroup}>
                <Form.Label style={styles.formLabel}><FaEnvelope style={styles.labelIcon} /> Email Address</Form.Label>
                <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" style={styles.formInput} required />
              </Form.Group>
              <Form.Group style={styles.formGroup}>
                <Form.Label style={styles.formLabel}><FaLock style={styles.labelIcon} /> Password</Form.Label>
                <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" style={styles.formInput} required />
              </Form.Group>
              <Button type="submit" style={styles.loginBtn} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
            </Form>
            <div style={styles.loginLink}>Don't have an account? <Link to="/register" style={{ color: KL_BRAND }}>Register</Link></div>
            <hr style={styles.divider} />
            <div style={styles.termsText}>By logging in, you agree to our Terms and Privacy Policy</div>
          </div>
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.testimonialCard}>
            <div style={styles.testimonialHeader}>⭐ 4.8 Trusted by thousands</div>
            <div style={styles.testimonialItem}><p>"KaziLinda helped me find a legitimate job in Dubai!"</p><strong>— Mary Wanjiku</strong></div>
          </div>
          <div style={styles.securityCard}><FaShieldAlt size={32} color={KL_BRAND} /><h4>Your Safety First</h4><p>All employers are verified before posting jobs.</p></div>
        </aside>
      </div>
    </div>
  );
};

const styles = {
  page: { background: '#f0f2f5', minHeight: '100vh', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: '1px solid #dddfe2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 200, boxShadow: '0 2px 4px rgba(0,0,0,.08)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 }, navCenter: { display: 'flex', gap: 4 }, navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  logoBox: { width: 40, height: 40, borderRadius: '50%', background: KL_BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  logoText: { color: '#fff', fontWeight: 900, fontSize: 18, fontStyle: 'italic' },
  searchBox: { position: 'relative' }, searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b' },
  searchInput: { background: '#f0f2f5', border: 'none', borderRadius: 20, padding: '8px 16px 8px 36px', fontSize: 15, outline: 'none', width: 240 },
  navTab: { width: 100, height: 48, background: 'transparent', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' },
  navIconInner: { width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: '#e41e3f', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '1px 5px' },
  registerBtn: { background: KL_BRAND, color: '#fff', padding: '8px 16px', borderRadius: 6, textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1200, margin: '0 auto' },
  leftSidebar: { width: 260, flexShrink: 0, padding: '20px 12px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  benefitsCard: { background: '#fff', borderRadius: 12, padding: '20px', marginBottom: 20, boxShadow: '0 1px 2px rgba(0,0,0,.2)' },
  benefitsTitle: { fontSize: 18, fontWeight: 700, marginBottom: 16 }, benefitsList: { listStyle: 'none', padding: 0, fontSize: 14, lineHeight: 2.2, color: '#65676b' },
  feedCol: { flex: 1, maxWidth: 400, margin: '0 16px', padding: '20px 0', minWidth: 0 },
  formCard: { background: '#fff', borderRadius: 12, padding: '28px', boxShadow: '0 1px 2px rgba(0,0,0,.2)' },
  formHeader: { textAlign: 'center', marginBottom: 28 },
  headerIcon: { width: 64, height: 64, borderRadius: '50%', background: KL_BRAND_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  formTitle: { fontSize: 28, fontWeight: 700, marginBottom: 8 }, formSubtitle: { fontSize: 14, color: '#65676b' },
  formGroup: { marginBottom: 20 }, formLabel: { fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 },
  labelIcon: { fontSize: 14, color: KL_BRAND }, formInput: { border: '1px solid #dddfe2', borderRadius: 8, padding: '10px 12px', fontSize: 15 },
  loginBtn: { background: KL_BRAND, border: 'none', borderRadius: 8, padding: '12px', fontSize: 16, fontWeight: 700, width: '100%', marginTop: 8, color: '#fff' },
  loginLink: { textAlign: 'center', fontSize: 14, marginTop: 16 }, divider: { margin: '20px 0' }, termsText: { textAlign: 'center', fontSize: 11, color: '#65676b' },
  rightSidebar: { width: 300, flexShrink: 0, padding: '20px 12px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  testimonialCard: { background: '#fff', borderRadius: 12, padding: '20px', marginBottom: 20, boxShadow: '0 1px 2px rgba(0,0,0,.2)' },
  testimonialHeader: { fontWeight: 600, color: KL_BRAND, marginBottom: 12 }, testimonialItem: { marginBottom: 16, fontSize: 13 },
  securityCard: { background: KL_BRAND_LIGHT, borderRadius: 12, padding: '20px', textAlign: 'center' },
};

export default Login;