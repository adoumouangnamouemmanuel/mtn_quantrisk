"""
Scenario Augmentation for MTN QuantRisk AI Training
Expands a base scenario CSV to >500 rows with realistic random noise.
"""

import pandas as pd
import numpy as np
from copy import deepcopy

# Set random seed for reproducibility
np.random.seed(42)

def add_noise(value, noise_pct=0.1, is_integer=False, min_val=None, max_val=None):
    """
    Add relative noise to a numeric value.
    - noise_pct: standard deviation as fraction of value (e.g., 0.1 = 10%)
    - is_integer: round to nearest integer
    - min_val, max_val: clamp to range
    """
    if pd.isna(value) or value == 0:
        noise = np.random.normal(0, 0.02)  # small absolute noise for zeros
        new_val = noise
    else:
        new_val = value * (1 + np.random.normal(0, noise_pct))
    if is_integer:
        new_val = int(round(new_val))
    if min_val is not None:
        new_val = max(min_val, new_val)
    if max_val is not None:
        new_val = min(max_val, new_val)
    return new_val

def vary_severity(original_sev, variation=0.1):
    """Add noise to severity multiplier, keep between 0.1 and 2.0"""
    new_sev = original_sev * (1 + np.random.normal(0, variation))
    return max(0.1, min(2.0, new_sev))

def vary_trigger_phrase(original_phrase):
    """Optional: add minor text variations (e.g., alternative wording)"""
    # Simple variation: add " [simulated]" suffix. In production, use synonym replacement.
    if np.random.random() > 0.7:
        return original_phrase + " (variant)"
    return original_phrase

# Load base CSV
df = pd.read_csv('mtn_scenario_library.csv')

# Define numeric columns that should receive noise
shock_cols = ['Cedi/USD shock (%)', 'Inflation shock (pp)', 
              'Policy rate shock (bps)', 'GDP shock (pp)']
impact_cols = ['Service Revenue (% chg)', 'EBITDA margin (bps chg)',
               'ARPU USD (% chg)', 'MoMo Revenue (% chg)',
               'Subscribers (% chg)', 'Net debt/EBITDA (x chg)']

# How many synthetic copies per original scenario?
# We want final rows > 500. With 65 base rows, need ~8 copies each.
n_copies_per_base = 10   # yields 65*10 = 650 rows

augmented_rows = []

for idx, row in df.iterrows():
    for copy_i in range(n_copies_per_base):
        new_row = row.to_dict()
        
        # 1. Severity multiplier with noise
        orig_sev = row['Severity Multiplier']
        new_row['Severity Multiplier'] = vary_severity(orig_sev, variation=0.12)
        
        # 2. Shock columns – add noise (relative, 10-15%)
        for col in shock_cols:
            val = row[col]
            if pd.isna(val) or val == 0:
                new_row[col] = 0
            else:
                noise_level = np.random.uniform(0.05, 0.15)
                new_row[col] = add_noise(val, noise_pct=noise_level, 
                                         min_val=0, max_val=100)
                # For bps columns (policy rate, GDP), keep as integer
                if 'bps' in col or col == 'Policy rate shock (bps)':
                    new_row[col] = int(round(new_row[col]))
        
        # 3. Impact columns – add noise (relative, 10-20%)
        for col in impact_cols:
            val = row[col]
            if pd.isna(val):
                new_row[col] = 0
            else:
                noise_level = np.random.uniform(0.08, 0.20)
                new_val = add_noise(val, noise_pct=noise_level)
                # Keep appropriate sign and reasonable bounds
                if col == 'Net debt/EBITDA (x chg)':
                    new_val = max(-2.0, min(2.0, new_val))
                elif col in ['Service Revenue (% chg)', 'ARPU USD (% chg)', 
                             'MoMo Revenue (% chg)', 'Subscribers (% chg)']:
                    new_val = max(-50, min(50, new_val))
                elif col == 'EBITDA margin (bps chg)':
                    new_val = max(-800, min(800, new_val))
                new_row[col] = new_val
        
        # 4. Trigger phrase variation (optional)
        new_row['Trigger Phrase(s)'] = vary_trigger_phrase(row['Trigger Phrase(s)'])
        
        # 5. Optionally add a copy number to scenario ID to keep track
        new_row['Scenario ID'] = f"{row['Scenario ID']}_v{copy_i+1}"
        
        augmented_rows.append(new_row)

# Convert to DataFrame
df_aug = pd.DataFrame(augmented_rows)

# Shuffle rows to mix scenarios
df_aug = df_aug.sample(frac=1).reset_index(drop=True)

# Save to CSV
output_file = 'mtn_training_data_augmented.csv'
df_aug.to_csv(output_file, index=False)

print(f"Done! Generated {len(df_aug)} training rows.")
print(f"Saved to {output_file}")
print("\nColumns preserved: " + ', '.join(df_aug.columns))