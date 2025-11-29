import { io } from 'socket.io-client';

// Socket.io connects to the base URL, not /api
const API_URL = import.meta.env.VITE_API_URL || 'https://api.milkybloomtoystore.id.vn/api';
// Remove trailing /api to get base URL
const SOCKET_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

// BroadcastChannel for cross-tab communication (works without backend socket)
const CART_CHANNEL_NAME = 'cart_updates';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.broadcastChannel = null;
    this.broadcastCallbacks = new Set();
    
    // Initialize BroadcastChannel for cross-tab sync
    this._initBroadcastChannel();
  }

  _initBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel(CART_CHANNEL_NAME);
      this.broadcastChannel.onmessage = (event) => {
        console.log('📡 Received cart update from another tab:', event.data);
        if (event.data.type === 'cart_updated') {
          // Call all registered callbacks
          this.broadcastCallbacks.forEach(callback => {
            try {
              callback(event.data.payload);
            } catch (err) {
              console.error('Error in broadcast callback:', err);
            }
          });
        }
      };
      console.log('📡 BroadcastChannel initialized');
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

  // Broadcast cart update to other tabs
  broadcastCartUpdate(data) {
    if (this.broadcastChannel) {
      console.log('📡 Broadcasting cart update to other tabs:', data);
      this.broadcastChannel.postMessage({
        type: 'cart_updated',
        payload: data,
      });
    } else {
      console.warn('⚠️ BroadcastChannel not available');
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

export const socketService = new SocketService();
