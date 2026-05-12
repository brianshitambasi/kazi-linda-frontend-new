import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaUser, FaEnvelope, FaPhone, FaLock, FaUserPlus, FaCheckCircle,
  FaBuilding, FaBriefcase, FaShieldAlt, FaArrowRight, FaArrowLeft,
  FaGlobe, FaMapMarkerAlt, FaCamera, FaEye, FaEyeSlash
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const KL_BRAND  = '#f39c12';

/* ─── tiny reusable field ─── */
const Field = ({ label, icon: Icon, error, children }) => (
  <div style={s.fieldWrap}>
    {label && <label style={s.label}>{label}</label>}
    <div style={{ position: 'relative' }}>
      {Icon && <Icon style={s.fieldIcon} size={15} color="#65676b" />}
      {children}
    </div>
    {error && <div style={s.fieldError}>{error}</div>}
  </div>
);

const Input = ({ icon, style: extra, ...props }) => (
  <input style={{ ...s.input, paddingLeft: icon ? 38 : 14, ...extra }} {...props} />
);

const STEPS = ['Basic Info', 'Personal', 'Professional', 'Emergency'];

/* ════════════════════════════════════════ */
const RegisterEnhanced = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const [profilePictureFile, setProfilePictureFile]       = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    role: 'worker',
    countryOfOrigin: 'Kenya', currentCountry: '', currentCity: '', bio: '',
    skills: [], experience: '', languages: [],
    nextOfKin: { name: '', phone: '', relationship: '' },
  });

  const [skillInput, setSkillInput]                   = useState('');
  const [languageInput, setLanguageInput]             = useState('');
  const [languageProficiency, setLanguageProficiency] = useState('fluent');

  const roleOptions = [
    { value: 'worker',    label: 'Job Seeker',    icon: FaBriefcase, desc: 'Find employment',          color: '#31a24c' },
    { value: 'employer',  label: 'Employer',      icon: FaBuilding,  desc: 'Hire workers',             color: '#1877f2' },
    { value: 'recruiter', label: 'Recruiter',     icon: FaUserPlus,  desc: 'Recruitment agency',       color: '#7c3aed' },
    { value: 'embassy',   label: 'Embassy Staff', icon: FaShieldAlt, desc: 'Government / Embassy',     color: '#e41e3f' },
  ];

  /* ── helpers ── */
  const set = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));
  const handleChange = e => set(e.target.name, e.target.value);

  const handleProfilePic = e => {
    const file = e.target.files[0];
    if (file?.type.startsWith('image/')) {
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !formData.skills.includes(v)) {
      set('skills', [...formData.skills, v]);
      setSkillInput('');
    }
  };
  const removeSkill = skill => set('skills', formData.skills.filter(s => s !== skill));

  const addLanguage = () => {
    if (languageInput.trim()) {
      set('languages', [...formData.languages, { name: languageInput.trim(), proficiency: languageProficiency }]);
      setLanguageInput('');
      setLanguageProficiency('fluent');
    }
  };
  const removeLang = i => set('languages', formData.languages.filter((_, idx) => idx !== i));

  /* ── navigation ── */
  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        setError('Please fill in all required fields'); return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match'); return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters'); return;
      }
    }
    setError('');
    setStep(s => s + 1);
  };
  const handleBack = () => { setStep(s => s - 1); setError(''); };

  /* ── upload & submit ── */
  const uploadProfilePicture = async (file, token) => {
    if (!file) return null;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', 'kazi_linda_uploads');
    try {
      const res  = await fetch('https://api.cloudinary.com/v1_1/denczbmin/image/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.secure_url) {
        await fetch('https://kazi-linda.onrender.com/api/profile/me', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ profilePicture: data.secure_url }),
        });
        return data.secure_url;
      }
    } catch (err) { console.error('Upload error:', err); }
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password, role: formData.role });
      const token = localStorage.getItem('token');
      if (profilePictureFile) await uploadProfilePicture(profilePictureFile, token);
      await fetch('https://kazi-linda.onrender.com/api/profile/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: formData.bio, countryOfOrigin: formData.countryOfOrigin, currentCountry: formData.currentCountry, currentCity: formData.currentCity, skills: formData.skills, experience: formData.experience, nextOfKin: formData.nextOfKin }),
      });
      for (const lang of formData.languages) {
        await fetch('https://kazi-linda.onrender.com/api/profile/language', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(lang),
        });
      }
      toast.success('Account created successfully!');
      const dash = { worker: '/dashboard', employer: '/employer/dashboard', admin: '/admin/dashboard', recruiter: '/recruiter/dashboard', embassy: '/embassy/dashboard' };
      navigate(dash[formData.role] || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div style={s.page}>

      {/* ── Left panel (desktop only) ── */}
      <div style={s.leftPanel}>
        <div style={s.leftInner}>
          <div style={s.leftLogo}>KL</div>
          <h1 style={s.leftTitle}>KaziLinda</h1>
          <p style={s.leftSub}>Safe Jobs for Kenyans at Home and Abroad</p>
          <div style={s.leftFeatures}>
            {[
              '✅ Verified job listings',
              '���️ Employer blacklist',
              '�� Jobs in 15+ countries',
              '��� Worker community',
              '��� Contract verification',
            ].map(f => <div key={f} style={s.leftFeatureItem}>{f}</div>)}
          </div>
          <p style={s.leftFooter}>Already have an account?{' '}
            <Link to="/login" style={{ color: KL_BRAND, fontWeight: 700 }}>Log in</Link>
          </p>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div style={s.rightPanel}>
        <div style={s.formBox}>

          {/* Header */}
          <div style={s.formHeader}>
            <Link to="/" style={s.mobileLogo}>KL</Link>
            <h2 style={s.formTitle}>Create your account</h2>
            <p style={s.formSub}>Join KaziLinda today — it's free!</p>
          </div>

          {/* Step progress */}
          <div style={s.progressWrap}>
            <div style={s.progressTrack}>
              <div style={{ ...s.progressFill, width: `${progress}%` }} />
            </div>
            <div style={s.stepLabels}>
              {STEPS.map((label, i) => (
                <span key={label} style={{ ...s.stepLabel, color: step >= i + 1 ? KL_BRAND : '#bcc0c4', fontWeight: step === i + 1 ? 700 : 400 }}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div style={s.errorBanner}>
              ⚠️ {error}
            </div>
          )}

          {/* ── STEP 1: Basic Info ── */}
          {step === 1 && (
            <div>
              {/* Avatar picker */}
              <div style={s.avatarCenter}>
                <div style={s.avatarWrap}>
                  {profilePicturePreview
                    ? <img src={profilePicturePreview} alt="preview" style={s.avatarImg} />
                    : <div style={s.avatarPlaceholder}><FaUser size={40} color="#bcc0c4" /></div>
                  }
                  <label style={s.avatarCamBtn}>
                    <FaCamera size={14} color="#fff" />
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePic} />
                  </label>
                </div>
                <div style={{ fontSize: 13, color: '#65676b', marginTop: 8 }}>Add profile photo (optional)</div>
              </div>

              <Field label="Full Name *" icon={FaUser}>
                <FaUser style={s.fieldIcon} size={15} color="#65676b" />
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" icon required />
              </Field>
              <Field label="Email Address *" icon={FaEnvelope}>
                <FaEnvelope style={s.fieldIcon} size={15} color="#65676b" />
                <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" icon required />
              </Field>
              <Field label="Phone Number *" icon={FaPhone}>
                <FaPhone style={s.fieldIcon} size={15} color="#65676b" />
                <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="0712 345 678" icon required />
              </Field>
              <Field label="Password *" icon={FaLock}>
                <FaLock style={s.fieldIcon} size={15} color="#65676b" />
                <Input name="password" type={showPass ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Create a password" icon style={{ paddingRight: 44 }} required />
                <button type="button" style={s.eyeBtn} onClick={() => setShowPass(v => !v)}>
                  {showPass ? <FaEyeSlash size={16} color="#65676b" /> : <FaEye size={16} color="#65676b" />}
                </button>
              </Field>
              <Field label="Confirm Password *" icon={FaCheckCircle}>
                <FaCheckCircle style={s.fieldIcon} size={15} color="#65676b" />
                <Input name="confirmPassword" type={showPass2 ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password" icon style={{ paddingRight: 44 }} required />
                <button type="button" style={s.eyeBtn} onClick={() => setShowPass2(v => !v)}>
                  {showPass2 ? <FaEyeSlash size={16} color="#65676b" /> : <FaEye size={16} color="#65676b" />}
                </button>
              </Field>

              {/* Role selector */}
              <div style={s.fieldWrap}>
                <label style={s.label}>I am a: *</label>
                <div style={s.roleGrid}>
                  {roleOptions.map(role => {
                    const active = formData.role === role.value;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        style={{ ...s.roleCard, ...(active ? { ...s.roleCardActive, borderColor: role.color } : {}) }}
                        onClick={() => set('role', role.value)}
                      >
                        <role.icon size={22} color={active ? role.color : '#65676b'} />
                        <div style={s.roleCardLabel}>{role.label}</div>
                        <div style={s.roleCardDesc}>{role.desc}</div>
                        {active && <FaCheckCircle size={14} color={role.color} style={{ position: 'absolute', top: 8, right: 8 }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Personal Info ── */}
          {step === 2 && (
            <div>
              <p style={s.stepTitle}>Tell us about yourself</p>

              <Field label="Bio / About You">
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself…"
                  style={{ ...s.input, paddingLeft: 14, resize: 'vertical', height: 80 }}
                />
              </Field>

              <div style={s.row2}>
                <Field label="Country of Origin">
                  <FaGlobe style={s.fieldIcon} size={14} color="#65676b" />
                  <select name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleChange} style={{ ...s.input, paddingLeft: 36 }}>
                    {['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ethiopia', 'Somalia'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Current Country">
                  <FaMapMarkerAlt style={s.fieldIcon} size={14} color="#65676b" />
                  <Input name="currentCountry" value={formData.currentCountry} onChange={handleChange} placeholder="e.g., UAE" icon />
                </Field>
              </div>

              <Field label="Current City">
                <FaMapMarkerAlt style={s.fieldIcon} size={14} color="#65676b" />
                <Input name="currentCity" value={formData.currentCity} onChange={handleChange} placeholder="e.g., Dubai" icon />
              </Field>
            </div>
          )}

          {/* ── STEP 3: Professional ── */}
          {step === 3 && (
            <div>
              <p style={s.stepTitle}>Your professional background</p>

              {/* Skills */}
              <Field label="Skills">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={{ ...s.input, paddingLeft: 14, flex: 1 }}
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="e.g., Carpentry, Nursing…"
                  />
                  <button type="button" style={s.addBtn} onClick={addSkill}>Add</button>
                </div>
                <div style={s.tagRow}>
                  {formData.skills.map(skill => (
                    <span key={skill} style={s.tag}>
                      {skill}
                      <button type="button" style={s.tagX} onClick={() => removeSkill(skill)}>✕</button>
                    </span>
                  ))}
                </div>
              </Field>

              {/* Experience */}
              <Field label="Work Experience">
                <textarea
                  name="experience"
                  rows={3}
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 5 years in construction…"
                  style={{ ...s.input, paddingLeft: 14, resize: 'vertical', height: 80 }}
                />
              </Field>

              {/* Languages */}
              <Field label="Languages">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    style={{ ...s.input, paddingLeft: 14, flex: 2, minWidth: 120 }}
                    value={languageInput}
                    onChange={e => setLanguageInput(e.target.value)}
                    placeholder="Language name"
                  />
                  <select
                    style={{ ...s.input, paddingLeft: 8, flex: 1, minWidth: 100 }}
                    value={languageProficiency}
                    onChange={e => setLanguageProficiency(e.target.value)}
                  >
                    {['basic', 'intermediate', 'fluent', 'native'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                  <button type="button" style={s.addBtn} onClick={addLanguage}>Add</button>
                </div>
                <div style={s.tagRow}>
                  {formData.languages.map((lang, i) => (
                    <span key={i} style={{ ...s.tag, background: '#7c3aed22', borderColor: '#7c3aed66', color: '#7c3aed' }}>
                      {lang.name} — {lang.proficiency}
                      <button type="button" style={{ ...s.tagX, color: '#7c3aed' }} onClick={() => removeLang(i)}>✕</button>
                    </span>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* ── STEP 4: Emergency Contact ── */}
          {step === 4 && (
            <div>
              <p style={s.stepTitle}>Emergency Contact</p>
              <p style={{ fontSize: 14, color: '#65676b', marginBottom: 20 }}>
                This info is only used in case of emergency and kept private.
              </p>

              <Field label="Contact Full Name">
                <FaUser style={s.fieldIcon} size={14} color="#65676b" />
                <Input
                  value={formData.nextOfKin.name}
                  onChange={e => setFormData({ ...formData, nextOfKin: { ...formData.nextOfKin, name: e.target.value } })}
                  placeholder="Full name"
                  icon
                />
              </Field>
              <Field label="Contact Phone">
                <FaPhone style={s.fieldIcon} size={14} color="#65676b" />
                <Input
                  value={formData.nextOfKin.phone}
                  onChange={e => setFormData({ ...formData, nextOfKin: { ...formData.nextOfKin, phone: e.target.value } })}
                  placeholder="Phone number"
                  icon
                />
              </Field>
              <Field label="Relationship">
                <Input
                  style={{ paddingLeft: 14 }}
                  value={formData.nextOfKin.relationship}
                  onChange={e => setFormData({ ...formData, nextOfKin: { ...formData.nextOfKin, relationship: e.target.value } })}
                  placeholder="e.g., Parent, Spouse, Sibling"
                />
              </Field>

              {/* Summary card */}
              <div style={s.summaryCard}>
                <div style={s.summaryTitle}>Account Summary</div>
                <div style={s.summaryRow}><span style={s.summaryKey}>Name</span><span>{formData.name}</span></div>
                <div style={s.summaryRow}><span style={s.summaryKey}>Email</span><span>{formData.email}</span></div>
                <div style={s.summaryRow}><span style={s.summaryKey}>Role</span><span style={{ textTransform: 'capitalize' }}>{formData.role}</span></div>
                {formData.skills.length > 0 && (
                  <div style={s.summaryRow}><span style={s.summaryKey}>Skills</span><span>{formData.skills.join(', ')}</span></div>
                )}
              </div>
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div style={s.navBtns}>
            {step > 1 && (
              <button type="button" style={s.backBtn} onClick={handleBack}>
                <FaArrowLeft size={14} style={{ marginRight: 6 }} /> Back
              </button>
            )}
            {step < 4 ? (
              <button type="button" style={{ ...s.nextBtn, marginLeft: step === 1 ? 'auto' : undefined }} onClick={handleNext}>
                Continue <FaArrowRight size={14} style={{ marginLeft: 6 }} />
              </button>
            ) : (
              <button
                type="button"
                style={{ ...s.nextBtn, flex: 1, justifyContent: 'center', opacity: loading ? .7 : 1 }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Creating Account…' : 'Create Account ���'}
              </button>
            )}
          </div>

          <div style={s.loginLink}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: KL_BRAND, fontWeight: 700, textDecoration: 'none' }}>Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════
   STYLES (KL_BRAND defined once)
════════════════════════════ */
const s = {
  page: {
    display: 'flex', minHeight: '100vh',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    background: '#f0f2f5',
  },

  /* LEFT PANEL */
  leftPanel: {
    width: 380, flexShrink: 0, background: '#1a1a2e',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 40,
  },
  leftInner: { color: '#fff', maxWidth: 300 },
  leftLogo: {
    width: 64, height: 64, borderRadius: '50%', background: KL_BRAND,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 900, fontSize: 26, fontStyle: 'italic', marginBottom: 20,
  },
  leftTitle: { fontSize: 40, fontWeight: 900, color: '#fff', marginBottom: 8 },
  leftSub:   { fontSize: 16, color: 'rgba(255,255,255,.7)', marginBottom: 32, lineHeight: 1.5 },
  leftFeatures: { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 },
  leftFeatureItem: { fontSize: 15, color: 'rgba(255,255,255,.9)', lineHeight: 1.4 },
  leftFooter: { fontSize: 14, color: 'rgba(255,255,255,.6)' },

  /* RIGHT PANEL */
  rightPanel: {
    flex: 1, overflowY: 'auto',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '32px 16px',
  },
  formBox: {
    background: '#fff', borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,.12)',
    padding: '32px 36px', width: '100%', maxWidth: 520,
  },

  /* HEADER */
  formHeader: { textAlign: 'center', marginBottom: 24 },
  mobileLogo: {
    display: 'none', /* shown only on mobile via media query */
    width: 48, height: 48, borderRadius: '50%', background: KL_BRAND,
    alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 900, fontSize: 18, textDecoration: 'none', margin: '0 auto 12px',
  },
  formTitle: { fontSize: 28, fontWeight: 800, color: '#050505', margin: '0 0 4px' },
  formSub:   { fontSize: 15, color: '#65676b', margin: 0 },

  /* PROGRESS */
  progressWrap: { marginBottom: 28 },
  progressTrack: {
    height: 4, background: '#e4e6eb', borderRadius: 2, overflow: 'hidden', marginBottom: 10,
  },
  progressFill: {
    height: '100%', background: KL_BRAND, borderRadius: 2,
    transition: 'width .4s ease',
  },
  stepLabels: { display: 'flex', justifyContent: 'space-between' },
  stepLabel:  { fontSize: 12, transition: 'color .2s' },

  /* ERROR */
  errorBanner: {
    background: '#fff0f0', color: '#c0392b', border: '1px solid #f5c6cb',
    borderRadius: 8, padding: '10px 14px', fontSize: 14, marginBottom: 18,
  },

  /* AVATAR */
  avatarCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 },
  avatarWrap: { position: 'relative', width: 96, height: 96 },
  avatarImg: { width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e4e6eb' },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: '50%', background: '#f0f2f5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '3px dashed #dddfe2',
  },
  avatarCamBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: '50%', background: KL_BRAND,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', border: '2px solid #fff',
  },

  /* FIELD */
  fieldWrap: { marginBottom: 18 },
  label: { display: 'block', fontSize: 15, fontWeight: 600, color: '#050505', marginBottom: 6 },
  input: {
    width: '100%', height: 44, background: '#f0f2f5', border: '1.5px solid transparent',
    borderRadius: 8, padding: '0 14px', fontSize: 15, color: '#050505',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color .15s, background .15s',
  },
  fieldIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 },
  fieldError: { fontSize: 13, color: '#e41e3f', marginTop: 4 },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
  },

  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },

  stepTitle: { fontSize: 18, fontWeight: 700, color: '#050505', marginBottom: 20, marginTop: 0 },

  /* ROLES */
  roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  roleCard: {
    position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 6, padding: '16px 10px', border: '1.5px solid #dddfe2',
    borderRadius: 10, background: '#fff', cursor: 'pointer', textAlign: 'center',
    transition: 'border-color .15s, background .15s',
  },
  roleCardActive: { background: KL_BRAND + '0d' },
  roleCardLabel:  { fontSize: 14, fontWeight: 700, color: '#050505' },
  roleCardDesc:   { fontSize: 12, color: '#65676b', lineHeight: 1.3 },

  /* TAGS */
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tag: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: KL_BRAND + '18', border: `1px solid ${KL_BRAND}66`,
    color: '#d68910', borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 600,
  },
  tagX: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#d68910', fontSize: 12, padding: 0, lineHeight: 1,
  },
  addBtn: {
    height: 44, padding: '0 16px', background: KL_BRAND, color: '#fff',
    border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer',
    flexShrink: 0,
  },

  /* SUMMARY */
  summaryCard: {
    background: '#f0f2f5', borderRadius: 10, padding: '16px 20px', marginTop: 24,
  },
  summaryTitle: { fontSize: 15, fontWeight: 700, color: '#050505', marginBottom: 12 },
  summaryRow:   { display: 'flex', gap: 12, fontSize: 14, marginBottom: 8, color: '#050505' },
  summaryKey:   { color: '#65676b', minWidth: 60 },

  /* NAV BUTTONS */
  navBtns: { display: 'flex', gap: 10, marginTop: 28 },
  backBtn: {
    display: 'inline-flex', alignItems: 'center',
    background: '#e4e6eb', color: '#050505', border: 'none',
    borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },
  nextBtn: {
    display: 'inline-flex', alignItems: 'center',
    background: KL_BRAND, color: '#fff', border: 'none',
    borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },

  loginLink: { textAlign: 'center', fontSize: 14, color: '#65676b', marginTop: 20 },
};

export default RegisterEnhanced;
