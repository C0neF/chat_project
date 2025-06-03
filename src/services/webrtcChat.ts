import { joinRoom, selfId } from 'trystero';

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isUser: boolean;
}

export interface PeerInfo {
  id: string;
  name: string;
  joinedAt: Date;
}

export interface WebRTCChatConfig {
  appId: string;
  roomId: string;
  userName: string;
  password?: string; // 可选的房间密码
}

export class WebRTCChatService {
  private room: any;
  private config: WebRTCChatConfig;
  private peers: Map<string, PeerInfo> = new Map();
  private messageHistory: ChatMessage[] = [];
  
  // 事件回调
  private onMessageCallback?: (message: ChatMessage) => void;
  private onPeerJoinCallback?: (peer: PeerInfo) => void;
  private onPeerLeaveCallback?: (peerId: string) => void;
  private onConnectionStatusCallback?: (status: 'connecting' | 'connected' | 'disconnected') => void;

  constructor(config: WebRTCChatConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      this.onConnectionStatusCallback?.('connecting');

      // 使用 Nostr 策略连接（默认策略，无需额外设置）
      const roomConfig: any = {
        appId: this.config.appId,
      };

      // 如果提供了密码，则使用密码保护
      if (this.config.password) {
        roomConfig.password = this.config.password;
      }

      this.room = joinRoom(roomConfig, this.config.roomId);

      // 设置消息处理
      this.setupMessageHandling();

      // 设置用户管理
      this.setupPeerManagement();

      // 立即设置为已连接状态，因为房间已经创建成功
      // 即使是单用户房间也应该允许发送消息
      this.broadcastUserInfo();
      this.onConnectionStatusCallback?.('connected');

    } catch (error) {
      console.error('连接失败:', error);
      this.onConnectionStatusCallback?.('disconnected');
      throw error;
    }
  }

  private setupMessageHandling(): void {
    // 创建消息发送和接收动作 (action 名称必须 ≤ 12 字节)
    const [sendMessage, getMessage] = this.room.makeAction('msg');
    const [sendUserInfo, getUserInfo] = this.room.makeAction('user');
    const [sendHistory, getHistory] = this.room.makeAction('history');

    // 监听消息
    getMessage((data: any, peerId: string) => {
      const message: ChatMessage = {
        id: data.id,
        content: data.content,
        senderId: peerId,
        senderName: this.peers.get(peerId)?.name || '未知用户',
        timestamp: new Date(data.timestamp),
        isUser: false
      };

      this.messageHistory.push(message);
      this.onMessageCallback?.(message);
    });

    // 监听用户信息
    getUserInfo((data: any, peerId: string) => {
      const peer: PeerInfo = {
        id: peerId,
        name: data.name,
        joinedAt: new Date()
      };
      
      this.peers.set(peerId, peer);
      this.onPeerJoinCallback?.(peer);

      // 向新用户发送消息历史
      if (this.messageHistory.length > 0) {
        sendHistory(this.messageHistory, peerId);
      }
    });

    // 监听消息历史
    getHistory((data: ChatMessage[], peerId: string) => {
      // 合并消息历史，避免重复
      data.forEach(msg => {
        if (!this.messageHistory.find(m => m.id === msg.id)) {
          this.messageHistory.push({
            ...msg,
            timestamp: new Date(msg.timestamp),
            isUser: msg.senderId === selfId
          });
        }
      });

      // 按时间排序
      this.messageHistory.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      // 通知UI更新
      this.messageHistory.forEach(msg => {
        this.onMessageCallback?.(msg);
      });
    });

    // 存储发送函数供外部使用
    this.sendMessage = sendMessage;
    this.sendUserInfo = sendUserInfo;
    this.sendHistory = sendHistory;
  }

  private setupPeerManagement(): void {
    // 监听用户加入
    this.room.onPeerJoin((peerId: string) => {
      console.log(`用户 ${peerId} 加入房间`);
      // 向新用户发送自己的信息
      this.sendUserInfo({ name: this.config.userName }, peerId);

      // 确保连接状态为已连接
      this.onConnectionStatusCallback?.('connected');
    });

    // 监听用户离开
    this.room.onPeerLeave((peerId: string) => {
      console.log(`用户 ${peerId} 离开房间`);
      this.peers.delete(peerId);
      this.onPeerLeaveCallback?.(peerId);
    });
  }

  private broadcastUserInfo(): void {
    // 向房间中的所有用户广播自己的信息
    this.sendUserInfo({ name: this.config.userName });
  }

  // 发送消息的方法
  private sendMessage: any;
  private sendUserInfo: any;
  private sendHistory: any;

  async sendChatMessage(content: string): Promise<void> {
    const message: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content,
      senderId: selfId,
      senderName: this.config.userName,
      timestamp: new Date(),
      isUser: true
    };

    // 添加到本地历史
    this.messageHistory.push(message);
    
    // 通知本地UI
    this.onMessageCallback?.(message);

    // 发送给其他用户
    this.sendMessage({
      id: message.id,
      content: message.content,
      timestamp: message.timestamp.toISOString()
    });
  }

  // 获取当前连接的用户列表
  getPeers(): PeerInfo[] {
    return Array.from(this.peers.values());
  }

  // 获取消息历史
  getMessageHistory(): ChatMessage[] {
    return this.messageHistory;
  }

  // 设置事件监听器
  onMessage(callback: (message: ChatMessage) => void): void {
    this.onMessageCallback = callback;
  }

  onPeerJoin(callback: (peer: PeerInfo) => void): void {
    this.onPeerJoinCallback = callback;
  }

  onPeerLeave(callback: (peerId: string) => void): void {
    this.onPeerLeaveCallback = callback;
  }

  onConnectionStatus(callback: (status: 'connecting' | 'connected' | 'disconnected') => void): void {
    this.onConnectionStatusCallback = callback;
  }

  // 断开连接
  disconnect(): void {
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
    this.peers.clear();
    this.messageHistory = [];
    this.onConnectionStatusCallback?.('disconnected');
  }

  // 获取当前用户ID
  getSelfId(): string {
    return selfId;
  }

  // 获取房间信息
  getRoomInfo() {
    return {
      roomId: this.config.roomId,
      appId: this.config.appId,
      userName: this.config.userName,
      selfId: selfId,
      peerCount: this.peers.size
    };
  }
}
