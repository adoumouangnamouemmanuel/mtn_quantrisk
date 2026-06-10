import { ThemeTokens } from '@/lib/theme';

export const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // We'll build custom legends
    },
    tooltip: {
      backgroundColor: ThemeTokens.colors.surfaceContainerHigh,
      titleColor: ThemeTokens.colors.onSurfaceVariant,
      bodyColor: ThemeTokens.colors.onSurface,
      borderColor: ThemeTokens.colors.outline,
      borderWidth: 1,
      padding: 10,
      cornerRadius: 4,
      displayColors: true,
      titleFont: {
        family: 'Space Mono, monospace',
        size: 11,
      },
      bodyFont: {
        family: 'JetBrains Mono, monospace',
        size: 13,
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        color: ThemeTokens.colors.onSurfaceVariant,
        font: {
          family: 'Space Mono, monospace',
          size: 10,
        }
      }
    },
    y: {
      grid: {
        color: ThemeTokens.colors.outline + '33', // 20% opacity
        drawBorder: false,
      },
      ticks: {
        color: ThemeTokens.colors.onSurfaceVariant,
        font: {
          family: 'JetBrains Mono, monospace',
          size: 11,
        }
      }
    }
  }
};
