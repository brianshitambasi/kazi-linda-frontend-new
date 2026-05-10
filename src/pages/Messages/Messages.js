import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../services/api';
// eslint-disable-next-line no-unused-vars
import { Spinner,Button, Badge } from 'react-bootstrap';
import { 
  FaUserCircle, FaPhone, FaPaperPlane, FaHome,
  FaBell, FaFacebookMessenger, FaEllipsisH, FaBriefcase,
  FaShieldAlt
} from 'react-icons/fa';
import ProfileModal from '../../components/ProfileModal';
import ClickableAvatar from '../../components/Common/ClickableAvatar';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import moment from 'moment';

const KL_BRAND = '#f39c12';

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
      toast.error('Failed to send message');
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
              <div style={styles.noChats}>No conversations yet</div>
            ) : (
              conversations.map(conv => {
                const otherUser = conv.otherUser || conv.participants?.find(p => p._id !== user._id);
                if (!otherUser) return null;
                return (
                  <div key={conv._id} style={{ ...styles.conversationItem, ...(selectedUser?._id === otherUser._id ? styles.conversationItemActive : {}) }} onClick={() => setSelectedUser(otherUser)}>
                    <ClickableAvatar userId={otherUser._id} src={otherUser.profilePicture} size={48} />
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
            <div style={styles.chatCard}>
              <div style={styles.chatHeader}>
                <div style={styles.chatUserInfo}>
                  <ClickableAvatar userId={selectedUser._id} src={selectedUser.profilePicture} size={48} />
                  <div><h4>{selectedUser.name}</h4></div>
                </div>
                <div><button style={styles.callBtn}><FaPhone /></button></div>
              </div>
              <div style={styles.chatBody}>
                {messages.length === 0 ? (
                  <div style={styles.noMessages}><FaUserCircle size={60} /><h6>No messages yet</h6></div>
                ) : (
                  messages.map(msg => {
                    const isOwn = msg.senderId?._id === user._id;
                    return (
                      <div key={msg._id} style={{ ...styles.messageRow, justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                        <div style={{ ...styles.messageBubble, background: isOwn ? KL_BRAND : '#f0f2f5', color: isOwn ? '#fff' : '#050505' }}>
                          <p>{msg.message}</p>
                          <small>{moment(msg.createdAt).format('h:mm A')}</small>
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
            </ul>
          </div>
        </aside>
      </div>

      <ProfileModal userId={selectedUser?._id} show={showProfileModal} onHide={() => setShowProfileModal(false)} />
    </div>
  );
};

const styles = {
  page: { background: '#f0f2f5', minHeight: '100vh' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' },
  loadingLogo: { width: 60, height: 60, borderRadius: '50%', background: KL_BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 24 },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: '1px solid #dddfe2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 200, boxShadow: '0 2px 4px rgba(0,0,0,.08)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 }, navCenter: { display: 'flex', gap: 4 }, navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  logoBox: { width: 40, height: 40, borderRadius: '50%', background: KL_BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  logoText: { color: '#fff', fontWeight: 900, fontSize: 18 }, navTab: { width: 100, height: 48, background: 'transparent', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', textDecoration: 'none' },
  navTabActive: { background: '#fef9e7' }, navTabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: KL_BRAND },
  navIconBtn: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }, navIconInner: { width: 40, height: 40, borderRadius: '50%', background: '#e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, background: '#e41e3f', color: '#fff', borderRadius: 10, fontSize: 11, padding: '1px 5px' },
  body: { display: 'flex', paddingTop: 56, maxWidth: 1400, margin: '0 auto' }, leftSidebar: { width: 320, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  sidebarProfileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px', borderRadius: 8, textDecoration: 'none', color: '#050505' }, sidebarDivider: { borderTop: '1px solid #dddfe2', margin: '12px 0' },
  conversationList: { display: 'flex', flexDirection: 'column', gap: 4 }, conversationItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 10, cursor: 'pointer' },
  conversationItemActive: { background: '#fef9e7' }, convInfo: { flex: 1 }, convName: { fontWeight: 600, fontSize: 15 }, convPreview: { fontSize: 13, color: '#65676b' },
  unreadBadge: { background: KL_BRAND, color: '#fff', borderRadius: 12, padding: '2px 8px', fontSize: 12 }, noChats: { textAlign: 'center', padding: '40px 20px', color: '#65676b' },
  feedCol: { flex: 1, maxWidth: 680, margin: '0 16px', padding: '16px 0', minWidth: 0 },
  chatCard: { background: '#fff', borderRadius: 12, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' },
  chatHeader: { background: '#fff', borderBottom: '1px solid #dddfe2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' },
  chatUserInfo: { display: 'flex', alignItems: 'center', gap: 12 }, callBtn: { background: '#e4e6eb', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  chatBody: { flex: 1, overflowY: 'auto', padding: '16px', background: '#f0f2f5' }, messageRow: { display: 'flex', marginBottom: 12 },
  messageBubble: { maxWidth: '70%', padding: '10px 14px', borderRadius: 18 }, chatFooter: { background: '#fff', borderTop: '1px solid #dddfe2', padding: '12px' },
  sendForm: { display: 'flex', gap: 8 }, messageInput: { flex: 1, padding: '10px 16px', border: '1px solid #dddfe2', borderRadius: 20, outline: 'none' },
  sendBtn: { background: KL_BRAND, border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  noChatSelected: { textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 12 }, noMessages: { textAlign: 'center', padding: '40px', color: '#65676b' },
  rightSidebar: { width: 280, flexShrink: 0, padding: '12px 8px', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' },
  rightCard: { background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16 }, rightCardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #dddfe2' },
  tipsList: { listStyle: 'none', padding: 0, margin: 0, fontSize: 13, lineHeight: 2 },
};

export default Messages;
