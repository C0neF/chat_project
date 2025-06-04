'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import WelcomeScreen from './WelcomeScreen';
import JoinRoomModal from './JoinRoomModal';
import CreateRoomModal from './CreateRoomModal';
import EncryptedRoomModal from './EncryptedRoomModal';
import PasswordModal from './PasswordModal';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ThemeToggle from './ThemeToggle';
import { WebRTCChatService, ChatMessage, PeerInfo } from '../services/webrtcChat';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

type ViewType = 'welcome' | 'chat';
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export default function ChatContainer() {
  // 界面状态管理
  const [currentView, setCurrentView] = useState<ViewType>('welcome');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEncryptedModal, setShowEncryptedModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);
  const [pendingSharedRoomId, setPendingSharedRoomId] = useState<string | null>(null);
  const [pendingEncryptedRoomId, setPendingEncryptedRoomId] = useState<string | null>(null);

  // WebRTC 聊天状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // WebRTC 服务引用
  const chatServiceRef = useRef<WebRTCChatService | null>(null);

  // 生成房间号：公开房间6位，加密房间4位
  const generateRoomId = (isEncrypted: boolean = false) => {
    if (isEncrypted) {
      // 加密房间：4位数字 (1000-9999)
      return Math.floor(1000 + Math.random() * 9000).toString();
    } else {
      // 公开房间：6位数字 (100000-999999)
      return Math.floor(100000 + Math.random() * 900000).toString();
    }
  };

  // 初始化 WebRTC 聊天服务
  const initializeChatService = useCallback(async (roomId: string, password?: string) => {
    try {
      setIsConnecting(true);

      // 创建聊天服务实例
      const chatService = new WebRTCChatService({
        appId: 'chat-app-2024', // 应用唯一标识
        roomId: roomId,
        userName: `用户${Math.floor(Math.random() * 1000)}`, // 简单的用户名生成
        password: password // 可选的房间密码
      });

      // 设置事件监听器
      chatService.onMessage((message: ChatMessage) => {
        setMessages(prev => [...prev, {
          id: message.id,
          content: message.content,
          isUser: message.isUser,
          timestamp: message.timestamp
        }]);
      });

      chatService.onPeerJoin((peer: PeerInfo) => {
        setPeers(prev => [...prev, peer]);
        console.log(`${peer.name} 加入了房间`);
      });

      chatService.onPeerLeave((peerId: string) => {
        setPeers(prev => prev.filter(p => p.id !== peerId));
        console.log(`用户 ${peerId} 离开了房间`);
      });

      chatService.onConnectionStatus((status: ConnectionStatus) => {
        setConnectionStatus(status);
        if (status === 'connected') {
          setIsConnecting(false);
        }
      });

      // 连接到房间
      await chatService.connect();

      // 保存服务引用
      chatServiceRef.current = chatService;

    } catch (error) {
      console.error('初始化聊天服务失败:', error);
      setIsConnecting(false);
      setConnectionStatus('disconnected');
    }
  }, []);

  // 清理聊天服务
  const cleanupChatService = useCallback(() => {
    if (chatServiceRef.current) {
      chatServiceRef.current.disconnect();
      chatServiceRef.current = null;
    }
    setMessages([]);
    setPeers([]);
    setConnectionStatus('disconnected');
    setIsConnecting(false);
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanupChatService();
    };
  }, [cleanupChatService]);

  // 显示创建房间弹窗
  const handleCreateRoom = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  // 创建公开房间
  const handleCreatePublicRoom = useCallback(async () => {
    const newRoomId = generateRoomId(false); // 6位公开房间号
    setRoomId(newRoomId);
    setCurrentView('chat');
    setShowCreateModal(false);
    await initializeChatService(newRoomId);
  }, [initializeChatService]);

  // 显示加密房间设置
  const handleCreateEncryptedRoom = useCallback(() => {
    const newRoomId = generateRoomId(true); // 4位加密房间号
    setPendingRoomId(newRoomId);
    setShowCreateModal(false);
    setShowEncryptedModal(true);
  }, []);

  // 创建加密房间
  const handleCreateEncryptedRoomWithPassword = useCallback(async (password: string) => {
    if (!pendingRoomId) return;

    setRoomId(pendingRoomId);
    setCurrentView('chat');
    setShowEncryptedModal(false);
    setPendingRoomId(null);
    await initializeChatService(pendingRoomId, password);
  }, [pendingRoomId, initializeChatService]);

  // 显示加入房间弹窗
  const handleShowJoinRoom = useCallback(() => {
    setShowJoinModal(true);
  }, []);

  // 加入房间 - 新的流程
  const handleJoinRoom = useCallback(async (inputRoomId: string) => {
    const isPublicRoom = /^\d{6}$/.test(inputRoomId);
    const isEncryptedRoom = /^\d{4}$/.test(inputRoomId);

    if (isPublicRoom) {
      // 公开房间直接加入
      setRoomId(inputRoomId);
      setCurrentView('chat');
      setShowJoinModal(false);
      await initializeChatService(inputRoomId);
    } else if (isEncryptedRoom) {
      // 加密房间显示密码弹窗
      setShowJoinModal(false);
      setPendingEncryptedRoomId(inputRoomId);
      setShowPasswordModal(true);
    }
  }, [initializeChatService]);

  // 处理密码验证并加入加密房间
  const handlePasswordSubmit = useCallback(async (password: string) => {
    if (pendingEncryptedRoomId) {
      setRoomId(pendingEncryptedRoomId);
      setCurrentView('chat');
      setShowPasswordModal(false);
      await initializeChatService(pendingEncryptedRoomId, password);
      setPendingEncryptedRoomId(null);
    }
  }, [pendingEncryptedRoomId, initializeChatService]);

  // 关闭加入房间弹窗
  const handleCloseJoinModal = useCallback(() => {
    setShowJoinModal(false);
    setPendingSharedRoomId(null); // 清除预填的房间号
  }, []);

  // 关闭创建房间弹窗
  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  // 关闭加密房间弹窗
  const handleCloseEncryptedModal = useCallback(() => {
    setShowEncryptedModal(false);
    setPendingRoomId(null);
  }, []);

  // 关闭密码弹窗
  const handleClosePasswordModal = useCallback(() => {
    setShowPasswordModal(false);
    setPendingEncryptedRoomId(null);
  }, []);

  // 返回欢迎界面
  const handleBackToWelcome = useCallback(() => {
    cleanupChatService();
    setCurrentView('welcome');
    setRoomId(null);
  }, [cleanupChatService]);

  // 发送消息
  const handleSendMessage = useCallback(async (content: string) => {
    if (chatServiceRef.current && connectionStatus !== 'disconnected') {
      try {
        await chatServiceRef.current.sendChatMessage(content);
      } catch (error) {
        console.error('发送消息失败:', error);
      }
    }
  }, [connectionStatus]);

  // 分享房间功能（支持公开房间和加密房间）
  const handleShareRoom = useCallback(async () => {
    if (!roomId) return;

    // 判断房间类型
    const isPublicRoom = roomId.length === 6 && /^\d{6}$/.test(roomId);
    const isEncryptedRoom = roomId.length === 4 && /^\d{4}$/.test(roomId);

    if (!isPublicRoom && !isEncryptedRoom) {
      // 如果不是有效的房间格式，不执行分享
      return;
    }

    // 生成分享链接
    const shareUrl = `${window.location.origin}?room=${roomId}`;
    const roomType = isPublicRoom ? '公开' : '加密';
    const shareText = `加入我的${roomType}聊天房间 #${roomId}${isEncryptedRoom ? '（需要密码）' : ''}`;

    try {
      // 优先使用 Web Share API（移动端友好）
      if (navigator.share) {
        await navigator.share({
          title: '聊天房间分享',
          text: shareText,
          url: shareUrl,
        });
      } else {
        // 降级到复制到剪贴板
        await navigator.clipboard.writeText(shareUrl);

        // 显示复制成功提示
        const successMessage = isEncryptedRoom
          ? '加密房间链接已复制到剪贴板！\n注意：接收者需要输入密码才能加入。'
          : '房间链接已复制到剪贴板！';
        alert(successMessage);
      }
    } catch (error) {
      console.error('分享失败:', error);

      // 如果所有方法都失败，提供手动复制的方式
      const fallbackText = `请手动复制此链接分享房间：\n${shareUrl}`;
      alert(fallbackText);
    }
  }, [roomId]);

  // 判断房间类型
  const isPublicRoom = roomId ? roomId.length === 6 && /^\d{6}$/.test(roomId) : false;
  const isEncryptedRoom = roomId ? roomId.length === 4 && /^\d{4}$/.test(roomId) : false;
  const canShareRoom = isPublicRoom || isEncryptedRoom;

  // 处理 URL 参数，自动加入分享的房间
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedRoomId = urlParams.get('room');

      if (sharedRoomId && currentView === 'welcome') {
        // 验证房间号格式
        const isValidPublicRoom = /^\d{6}$/.test(sharedRoomId);
        const isValidEncryptedRoom = /^\d{4}$/.test(sharedRoomId);

        if (isValidPublicRoom) {
          // 自动加入分享的公开房间
          handleJoinRoom(sharedRoomId);

          // 清除 URL 参数，避免重复加入
          window.history.replaceState({}, '', window.location.pathname);
        } else if (isValidEncryptedRoom) {
          // 对于加密房间，直接显示密码弹窗
          setPendingEncryptedRoomId(sharedRoomId);
          setShowPasswordModal(true);

          // 清除 URL 参数，避免重复处理
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, [currentView, handleJoinRoom]);

  // 根据当前视图渲染不同界面
  if (currentView === 'welcome') {
    return (
      <>
        <WelcomeScreen
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleShowJoinRoom}
        />
        <JoinRoomModal
          isOpen={showJoinModal}
          onClose={handleCloseJoinModal}
          onJoin={handleJoinRoom}
          prefilledRoomId={pendingSharedRoomId || undefined}
        />

        {/* 创建房间类型选择弹窗 */}
        <CreateRoomModal
          isOpen={showCreateModal}
          onClose={handleCloseCreateModal}
          onCreatePublic={handleCreatePublicRoom}
          onCreateEncrypted={handleCreateEncryptedRoom}
        />

        {/* 加密房间设置弹窗 */}
        <EncryptedRoomModal
          isOpen={showEncryptedModal}
          onClose={handleCloseEncryptedModal}
          onCreateRoom={handleCreateEncryptedRoomWithPassword}
          roomId={pendingRoomId || undefined}
        />

        {/* 密码验证弹窗 */}
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={handleClosePasswordModal}
          onSubmit={handlePasswordSubmit}
          roomId={pendingEncryptedRoomId || ''}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
      {/* 主题切换按钮 - 右上角固定定位 */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle size="medium" />
      </div>

      {/* 居中的聊天区域 - Bento Grid 风格 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl h-[80vh] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col"
      >
        {/* 聊天头部 - Bento 风格，显示房间号和连接状态 */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                'bg-red-500'
              }`}></div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  房间 #{roomId}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {connectionStatus === 'connected' && `${peers.length + 1} 人在线`}
                  {connectionStatus === 'connecting' && '正在连接...'}
                  {connectionStatus === 'disconnected' && '连接断开'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* 分享按钮 - 对公开房间和加密房间都显示 */}
              {canShareRoom && (
                <motion.button
                  onClick={handleShareRoom}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-[32px] h-[32px] rounded-full flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  title="分享房间"
                >
                  <ShareIcon fontSize="small" />
                </motion.button>
              )}

              {/* 关闭按钮 */}
              <motion.button
                onClick={handleBackToWelcome}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-[32px] h-[32px] rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                title="关闭聊天"
              >
                <CloseIcon fontSize="small" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* 消息列表 */}
        <MessageList messages={messages} />

        {/* 消息输入 */}
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={connectionStatus !== 'connected' || isConnecting}
        />
      </motion.div>
    </div>
  );
}
