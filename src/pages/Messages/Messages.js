import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../services/api';
import { Spinner } from 'react-bootstrap';
import { 
  FaUserCircle, FaPhone, FaPaperPlane, FaHome,
  FaBell, FaFacebookMessenger, FaEllipsisH, FaBriefcase,
  FaShieldAlt, FaUserPlus, FaClock
} from 'react-icons/fa';
import ProfileModal from '../../components/ProfileModal';
import ClickableAvatar from '../../components/Common/ClickableAvatar';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import moment from 'moment';

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

const KL_BRAND = colors.primary;

const Messages = () => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeNav, setActiveNav] = useState('messages');
  const messagesEndRef = useRef(null);

  const navTabs = [
    { id: 'home', icon: FaHome, label: 'Home', link: '/' },
    { id: 'messages', icon: FaFacebookMessenger, label: 'Messages', link: '/messages' },
    { id: 'jobs', icon: FaBriefcase, label: 'Jobs', link: '/jobs' },
  ];

  const fetchConversations = useCallback(async () => {
    try {
      const res = await messageAPI.getConversations(token);
      setConversations(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchMessages = useCallback(async (userId) => {
    try {
      const res = await messageAPI.getMessages(userId, token);
      setMessages(res.data.messages || res.data || []);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser, fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await messageAPI.sendMessage({
        receiverId: selectedUser._id,
        message: newMessage,
        subject: `Message from ${user.name}`
      }, token);
      setNewMessage('');
      await fetchMessages(selectedUser._id);
      await fetchConversations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingLogo}>KL</div>
        <Spinner animation="border" style={{ color: KL_BRAND, marginTop: 16 }} />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link to="/" style={styles.logoBox}><span style={styles.logoText}>KL</span></Link>
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
            <span>{user?.name}</span>
          </Link>
          <div style={styles.sidebarDivider} />
          <div style={styles.conversationList}>
            {conversations.length === 0 ? (
              <div style={styles.noChats}>
                <FaUserCircle size={48} color={colors.primary} />
                <h5>No conversations yet</h5>
                <p style={{ fontSize: 13, color: '#65676b' }}>Follow users and wait for them to accept your request to start chatting.</p>
              </div>
            ) : (
              conversations.map(conv => {
                const otherUser = conv.otherUser || conv.participants?.find(p => p._id !== user._id);
                if (!otherUser) return null;
                return (
                  <div key={conv._id} style={{ ...styles.conversationItem, ...(selectedUser?._id === otherUser._id ? styles.conversationItemActive : {}) }} onClick={() => setSelectedUser(otherUser)}>
                    <ClickableAvatar userId={otherUser._id} src={otherUser.profilePicture} size={48} />
                    <div style={styles.convInfo}>
                      <div style={styles.convName}>{otherUser.name}</div>
                      <div style={styles.convPreview}>{conv.lastMessage?.substring(0, 30) || 'No messages yet'}</div>
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
            <div style={styles.chatCard}>
              <div style={styles.chatHeader}>
                <div style={styles.chatUserInfo} onClick={() => setShowProfileModal(true)}>
                  <ClickableAvatar userId={selectedUser._id} src={selectedUser.profilePicture} size={48} />
                  <div><h4>{selectedUser.name}</h4></div>
                </div>
                <div><button style={styles.callBtn}><FaPhone /></button></div>
              </div>
              <div style={styles.chatBody}>
                {messages.length === 0 ? (
                  <div style={styles.noMessages}>
                    <FaUserCircle size={60} color={colors.primary} />
                    <h6>No messages yet</h6>
                    <p style={{ fontSize: 13, color: '#65676b' }}>Start a conversation with {selectedUser.name}</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isOwn = msg.senderId?._id === user._id || msg.senderId === user._id;
                    return (
                      <div key={msg._id} style={{ ...styles.messageRow, justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                        <div style={{ ...styles.messageBubble, background: isOwn ? colors.gradient : '#f0f2f5', color: isOwn ? '#fff' : '#050505' }}>
                          <p style={{ margin: 0 }}>{msg.message}</p>
                          <small style={{ opacity: 0.7, fontSize: 10 }}>{moment(msg.createdAt).format('h:mm A')}</small>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <div style={styles.chatFooter}>
                <form onSubmit={handleSendMessage} style={styles.sendForm}>
                  <input type="text" placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} disabled={sending} style={styles.messageInput} />
                  <button type="submit" style={styles.sendBtn} disabled={sending}>{sending ? <Spinner animation="border" size="sm" /> : <FaPaperPlane />}</button>
                </form>
              </div>
            </div>
          ) : (
            <div style={styles.noChatSelected}>
              <FaFacebookMessenger size={64} color={KL_BRAND} />
              <h3>Welcome to Messages</h3>
              <p>Select a conversation to start chatting!</p>
              <p style={{ fontSize: 13, color: '#65676b' }}>
                <FaClock size={12} /> Only users who have accepted your follow request can message you.
              </p>
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
              <li>✓ Follow users to start conversations</li>
            </ul>
          </div>
          <div style={styles.rightCard}>
            <div style={styles.rightCardHeader}><FaUserPlus color={KL_BRAND} /><span>Connect to Chat</span></div>
            <p style={{ fontSize: 13 }}>Follow users and wait for them to accept your request to start messaging.</p>
            <Link to="/discover" style={styles.findPeopleBtn}>Find People</Link>
          </div>
        </aside>
      </div>

      <ProfileModal userId={selectedUser?._id} show={showProfileModal} onHide={() => setShowProfileModal(false)} />
    </div>
  );
};

const styles = {
  page: { background: colors.gradientLight, minHeight: '100vh' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: colors.gradientLight },
  loadingLogo: { width: 60, height: 60, borderRadius: '50%', background: colors.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 24 },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 200, boxShadow: '0 2px 4px rgba(0,0,0,.08)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 }, navCenter: { display: 'flex', gap: 4 }, navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  logoBox: { width: 40, height: 40, borderRadius: '50%', background: colors.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  logoText: { color: '#fff', fontWeight: 900, fontSize: 18 }, navTab: { width: 100, height: 48, background: 'transparent', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', textDecoration: 'none' },
  navTabActive: { background: colors.light }, navTabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: colors.primary },
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }, navIconInner: { width: 40, height: 40, borderRadius: '50%', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: colors.danger, color: '#fff', borderRadius: 10, fontSize: 11, padding: '1px 5px' },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1400, margin: '0 auto' }, leftSidebar: { width: 320, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px', borderRadius: 8, textDecoration: 'none', color: colors.text }, sidebarDivider: { borderTop: `1px solid ${colors.border}`, margin: '12px 0' },
  conversationList: { display: 'flex', flexDirection: 'column', gap: 4 }, conversationItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 10, cursor: 'pointer' },
  conversationItemActive: { background: colors.light }, convInfo: { flex: 1 }, convName: { fontWeight: 600, fontSize: 15, color: colors.text }, convPreview: { fontSize: 13, color: '#65676b' },
  unreadBadge: { background: colors.primary, color: '#fff', borderRadius: 12, padding: '2px 8px', fontSize: 12 }, noChats: { textAlign: 'center', padding: '40px 20px', color: '#65676b' },
  feedCol: { flex: 1, maxWidth: 680, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  chatCard: { background: '#fff', borderRadius: 12, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', border: `1px solid ${colors.border}` },
  chatHeader: { background: '#fff', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' },
  chatUserInfo: { display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }, callBtn: { background: colors.light, border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.text },
  chatBody: { flex: 1, overflowY: 'auto', padding: '16px', background: colors.light }, messageRow: { display: 'flex', marginBottom: 12 },
  messageBubble: { maxWidth: '70%', padding: '10px 14px', borderRadius: 18, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }, chatFooter: { background: '#fff', borderTop: `1px solid ${colors.border}`, padding: '12px' },
  sendForm: { display: 'flex', gap: 8 }, messageInput: { flex: 1, padding: '10px 16px', border: `1px solid ${colors.border}`, borderRadius: 20, outline: 'none' },
  sendBtn: { background: colors.gradient, border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  noChatSelected: { textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 12, border: `1px solid ${colors.border}` }, noMessages: { textAlign: 'center', padding: '40px', color: '#65676b' },
  rightSidebar: { width: 280, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16, border: `1px solid ${colors.border}` }, rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${colors.border}` },
  tipsList: { listStyle: 'none', padding: 0, margin: 0, fontSize: 13, lineHeight: 2, color: colors.text },
  findPeopleBtn: { display: 'block', background: colors.gradient, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', textAlign: 'center', marginTop: 12, textDecoration: 'none' },
};

export default Messages;
