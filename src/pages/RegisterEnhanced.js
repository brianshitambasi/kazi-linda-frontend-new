import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Card, Container, Row, Col, Alert, ProgressBar, Badge, Image } from 'react-bootstrap';
import { 
  FaUser, FaEnvelope, FaPhone, FaLock, FaUserPlus, FaCheckCircle, 
  FaBuilding, FaBriefcase, FaShieldAlt, FaArrowRight, FaArrowLeft,
  FaGlobe, FaMapMarkerAlt, FaLanguage, FaCamera
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const KL_BRAND = '#f39c12';

const RegisterEnhanced = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'worker',
    countryOfOrigin: 'Kenya',
    currentCountry: '',
    currentCity: '',
    bio: '',
    skills: [],
    experience: '',
    languages: [],
    nextOfKin: { name: '', phone: '', relationship: '' }
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [languageProficiency, setLanguageProficiency] = useState('fluent');

  const roleOptions = [
    { value: 'worker', label: 'Job Seeker / Worker', icon: FaBriefcase, desc: 'Looking for employment opportunities', color: 'success' },
    { value: 'employer', label: 'Employer', icon: FaBuilding, desc: 'Hire workers for your business', color: 'primary' },
    { value: 'recruiter', label: 'Recruiter / Agency', icon: FaUserPlus, desc: 'Recruitment agency representative', color: 'info' },
    { value: 'embassy', label: 'Embassy Staff', icon: FaShieldAlt, desc: 'Government/Embassy personnel', color: 'danger' }
  ];

  const uploadProfilePicture = async (file, authToken) => {
    if (!file) return null;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'kazi_linda_uploads');
    
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/denczbmin/image/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.secure_url) {
        await fetch('https://kazi-linda.onrender.com/api/profile/me', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ profilePicture: data.secure_url })
        });
        return data.secure_url;
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
    return null;
  };

  const handleProfilePictureSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
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

  const addLanguage = () => {
    if (languageInput.trim()) {
      setFormData({
        ...formData,
        languages: [...formData.languages, { name: languageInput.trim(), proficiency: languageProficiency }]
      });
      setLanguageInput('');
      setLanguageProficiency('fluent');
    }
  };

  const removeLanguage = (index) => {
    setFormData({ ...formData, languages: formData.languages.filter((_, i) => i !== index) });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const registerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      };
      
      await register(registerData);
      const token = localStorage.getItem('token');
      
      if (profilePictureFile) {
        await uploadProfilePicture(profilePictureFile, token);
      }
      
      await fetch('https://kazi-linda.onrender.com/api/profile/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio: formData.bio,
          countryOfOrigin: formData.countryOfOrigin,
          currentCountry: formData.currentCountry,
          currentCity: formData.currentCity,
          skills: formData.skills,
          experience: formData.experience,
          nextOfKin: formData.nextOfKin
        })
      });
      
      for (const lang of formData.languages) {
        await fetch('https://kazi-linda.onrender.com/api/profile/language', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(lang)
        });
      }
      
      toast.success('Account created successfully!');
      const dashboards = {
        worker: '/dashboard',
        employer: '/employer/dashboard',
        admin: '/admin/dashboard',
        recruiter: '/recruiter/dashboard',
        embassy: '/embassy/dashboard'
      };
      navigate(dashboards[formData.role] || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => (step / 4) * 100;

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <div className="mb-4">
            <ProgressBar now={getProgress()} label={`${Math.round(getProgress())}% Complete`} variant="warning" />
            <div className="d-flex justify-content-between mt-2">
              <small className={step >= 1 ? 'text-warning' : 'text-muted'}>Basic Info</small>
              <small className={step >= 2 ? 'text-warning' : 'text-muted'}>Personal Info</small>
              <small className={step >= 3 ? 'text-warning' : 'text-muted'}>Professional</small>
              <small className={step >= 4 ? 'text-warning' : 'text-muted'}>Emergency</small>
            </div>
          </div>

          <Card className="shadow-lg border-0">
            <Card.Body className="p-4 p-lg-5">
              <div className="text-center mb-4">
                <div style={{ background: KL_BRAND + '20', borderRadius: '50%', width: 64, height: 64, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <FaUserPlus size={32} color={KL_BRAND} />
                </div>
                <h2 className="fw-bold">Create Your Account</h2>
                <p className="text-muted">Join KAZI LINDA today - It's free!</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={step === 4 ? handleSubmit : (e) => e.preventDefault()}>
                {step === 1 && (
                  <div>
                    <h5 className="mb-3">Basic Information</h5>
                    
                    <div className="text-center mb-3">
                      <div className="position-relative d-inline-block">
                        {profilePicturePreview ? (
                          <Image src={profilePicturePreview} roundedCircle width="100" height="100" className="border" />
                        ) : (
                          <FaUser size={100} className="text-muted" />
                        )}
                        <label className="position-absolute bottom-0 end-0 bg-warning rounded-circle p-2" style={{ cursor: 'pointer' }}>
                          <FaCamera size={16} />
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePictureSelect} />
                        </label>
                      </div>
                      <small className="text-muted d-block mt-2">Add a profile picture (optional)</small>
                    </div>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaUser /></span>
                        <Form.Control name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required />
                      </div>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaEnvelope /></span>
                        <Form.Control name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required />
                      </div>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaPhone /></span>
                        <Form.Control name="phone" value={formData.phone} onChange={handleChange} placeholder="0712345678" required />
                      </div>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaLock /></span>
                        <Form.Control name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Create password" required />
                      </div>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaCheckCircle /></span>
                        <Form.Control name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" required />
                      </div>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>I am a:</Form.Label>
                      <Row>
                        {roleOptions.map(role => (
                          <Col md={6} key={role.value} className="mb-2">
                            <div className={`border rounded p-3 cursor-pointer ${formData.role === role.value ? 'border-warning bg-warning bg-opacity-10' : 'border-secondary'}`}
                                 onClick={() => setFormData({ ...formData, role: role.value })} style={{ cursor: 'pointer' }}>
                              <div className="d-flex align-items-center">
                                <role.icon size={24} className={`text-${role.color} me-3`} />
                                <div><div className="fw-bold">{role.label}</div><small className="text-muted">{role.desc}</small></div>
                                {formData.role === role.value && <FaCheckCircle className="text-warning ms-auto" />}
                              </div>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </Form.Group>
                  </div>
                )}
                
                {step === 2 && (
                  <div>
                    <h5 className="mb-3">Personal Information</h5>
                    <Form.Group className="mb-3"><Form.Label>Bio / About You</Form.Label><Form.Control as="textarea" rows={3} name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." /></Form.Group>
                    <Row><Col md={6}><Form.Group><Form.Label><FaGlobe className="me-2" /> Country of Origin</Form.Label><Form.Select name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleChange}><option>Kenya</option><option>Uganda</option><option>Tanzania</option></Form.Select></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label><FaMapMarkerAlt className="me-2" /> Current Country</Form.Label><Form.Control name="currentCountry" value={formData.currentCountry} onChange={handleChange} placeholder="e.g., UAE" /></Form.Group></Col></Row>
                    <Form.Group><Form.Label>Current City</Form.Label><Form.Control name="currentCity" value={formData.currentCity} onChange={handleChange} placeholder="e.g., Dubai" /></Form.Group>
                  </div>
                )}
                
                {step === 3 && (
                  <div>
                    <h5 className="mb-3">Professional Information</h5>
                    <Form.Group className="mb-3"><Form.Label>Skills</Form.Label><div className="d-flex mb-2"><Form.Control type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="e.g., Carpentry" onKeyPress={e => e.key === 'Enter' && addSkill()} /><Button variant="outline-warning" onClick={addSkill} className="ms-2">Add</Button></div><div className="d-flex flex-wrap gap-2">{formData.skills.map((skill, idx) => (<Badge key={idx} bg="info" className="px-3 py-2" style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)}>{skill} ✕</Badge>))}</div></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Experience</Form.Label><Form.Control as="textarea" rows={2} name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g., 5 years in construction..." /></Form.Group>
                    <Form.Group><Form.Label><FaLanguage className="me-2" /> Languages</Form.Label><div className="d-flex gap-2 mb-2"><Form.Control type="text" value={languageInput} onChange={e => setLanguageInput(e.target.value)} placeholder="Language" style={{ flex: 2 }} /><Form.Select value={languageProficiency} onChange={e => setLanguageProficiency(e.target.value)} style={{ flex: 1 }}><option value="basic">Basic</option><option value="intermediate">Intermediate</option><option value="fluent">Fluent</option><option value="native">Native</option></Form.Select><Button variant="outline-warning" onClick={addLanguage}>Add</Button></div><div>{formData.languages.map((lang, idx) => (<Badge key={idx} bg="secondary" className="me-2 mb-2 px-3 py-2" style={{ cursor: 'pointer' }} onClick={() => removeLanguage(idx)}>{lang.name} - {lang.proficiency} ✕</Badge>))}</div></Form.Group>
                  </div>
                )}
                
                {step === 4 && (
                  <div>
                    <h5 className="mb-3">Emergency Contact</h5>
                    <p className="text-muted small mb-3">This information will only be used in case of emergency</p>
                    <Form.Group className="mb-3"><Form.Label>Emergency Contact Name</Form.Label><Form.Control value={formData.nextOfKin.name} onChange={e => setFormData({ ...formData, nextOfKin: { ...formData.nextOfKin, name: e.target.value } })} placeholder="Full name" /></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Emergency Contact Phone</Form.Label><Form.Control value={formData.nextOfKin.phone} onChange={e => setFormData({ ...formData, nextOfKin: { ...formData.nextOfKin, phone: e.target.value } })} placeholder="Phone number" /></Form.Group>
                    <Form.Group><Form.Label>Relationship</Form.Label><Form.Control value={formData.nextOfKin.relationship} onChange={e => setFormData({ ...formData, nextOfKin: { ...formData.nextOfKin, relationship: e.target.value } })} placeholder="e.g., Parent, Spouse" /></Form.Group>
                  </div>
                )}
                
                <div className="d-flex justify-content-between mt-4">
                  {step > 1 && <Button variant="outline-secondary" onClick={handleBack}><FaArrowLeft className="me-2" /> Back</Button>}
                  {step < 4 ? <Button style={{ background: KL_BRAND, border: 'none' }} onClick={handleNext} className={step === 1 ? 'w-100' : ''}>Continue <FaArrowRight className="ms-2" /></Button> : <Button style={{ background: KL_BRAND, border: 'none' }} type="submit" disabled={loading} className="w-100">{loading ? 'Creating Account...' : 'Create Account'}</Button>}
                </div>
              </Form>
              
              <div className="text-center mt-4"><Link to="/login" className="text-decoration-none" style={{ color: KL_BRAND }}>Already have an account? Login</Link></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterEnhanced;