import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Chip } from '@/components/ui/Chip';
import { PillarBadge } from '@/components/ui/PillarBadge';
import { SeverityDots, PlausibilityDots } from '@/components/ui/SeverityDots';

describe('Chip', () => {
  it('renders its children', () => {
    render(<Chip>Stress</Chip>);
    expect(screen.getByText('Stress')).toBeInTheDocument();
  });

  it('applies the success variant class', () => {
    const { container } = render(<Chip variant="success">OK</Chip>);
    const chip = container.firstChild as HTMLElement;
    expect(chip.className).toContain('emerald');
  });

  it('renders the small size', () => {
    const { container } = render(<Chip size="sm">sm</Chip>);
    expect((container.firstChild as HTMLElement).className).toContain('text-[10px]');
  });
});

describe('PillarBadge', () => {
  it('renders the pillar letter', () => {
    render(<PillarBadge pillar="A" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders pillar E', () => {
    const { container } = render(<PillarBadge pillar="E" />);
    expect(container.textContent).toBe('E');
  });
});

describe('SeverityDots', () => {
  it('renders max dots and fills the first `severity`', () => {
    const { container } = render(<SeverityDots severity={3} max={5} />);
    // The dot elements are the rounded-full children of the inner flex div.
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots).toHaveLength(5);
    expect(dots[0]!.className).toContain('bg-mtn-yellow');
    expect(dots[2]!.className).toContain('bg-mtn-yellow');
    expect(dots[3]!.className).toContain('bg-surface-container-high');
  });

  it('PlausibilityDots uses hollow inactive dots', () => {
    const { container } = render(<PlausibilityDots plausibility={1} max={5} />);
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots[0]!.className).toContain('bg-mtn-yellow');
    expect(dots[1]!.className).toContain('bg-transparent');
  });
});
