import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaBuilding, FaMapMarkerAlt, FaUsers, FaSave, FaLeaf, FaBed, FaUtensils, FaCar, FaGraduationCap, FaBriefcase, FaVenusMars, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';
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
  text: '#1B5E20'
};

const EmployerProfile = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    alternativePhone: '',
    address: '',
    city: '',
    country: '',
    householdType: 'house',
    householdSize: 1,
    numberOfChildren: 0,
    numberOfRooms: 1,
    hasPets: false,
    pets: [],
    workingHours: '8 hours/day',
    daysOff: '1 day/week',
    accommodation: 'provided',
    food: 'provided',
    transportation: 'none',
    benefits: [],
    otherBenefits: '',
    educationLevel: 'none',
    experience: 'none',
    genderPreference: 'any',
    agePreference: '',
    emergencyContact: { name: '', phone: '', relationship: '' }
  });

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('https://kazi-linda.onrender.com/api/employers/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setFormData(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayAdd = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleBenefitToggle = (benefit) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('https://kazi-linda.onrender.com/api/employers/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success('Profile saved successfully!');
        fetchProfile();
      } else {
        toast.error('Failed to save profile');
      }
    } catch (err) {
      toast.error('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Employer Profile">
        <div className="text-center py-5"><Spinner animation="border" style={{ color: colors.primary }} /></div>
      </DashboardLayout>
    );
  }

  const benefitOptions = [
    { value: 'medical_insurance', label: '��� Medical Insurance' },
    { value: 'flight_ticket', label: '✈️ Annual Flight Ticket' },
    { value: 'annual_leave', label: '��� Annual Leave' },
    { value: 'accommodation', label: '�� Free Accommodation' },
    { value: 'transport', label: '��� Transportation Allowance' },
    { value: 'education', label: '��� Education Allowance' }
  ];

  return (
    <DashboardLayout title="Employer Profile">
      <div className="employer-profile">
        <Alert variant="success" className="mb-4" style={{ background: colors.light, borderColor: colors.accent, color: colors.text }}>
          <FaLeaf className="me-2" />
          <strong>��� Complete your profile to attract the best workers!</strong> A detailed profile increases trust and gets more applications.
        </Alert>

        <Form>
          {/* Basic Information */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header style={{ background: colors.gradient, color: '#fff', borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
              <FaBuilding className="me-2" /> Basic Information
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}>Full Name *</Form.Label>
                    <Form.Control
                      value={formData.name || ''}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="Your full name"
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}>Company Name (if applicable)</Form.Label>
                    <Form.Control
                      value={formData.companyName || ''}
                      onChange={e => handleChange('companyName', e.target.value)}
                      placeholder="e.g., ABC Company"
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}>Phone Number *</Form.Label>
                    <Form.Control
                      value={formData.phone || ''}
                      onChange={e => handleChange('phone', e.target.value)}
                      placeholder="+254 700 000000"
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}>Alternative Phone</Form.Label>
                    <Form.Control
                      value={formData.alternativePhone || ''}
                      onChange={e => handleChange('alternativePhone', e.target.value)}
                      placeholder="Alternative contact number"
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Location */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header style={{ background: colors.gradient, color: '#fff', borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
              <FaMapMarkerAlt className="me-2" /> Location
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}>Country *</Form.Label>
                    <Form.Control
                      value={formData.country || ''}
                      onChange={e => handleChange('country', e.target.value)}
                      placeholder="e.g., Saudi Arabia, UAE, Kenya"
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}>City *</Form.Label>
                    <Form.Control
                      value={formData.city || ''}
                      onChange={e => handleChange('city', e.target.value)}
                      placeholder="e.g., Riyadh, Dubai, Nairobi"
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: colors.text, fontWeight: 500 }}>Street Address</Form.Label>
                <Form.Control
                  value={formData.address || ''}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="Street address"
                  style={{ borderRadius: 10, borderColor: colors.accent }}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Household Information */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header style={{ background: colors.gradient, color: '#fff', borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
              <FaUsers className="me-2" /> Household Information
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}>Type of Residence</Form.Label>
                    <Form.Select
                      value={formData.householdType || 'house'}
                      onChange={e => handleChange('householdType', e.target.value)}
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    >
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="house">House</option>
                      <option value="farm">Farm</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}>Number of Family Members</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.householdSize || 1}
                      onChange={e => handleChange('householdSize', parseInt(e.target.value))}
                      min={1}
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}>Number of Children</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.numberOfChildren || 0}
                      onChange={e => handleChange('numberOfChildren', parseInt(e.target.value))}
                      min={0}
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}>Number of Rooms</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.numberOfRooms || 1}
                      onChange={e => handleChange('numberOfRooms', parseInt(e.target.value))}
                      min={1}
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}>Has Pets?</Form.Label>
                    <Form.Select
                      value={formData.hasPets}
                      onChange={e => handleChange('hasPets', e.target.value === 'true')}
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              {formData.hasPets && (
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: colors.text, fontWeight: 500 }}>Pets in the House</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      placeholder="e.g., Dog, Cat"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleArrayAdd('pets', e.target.value);
                          e.target.value = '';
                        }
                      }}
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    />
                  </div>
                  <div className="mt-2">
                    {(formData.pets || []).map((pet, i) => (
                      <span key={i} className="badge me-2 mb-2" style={{ background: colors.accent, color: colors.text, cursor: 'pointer', padding: '8px 12px', borderRadius: 20 }} onClick={() => handleArrayRemove('pets', i)}>
                        {pet} ✕
                      </span>
                    ))}
                  </div>
                </Form.Group>
              )}
            </Card.Body>
          </Card>

          {/* Work Conditions */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header style={{ background: colors.gradient, color: '#fff', borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
              ��� Work Conditions
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}>Working Hours</Form.Label>
                    <Form.Control
                      value={formData.workingHours || '8 hours/day'}
                      onChange={e => handleChange('workingHours', e.target.value)}
                      placeholder="e.g., 8 hours/day"
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}>Days Off</Form.Label>
                    <Form.Control
                      value={formData.daysOff || '1 day/week'}
                      onChange={e => handleChange('daysOff', e.target.value)}
                      placeholder="e.g., 1 day/week"
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}><FaBed className="me-1" /> Accommodation</Form.Label>
                    <Form.Select
                      value={formData.accommodation || 'provided'}
                      onChange={e => handleChange('accommodation', e.target.value)}
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    >
                      <option value="provided">Provided</option>
                      <option value="allowance">Allowance</option>
                      <option value="shared">Shared Room</option>
                      <option value="none">Not Provided</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}><FaUtensils className="me-1" /> Food</Form.Label>
                    <Form.Select
                      value={formData.food || 'provided'}
                      onChange={e => handleChange('food', e.target.value)}
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    >
                      <option value="provided">Provided</option>
                      <option value="allowance">Allowance</option>
                      <option value="none">Not Provided</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}><FaCar className="me-1" /> Transportation</Form.Label>
                    <Form.Select
                      value={formData.transportation || 'none'}
                      onChange={e => handleChange('transportation', e.target.value)}
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    >
                      <option value="provided">Provided</option>
                      <option value="allowance">Allowance</option>
                      <option value="none">Not Provided</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Benefits */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header style={{ background: colors.gradient, color: '#fff', borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
              ��� Benefits Package
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Form.Label style={{ color: colors.text, fontWeight: 500 }}>Select Benefits</Form.Label>
                <div className="d-flex flex-wrap gap-3">
                  {benefitOptions.map(benefit => (
                    <Form.Check
                      key={benefit.value}
                      type="checkbox"
                      label={benefit.label}
                      checked={(formData.benefits || []).includes(benefit.value)}
                      onChange={() => handleBenefitToggle(benefit.value)}
                    />
                  ))}
                </div>
              </div>
              <Form.Group>
                <Form.Label style={{ color: colors.text, fontWeight: 500 }}>Other Benefits</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.otherBenefits || ''}
                  onChange={e => handleChange('otherBenefits', e.target.value)}
                  placeholder="Describe any additional benefits"
                  style={{ borderRadius: 10, borderColor: colors.accent }}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Requirements */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header style={{ background: colors.gradient, color: '#fff', borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
              ��� Worker Requirements
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}><FaGraduationCap className="me-1" /> Education Level</Form.Label>
                    <Form.Select
                      value={formData.educationLevel || 'none'}
                      onChange={e => handleChange('educationLevel', e.target.value)}
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    >
                      <option value="none">No formal education</option>
                      <option value="primary">Primary School</option>
                      <option value="secondary">Secondary School</option>
                      <option value="diploma">Diploma</option>
                      <option value="degree">Bachelor's Degree</option>
                      <option value="masters">Master's Degree</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}><FaBriefcase className="me-1" /> Experience Required</Form.Label>
                    <Form.Select
                      value={formData.experience || 'none'}
                      onChange={e => handleChange('experience', e.target.value)}
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    >
                      <option value="none">No experience needed</option>
                      <option value="1_year">1+ year</option>
                      <option value="2_5_years">2-5 years</option>
                      <option value="5_10_years">5-10 years</option>
                      <option value="10+_years">10+ years</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: 500 }}><FaVenusMars className="me-1" /> Gender Preference</Form.Label>
                    <Form.Select
                      value={formData.genderPreference || 'any'}
                      onChange={e => handleChange('genderPreference', e.target.value)}
                      style={{ borderRadius: 10, borderColor: colors.accent }}
                    >
                      <option value="any">Any</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group>
                <Form.Label style={{ color: colors.text, fontWeight: 500 }}><FaCalendarAlt className="me-1" /> Age Preference</Form.Label>
                <Form.Control
                  value={formData.agePreference || ''}
                  onChange={e => handleChange('agePreference', e.target.value)}
                  placeholder="e.g., 25-40 years"
                  style={{ borderRadius: 10, borderColor: colors.accent }}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Save Button */}
          <div className="text-end mb-5">
            <Button onClick={handleSave} disabled={saving} size="lg" style={{ background: colors.gradient, border: 'none', borderRadius: 50, padding: '12px 32px' }}>
              <FaSave className="me-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </Form>
      </div>

      <style>{`
        .employer-profile .card {
          border-radius: 12px;
          overflow: hidden;
        }
        .employer-profile .form-control:focus, 
        .employer-profile .form-select:focus {
          border-color: ${colors.primary};
          box-shadow: 0 0 0 0.2rem rgba(46,125,50,0.25);
        }
      `}</style>
    </DashboardLayout>
  );
};

export default EmployerProfile;
