import { WebSocket } from "ws";
import { CandlestickData } from "../types/trading";

export class MarketDataService {
  private ws: WebSocket | null = null;
  private subscribers: Set<(data: CandlestickData) => void> = new Set();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket("wss://stream.binance.com:9443/ws");

      this.ws.onopen = () => {
        console.log("Connected to Binance WebSocket");
        this.reconnectAttempts = 0;
        this.subscribe();
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data.toString());
        if (data.e === "kline") {
          const candle: CandlestickData = {
            time: Math.floor(data.k.t / 1000),
            open: parseFloat(data.k.o),
            high: parseFloat(data.k.h),
            low: parseFloat(data.k.l),
            close: parseFloat(data.k.c),
            volume: parseFloat(data.k.v),
          };
          this.notifySubscribers(candle);
        }
      };

      this.ws.onclose = () => {
        console.log("Disconnected from Binance WebSocket");
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to connect to Binance WebSocket:", error);
      this.attemptReconnect();
    }
  }

  private subscribe() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const subscribeMessage = {
      method: "SUBSCRIBE",
      params: [
        "btcusdt@kline_1m",
        "ethusdt@kline_1m",
        "solusdt@kline_1m",
        "avaxusdt@kline_1m",
        "maticusdt@kline_1m",
      ],
      id: 1,
    };

    this.ws.send(JSON.stringify(subscribeMessage));
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      console.log(`Attempting to reconnect in ${delay}ms...`);
      setTimeout(() => this.connect(), delay);
    }
  }

  private notifySubscribers(data: CandlestickData) {
    this.subscribers.forEach((callback) => callback(data));
  }

  public subscribeToMarketData(callback: (data: CandlestickData) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
  }
}

export const marketDataService = new MarketDataService();
