"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { PillarId } from '@/lib/types';
import { PillarBadge } from '@/components/ui/PillarBadge';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface TopDangerousScenariosCardProps {
  ranking: Array<{
    scenarioId: string;
    scenarioName: string;
    pillar: PillarId;
    requiredSeverityMultiplier: number;
  }>;
}

const NARRATIVES = [
  "Cedi devaluation directly compresses revenue via USD-denominated op-ex.",
  "Regulatory friction slows market expansion, capping growth significantly.",
  "Prolonged infrastructure outages cascade into severe SLA penalties.",
  "Aggressive competitor pricing wars erode baseline EBITDA margins.",
  "Macro supply-chain shocks delay critical capacity upgrades."
];

export function TopDangerousScenariosCard({ ranking }: TopDangerousScenariosCardProps) {
  const router = useRouter();
  const top5 = ranking.slice(0, 5);

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="font-sans text-2xl font-bold text-white mb-1">
          Top 5 Most Dangerous Scenarios
        </h2>
        <p className="font-sans text-sm text-on-surface-variant">
          These scenarios would breach your target with the lowest stress
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {top5.map((item, index) => (
          <Card key={item.scenarioId} className="p-4 bg-surface-container-low flex flex-col hover:bg-surface-container transition-colors">
            <div className="flex items-center space-x-2 mb-3">
              <PillarBadge pillar={item.pillar} />
              <span className="font-mono text-[10px] bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant">
                {item.scenarioId}
              </span>
            </div>
            
            <h4 className="font-sans text-sm font-bold text-white mb-2 line-clamp-2">
              {item.scenarioName}
            </h4>

            <div className="my-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">
                Required Severity
              </span>
              <span className="font-mono text-2xl font-bold text-mtn-yellow">
                {item.requiredSeverityMultiplier.toFixed(2)}×
              </span>
            </div>

            <p className="font-sans text-xs text-on-surface-variant line-clamp-3 mb-4 flex-1">
              {NARRATIVES[index % NARRATIVES.length]}
            </p>

            <Button 
              variant="ghost" 
              className="w-full text-xs font-mono uppercase tracking-widest text-mtn-yellow mt-auto"
              onClick={() => router.push(`/scenarios?id=${item.scenarioId}`)}
            >
              View Details
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
