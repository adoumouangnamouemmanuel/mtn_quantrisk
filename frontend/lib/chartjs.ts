export type ChartType = 'line' | 'bar' | 'horizontalBar' | 'doughnut';

// We abstract the Chart instance type to avoid 'any' across the app
export interface ChartInstance {
  destroy: () => void;
  update: (mode?: string) => void;
  data: unknown;
  options: unknown;
}

export interface ChartConfig {
  type: string;
  data: unknown;
  options?: unknown;
}

export function createChart(canvas: HTMLCanvasElement, type: ChartType, config: ChartConfig): ChartInstance {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ChartClass = (window as any).Chart;
  if (!ChartClass) {
    console.error("Chart.js is not loaded");
    return {
      destroy: () => {},
      update: () => {},
      data: {},
      options: {}
    } as ChartInstance;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error("Could not get 2D context from canvas");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new ChartClass(ctx, { ...config, type }) as any as ChartInstance;
}

export function destroyChart(instance: ChartInstance | null): void {
  if (instance && typeof instance.destroy === 'function') {
    instance.destroy();
  }
}
