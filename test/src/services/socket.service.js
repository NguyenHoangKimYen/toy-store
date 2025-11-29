import { io } from 'socket.io-client';

// Socket.io connects to the base URL, not /api
const API_URL = import.meta.env.VITE_API_URL || 'https://api.milkybloomtoystore.id.vn/api';
// Remove trailing /api to get base URL
const SOCKET_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

// BroadcastChannel for cross-tab communication (works without backend socket)
const CART_CHANNEL_NAME = 'cart_updates';

// Generate unique tab ID for conflict resolution
const TAB_ID = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.broadcastChannel = null;
    this.broadcastCallbacks = new Set();
    this.tabId = TAB_ID;
    
    // Track last update timestamp per variant for conflict resolution
    this.lastUpdateTimestamps = {};
    
    // Initialize BroadcastChannel for cross-tab sync
    this._initBroadcastChannel();
  }

  _initBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel(CART_CHANNEL_NAME);
      this.broadcastChannel.onmessage = (event) => {
        const { type, payload, timestamp, sourceTabId } = event.data;
        
        // Ignore messages from self
        if (sourceTabId === this.tabId) {
          return;
        }
        
        console.log('📡 Received cart update from tab:', sourceTabId, 'at', timestamp);
        
        if (type === 'cart_updated') {
          // Call all registered callbacks with timestamp for conflict resolution
          this.broadcastCallbacks.forEach(callback => {
            try {
              callback({ ...payload, _timestamp: timestamp, _sourceTabId: sourceTabId });
            } catch (err) {
              console.error('Error in broadcast callback:', err);
            }
          });
        }
      };
      console.log('📡 BroadcastChannel initialized, Tab ID:', this.tabId);
    } else {
      console.warn('⚠️ BroadcastChannel not supported in this browser');
    }
  }

  connect(userId) {
    if (this.socket?.connected) {
      return this.socket;
    }

    console.log('🔌 Connecting to socket URL:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('🟢 Socket connected:', this.socket.id);
      this.connected = true;

      // Join user room if userId provided
      if (userId) {
        this.socket.emit('join_user_room', userId);
        console.log('👤 Joined user room:', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // Subscribe to cart updates from BroadcastChannel (returns unsubscribe function)
  onCartUpdate(callback) {
    this.broadcastCallbacks.add(callback);
    console.log('📡 Subscribed to cart updates, total listeners:', this.broadcastCallbacks.size);
    
    // Return unsubscribe function
    return () => {
      this.broadcastCallbacks.delete(callback);
      console.log('📡 Unsubscribed from cart updates, total listeners:', this.broadcastCallbacks.size);
    };
  }

  /**
   * Broadcast cart update to other tabs with timestamp for conflict resolution
   * @param {Object} data - Cart data to broadcast
   * @param {Object} variantTimestamps - Map of variantId -> timestamp for per-item conflict resolution
   */
  broadcastCartUpdate(data, variantTimestamps = {}) {
    const timestamp = Date.now();
    
    if (this.broadcastChannel) {
      console.log('📡 Broadcasting cart update to other tabs at:', timestamp);
      this.broadcastChannel.postMessage({
        type: 'cart_updated',
        payload: { ...data, _variantTimestamps: variantTimestamps },
        timestamp,
        sourceTabId: this.tabId,
      });
    } else {
      console.warn('⚠️ BroadcastChannel not available');
    }
  }

  /**
   * Check if an incoming update is newer than local state for a specific variant
   * @param {string} variantId - The variant to check
   * @param {number} incomingTimestamp - Timestamp of incoming update
   * @returns {boolean} - True if incoming update is newer
   */
  isNewerUpdate(variantId, incomingTimestamp) {
    const localTimestamp = this.lastUpdateTimestamps[variantId] || 0;
    return incomingTimestamp > localTimestamp;
  }

  /**
   * Record a local update timestamp for a variant
   * @param {string} variantId - The variant being updated
   * @returns {number} - The timestamp recorded
   */
  recordLocalUpdate(variantId) {
    const timestamp = Date.now();
    this.lastUpdateTimestamps[variantId] = timestamp;
    return timestamp;
  }

  /**
   * Get the tab ID for this instance
   */
  getTabId() {
    return this.tabId;
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

export const socketService = new SocketService();
