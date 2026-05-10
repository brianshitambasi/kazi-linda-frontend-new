import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { 
  FaShieldAlt, FaUsers, FaGlobeAfrica, FaHandsHelping, FaCheckCircle, 
  FaHeart
} from 'react-icons/fa';

const KL_BRAND = '#f39c12';

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
      <div style={styles.heroSection}>
        <h1 style={styles.heroTitle}>About KAZI LINDA</h1>
        <p style={styles.heroSubtitle}>Safe Jobs for Kenyans at Home and Abroad</p>
      </div>

      <div style={styles.missionSection}>
        <div style={styles.missionContent}>
          <h2>Our Mission</h2>
          <p>KAZI LINDA was founded with a single mission: to protect Kenyan workers from exploitation while helping them find legitimate employment opportunities both locally and internationally.</p>
          <p>We believe that every worker deserves dignity, fair treatment, and a safe working environment. Our platform connects job seekers with verified employers and provides tools to report abuse, verify employers, and access emergency support when needed.</p>
          <div><FaCheckCircle color={KL_BRAND} /> Verify employers before you accept a job</div>
          <div><FaCheckCircle color={KL_BRAND} /> Access emergency support 24/7</div>
          <div><FaCheckCircle color={KL_BRAND} /> Connect with a community of workers</div>
        </div>
        <div style={styles.missionQuote}>
          <FaHeart size={50} color={KL_BRAND} />
          <h3>Protecting Kenyan Workers</h3>
          <p>"Every worker deserves to return home safely"</p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <div key={idx} style={styles.statCard}>
            <h2>{stat.number}</h2>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>

      <h2 style={styles.sectionTitle}>Our Core Values</h2>
      <div style={styles.valuesGrid}>
        {values.map((value, idx) => (
          <div key={idx} style={styles.valueCard}>
            <value.icon size={45} color={KL_BRAND} />
            <h4>{value.title}</h4>
            <p>{value.desc}</p>
          </div>
        ))}
      </div>

      <h2 style={styles.sectionTitle}>How KAZI LINDA Works</h2>
      <div style={styles.stepsGrid}>
        <div style={styles.stepCard}><div style={styles.stepNumber}>1</div><h4>Find Jobs</h4><p>Browse verified job listings from trusted employers</p></div>
        <div style={styles.stepCard}><div style={styles.stepNumber}>2</div><h4>Verify Employer</h4><p>Check employer legitimacy before accepting an offer</p></div>
        <div style={styles.stepCard}><div style={styles.stepNumber}>3</div><h4>Stay Safe</h4><p>Access emergency support and daily check-ins</p></div>
      </div>

      <div style={styles.ctaCard}>
        <h3>Ready to find safe employment?</h3>
        <p>Join thousands of Kenyans who trust KAZI LINDA</p>
        <Button as={Link} to="/register" style={styles.ctaBtn}>Register Now</Button>
      </div>
    </div>
  );
};

const styles = {
  page: { background: '#f0f2f5', minHeight: '100vh', padding: '40px 20px' },
  heroSection: { textAlign: 'center', marginBottom: '40px' },
  heroTitle: { fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', color: '#050505' },
  heroSubtitle: { fontSize: '20px', color: '#65676b' },
  missionSection: { display: 'flex', gap: '32px', maxWidth: '1200px', margin: '0 auto 48px', flexWrap: 'wrap' },
  missionContent: { flex: 2 },
  missionQuote: { flex: 1, background: '#fef9e7', borderRadius: '16px', padding: '24px', textAlign: 'center' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', maxWidth: '1200px', margin: '0 auto 48px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,.1)' },
  sectionTitle: { textAlign: 'center', fontSize: '28px', fontWeight: 'bold', marginBottom: '32px' },
  valuesGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', maxWidth: '1200px', margin: '0 auto 48px' },
  valueCard: { background: '#fff', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,.1)' },
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', maxWidth: '1200px', margin: '0 auto 48px' },
  stepCard: { background: '#fff', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,.1)' },
  stepNumber: { width: '40px', height: '40px', borderRadius: '50%', background: KL_BRAND, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 'bold' },
  ctaCard: { background: '#fef9e7', borderRadius: '16px', padding: '48px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' },
  ctaBtn: { background: KL_BRAND, border: 'none', borderRadius: '8px', padding: '12px 32px', fontWeight: 'bold', color: '#fff' },
};

export default About;
