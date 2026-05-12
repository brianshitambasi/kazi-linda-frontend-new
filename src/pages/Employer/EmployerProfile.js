import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaBuilding, FaMapMarkerAlt, FaUsers, FaSave } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import toast from 'react-hot-toast';

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
        <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
      </DashboardLayout>
    );
  }

  const benefitOptions = [
    { value: 'medical_insurance', label: 'Ìø• Medical Insurance' },
    { value: 'flight_ticket', label: '‚úàÔ∏è Annual Flight Ticket' },
    { value: 'annual_leave', label: 'Ìº¥ Annual Leave' },
    { value: 'accommodation', label: 'Ìø† Free Accommodation' },
    { value: 'transport', label: 'ÔøΩÔøΩ Transportation Allowance' },
    { value: 'education', label: 'Ì≥ö Education Allowance' }
  ];

  return (
    <DashboardLayout title="Employer Profile">
      <div className="employer-profile">
        <Alert variant="info" className="mb-4">
          <strong>Ì≤° Complete your profile to attract the best workers!</strong> A detailed profile increases trust and gets more applications.
        </Alert>

        <Form>
          {/* Basic Information */}
          <Card className="mb-4">
            <Card.Header><FaBuilding /> Basic Information</Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name *</Form.Label>
                    <Form.Control
                      value={formData.name || ''}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="Your full name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Name (if applicable)</Form.Label>
                    <Form.Control
                      value={formData.companyName || ''}
                      onChange={e => handleChange('companyName', e.target.value)}
                      placeholder="e.g., ABC Company"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number *</Form.Label>
                    <Form.Control
                      value={formData.phone || ''}
                      onChange={e => handleChange('phone', e.target.value)}
                      placeholder="+254 700 000000"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Alternative Phone</Form.Label>
                    <Form.Control
                      value={formData.alternativePhone || ''}
                      onChange={e => handleChange('alternativePhone', e.target.value)}
                      placeholder="Alternative contact number"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Location */}
          <Card className="mb-4">
            <Card.Header><FaMapMarkerAlt /> Location</Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Country *</Form.Label>
                    <Form.Control
                      value={formData.country || ''}
                      onChange={e => handleChange('country', e.target.value)}
                      placeholder="e.g., Saudi Arabia, UAE, Kenya"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City *</Form.Label>
                    <Form.Control
                      value={formData.city || ''}
                      onChange={e => handleChange('city', e.target.value)}
                      placeholder="e.g., Riyadh, Dubai, Nairobi"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Street Address</Form.Label>
                <Form.Control
                  value={formData.address || ''}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="Street address"
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Household Information */}
          <Card className="mb-4">
            <Card.Header><FaUsers /> Household Information</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type of Residence</Form.Label>
                    <Form.Select
                      value={formData.householdType || 'house'}
                      onChange={e => handleChange('householdType', e.target.value)}
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
                    <Form.Label>Number of Family Members</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.householdSize || 1}
                      onChange={e => handleChange('householdSize', parseInt(e.target.value))}
                      min={1}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Number of Children</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.numberOfChildren || 0}
                      onChange={e => handleChange('numberOfChildren', parseInt(e.target.value))}
                      min={0}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Number of Rooms</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.numberOfRooms || 1}
                      onChange={e => handleChange('numberOfRooms', parseInt(e.target.value))}
                      min={1}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Has Pets?</Form.Label>
                    <Form.Select
                      value={formData.hasPets}
                      onChange={e => handleChange('hasPets', e.target.value === 'true')}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              {formData.hasPets && (
                <Form.Group className="mb-3">
                  <Form.Label>Pets in the House</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      placeholder="e.g., Dog, Cat"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleArrayAdd('pets', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                  <div className="mt-2">
                    {(formData.pets || []).map((pet, i) => (
                      <span key={i} className="badge bg-secondary me-2 mb-2" onClick={() => handleArrayRemove('pets', i)} style={{ cursor: 'pointer' }}>
                        {pet} ‚úï
                      </span>
                    ))}
                  </div>
                </Form.Group>
              )}
            </Card.Body>
          </Card>

          {/* Work Conditions */}
          <Card className="mb-4">
            <Card.Header>Ì≥ã Work Conditions</Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Working Hours</Form.Label>
                    <Form.Control
                      value={formData.workingHours || '8 hours/day'}
                      onChange={e => handleChange('workingHours', e.target.value)}
                      placeholder="e.g., 8 hours/day"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Days Off</Form.Label>
                    <Form.Control
                      value={formData.daysOff || '1 day/week'}
                      onChange={e => handleChange('daysOff', e.target.value)}
                      placeholder="e.g., 1 day/week"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Accommodation</Form.Label>
                    <Form.Select
                      value={formData.accommodation || 'provided'}
                      onChange={e => handleChange('accommodation', e.target.value)}
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
                    <Form.Label>Food</Form.Label>
                    <Form.Select
                      value={formData.food || 'provided'}
                      onChange={e => handleChange('food', e.target.value)}
                    >
                      <option value="provided">Provided</option>
                      <option value="allowance">Allowance</option>
                      <option value="none">Not Provided</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Transportation</Form.Label>
                    <Form.Select
                      value={formData.transportation || 'none'}
                      onChange={e => handleChange('transportation', e.target.value)}
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
          <Card className="mb-4">
            <Card.Header>ÌæÅ Benefits Package</Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Form.Label>Select Benefits</Form.Label>
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
                <Form.Label>Other Benefits</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.otherBenefits || ''}
                  onChange={e => handleChange('otherBenefits', e.target.value)}
                  placeholder="Describe any additional benefits"
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Requirements */}
          <Card className="mb-4">
            <Card.Header>Ì±§ Worker Requirements</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Education Level</Form.Label>
                    <Form.Select
                      value={formData.educationLevel || 'none'}
                      onChange={e => handleChange('educationLevel', e.target.value)}
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
                    <Form.Label>Experience Required</Form.Label>
                    <Form.Select
                      value={formData.experience || 'none'}
                      onChange={e => handleChange('experience', e.target.value)}
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
                    <Form.Label>Gender Preference</Form.Label>
                    <Form.Select
                      value={formData.genderPreference || 'any'}
                      onChange={e => handleChange('genderPreference', e.target.value)}
                    >
                      <option value="any">Any</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group>
                <Form.Label>Age Preference</Form.Label>
                <Form.Control
                  value={formData.agePreference || ''}
                  onChange={e => handleChange('agePreference', e.target.value)}
                  placeholder="e.g., 25-40 years"
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Save Button */}
          <div className="text-end mb-5">
            <Button variant="warning" onClick={handleSave} disabled={saving} size="lg">
              <FaSave className="me-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </Form>
      </div>

      <style>{`
        .employer-profile .card-header {
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
          color: white;
          font-weight: 600;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default EmployerProfile;
