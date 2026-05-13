import { io } from 'socket.io-client';

const SOCKET_URL = 'https://vquest-backend-api.onrender.com';

let _socket = null;

const socket = {
  /**
   * Socket bağlantısını kur (tekil — singleton)
   */
  connect() {
    if (!_socket || !_socket.connected) {
      _socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      _socket.on('connect', () => {
        console.log('[Socket] Bağlantı kuruldu:', _socket.id);
      });

      _socket.on('disconnect', (reason) => {
        console.log('[Socket] Bağlantı kesildi:', reason);
      });

      _socket.on('connect_error', (err) => {
        console.error('[Socket] Bağlantı hatası:', err.message);
      });
    }
    return _socket;
  },

  /**
   * Odadan ayrıl ve socket event listener'larını temizle
   */
  leaveRoom() {
    if (_socket) {
      _socket.off('gameStarted');
      _socket.off('nextQuestion');
      _socket.off('updateScoreboard');
      _socket.off('roomClosed');
    }
  },

  /**
   * Genel event emit
   */
  emit(event, data) {
    if (_socket) {
      _socket.emit(event, data);
    }
  },

  /**
   * Genel event listener
   */
  on(event, callback) {
    if (_socket) {
      _socket.on(event, callback);
    }
  },

  /**
   * Genel event listener kaldır
   */
  off(event) {
    if (_socket) {
      _socket.off(event);
    }
  },

  /**
   * Bağlantıyı tamamen kes
   */
  disconnect() {
    if (_socket) {
      _socket.disconnect();
      _socket = null;
    }
  },

  /**
   * Mevcut socket instance'ını döndür
   */
  getSocket() {
    return _socket;
  },
};

export default socket;
