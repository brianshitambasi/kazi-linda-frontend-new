import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { 
  FaMoon, FaSun, FaBell, FaEnvelope, FaUserSecret, 
  FaLanguage, FaSave, FaPalette, FaShieldAlt, 
  FaVolumeUp, FaVolumeMute, FaComment, FaBriefcase, 
  FaUserFriends, FaMapMarkerAlt, FaMobileAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import toast from 'react-hot-toast';

const Settings = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('https://kazi-linda.onrender.com/api/profile/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        applyTheme(data.theme === 'dark');
        applyCompactView(data.compactView);
        applyFontSize(data.fontSize);
        applyHighContrast(data.highContrast);
      } else {
        setSettings({
          theme: 'light',
          fontSize: 'medium',
          compactView: false,
          highContrast: false,
          notifications: {
            email: true,
            push: true,
            jobAlerts: true,
            messageAlerts: true,
            emergencyAlerts: true,
            friendRequestAlerts: true,
            soundEnabled: true,
            soundVolume: 70,
            soundType: 'modern'
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showPhone: false,
            showLocation: true,
            allowTagging: true
          },
          language: 'en',
          sessionTimeout: 30
        });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const applyTheme = (isDark) => {
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const applyCompactView = (isCompact) => {
    if (isCompact) {
      document.body.classList.add('compact-view');
    } else {
      document.body.classList.remove('compact-view');
    }
  };

  const applyFontSize = (size) => {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${size}`);
  };

  const applyHighContrast = (isHigh) => {
    if (isHigh) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  };

  const testSound = () => {
    if (!settings?.notifications?.soundEnabled) return;
    const audio = new Audio();
    const soundUrls = {
      modern: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
      classic: 'https://www.soundjay.com/misc/sounds/notification-01.mp3',
      gentle: 'https://www.soundjay.com/misc/sounds/chime-up-01.mp3',
      urgent: 'https://www.soundjay.com/misc/sounds/alarm-clock-short-01.mp3'
    };
    audio.src = soundUrls[settings.notifications.soundType] || soundUrls.modern;
    audio.volume = (settings.notifications.soundVolume || 70) / 100;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const handleChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    
    if (category === 'theme') applyTheme(value === 'dark');
    if (category === 'compactView') applyCompactView(value);
    if (category === 'fontSize') applyFontSize(value);
    if (category === 'highContrast') applyHighContrast(value);
  };

  const handleDirectChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'theme') applyTheme(value === 'dark');
    if (key === 'compactView') applyCompactView(value);
    if (key === 'fontSize') applyFontSize(value);
    if (key === 'highContrast') applyHighContrast(value);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('https://kazi-linda.onrender.com/api/profile/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      });
      
      if (response.ok) {
        toast.success('Settings saved successfully!');
        if (settings?.notifications?.soundEnabled) {
          const audio = new Audio();
          audio.src = 'https://www.soundjay.com/misc/sounds/button-click-01.mp3';
          audio.volume = (settings.notifications.soundVolume || 70) / 100;
          audio.play().catch(e => console.log('Audio play failed:', e));
        }
      } else {
        toast.error('Failed to save settings');
      }
    } catch (err) {
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Settings">
        <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
      </DashboardLayout>
    );
  }

  if (!settings) {
    return (
      <DashboardLayout title="Settings">
        <Alert variant="danger">Failed to load settings. Please try again.</Alert>
      </DashboardLayout>
    );
  }

  const soundOptions = [
    { value: 'modern', label: 'Ì¥î Modern Bell' },
    { value: 'classic', label: 'Ì≥± Classic Ding' },
    { value: 'gentle', label: '‚ú® Gentle Chime' },
    { value: 'urgent', label: 'Ì∫® Urgent Alert' },
  ];

  return (
    <DashboardLayout title="Settings">
      <Row>
        <Col lg={3}>
          <div className="settings-sidebar">
            <div className="settings-nav">
              <a href="#appearance" className="settings-nav-item"><FaPalette /> Appearance</a>
              <a href="#sounds" className="settings-nav-item"><FaVolumeUp /> Sounds & Alerts</a>
              <a href="#notifications" className="settings-nav-item"><FaBell /> Notifications</a>
              <a href="#privacy" className="settings-nav-item"><FaUserSecret /> Privacy</a>
              <a href="#language" className="settings-nav-item"><FaLanguage /> Language</a>
            </div>
          </div>
        </Col>
        
        <Col lg={9}>
          <div className="settings-content">
            
            {/* Appearance Section */}
            <Card id="appearance" className="settings-card">
              <Card.Header><FaPalette /> Appearance</Card.Header>
              <Card.Body>
                <div className="setting-item">
                  <div className="setting-info">
                    <h6>Theme</h6>
                    <p className="text-muted small">Choose your preferred theme</p>
                  </div>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant={settings.theme === 'light' ? 'warning' : 'outline-secondary'} onClick={() => handleDirectChange('theme', 'light')}><FaSun /> Light</Button>
                    <Button size="sm" variant={settings.theme === 'dark' ? 'warning' : 'outline-secondary'} onClick={() => handleDirectChange('theme', 'dark')}><FaMoon /> Dark</Button>
                  </div>
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h6>Compact View</h6>
                    <p className="text-muted small">Reduce spacing for more content</p>
                  </div>
                  <Form.Check type="switch" checked={settings.compactView} onChange={(e) => handleDirectChange('compactView', e.target.checked)} />
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h6>Font Size</h6>
                    <p className="text-muted small">Adjust text size for readability</p>
                  </div>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant={settings.fontSize === 'small' ? 'warning' : 'outline-secondary'} onClick={() => handleDirectChange('fontSize', 'small')}>A-</Button>
                    <Button size="sm" variant={settings.fontSize === 'medium' ? 'warning' : 'outline-secondary'} onClick={() => handleDirectChange('fontSize', 'medium')}>A</Button>
                    <Button size="sm" variant={settings.fontSize === 'large' ? 'warning' : 'outline-secondary'} onClick={() => handleDirectChange('fontSize', 'large')}>A+</Button>
                  </div>
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h6>High Contrast</h6>
                    <p className="text-muted small">Enhanced visibility for accessibility</p>
                  </div>
                  <Form.Check type="switch" checked={settings.highContrast} onChange={(e) => handleDirectChange('highContrast', e.target.checked)} />
                </div>
              </Card.Body>
            </Card>
            
            {/* Sounds & Alerts Section */}
            <Card id="sounds" className="settings-card">
              <Card.Header><FaVolumeUp /> Sounds & Alerts</Card.Header>
              <Card.Body>
                <div className="setting-item">
                  <div className="setting-info">
                    <h6>Notification Sounds</h6>
                    <p className="text-muted small">Play sounds for notifications</p>
                  </div>
                  <Form.Check type="switch" checked={settings.notifications?.soundEnabled} onChange={(e) => handleChange('notifications', 'soundEnabled', e.target.checked)} label={settings.notifications?.soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />} />
                </div>
                
                {settings.notifications?.soundEnabled && (
                  <>
                    <div className="setting-item">
                      <div className="setting-info">
                        <h6>Notification Sound</h6>
                        <p className="text-muted small">Choose your preferred alert sound</p>
                      </div>
                      <div className="d-flex gap-2">
                        <Form.Select value={settings.notifications.soundType} onChange={(e) => handleChange('notifications', 'soundType', e.target.value)} style={{ width: '150px' }}>
                          {soundOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                        </Form.Select>
                        <Button size="sm" variant="outline-warning" onClick={testSound}>Test Sound</Button>
                      </div>
                    </div>
                    
                    <div className="setting-item">
                      <div className="setting-info">
                        <h6>Volume</h6>
                        <p className="text-muted small">Adjust notification volume</p>
                      </div>
                      <div style={{ width: '200px' }}>
                        <Form.Range min={0} max={100} value={settings.notifications.soundVolume} onChange={(e) => handleChange('notifications', 'soundVolume', parseInt(e.target.value))} />
                        <small className="text-muted">{settings.notifications.soundVolume}%</small>
                      </div>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
            
            {/* Notifications Section */}
            <Card id="notifications" className="settings-card">
              <Card.Header><FaBell /> Notifications</Card.Header>
              <Card.Body>
                <div className="setting-item"><div className="setting-info"><h6><FaEnvelope /> Email Notifications</h6><p className="text-muted small">Receive updates via email</p></div><Form.Check type="switch" checked={settings.notifications?.email} onChange={(e) => handleChange('notifications', 'email', e.target.checked)} /></div>
                <div className="setting-item"><div className="setting-info"><h6><FaMobileAlt /> Push Notifications</h6><p className="text-muted small">Get instant alerts on your device</p></div><Form.Check type="switch" checked={settings.notifications?.push} onChange={(e) => handleChange('notifications', 'push', e.target.checked)} /></div>
                <div className="setting-item"><div className="setting-info"><h6><FaBriefcase /> Job Alerts</h6><p className="text-muted small">Notify me about new job matches</p></div><Form.Check type="switch" checked={settings.notifications?.jobAlerts} onChange={(e) => handleChange('notifications', 'jobAlerts', e.target.checked)} /></div>
                <div className="setting-item"><div className="setting-info"><h6><FaComment /> Message Alerts</h6><p className="text-muted small">Get notified when you receive messages</p></div><Form.Check type="switch" checked={settings.notifications?.messageAlerts} onChange={(e) => handleChange('notifications', 'messageAlerts', e.target.checked)} /></div>
                <div className="setting-item"><div className="setting-info"><h6><FaShieldAlt /> Emergency Alerts</h6><p className="text-muted small text-danger">Critical safety notifications</p></div><Form.Check type="switch" checked={settings.notifications?.emergencyAlerts} onChange={(e) => handleChange('notifications', 'emergencyAlerts', e.target.checked)} /></div>
                <div className="setting-item"><div className="setting-info"><h6><FaUserFriends /> Friend Request Alerts</h6><p className="text-muted small">Get notified about new follow/friend requests</p></div><Form.Check type="switch" checked={settings.notifications?.friendRequestAlerts} onChange={(e) => handleChange('notifications', 'friendRequestAlerts', e.target.checked)} /></div>
              </Card.Body>
            </Card>
            
            {/* Privacy Section */}
            <Card id="privacy" className="settings-card">
              <Card.Header><FaUserSecret /> Privacy</Card.Header>
              <Card.Body>
                <div className="setting-item">
                  <div className="setting-info"><h6>Profile Visibility</h6><p className="text-muted small">Who can see your profile</p></div>
                  <Form.Select value={settings.privacy?.profileVisibility} onChange={(e) => handleChange('privacy', 'profileVisibility', e.target.value)} style={{ width: '150px' }}>
                    <option value="public">Ìºç Public</option><option value="friends">Ì±• Friends Only</option><option value="private">Ì¥í Private</option>
                  </Form.Select>
                </div>
                <div className="setting-item"><div className="setting-info"><h6><FaEnvelope /> Show Email</h6></div><Form.Check type="switch" checked={settings.privacy?.showEmail} onChange={(e) => handleChange('privacy', 'showEmail', e.target.checked)} /></div>
                <div className="setting-item"><div className="setting-info"><h6><FaMobileAlt /> Show Phone</h6></div><Form.Check type="switch" checked={settings.privacy?.showPhone} onChange={(e) => handleChange('privacy', 'showPhone', e.target.checked)} /></div>
                <div className="setting-item"><div className="setting-info"><h6><FaMapMarkerAlt /> Show Location</h6></div><Form.Check type="switch" checked={settings.privacy?.showLocation} onChange={(e) => handleChange('privacy', 'showLocation', e.target.checked)} /></div>
              </Card.Body>
            </Card>
            
            {/* Language Section */}
            <Card id="language" className="settings-card">
              <Card.Header><FaLanguage /> Language</Card.Header>
              <Card.Body>
                <div className="setting-item">
                  <div className="setting-info"><h6>Select Language</h6><p className="text-muted small">Choose your preferred language</p></div>
                  <Form.Select value={settings.language} onChange={(e) => handleDirectChange('language', e.target.value)} style={{ width: '200px' }}>
                    <option value="en">Ì∑¨Ì∑ß English</option><option value="sw">Ì∑∞Ì∑™ Kiswahili</option><option value="fr">Ì∑´Ì∑∑ Fran√ßais</option>
                  </Form.Select>
                </div>
              </Card.Body>
            </Card>
            
            {/* Save Button */}
            <div className="settings-actions"><Button variant="warning" onClick={handleSave} disabled={saving} className="px-4">{saving ? <Spinner animation="border" size="sm" className="me-2" /> : <FaSave className="me-2" />}{saving ? 'Saving...' : 'Save All Settings'}</Button></div>
          </div>
        </Col>
      </Row>
      
      <style>{`
        .settings-sidebar { position: sticky; top: 80px; }
        .settings-nav { background: white; border-radius: 12px; padding: 8px 0; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .settings-nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: #050505; text-decoration: none; transition: all 0.2s; }
        .settings-nav-item:hover { background: #f0f2f5; }
        .settings-card { margin-bottom: 20px; border: none; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .settings-card .card-header { background: white; border-bottom: 1px solid #dddfe2; font-weight: 600; }
        .setting-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #f0f2f5; }
        .setting-item:last-child { border-bottom: none; }
        .setting-info h6 { margin-bottom: 4px; font-weight: 600; }
        .settings-actions { text-align: right; margin-top: 20px; margin-bottom: 40px; }
        body.dark-mode { background-color: #1a1a2e; color: #e4e6eb; }
        body.dark-mode .settings-card, body.dark-mode .settings-nav { background: #2d2d44; }
        body.dark-mode .settings-card .card-header { background: #2d2d44; border-bottom-color: #3a3a5a; color: #e4e6eb; }
        body.dark-mode .setting-item { border-bottom-color: #3a3a5a; }
        body.font-small { font-size: 12px; }
        body.font-medium { font-size: 14px; }
        body.font-large { font-size: 16px; }
        body.compact-view .settings-card { margin-bottom: 12px; }
        body.compact-view .setting-item { padding: 8px 0; }
        body.high-contrast { filter: contrast(1.2); }
        body.high-contrast .settings-card { border: 2px solid #000; }
      `}</style>
    </DashboardLayout>
  );
};

export default Settings;
