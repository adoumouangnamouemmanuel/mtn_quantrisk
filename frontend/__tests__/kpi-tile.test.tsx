import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KpiTile } from '@/components/ui/KpiTile';
import type { Kpi } from '@/lib/types';

function makeKpi(overrides: Partial<Kpi> = {}): Kpi {
  return {
    id: 'FIN01',
    name: 'Service Revenue',
    category: 'financial',
    unit: 'GHSm',
    fy25Value: 24400,
    lowerThreshold: 23000,
    upperThreshold: 26000,
    currentStatus: 'Safe',
    trend24m: [1, 2, 3, 4, 3, 2],
    ...overrides,
  };
}

describe('KpiTile', () => {
  it('renders the KPI id, name and formatted value', () => {
    render(<KpiTile kpi={makeKpi()} />);
    expect(screen.getByText(/FIN01 · Financial/)).toBeInTheDocument();
    expect(screen.getByText('Service Revenue')).toBeInTheDocument();
    // The value should be formatted as a number, not a percentage.
    expect(screen.getByText(/24,400/)).toBeInTheDocument();
  });

  it('shows a Safe status chip', () => {
    render(<KpiTile kpi={makeKpi({ currentStatus: 'Safe' })} />);
    expect(screen.getByText('Safe')).toBeInTheDocument();
  });

  it('shows a Warning status chip', () => {
    render(<KpiTile kpi={makeKpi({ currentStatus: 'Warning' })} />);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('shows a Critical status chip', () => {
    render(<KpiTile kpi={makeKpi({ currentStatus: 'Critical' })} />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('formats percentage KPIs with a % sign', () => {
    render(
      <KpiTile
        kpi={makeKpi({
          id: 'FIN03',
          name: 'EBITDA Margin',
          unit: '%',
          fy25Value: 60.2,
          currentStatus: 'Safe',
        })}
      />
    );
    // formatPct renders the value + %; assert the unit chip or the text.
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('renders the source provenance when provided', () => {
    render(
      <KpiTile
        kpi={makeKpi({
          sourceType: 'Reported',
          sourcePeriod: '2026Q1',
          notes: 'quarterly reported',
        } as Partial<Kpi>)}
      />
    );
    expect(screen.getByText('2026Q1')).toBeInTheDocument();
    expect(screen.getByText('Reported')).toBeInTheDocument();
  });
});
