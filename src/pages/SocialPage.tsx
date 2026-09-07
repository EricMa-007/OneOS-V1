/**
 * OneOS 社交页面 V2
 * 慢连接社交 · 零打扰 · 用户主权
 * 
 * 三大创新：
 * 1. 人类节点：通过话题认识，而非加好友
 * 2. 静默收件箱：消息不实时推送，主动查看
 * 3. 极小圈子：最多10人，话题驱动，讨论自动沉淀
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api, authApi, usersApi, messagesApi, circlesApi, qrcodeApi } from '../shared/api';
import type { User, Friend, Message, Circle, QRCodeResponse } from '../shared/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tag } from '../components/ui/Tag';
import { Icon, IconName } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { Avatar } from '../components/ui/Avatar';
import { Loading } from '../components/ui/Loading';
import { useToast } from '../components/ui/Toast';

type SocialTab = 'inbox' | 'friends' | 'discover' | 'circles' | 'me';

// 颜色映射
const getColor = (id: string): string => {
  const colors = ['#8B5CF6', '#00CEC9', '#FD79A8', '#FDCB6E', '#6C5CE7', '#00B894', '#E17055', '#0984E3'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export const SocialPage: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<SocialTab>('inbox');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverAvailable, setServerAvailable] = useState(true);

  // 检查登录状态和服务器可用性
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const available = await api.serverConfig.isAvailable();
        setServerAvailable(available);
        
        if (authApi.isLoggedIn()) {
          setIsLoggedIn(true);
          setCurrentUser(authApi.getCurrentUser());
          // 同步用户信息
          try {
            const user = await authApi.getMe();
            setCurrentUser(user);
          } catch (e) {
            // Token可能过期，保持本地缓存
          }
        }
      } catch (e) {
        setServerAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, []);

  const tabConfig: Array<{ key: SocialTab; label: string; icon: IconName }> = [
    { key: 'inbox', label: '收件箱', icon: 'message' },
    { key: 'friends', label: '好友', icon: 'users' },
    { key: 'discover', label: '发现', icon: 'compass' },
    { key: 'circles', label: '圈子', icon: 'grid' },
    { key: 'me', label: '我的', icon: 'user' },
  ];

  if (isLoading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading text="加载社交模块..." size="lg" />
      </div>
    );
  }

  // 服务器不可用
  if (!serverAvailable) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ padding: 40, maxWidth: 400, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name="alert" size="lg" color="#F59E0B" />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>社交服务未启动</h2>
          <p style={{ fontSize: 14, color: '#636E72', margin: '0 0 20px', lineHeight: 1.6 }}>
            OneOS 社交功能需要服务器端支持。请启动服务器后再试。
          </p>
          <div style={{ background: '#F8F9FC', borderRadius: 8, padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#636E72', marginBottom: 20 }}>
            cd server &amp;&amp; npm start
          </div>
          <Button variant="primary" onClick={() => window.location.reload()}>
            <Icon name="refresh" size="sm" /> 重新连接
          </Button>
        </Card>
      </div>
    );
  }

  // 未登录 - 显示登录注册界面
  if (!isLoggedIn) {
    return <AuthView onLoginSuccess={(user) => { setIsLoggedIn(true); setCurrentUser(user); toast.success('登录成功'); }} />;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部导航 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {tabConfig.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 500,
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === tab.key ? 'var(--color-primary-500)' : 'var(--color-neutral-100)',
              color: activeTab === tab.key ? '#FFFFFF' : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            <Icon name={tab.icon} size="sm" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'inbox' && <InboxView currentUser={currentUser!} />}
        {activeTab === 'friends' && <FriendsView currentUser={currentUser!} />}
        {activeTab === 'discover' && <DiscoverView />}
        {activeTab === 'circles' && <CirclesView currentUser={currentUser!} />}
        {activeTab === 'me' && <MeView currentUser={currentUser!} onLogout={() => { authApi.logout(); setIsLoggedIn(false); setCurrentUser(null); toast.info('已退出登录'); }} />}
      </div>
    </div>
  );
};

// ==================== 登录注册界面 ====================
const AuthView: React.FC<{ onLoginSuccess: (user: User) => void }> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('请输入用户名和密码');
      return;
    }
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const response = await authApi.login(username, password);
        onLoginSuccess(response.user);
      } else {
        if (password.length < 6) {
          toast.error('密码至少6个字符');
          setIsSubmitting(false);
          return;
        }
        const response = await authApi.register(username, password, displayName || username);
        onLoginSuccess(response.user);
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ padding: 32, maxWidth: 400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #8B5CF6, #6C5CE7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Icon name="message" size="lg" color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>OneOS 社交</h1>
          <p style={{ fontSize: 13, color: '#636E72', margin: 0 }}>慢连接 · 零打扰 · 深度对话</p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            onClick={() => setMode('login')}
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, background: mode === 'login' ? 'var(--color-primary-500)' : 'var(--color-neutral-100)', color: mode === 'login' ? '#FFFFFF' : 'var(--text-secondary)' }}
          >
            登录
          </button>
          <button
            onClick={() => setMode('register')}
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, background: mode === 'register' ? 'var(--color-primary-500)' : 'var(--color-neutral-100)', color: mode === 'register' ? '#FFFFFF' : 'var(--text-secondary)' }}
          >
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>用户名</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="输入用户名" />
          </div>
          {mode === 'register' && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>昵称（可选）</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="显示的昵称" />
            </div>
          )}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>密码</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="输入密码" />
          </div>
          <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
            {isSubmitting ? <Loading size="sm" /> : (mode === 'login' ? '登录' : '注册')}
          </Button>
        </form>

        <div style={{ marginTop: 20, padding: 12, background: 'var(--color-neutral-50)', borderRadius: 8, fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
          <strong>慢连接社交理念：</strong><br />
          · 消息不实时推送，你主动查看<br />
          · 无在线状态、无已读回执，零打扰<br />
          · 通过话题认识人，而非搜索用户名<br />
          · 极小圈子最多10人，深度对话
        </div>
      </Card>
    </div>
  );
};

// ==================== 静默收件箱 ====================
const InboxView: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const toast = useToast();

  const loadInbox = useCallback(async () => {
    try {
      const response = await messagesApi.getInbox(50, 0, false);
      setMessages(response.messages);
      setUnreadCount(response.unreadCount);
    } catch (error: any) {
      toast.error('加载收件箱失败');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadFriends = useCallback(async () => {
    try {
      const response = await usersApi.getFriends();
      setFriends(response.friends);
    } catch (error) {
      // 静默处理
    }
  }, []);

  useEffect(() => {
    loadInbox();
    loadFriends();
  }, [loadInbox, loadFriends]);

  const openConversation = async (friend: Friend) => {
    setSelectedFriend(friend);
    try {
      const response = await messagesApi.getConversation(friend.id);
      setConversation(response.messages);
      await messagesApi.markAllAsRead(friend.id);
      setUnreadCount((prev) => Math.max(0, prev - messages.filter(m => m.fromUser.id === friend.id && !m.isRead).length));
    } catch (error) {
      toast.error('加载对话失败');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return;
    try {
      await messagesApi.sendMessage(selectedFriend.id, newMessage.trim());
      setNewMessage('');
      const response = await messagesApi.getConversation(selectedFriend.id);
      setConversation(response.messages);
      toast.success('消息已发送（慢连接：对方将在下次查看时收到）');
    } catch (error: any) {
      toast.error(error.message || '发送失败');
    }
  };

  if (selectedFriend) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--color-neutral-50)', borderRadius: 12, marginBottom: 12 }}>
          <button onClick={() => setSelectedFriend(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <Icon name="chevron-left" size="md" />
          </button>
          <Avatar size="md" name={selectedFriend.displayName} color={getColor(selectedFriend.id)} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{selectedFriend.displayName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>慢连接 · 零打扰</div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '0 8px' }}>
          {conversation.length === 0 ? (
            <EmptyState icon="message" title="还没有消息" description="发送第一条消息，开始深度对话" size="md" />
          ) : (
            conversation.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.isMine ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: 16, background: msg.isMine ? 'var(--color-primary-500)' : 'var(--color-neutral-100)', color: msg.isMine ? '#FFFFFF' : 'var(--text-primary)', fontSize: 14, lineHeight: 1.6 }}>
                  {msg.content}
                  <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7 }}>
                    {new Date(msg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, paddingTop: 12 }}>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="输入消息（慢连接，对方不会立即收到提醒）"
            style={{ flex: 1 }}
          />
          <Button variant="primary" onClick={sendMessage} disabled={!newMessage.trim()}>
            <Icon name="send" size="sm" />
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loading text="加载收件箱..." /></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>静默收件箱</h2>
        {unreadCount > 0 && <Tag variant="primary">{unreadCount} 条未读</Tag>}
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '0 0 16px', lineHeight: 1.6 }}>
        消息不会实时推送，只有你主动查看时才会出现。零打扰，你的注意力属于你自己。
      </p>
      {messages.length === 0 ? (
        <EmptyState icon="message" title="收件箱是空的" description="当好友给你发送消息时，会出现在这里" actionLabel="去发现好友" onAction={() => {}} size="lg" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {messages.map((msg) => {
            const friend = friends.find(f => f.id === msg.fromUser.id) || msg.fromUser;
            return (
              <Card
                key={msg.id}
                hoverable
                style={{ padding: 16, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}
                onClick={() => openConversation(friend as Friend)}
              >
                <Avatar size="lg" name={msg.fromUser.displayName} color={getColor(msg.fromUser.id)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{msg.fromUser.displayName}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{new Date(msg.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.content}</p>
                </div>
                {!msg.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FD79A8', flexShrink: 0 }} />}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ==================== 好友 ====================
const FriendsView: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const toast = useToast();

  const loadData = useCallback(async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        usersApi.getFriends(),
        usersApi.getFriendRequests(),
      ]);
      setFriends(friendsRes.friends);
      setFriendRequests(requestsRes.requests);
    } catch (error) {
      toast.error('加载好友列表失败');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const acceptRequest = async (requestId: string) => {
    try {
      await usersApi.acceptFriendRequest(requestId);
      toast.success('已接受好友请求');
      loadData();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      await usersApi.rejectFriendRequest(requestId);
      toast.info('已拒绝好友请求');
      loadData();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  if (isLoading) {
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loading text="加载好友..." /></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>我的好友</h2>
        <Button variant="primary" size="sm" onClick={() => setShowQRScanner(true)}>
          <Icon name="qr-code" size="sm" /> 扫码添加
        </Button>
      </div>

      {/* 好友请求 */}
      {friendRequests.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
            好友请求 ({friendRequests.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {friendRequests.map((req) => (
              <Card key={req.id} style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar size="lg" name={req.fromUser.displayName} color={getColor(req.fromUser.id)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{req.fromUser.displayName}</div>
                  {req.message && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{req.message}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="primary" size="sm" onClick={() => acceptRequest(req.id)}>接受</Button>
                  <Button variant="ghost" size="sm" onClick={() => rejectRequest(req.id)}>拒绝</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 好友列表 */}
      {friends.length === 0 ? (
        <EmptyState icon="users" title="还没有好友" description="通过二维码或发现页面，认识有共同话题的人" actionLabel="去发现" onAction={() => {}} size="lg" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {friends.map((friend) => (
            <Card key={friend.id} hoverable style={{ padding: 16, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar size="lg" name={friend.displayName} color={getColor(friend.id)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{friend.displayName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>@{friend.username}</div>
                </div>
              </div>
              {friend.bio && <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.6 }}>{friend.bio}</p>}
              {friend.topicTags && friend.topicTags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {friend.topicTags.slice(0, 3).map((tag) => <Tag key={tag} size="sm">{tag}</Tag>)}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* 扫码弹窗 */}
      {showQRScanner && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowQRScanner(false)}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 24, maxWidth: 400, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>扫码添加好友</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6 }}>
              请输入对方的用户ID或二维码内容（JSON格式），发送好友请求。
            </p>
            <QRCodeInput onSuccess={() => { setShowQRScanner(false); loadData(); }} />
            <Button variant="ghost" fullWidth style={{ marginTop: 12 }} onClick={() => setShowQRScanner(false)}>取消</Button>
          </div>
        </div>
      )}
    </div>
  );
};

// 二维码输入组件
const QRCodeInput: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [qrContent, setQrContent] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleScan = async () => {
    if (!qrContent.trim()) {
      toast.error('请输入二维码内容或用户ID');
      return;
    }
    setIsSubmitting(true);
    try {
      // 尝试解析JSON
      let qrData: any = qrContent.trim();
      try {
        qrData = JSON.parse(qrContent);
      } catch {
        // 如果不是JSON，当作用户ID处理
        qrData = { type: 'oneos-add-friend', userId: qrContent.trim() };
      }
      
      const result = await qrcodeApi.scanQRCode(qrData, message || '通过二维码添加');
      if (result.alreadyFriend) {
        toast.info('已经是好友了');
      } else if (result.requestPending) {
        toast.info('已有待处理的好友请求');
      } else {
        toast.success('好友请求已发送（慢连接：对方将在下次查看时收到）');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>二维码内容 / 用户ID</label>
        <Input value={qrContent} onChange={(e) => setQrContent(e.target.value)} placeholder="粘贴二维码内容或输入用户ID" />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>验证消息（可选）</label>
        <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="我是..." />
      </div>
      <Button variant="primary" fullWidth onClick={handleScan} disabled={isSubmitting}>
        {isSubmitting ? <Loading size="sm" /> : '发送好友请求'}
      </Button>
    </div>
  );
};

// ==================== 人类节点发现 ====================
const DiscoverView: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topic, setTopic] = useState('');
  const toast = useToast();

  const loadRecommendations = useCallback(async (searchTopic?: string) => {
    setIsLoading(true);
    try {
      const response = await usersApi.discoverHumans(searchTopic, 20);
      setRecommendations(response.recommendations);
    } catch (error) {
      toast.error('加载推荐失败');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const sendFriendRequest = async (userId: string) => {
    try {
      await usersApi.sendFriendRequest(userId, '通过话题发现，希望能有深度对话');
      toast.success('好友请求已发送');
    } catch (error: any) {
      toast.error(error.message || '发送失败');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>人类节点</h2>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.6 }}>
          人是知识网络中的节点。通过话题认识，而非搜索用户名。找到有共同语言的人，开始深度对话。
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="按话题搜索，如：AI、哲学、物理..." style={{ flex: 1 }} onKeyDown={(e) => e.key === 'Enter' && loadRecommendations(topic)} />
        <Button variant="primary" onClick={() => loadRecommendations(topic)}><Icon name="search" size="sm" /></Button>
      </div>

      {isLoading ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loading text="发现人类节点..." /></div>
      ) : recommendations.length === 0 ? (
        <EmptyState icon="compass" title="暂无推荐" description="完善你的话题标签，系统会推荐有共同语言的人" size="lg" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {recommendations.map((user) => (
            <Card key={user.id} style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar size="lg" name={user.displayName} color={getColor(user.id)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{user.displayName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>@{user.username}</div>
                </div>
              </div>
              {user.bio && <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.6 }}>{user.bio}</p>}
              {user.commonTags && user.commonTags.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>共同话题 ({user.commonCount})</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {user.commonTags.slice(0, 3).map((tag: string) => <Tag key={tag} size="sm" variant="primary">{tag}</Tag>)}
                  </div>
                </div>
              )}
              <Button variant="primary" size="sm" fullWidth onClick={() => sendFriendRequest(user.id)}>
                <Icon name="user-plus" size="sm" /> 发送好友请求
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== 极小圈子 ====================
const CirclesView: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [myCircles, setMyCircles] = useState<Circle[]>([]);
  const [publicCircles, setPublicCircles] = useState<Circle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const toast = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [myRes, publicRes] = await Promise.all([
        circlesApi.getMyCircles(),
        circlesApi.getCircles(undefined, 20, 0),
      ]);
      setMyCircles(myRes.circles);
      // 过滤掉我已加入的圈子
      const myCircleIds = new Set(myRes.circles.map(c => c.id));
      setPublicCircles(publicRes.circles.filter(c => !myCircleIds.has(c.id)));
    } catch (error) {
      toast.error('加载圈子失败');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const joinCircle = async (circleId: string) => {
    try {
      await circlesApi.joinCircle(circleId);
      toast.success('已加入圈子');
      loadData();
    } catch (error: any) {
      toast.error(error.message || '加入失败');
    }
  };

  if (isLoading) {
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loading text="加载圈子..." /></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>极小圈子</h2>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>最多10人 · 话题驱动 · 讨论自动沉淀为知识</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Icon name="plus" size="sm" /> 创建圈子
        </Button>
      </div>

      {/* 我加入的圈子 */}
      {myCircles.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
            我的圈子 ({myCircles.length}/3)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {myCircles.map((circle) => (
              <Card key={circle.id} hoverable style={{ padding: 16, cursor: 'pointer' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${getColor(circle.id)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon name="grid" size="lg" color={getColor(circle.id)} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>{circle.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.6 }}>{circle.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{circle.memberCount}/{circle.maxMembers} 人</span>
                  <Tag size="sm" variant="primary">{circle.topic}</Tag>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 发现圈子 */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
          发现圈子
        </h3>
        {publicCircles.length === 0 ? (
          <EmptyState icon="grid" title="暂无更多圈子" description="创建一个新的极小圈子，开始深度讨论" size="md" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {publicCircles.map((circle) => (
              <Card key={circle.id} style={{ padding: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${getColor(circle.id)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon name="grid" size="lg" color={getColor(circle.id)} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>{circle.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.6 }}>{circle.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{circle.memberCount}/{circle.maxMembers} 人</span>
                  <Tag size="sm" variant="primary">{circle.topic}</Tag>
                </div>
                <Button variant="primary" size="sm" fullWidth onClick={() => joinCircle(circle.id)} disabled={circle.memberCount >= circle.maxMembers}>
                  {circle.memberCount >= circle.maxMembers ? '已满员' : '加入圈子'}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 创建圈子弹窗 */}
      {showCreate && (
        <CreateCircleModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); loadData(); }} />
      )}
    </div>
  );
};

// 创建圈子弹窗
const CreateCircleModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleCreate = async () => {
    if (!name || !topic) {
      toast.error('请填写圈子名称和话题');
      return;
    }
    setIsSubmitting(true);
    try {
      await circlesApi.createCircle({ name, description, topic });
      toast.success('圈子创建成功');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || '创建失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 24, maxWidth: 400, width: '90%' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>创建极小圈子</h3>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>圈子名称 *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="给圈子起个名字" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>话题 *</label>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="如：AI、哲学、物理、文学..." />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>描述（可选）</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="描述这个圈子的目的" />
        </div>
        <div style={{ background: 'var(--color-neutral-50)', borderRadius: 8, padding: 12, fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16, lineHeight: 1.6 }}>
          极小圈子规则：<br />
          · 最多10人，每人最多3个圈子<br />
          · 话题驱动，无消息流<br />
          · 所有讨论自动沉淀为共享文档
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" fullWidth onClick={onClose}>取消</Button>
          <Button variant="primary" fullWidth onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? <Loading size="sm" /> : '创建'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ==================== 我的 ====================
const MeView: React.FC<{ currentUser: User; onLogout: () => void }> = ({ currentUser, onLogout }) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: currentUser.displayName, bio: currentUser.bio });
  const toast = useToast();

  const loadQRCode = useCallback(async () => {
    setIsLoadingQR(true);
    try {
      const response = await qrcodeApi.getMyQRCode();
      setQrCode(response.qrCode);
    } catch (error) {
      toast.error('生成二维码失败');
    } finally {
      setIsLoadingQR(false);
    }
  }, [toast]);

  useEffect(() => {
    loadQRCode();
  }, [loadQRCode]);

  const handleSave = async () => {
    try {
      await authApi.updateMe(editForm);
      toast.success('资料已更新');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || '更新失败');
    }
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(currentUser.id);
    toast.success('用户ID已复制');
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* 个人资料卡片 */}
      <Card style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <Avatar size="xl" name={currentUser.displayName} color={getColor(currentUser.id)} />
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <Input value={editForm.displayName} onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })} style={{ marginBottom: 8 }} />
            ) : (
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>{currentUser.displayName}</h2>
            )}
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              @{currentUser.username}
              <button onClick={copyUserId} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary-500)', fontSize: 12 }}>
                复制ID
              </button>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
            {isEditing ? '保存' : '编辑'}
          </Button>
        </div>

        {isEditing ? (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>个人简介</label>
            <Input value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="介绍一下自己" />
          </div>
        ) : (
          currentUser.bio && <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6 }}>{currentUser.bio}</p>
        )}

        {currentUser.topicTags && currentUser.topicTags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {currentUser.topicTags.map((tag) => <Tag key={tag} size="sm" variant="primary">{tag}</Tag>)}
          </div>
        )}
      </Card>

      {/* 二维码卡片 */}
      <Card style={{ padding: 24, marginBottom: 20, textAlign: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>我的二维码</h3>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '0 0 16px' }}>扫码添加我为好友，开始慢连接深度对话</p>
        
        {isLoadingQR ? (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loading text="生成二维码..." /></div>
        ) : qrCode ? (
          <div style={{ display: 'inline-block', padding: 16, background: '#FFFFFF', borderRadius: 12, border: '1px solid var(--border-light)', marginBottom: 16 }}>
            <img src={qrCode} alt="我的二维码" style={{ width: 200, height: 200 }} />
          </div>
        ) : (
          <EmptyState icon="qr-code" title="生成失败" description="点击重试生成二维码" actionLabel="重试" onAction={loadQRCode} size="md" />
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button variant="primary" size="sm" onClick={loadQRCode}>
            <Icon name="refresh" size="sm" /> 刷新
          </Button>
          <Button variant="ghost" size="sm" onClick={() => {
            const text = qrcodeApi.generateShareText(currentUser);
            navigator.clipboard.writeText(text);
            toast.success('分享文本已复制');
          }}>
            <Icon name="share" size="sm" /> 分享
          </Button>
        </div>
      </Card>

      {/* 设置 */}
      <Card style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>设置</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>慢连接设置</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>消息接收时间窗口</div>
            </div>
            <Tag size="sm">即将上线</Tag>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>隐私设置</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>谁可以看到我的资料</div>
            </div>
            <Tag size="sm">即将上线</Tag>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>数据导出</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>导出我的所有社交数据</div>
            </div>
            <Tag size="sm">即将上线</Tag>
          </div>
        </div>
      </Card>

      {/* 退出登录 */}
      <Button variant="ghost" fullWidth style={{ marginTop: 20, color: '#E53E3E' }} onClick={onLogout}>
        <Icon name="logout" size="sm" /> 退出登录
      </Button>
    </div>
  );
};

export default SocialPage;
