import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShapAttributionCard } from '@/components/scenarios/ShapAttributionCard';

describe('ShapAttributionCard', () => {
  it('renders the attribution feature names when switched to table view', () => {
    render(
      <ShapAttributionCard
        attributions={[
          { feature: 'Cedi_USD_Avg', contribution: -0.38 },
          { feature: 'Inflation_YoY_Pct', contribution: 0.12 },
        ]}
      />
    );
    // The default view is a chart (canvas), so feature names are not text.
    // Switch to the table view to surface them.
    const toggle = screen.getByRole('button', { name: /toggle table view/i });
    fireEvent.click(toggle);
    expect(screen.getByText('Cedi_USD_Avg', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Inflation_YoY_Pct', { exact: false })).toBeInTheDocument();
  });

  it('always renders the card title', () => {
    render(<ShapAttributionCard attributions={[]} unavailable={true} />);
    expect(screen.getByText('Why This Result')).toBeInTheDocument();
  });

  it('shows an explicit unavailable state when shapUnavailable is true (audit C6)', () => {
    render(<ShapAttributionCard attributions={[]} unavailable={true} />);
    expect(screen.getByText('Attribution Unavailable')).toBeInTheDocument();
    expect(
      screen.getByText(
        /SHAP driver attribution could not be computed/,
      )
    ).toBeInTheDocument();
  });

  it('shows the unavailable state when attributions are empty even without the flag', () => {
    render(<ShapAttributionCard attributions={[]} />);
    expect(screen.getByText('Attribution Unavailable')).toBeInTheDocument();
  });
});
