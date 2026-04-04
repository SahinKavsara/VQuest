import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  socket = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
      console.log('Socket bağlandı');
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) this.socket.emit(event, data);
  }

  on(event, callback) {
    if (this.socket) this.socket.on(event, callback);
  }

  off(event) {
    if (this.socket) this.socket.off(event);
  }
}

const socketService = new SocketService();
export default socketService;
