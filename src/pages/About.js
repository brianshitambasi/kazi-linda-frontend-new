import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { 
  FaShieldAlt, FaUsers, FaGlobeAfrica, FaHandsHelping, FaCheckCircle, 
  FaHeart, FaLeaf
} from 'react-icons/fa';
import Logo from '../components/Common/Logo';

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



const About = () => {
  const values = [
    { icon: FaShieldAlt, title: 'Safety First', desc: 'We prioritize worker safety above all else' },
    { icon: FaUsers, title: 'Community', desc: 'Building a supportive worker community' },
    { icon: FaGlobeAfrica, title: 'Global Reach', desc: 'Connecting Kenyans to opportunities worldwide' },
    { icon: FaHandsHelping, title: 'Support', desc: '24/7 emergency support for all workers' }
  ];

  const stats = [
    { number: '5000+', label: 'Workers Protected' },
    { number: '50+', label: 'Countries Served' },
    { number: '1000+', label: 'Verified Jobs' },
    { number: '98%', label: 'Satisfaction Rate' }
  ];

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <Logo size={80} />
        <h1 style={styles.heroTitle}>About KAZI LINDA</h1>
        <p style={styles.heroSubtitle}>Safe Jobs for Kenyans at Home and Abroad</p>
      </div>

      {/* Mission Section */}
      <div style={styles.missionSection}>
        <div style={styles.missionContent}>
          <h2 style={{ color: colors.text }}>Our Mission</h2>
          <p>KAZI LINDA was founded with a single mission: to protect Kenyan workers from exploitation while helping them find legitimate employment opportunities both locally and internationally.</p>
          <p>We believe that every worker deserves dignity, fair treatment, and a safe working environment. Our platform connects job seekers with verified employers and provides tools to report abuse, verify employers, and access emergency support when needed.</p>
          <div style={styles.checkItem}><FaCheckCircle style={{ color: colors.primary, marginRight: 8 }} /> Verify employers before you accept a job</div>
          <div style={styles.checkItem}><FaCheckCircle style={{ color: colors.primary, marginRight: 8 }} /> Access emergency support 24/7</div>
          <div style={styles.checkItem}><FaCheckCircle style={{ color: colors.primary, marginRight: 8 }} /> Connect with a community of workers</div>
        </div>
        <div style={styles.missionQuote}>
          <FaHeart size={50} style={{ color: colors.warning }} />
          <h3 style={{ color: colors.text }}>Protecting Kenyan Workers</h3>
          <p>"Every worker deserves to return home safely"</p>
          <FaLeaf size={24} style={{ color: colors.primary, marginTop: 16 }} />
        </div>
      </div>

      {/* Stats Section */}
      <div style={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <div key={idx} style={styles.statCard}>
            <h2 style={styles.statNumber}>{stat.number}</h2>
            <p style={styles.statLabel}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Core Values */}
      <h2 style={styles.sectionTitle}>Our Core Values</h2>
      <div style={styles.valuesGrid}>
        {values.map((value, idx) => (
          <div key={idx} style={styles.valueCard}>
            <value.icon size={45} style={{ color: colors.primary }} />
            <h4 style={{ color: colors.text }}>{value.title}</h4>
            <p style={{ color: '#65676b' }}>{value.desc}</p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <h2 style={styles.sectionTitle}>How KAZI LINDA Works</h2>
      <div style={styles.stepsGrid}>
        <div style={styles.stepCard}>
          <div style={styles.stepNumber}>1</div>
          <h4 style={{ color: colors.text }}>Find Jobs</h4>
          <p style={{ color: '#65676b' }}>Browse verified job listings from trusted employers</p>
        </div>
        <div style={styles.stepCard}>
          <div style={styles.stepNumber}>2</div>
          <h4 style={{ color: colors.text }}>Verify Employer</h4>
          <p style={{ color: '#65676b' }}>Check employer legitimacy before accepting an offer</p>
        </div>
        <div style={styles.stepCard}>
          <div style={styles.stepNumber}>3</div>
          <h4 style={{ color: colors.text }}>Stay Safe</h4>
          <p style={{ color: '#65676b' }}>Access emergency support and daily check-ins</p>
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.ctaCard}>
        <h3 style={{ color: colors.text }}>Ready to find safe employment?</h3>
        <p style={{ color: '#65676b' }}>Join thousands of Kenyans who trust KAZI LINDA</p>
        <Button as={Link} to="/register" style={styles.ctaBtn}>Register Now</Button>
      </div>
    </div>
  );
};

const styles = {
  page: { background: colors.gradientLight, minHeight: '100vh', padding: '40px 20px' },
  heroSection: { textAlign: 'center', marginBottom: '40px' },
  heroTitle: { fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', color: colors.text },
  heroSubtitle: { fontSize: '20px', color: '#65676b' },
  missionSection: { display: 'flex', gap: '32px', maxWidth: '1200px', margin: '0 auto 48px', flexWrap: 'wrap' },
  missionContent: { flex: 2 },
  checkItem: { display: 'flex', alignItems: 'center', marginBottom: 12, fontSize: 14, color: '#050505' },
  missionQuote: { flex: 1, background: colors.light, borderRadius: '16px', padding: '24px', textAlign: 'center', border: `1px solid ${colors.border}` },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', maxWidth: '1200px', margin: '0 auto 48px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,.1)', border: `1px solid ${colors.border}` },
  statNumber: { fontSize: '32px', fontWeight: 'bold', color: colors.primary, marginBottom: 8 },
  statLabel: { color: '#65676b', margin: 0 },
  sectionTitle: { textAlign: 'center', fontSize: '28px', fontWeight: 'bold', marginBottom: '32px', color: colors.text },
  valuesGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', maxWidth: '1200px', margin: '0 auto 48px' },
  valueCard: { background: '#fff', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,.1)', border: `1px solid ${colors.border}` },
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', maxWidth: '1200px', margin: '0 auto 48px' },
  stepCard: { background: '#fff', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,.1)', border: `1px solid ${colors.border}` },
  stepNumber: { width: '40px', height: '40px', borderRadius: '50%', background: colors.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 'bold' },
  ctaCard: { background: colors.light, borderRadius: '16px', padding: '48px', textAlign: 'center', maxWidth: '800px', margin: '0 auto', border: `1px solid ${colors.accent}` },
  ctaBtn: { background: colors.gradient, border: 'none', borderRadius: '30px', padding: '12px 32px', fontWeight: 'bold', color: '#fff' },
};

export default About;
