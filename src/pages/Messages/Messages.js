import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../services/api';
import { Container, Card, ListGroup, Form, Button, Badge, Spinner, Image } from 'react-bootstrap';
import { 
  FaUserCircle, FaPhone, FaVideo, FaPaperPlane, FaMapMarkerAlt, FaCircle,
  FaHome, FaSearch, FaBell, FaFacebookMessenger, FaEllipsisH, FaBriefcase,
  FaUsers, FaShieldAlt, FaArrowLeft
} from 'react-icons/fa';
import ProfileModal from '../../components/ProfileModal';
import ClickableAvatar from '../../components/Common/ClickableAvatar';
import toast from 'react-hot-toast';

const KL_BRAND = '#f39c12';
const KL_BRAND_LIGHT = '#fef9e7';

const Messages = () => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState(null);
  const [activeNav, setActiveNav] = useState('messages');
  const messagesEndRef = useRef(null);

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'messages', icon: FaFacebookMessenger, label: 'Messages', link: '/messages' },
    { id: 'social', icon: FaUsers, label: 'Community', link: '/social' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
  ];

  const fetchUserAndStartChat = useCallback(async (userId) => {
    try {
      const res = await fetch(`https://kazi-linda.onrender.com/api/profile/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await res.json();
      setSelectedUser(userData);
    } catch (err) {
      console.error(err);
      toast.error('Could not load user');
    }
  }, [token]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('user');
    if (userId && !selectedUser) {
      fetchUserAndStartChat(userId);
    }
  }, [fetchUserAndStartChat, selectedUser]);

  useEffect(() => {
    const updateOnlineStatus = async () => {
      try {
        await fetch('https://kazi-linda.onrender.com/api/social/online', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
      } catch (err) { console.error(err); }
    };
    updateOnlineStatus();
    const interval = setInterval(updateOnlineStatus, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      if (selectedUser) fetchMessages(selectedUser._id, false);
      fetchConversations();
    }, 15000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  useEffect(() => { if (selectedUser) fetchMessages(selectedUser._id); }, [selectedUser]);
  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const fetchConversations = async () => {
    try {
      const res = await messageAPI.getConversations();
      setConversations(res.data);
    } catch (err) { toast.error('Failed to load conversations'); }
    finally { setLoading(false); }
  };

  const fetchMessages = async (userId, showToast = true) => {
    try {
      const res = await messageAPI.getMessages(userId);
      setMessages(res.data.messages || res.data);
    } catch (err) { if (showToast) toast.error('Failed to load messages'); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await messageAPI.sendMessage({ receiverId: selectedUser._id, message: newMessage, subject: `Message from ${user.name}` });
      setNewMessage('');
      await fetchMessages(selectedUser._id);
      await fetchConversations();
    } catch (err) { toast.error('Failed to send message'); }
    finally { setSending(false); }
  };

  const getStatusBadge = (status) => {
    const config = { looking: 'success', working: 'primary', available: 'success', departed: 'warning', returned: 'info', distress: 'danger' };
    const text = { looking: 'Looking for work', working: 'Working', available: 'Available', departed: 'Departed', returned: 'Returned', distress: 'Distress' };
    return <Badge bg={config[status] || 'secondary'}>{text[status] || status || 'Unknown'}</Badge>;
  };

  const formatDate = (date) => date ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  if (loading) return <div style={styles.loadingWrap}><div style={styles.loadingLogo}>KL</div><Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} /></div>;

  const unreadTotal = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link to="/" style={styles.logoBox}><span style={styles.logoText}>KL</span></Link>
          <div style={styles.searchBox}><FaSearch style={styles.searchIcon} /><input style={styles.searchInput} placeholder="Search messages..." /></div>
        </div>
        <div style={styles.navCenter}>
          {navTabs.map(tab => (
            <Link key={tab.id} to={tab.link} style={{ ...styles.navTab, ...(activeNav === tab.id ? styles.navTabActive : {}) }} onClick={() => setActiveNav(tab.id)}>
              <tab.icon size={24} style={{ color: activeNav === tab.id ? KL_BRAND : '#65676b' }} />
              {activeNav === tab.id && <div style={styles.navTabLine} />}
            </Link>
          ))}
        </div>
        <div style={styles.navRight}>
          <button style={styles.navIconBtn}><div style={styles.navIconInner}><FaEllipsisH size={18} /></div></button>
          <button style={styles.navIconBtn}><div style={styles.navIconInner}><FaFacebookMessenger size={18} /></div></button>
          <button style={styles.navIconBtn}><div style={styles.navIconInner}><FaBell size={18} /></div><span style={styles.badge}>3</span></button>
          <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={40} />
        </div>
      </nav>

      <div style={styles.body}>
        <aside style={styles.leftSidebar}>
          <Link to={`/profile/${user?._id}`} style={styles.sidebarProfileLink}>
            <ClickableAvatar userId={user?._id} src={user?.profilePicture} size={36} />
            <span>{user?.name?.split(' ')[0]}</span>
          </Link>
          <div style={styles.sidebarDivider} />
          <div style={styles.sidebarSectionTitle}>Chats</div>
          <div style={styles.conversationList}>
            {conversations.length === 0 ? (
              <div style={styles.noChats}>No conversations yet<br /><small>Start by messaging someone!</small></div>
            ) : (
              conversations.map(conv => {
                const otherUser = conv.otherUser || conv.participants?.find(p => p._id !== user._id);
                if (!otherUser) return null;
                return (
                  <div key={conv._id} style={{ ...styles.conversationItem, ...(selectedUser?._id === otherUser._id ? styles.conversationItemActive : {}) }} onClick={() => setSelectedUser(otherUser)}>
                    <div style={styles.convAvatar}>
                      <ClickableAvatar userId={otherUser._id} src={otherUser.profilePicture} size={48} />
                      {otherUser.isOnline && <span style={styles.onlineDot}></span>}
                    </div>
                    <div style={styles.convInfo}>
                      <div style={styles.convName}>{otherUser.name}</div>
                      <div style={styles.convPreview}>{conv.lastMessage?.substring(0, 30)}</div>
                    </div>
                    {conv.unreadCount > 0 && <span style={styles.unreadBadge}>{conv.unreadCount}</span>}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <main style={styles.feedCol}>
          {selectedUser ? (
            <Card style={styles.chatCard}>
              <Card.Header style={styles.chatHeader}>
                <div style={styles.chatUserInfo}>
                  <ClickableAvatar userId={selectedUser._id} src={selectedUser.profilePicture} size={48} />
                  <div>
                    <h4>{selectedUser.name}</h4>
                    <div style={styles.userStatus}>{getStatusBadge(selectedUser.currentStatus)}</div>
                  </div>
                </div>
                <div><Button variant="outline-primary" size="sm" style={styles.callBtn}><FaPhone /></Button></div>
              </Card.Header>
              <Card.Body style={styles.chatBody}>
                {messages.length === 0 ? (
                  <div style={styles.noMessages}><FaUserCircle size={60} /><h6>No messages yet</h6><p>Start a conversation with {selectedUser.name}!</p></div>
                ) : (
                  messages.map(msg => {
                    const isOwn = msg.senderId?._id === user._id;
                    return (
                      <div key={msg._id} style={{ ...styles.messageRow, justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                        {!isOwn && <ClickableAvatar userId={msg.senderId?._id} src={msg.senderId?.profilePicture} size={32} />}
                        <div style={{ ...styles.messageBubble, background: isOwn ? KL_BRAND : '#f0f2f5', color: isOwn ? '#fff' : '#050505' }}>
                          {!isOwn && <strong>{msg.senderId?.name}</strong>}
                          <p>{msg.message}</p>
                          <small style={styles.messageTime}>{formatDate(msg.createdAt)}</small>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Card.Body>
              <Card.Footer style={styles.chatFooter}>
                <Form onSubmit={handleSendMessage} style={styles.sendForm}>
                  <Form.Control type="text" placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} disabled={sending} style={styles.messageInput} />
                  <Button type="submit" style={styles.sendBtn} disabled={sending}>{sending ? <Spinner animation="border" size="sm" /> : <FaPaperPlane />}</Button>
                </Form>
              </Card.Footer>
            </Card>
          ) : (
            <div style={styles.noChatSelected}>
              <FaFacebookMessenger size={64} color={KL_BRAND} />
              <h3>Welcome to Messages</h3>
              <p>Select a conversation from the sidebar or click on a user's profile to start chatting!</p>
            </div>
          )}
        </main>

        <aside style={styles.rightSidebar}>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}><FaShieldAlt color={KL_BRAND} /><span>Messaging Tips</span></div>
            <ul style={styles.tipsList}>
              <li>✓ Be respectful in all communications</li>
              <li>✓ Never share personal financial info</li>
              <li>✓ Report suspicious behavior</li>
              <li>✓ Keep conversations professional</li>
            </ul>
          </div>
        </aside>
      </div>

      <ProfileModal userId={selectedProfileUserId} show={showProfileModal} onHide={() => setShowProfileModal(false)} onSendMessage={(user) => { setSelectedUser(user); setShowProfileModal(false); }} />
    </div>
  );
};

const styles = {
  page: { background: '#f0f2f5', minHeight: '100vh' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' },
  loadingLogo: { width: 60, height: 60, borderRadius: '50%', background: KL_BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 24 },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: '1px solid #dddfe2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 200 },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 }, navCenter: { display: 'flex', gap: 4 }, navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  logoBox: { width: 40, height: 40, borderRadius: '50%', background: KL_BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  logoText: { color: '#fff', fontWeight: 900, fontSize: 18 }, searchBox: { position: 'relative' }, searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b' },
  searchInput: { background: '#f0f2f5', border: 'none', borderRadius: 20, padding: '8px 16px 8px 36px', fontSize: 15, outline: 'none', width: 240 },
  navTab: { width: 100, height: 48, background: 'transparent', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', textDecoration: 'none' },
  navTabActive: { background: KL_BRAND_LIGHT }, navTabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: KL_BRAND },
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' },
  navIconInner: { width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: '#e41e3f', color: '#fff', borderRadius: 10, fontSize: 11, padding: '1px 5px' },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1400, margin: '0 auto' },
  leftSidebar: { width: 320, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px', borderRadius: 8, textDecoration: 'none', color: '#050505' },
  sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' }, sidebarSectionTitle: { fontSize: 15, fontWeight: 700, color: '#65676b', padding: '8px 8px' },
  conversationList: { display: 'flex', flexDirection: 'column', gap: 4 },
  conversationItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 10, cursor: 'pointer', position: 'relative' },
  conversationItemActive: { background: KL_BRAND_LIGHT }, convAvatar: { position: 'relative' }, onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, background: '#45bd62', borderRadius: '50%', border: '2px solid #fff' },
  convInfo: { flex: 1 }, convName: { fontWeight: 600, fontSize: 15 }, convPreview: { fontSize: 13, color: '#65676b' }, unreadBadge: { background: KL_BRAND, color: '#fff', borderRadius: 12, padding: '2px 8px', fontSize: 12, fontWeight: 600 },
  noChats: { textAlign: 'center', padding: '40px 20px', color: '#65676b' },
  feedCol: { flex: 1, maxWidth: 680, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  chatCard: { height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,.2)' },
  chatHeader: { background: '#fff', borderBottom: '1px solid #dddfe2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' },
  chatUserInfo: { display: 'flex', alignItems: 'center', gap: 12 }, userStatus: { fontSize: 12 }, callBtn: { borderRadius: '50%', width: 40, height: 40 },
  chatBody: { flex: 1, overflowY: 'auto', padding: '16px', background: '#f0f2f5' },
  messageRow: { display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  messageBubble: { maxWidth: '70%', padding: '10px 14px', borderRadius: 18, position: 'relative' }, messageTime: { fontSize: 10, opacity: 0.7, display: 'block', marginTop: 4 },
  chatFooter: { background: '#fff', borderTop: '1px solid #dddfe2', padding: '12px' },
  sendForm: { display: 'flex', gap: 8 }, messageInput: { borderRadius: 20 }, sendBtn: { background: KL_BRAND, border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  noChatSelected: { textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 12 },
  noMessages: { textAlign: 'center', padding: '40px', color: '#65676b' },
  rightSidebar: { width: 280, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16 },
  rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #dddfe2' },
  tipsList: { listStyle: 'none', padding: 0, margin: 0, fontSize: 13, lineHeight: 2 },
};

export default Messages;