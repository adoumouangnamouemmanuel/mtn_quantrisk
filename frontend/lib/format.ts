export function formatGHS(value: number): string {
  return `GHS ${value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
}

export function formatPct(value: number): string {
  return `${value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

export function formatNumber(value: number, decimals: number = 1): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatDelta(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
}
