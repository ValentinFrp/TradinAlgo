import { WebSocketService } from './websocketService';

const API_BASE_URL = 'http://localhost:8080/api';
const WS_BASE_URL = 'ws://localhost:8080/ws';

class ApiService {
  private ws: WebSocketService;

  constructor() {
    this.ws = new WebSocketService();
  }

  async fetchMarketData(symbol: string): Promise<Response> {
    return fetch(`${API_BASE_URL}/market/price/${symbol}`);
  }

  async fetchStrategies(): Promise<Response> {
    return fetch(`${API_BASE_URL}/strategies`);
  }

  async activateStrategy(strategyId: string, parameters: Record<string, any>): Promise<Response> {
    return fetch(`${API_BASE_URL}/strategies/${strategyId}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parameters)
    });
  }

  async deactivateStrategy(strategyId: string): Promise<Response> {
    return fetch(`${API_BASE_URL}/strategies/${strategyId}/deactivate`, {
      method: 'POST'
    });
  }

  subscribeToMarketData(onData: (data: any) => void): void {
    this.ws.connect(`${WS_BASE_URL}/market`, onData);
  }

  subscribeToTrades(onData: (data: any) => void): void {
    this.ws.connect(`${WS_BASE_URL}/trades`, onData);
  }

  subscribeToPositions(onData: (data: any) => void): void {
    this.ws.connect(`${WS_BASE_URL}/positions`, onData);
  }

  unsubscribeAll(): void {
    this.ws.disconnectAll();
  }
}

export const apiService = new ApiService();