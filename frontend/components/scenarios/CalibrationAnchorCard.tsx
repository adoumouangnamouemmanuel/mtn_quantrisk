import React from 'react';
import { Card } from '@/components/ui/Card';
import { Anchor } from 'lucide-react';

interface CalibrationAnchorCardProps {
  anchor: string;
}

export function CalibrationAnchorCard({ anchor }: CalibrationAnchorCardProps) {
  return (
    <Card className="p-4 bg-surface-container-low">
      <div className="flex items-center space-x-2 mb-3">
        <Anchor className="w-4 h-4 text-mtn-yellow" />
        <h3 className="font-sans text-lg font-bold text-white">Calibration Anchor</h3>
      </div>
      
      <h4 className="font-sans text-base text-mtn-yellow mb-2">
        {anchor}
      </h4>
      
      <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
        This scenario&apos;s severity and macro overlays have been calibrated against historical data points associated with this anchor. The expected KPI impacts reflect market realities observed during this period, adjusted for current enterprise scale.
      </p>
    </Card>
  );
}
