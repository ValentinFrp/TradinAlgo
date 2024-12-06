import { CandlestickData, Trade } from '../types/trading';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private onMessageCallback: ((data: any) => void) | null = null;

  constructor(private url: string = 'ws://localhost:8080/ws/market') {}

  connect(onMessage: (data: any) => void): void {
    this.onMessageCallback = onMessage;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket connecté');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (this.onMessageCallback) {
        this.onMessageCallback(data);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket déconnecté');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Tentative de reconnexion ${this.reconnectAttempts}...`);
        this.connect(this.onMessageCallback!);
      }, 1000 * Math.pow(2, this.reconnectAttempts));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}