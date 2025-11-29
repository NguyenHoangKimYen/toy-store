import { io } from 'socket.io-client';

// Socket.io connects to the base URL, not /api
const API_URL = import.meta.env.VITE_API_URL || 'https://api.milkybloomtoystore.id.vn/api';
// Remove trailing /api to get base URL
const SOCKET_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

// BroadcastChannel for cross-tab communication (same browser, instant)
const CART_CHANNEL_NAME = 'cart_updates';

// Generate unique tab ID for conflict resolution
const TAB_ID = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.userId = null;
    this.broadcastChannel = null;
    this.broadcastCallbacks = new Set();
    this.tabId = TAB_ID;
    
    // Track last update timestamp per variant for conflict resolution
    this.lastUpdateTimestamps = {};
    
    // Store event callbacks for socket events
    this.socketCallbacks = new Map(); // event -> Set of callbacks
    
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
        
        console.log('📡 [BroadcastChannel] Received from tab:', sourceTabId);
        
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
    // Store userId for rejoining on reconnect
    this.userId = userId;
    
    // If already connected, just join the room
    if (this.socket?.connected) {
      if (userId) {
        this.socket.emit('join_user_room', userId);
        console.log('👤 [Socket] Joined room (already connected):', `user_${userId}`);
      }
      return this.socket;
    }

    // If socket exists but not connected, disconnect first
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('🔌 [Socket] Connecting to:', SOCKET_URL);
    console.log('🔌 [Socket] User ID:', userId);

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('🟢 [Socket] Connected! ID:', this.socket.id);
      this.connected = true;

      // Join user room
      if (this.userId) {
        this.socket.emit('join_user_room', this.userId);
        console.log('👤 [Socket] Joining room:', `user_${this.userId}`);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔴 [Socket] Disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 [Socket] Reconnected after', attemptNumber, 'attempts');
      // Rejoin room on reconnect
      if (this.userId) {
        this.socket.emit('join_user_room', this.userId);
        console.log('👤 [Socket] Rejoined room after reconnect:', `user_${this.userId}`);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ [Socket] Connection error:', error.message);
    });

    // Set up the main cart_updated listener that dispatches to all registered callbacks
    this.socket.on('cart_updated', (data) => {
      console.log('📥 [Socket] Received cart_updated:', data?.action);
      this._dispatchEvent('cart_updated', data);
    });

    return this.socket;
  }

  // Dispatch event to all registered callbacks
  _dispatchEvent(event, data) {
    const callbacks = this.socketCallbacks.get(event);
    if (callbacks) {
      console.log(`📡 [Socket] Dispatching ${event} to ${callbacks.size} listener(s)`);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in ${event} callback:`, err);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.userId = null;
    }
  }

  // Register a callback for socket events
  on(event, callback) {
    if (!this.socketCallbacks.has(event)) {
      this.socketCallbacks.set(event, new Set());
    }
    this.socketCallbacks.get(event).add(callback);
    console.log(`📡 [Socket] Registered listener for: ${event}, total: ${this.socketCallbacks.get(event).size}`);
  }

  // Unregister a callback for socket events
  off(event, callback) {
    const callbacks = this.socketCallbacks.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      console.log(`📡 [Socket] Unregistered listener for: ${event}, remaining: ${callbacks.size}`);
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`⚠️ [Socket] Cannot emit ${event} - not connected`);
    }
  }

  // Subscribe to cart updates from BroadcastChannel (returns unsubscribe function)
  onCartUpdate(callback) {
    this.broadcastCallbacks.add(callback);
    console.log('📡 [BroadcastChannel] Subscribed, total listeners:', this.broadcastCallbacks.size);
    
    // Return unsubscribe function
    return () => {
      this.broadcastCallbacks.delete(callback);
      console.log('📡 [BroadcastChannel] Unsubscribed, remaining:', this.broadcastCallbacks.size);
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
      console.log('📡 [BroadcastChannel] Broadcasting update at:', timestamp);
      this.broadcastChannel.postMessage({
        type: 'cart_updated',
        payload: { ...data, _variantTimestamps: variantTimestamps },
        timestamp,
        sourceTabId: this.tabId,
      });
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
  
  /**
   * Force refresh - useful for debugging
   */
  forceReconnect() {
    console.log('🔄 [Socket] Force reconnecting...');
    const userId = this.userId;
    this.disconnect();
    if (userId) {
      this.connect(userId);
    }
  }
}

export const socketService = new SocketService();
