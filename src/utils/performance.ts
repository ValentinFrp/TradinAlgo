interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private interval: number = 5000; // 5 seconds
  private timer: NodeJS.Timer | null = null;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  start() {
    if (this.timer) return;

    this.timer = setInterval(() => {
      this.collectMetrics();
    }, this.interval);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async collectMetrics() {
    const metrics: PerformanceMetrics = {
      renderTime: performance.now(),
      memoryUsage: this.getMemoryUsage(),
      networkLatency: await this.measureNetworkLatency()
    };

    this.metrics.push(metrics);
    this.reportMetrics(metrics);
  }

  private getMemoryUsage(): number {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  private async measureNetworkLatency(): Promise<number> {
    const start = performance.now();
    try {
      await fetch('http://localhost:8080/api/ping');
      return performance.now() - start;
    } catch (error) {
      console.error('Network latency measurement failed:', error);
      return -1;
    }
  }

  private async reportMetrics(metrics: PerformanceMetrics) {
    try {
      await fetch('http://localhost:8080/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });
    } catch (error) {
      console.error('Failed to report metrics:', error);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();