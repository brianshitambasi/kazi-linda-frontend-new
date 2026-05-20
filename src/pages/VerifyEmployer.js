import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { 
  FaSearch, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, 
  FaBuilding, FaMapMarkerAlt, FaBriefcase, FaStar, FaClock, FaUsers
} from 'react-icons/fa';
import { employerAPI } from '../services/api';
import Logo from '../components/Common/Logo';
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

const VerifyEmployer = () => {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employerData, setEmployerData] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!name || !country) {
      toast.error('Please enter employer name and country');
      return;
    }

    setLoading(true);
    try {
      const res = await employerAPI.verify({ name, country });
      setResult(res.data);
      
      if (res.data.employer?._id) {
        const statsRes = await employerAPI.getStats(res.data.employer._id);
        setEmployerData(statsRes.data);
      } else {
        setEmployerData(null);
      }
    } catch (err) {
      toast.error('Failed to verify employer');
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar key={i} className={i <= fullStars ? 'text-warning' : 'text-muted'} />
      );
    }
    return stars;
  };

  return (
    <div style={styles.page}>
      <Container className="py-4">
        <div className="text-center mb-5">
          <div style={styles.logoWrapper}>
            <Logo size={60} />
          </div>
          <h1 style={styles.title}>Verify Employer</h1>
          <p style={styles.subtitle}>Check employer history and track record before accepting a job</p>
        </div>

        <Row className="justify-content-center">
          <Col md={6}>
            <Card style={styles.card}>
              <Card.Body style={styles.cardBody}>
                <Form onSubmit={handleVerify}>
                  <Form.Group className="mb-3">
                    <Form.Label style={styles.label}>Employer Name</Form.Label>
                    <div className="input-group">
                      <span style={styles.inputGroupText}><FaBuilding style={{ color: colors.primary }} /></span>
                      <Form.Control
                        type="text"
                        placeholder="Enter employer name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        style={styles.input}
                      />
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label style={styles.label}>Country</Form.Label>
                    <div className="input-group">
                      <span style={styles.inputGroupText}><FaMapMarkerAlt style={{ color: colors.primary }} /></span>
                      <Form.Control
                        type="text"
                        placeholder="Enter country"
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        required
                        style={styles.input}
                      />
                    </div>
                  </Form.Group>
                  <Button type="submit" disabled={loading} style={styles.verifyBtn}>
                    {loading ? <Spinner animation="border" size="sm" /> : <><FaSearch className="me-2" /> Verify Employer</>}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {result && (
          <Row className="justify-content-center mt-4">
            <Col md={8}>
              {result.blacklisted ? (
                <Card style={styles.blacklistCard}>
                  <Card.Body style={styles.blacklistCardBody}>
                    <FaExclamationTriangle size={50} style={styles.dangerIcon} className="mb-3" />
                    <h3 style={styles.blacklistTitle}>⚠️ BLACKLISTED</h3>
                    <p style={styles.blacklistText}>Reason: {result.blacklistReason}</p>
                    <hr style={styles.divider} />
                    <p style={styles.warningText}>This employer has been reported for workplace violations.</p>
                  </Card.Body>
                </Card>
              ) : result.employer?._id ? (
                <>
                  <Card style={styles.resultCard}>
                    <Card.Body style={styles.resultCardBody}>
                      <div style={styles.resultHeader}>
                        {result.employer.verified ? (
                          <FaCheckCircle size={40} style={styles.successIcon} />
                        ) : (
                          <FaShieldAlt size={40} style={styles.warningIcon} />
                        )}
                        <h3 style={styles.employerName}>{result.employer.name}</h3>
                        <p style={styles.companyName}>{result.employer.companyName || 'Individual Employer'}</p>
                        <div style={styles.ratingContainer}>
                          {getRatingStars(result.employer.rating)}
                          <span style={styles.reviewCount}>({result.employer.totalRatings} reviews)</span>
                        </div>
                      </div>
                      <hr style={styles.divider} />
                      <Row>
                        <Col md={6}>
                          <p style={styles.infoText}><FaMapMarkerAlt style={{ color: colors.primary }} className="me-2" /> Country: {result.employer.country}</p>
                          <p style={styles.infoText}><FaClock style={{ color: colors.primary }} className="me-2" /> Member since: {new Date(result.employer.memberSince).toLocaleDateString()}</p>
                        </Col>
                        <Col md={6}>
                          <p style={styles.infoText}><FaUsers style={{ color: colors.primary }} className="me-2" /> Total Hired: {employerData?.stats?.hiredCount || 0}</p>
                          <p style={styles.infoText}><FaBriefcase style={{ color: colors.primary }} className="me-2" /> Jobs Posted: {employerData?.stats?.totalJobsPosted || 0}</p>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {result.complaints > 0 && (
                    <Alert variant="danger" style={styles.complaintAlert}>
                      <FaExclamationTriangle className="me-2" />
                      This employer has {result.complaints} complaint{result.complaints !== 1 ? 's' : ''} on record.
                    </Alert>
                  )}
                </>
              ) : (
                <Card style={styles.cleanCard}>
                  <Card.Body style={styles.cleanCardBody}>
                    <FaCheckCircle size={50} style={styles.successIcon} className="mb-3" />
                    <h3 style={styles.cleanTitle}>✓ CLEAN</h3>
                    <p style={styles.cleanText}>No blacklist records found for this employer.</p>
                    <p style={styles.hintText}>This employer is not in our database yet.</p>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

const styles = {
  page: { background: colors.gradientLight, minHeight: '100vh' },
  logoWrapper: { marginBottom: 20 },
  title: { fontSize: '2.5rem', fontWeight: 700, color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: '1.1rem', color: '#65676b' },
  card: { border: 'none', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#fff' },
  cardBody: { padding: '32px' },
  label: { fontWeight: 600, color: colors.text, marginBottom: 8 },
  inputGroupText: { background: colors.light, border: `1px solid ${colors.border}`, borderRight: 'none', borderRadius: '12px 0 0 12px' },
  input: { border: `1px solid ${colors.border}`, borderRadius: '0 12px 12px 0', padding: '12px', '&:focus': { borderColor: colors.primary, boxShadow: `0 0 0 0.2rem ${colors.primary}25` } },
  verifyBtn: { background: colors.gradient, border: 'none', borderRadius: 50, padding: '12px 24px', fontWeight: 600, width: '100%', transition: 'all 0.3s', '&:hover': { opacity: 0.9, transform: 'translateY(-2px)' } },
  blacklistCard: { border: 'none', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#fff0f0', borderLeft: `4px solid ${colors.danger}` },
  blacklistCardBody: { padding: '32px', textAlign: 'center' },
  dangerIcon: { color: colors.danger },
  blacklistTitle: { color: colors.danger, marginBottom: 16 },
  blacklistText: { marginBottom: 16, fontSize: 16 },
  divider: { borderColor: colors.border, margin: '16px 0' },
  warningText: { color: '#65676b', fontSize: 14 },
  resultCard: { border: 'none', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#fff', borderTop: `4px solid ${colors.primary}` },
  resultCardBody: { padding: '32px' },
  resultHeader: { textAlign: 'center', marginBottom: 24 },
  successIcon: { color: colors.secondary },
  warningIcon: { color: colors.warning },
  employerName: { fontSize: '1.75rem', fontWeight: 700, color: colors.text, marginTop: 12, marginBottom: 4 },
  companyName: { color: '#65676b', marginBottom: 8 },
  ratingContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  reviewCount: { fontSize: 14, color: '#65676b' },
  infoText: { fontSize: 14, color: '#050505', marginBottom: 8 },
  complaintAlert: { marginTop: 16, borderRadius: 12, background: colors.light, borderColor: colors.danger, color: colors.danger },
  cleanCard: { border: 'none', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#f0fff4', borderLeft: `4px solid ${colors.secondary}` },
  cleanCardBody: { padding: '32px', textAlign: 'center' },
  cleanTitle: { color: colors.secondary, marginBottom: 12 },
  cleanText: { fontSize: 16, marginBottom: 8 },
  hintText: { color: '#65676b', fontSize: 14 },
};

export default VerifyEmployer;
