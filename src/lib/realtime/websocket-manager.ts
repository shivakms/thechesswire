/**
 * WebSocket Manager for Real-time Features
 * 
 * This module provides WebSocket functionality for real-time features across the platform.
 * It addresses the missing WebSocket implementation identified in the gaps analysis.
 */

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface WebSocketConnection {
  id: string;
  userId?: string;
  userAgent: string;
  ipAddress: string;
  connectedAt: Date;
  lastActivity: Date;
  subscriptions: string[];
}

export interface WebSocketEvent {
  type: 'connect' | 'disconnect' | 'message' | 'error';
  connectionId: string;
  data?: any;
  timestamp: Date;
}

export interface RealTimeFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  maxConnections: number;
  rateLimit: number; // messages per minute
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private connections: Map<string, WebSocketConnection> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map(); // topic -> connectionIds
  private features: Map<string, RealTimeFeature> = new Map();
  private messageQueue: WebSocketMessage[] = [];
  private isRunning: boolean = false;
  private cleanupInterval?: NodeJS.Timeout;

  private constructor() {
    this.initializeFeatures();
  }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  /**
   * Initialize real-time features
   */
  private initializeFeatures(): void {
    const features: RealTimeFeature[] = [
      {
        id: 'live-games',
        name: 'Live Games',
        description: 'Real-time updates for ongoing chess games',
        enabled: true,
        maxConnections: 1000,
        rateLimit: 60
      },
      {
        id: 'chat',
        name: 'Live Chat',
        description: 'Real-time chat functionality',
        enabled: true,
        maxConnections: 500,
        rateLimit: 120
      },
      {
        id: 'notifications',
        name: 'Notifications',
        description: 'Real-time notifications and alerts',
        enabled: true,
        maxConnections: 2000,
        rateLimit: 30
      },
      {
        id: 'analytics',
        name: 'Analytics',
        description: 'Real-time analytics and metrics',
        enabled: true,
        maxConnections: 100,
        rateLimit: 10
      },
      {
        id: 'admin-dashboard',
        name: 'Admin Dashboard',
        description: 'Real-time admin dashboard updates',
        enabled: true,
        maxConnections: 50,
        rateLimit: 20
      }
    ];

    features.forEach(feature => {
      this.features.set(feature.id, feature);
      this.subscriptions.set(feature.id, new Set());
    });
  }

  /**
   * Start the WebSocket manager
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startCleanupInterval();
    console.log('WebSocket Manager started');
  }

  /**
   * Stop the WebSocket manager
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.stopCleanupInterval();
    this.connections.clear();
    this.subscriptions.forEach(set => set.clear());
    console.log('WebSocket Manager stopped');
  }

  /**
   * Handle new connection
   */
  handleConnection(connectionId: string, userId: string, userAgent: string, ipAddress: string): void {
    const connection: WebSocketConnection = {
      id: connectionId,
      userId,
      userAgent,
      ipAddress,
      connectedAt: new Date(),
      lastActivity: new Date(),
      subscriptions: []
    };

    this.connections.set(connectionId, connection);
    console.log(`New WebSocket connection: ${connectionId} (User: ${userId})`);
  }

  /**
   * Handle connection disconnect
   */
  handleDisconnect(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Remove from all subscriptions
    connection.subscriptions.forEach(topic => {
      const subscribers = this.subscriptions.get(topic);
      if (subscribers) {
        subscribers.delete(connectionId);
      }
    });

    this.connections.delete(connectionId);
    console.log(`WebSocket connection closed: ${connectionId}`);
  }

  /**
   * Handle incoming message
   */
  handleMessage(connectionId: string, message: WebSocketMessage): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Update last activity
    connection.lastActivity = new Date();

    // Validate message
    if (!this.validateMessage(message)) {
      this.sendError(connectionId, 'Invalid message format');
      return;
    }

    // Handle different message types
    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(connectionId, message.data);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(connectionId, message.data);
        break;
      case 'chat':
        this.handleChatMessage(connectionId, message);
        break;
      case 'game-move':
        this.handleGameMove(connectionId, message);
        break;
      case 'ping':
        this.sendPong(connectionId);
        break;
      default:
        this.sendError(connectionId, `Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle subscription request
   */
  private handleSubscribe(connectionId: string, data: { topic: string }): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { topic } = data;
    const feature = this.features.get(topic);

    if (!feature) {
      this.sendError(connectionId, `Unknown topic: ${topic}`);
      return;
    }

    if (!feature.enabled) {
      this.sendError(connectionId, `Feature disabled: ${topic}`);
      return;
    }

    const subscribers = this.subscriptions.get(topic);
    if (subscribers && subscribers.size >= feature.maxConnections) {
      this.sendError(connectionId, `Topic at maximum capacity: ${topic}`);
      return;
    }

    // Add to subscription
    if (subscribers) {
      subscribers.add(connectionId);
    }
    connection.subscriptions.push(topic);

    this.sendMessage(connectionId, {
      type: 'subscribed',
      data: { topic },
      timestamp: Date.now()
    });

    console.log(`User ${connection.userId} subscribed to ${topic}`);
  }

  /**
   * Handle unsubscription request
   */
  private handleUnsubscribe(connectionId: string, data: { topic: string }): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { topic } = data;
    const subscribers = this.subscriptions.get(topic);

    if (subscribers) {
      subscribers.delete(connectionId);
    }

    connection.subscriptions = connection.subscriptions.filter(t => t !== topic);

    this.sendMessage(connectionId, {
      type: 'unsubscribed',
      data: { topic },
      timestamp: Date.now()
    });

    console.log(`User ${connection.userId} unsubscribed from ${topic}`);
  }

  /**
   * Handle chat message
   */
  private handleChatMessage(connectionId: string, message: WebSocketMessage): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Validate chat message
    if (!message.data.content || typeof message.data.content !== 'string') {
      this.sendError(connectionId, 'Invalid chat message');
      return;
    }

    // Rate limiting
    if (!this.checkRateLimit(connectionId, 'chat')) {
      this.sendError(connectionId, 'Rate limit exceeded');
      return;
    }

    // Broadcast to chat subscribers
    this.broadcastToTopic('chat', {
      type: 'chat-message',
      data: {
        userId: connection.userId,
        content: message.data.content,
        timestamp: message.timestamp
      },
      timestamp: Date.now()
    });
  }

  /**
   * Handle game move
   */
  private handleGameMove(connectionId: string, message: WebSocketMessage): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Validate game move
    if (!message.data.gameId || !message.data.move) {
      this.sendError(connectionId, 'Invalid game move');
      return;
    }

    // Rate limiting
    if (!this.checkRateLimit(connectionId, 'live-games')) {
      this.sendError(connectionId, 'Rate limit exceeded');
      return;
    }

    // Broadcast to game subscribers
    this.broadcastToTopic('live-games', {
      type: 'game-move',
      data: {
        gameId: message.data.gameId,
        userId: connection.userId,
        move: message.data.move,
        timestamp: message.timestamp
      },
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast message to topic subscribers
   */
  broadcastToTopic(topic: string, message: WebSocketMessage): void {
    const subscribers = this.subscriptions.get(topic);
    if (!subscribers) return;

    subscribers.forEach(connectionId => {
      this.sendMessage(connectionId, message);
    });
  }

  /**
   * Send message to specific connection
   */
  sendMessage(connectionId: string, message: WebSocketMessage): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // In a real implementation, this would send via actual WebSocket
    // For now, we'll queue the message
    this.messageQueue.push({
      ...message,
      userId: connection.userId,
      sessionId: connectionId
    });

    // Update last activity
    connection.lastActivity = new Date();
  }

  /**
   * Send error message
   */
  sendError(connectionId: string, error: string): void {
    this.sendMessage(connectionId, {
      type: 'error',
      data: { message: error },
      timestamp: Date.now()
    });
  }

  /**
   * Send pong response
   */
  sendPong(connectionId: string): void {
    this.sendMessage(connectionId, {
      type: 'pong',
      data: { timestamp: Date.now() },
      timestamp: Date.now()
    });
  }

  /**
   * Validate message format
   */
  private validateMessage(message: WebSocketMessage): boolean {
    return (
      message &&
      typeof message.type === 'string' &&
      message.data !== undefined &&
      typeof message.timestamp === 'number'
    );
  }

  /**
   * Check rate limit for connection
   */
  private checkRateLimit(connectionId: string, topic: string): boolean {
    const feature = this.features.get(topic);
    if (!feature) return false;

    // Simple rate limiting - in production, use Redis or similar
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentMessages = this.messageQueue.filter(
      msg => msg.sessionId === connectionId && msg.timestamp > oneMinuteAgo
    );

    return recentMessages.length < feature.rateLimit;
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveConnections();
    }, 30000); // Clean up every 30 seconds
  }

  /**
   * Stop cleanup interval
   */
  private stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  /**
   * Clean up inactive connections
   */
  private cleanupInactiveConnections(): void {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [connectionId, connection] of this.connections.entries()) {
      const timeSinceActivity = now.getTime() - connection.lastActivity.getTime();
      
      if (timeSinceActivity > inactiveThreshold) {
        this.handleDisconnect(connectionId);
      }
    }

    // Clean up old messages from queue
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.messageQueue = this.messageQueue.filter(msg => msg.timestamp > oneHourAgo);
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    totalConnections: number;
    activeFeatures: number;
    messageQueueSize: number;
    connectionsByFeature: { [key: string]: number };
  } {
    const connectionsByFeature: { [key: string]: number } = {};
    
    this.features.forEach((feature, featureId) => {
      const subscribers = this.subscriptions.get(featureId);
      connectionsByFeature[featureId] = subscribers ? subscribers.size : 0;
    });

    return {
      totalConnections: this.connections.size,
      activeFeatures: Array.from(this.features.values()).filter(f => f.enabled).length,
      messageQueueSize: this.messageQueue.length,
      connectionsByFeature
    };
  }

  /**
   * Get connection info
   */
  getConnectionInfo(connectionId: string): WebSocketConnection | null {
    return this.connections.get(connectionId) || null;
  }

  /**
   * Get all connections
   */
  getAllConnections(): WebSocketConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Enable/disable feature
   */
  setFeatureStatus(featureId: string, enabled: boolean): boolean {
    const feature = this.features.get(featureId);
    if (!feature) return false;

    feature.enabled = enabled;
    console.log(`Feature ${featureId} ${enabled ? 'enabled' : 'disabled'}`);
    return true;
  }

  /**
   * Get feature info
   */
  getFeatureInfo(featureId: string): RealTimeFeature | null {
    return this.features.get(featureId) || null;
  }

  /**
   * Get all features
   */
  getAllFeatures(): RealTimeFeature[] {
    return Array.from(this.features.values());
  }

  /**
   * Get message queue (for debugging)
   */
  getMessageQueue(): WebSocketMessage[] {
    return [...this.messageQueue];
  }

  /**
   * Clear message queue
   */
  clearMessageQueue(): void {
    this.messageQueue = [];
  }
}

// Export singleton instance
export const websocketManager = WebSocketManager.getInstance();

// Export utility functions
export const startWebSocketManager = () => websocketManager.start();
export const stopWebSocketManager = () => websocketManager.stop();
export const handleConnection = (connectionId: string, userId: string, userAgent: string, ipAddress: string) => 
  websocketManager.handleConnection(connectionId, userId, userAgent, ipAddress);
export const handleDisconnect = (connectionId: string) => 
  websocketManager.handleDisconnect(connectionId);
export const handleMessage = (connectionId: string, message: WebSocketMessage) => 
  websocketManager.handleMessage(connectionId, message);
export const broadcastToTopic = (topic: string, message: WebSocketMessage) => 
  websocketManager.broadcastToTopic(topic, message);
export const sendMessage = (connectionId: string, message: WebSocketMessage) => 
  websocketManager.sendMessage(connectionId, message);
export const getStats = () => websocketManager.getStats();
export const getConnectionInfo = (connectionId: string) => 
  websocketManager.getConnectionInfo(connectionId);
export const getAllConnections = () => websocketManager.getAllConnections();
export const setFeatureStatus = (featureId: string, enabled: boolean) => 
  websocketManager.setFeatureStatus(featureId, enabled);
export const getFeatureInfo = (featureId: string) => 
  websocketManager.getFeatureInfo(featureId);
export const getAllFeatures = () => websocketManager.getAllFeatures(); 