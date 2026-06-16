import React from 'react';
import { Card } from '@/components/ui/Card';
import { Scenario } from '@/lib/types';
import { SeverityDots, PlausibilityDots } from '@/components/ui/SeverityDots';
import { PillarBadge } from '@/components/ui/PillarBadge';
import { Chip } from '@/components/ui/Chip';

interface ScenarioMetadataCardProps {
  scenario: Scenario;
}

function MetaRow({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-outline/10 last:border-0">
      <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
}

export function ScenarioMetadataCard({ scenario }: ScenarioMetadataCardProps) {
  return (
    <Card className="p-4 bg-surface-container-low">
      <h3 className="font-sans text-sm font-bold text-white mb-4">Scenario Metadata</h3>
      
      <div className="flex flex-col">
        <MetaRow label="Severity">
          <SeverityDots severity={scenario.severity} colorClass="bg-error" />
        </MetaRow>
        <MetaRow label="Plausibility">
          <PlausibilityDots plausibility={scenario.plausibility} />
        </MetaRow>
        <MetaRow label="Pillar">
          <PillarBadge pillar={scenario.pillar} />
        </MetaRow>
        <MetaRow label="Type">
          <Chip size="sm">{scenario.type}</Chip>
        </MetaRow>
        <MetaRow label="Owner">
          <span className="font-sans text-sm text-white">{scenario.owner}</span>
        </MetaRow>
        <MetaRow label="Last Calibrated">
          <span className="font-mono text-xs text-on-surface-variant">
            {new Date(scenario.lastCalibrated).toLocaleDateString()}
          </span>
        </MetaRow>
      </div>
    </Card>
  );
}
