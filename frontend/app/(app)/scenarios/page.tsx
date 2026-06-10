"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { FlaskConical } from 'lucide-react';

export default function ScenariosPlaceholder() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh] animate-in fade-in duration-500">
      <Card className="max-w-md text-center p-8 border-dashed border-2 border-outline/50 bg-surface-container/30">
        <div className="w-16 h-16 rounded-full bg-mtn-yellow/10 flex items-center justify-center mx-auto mb-6">
          <FlaskConical className="w-8 h-8 text-mtn-yellow" />
        </div>
        <h2 className="text-2xl font-hero font-bold text-on-surface mb-2">Stress Tester</h2>
        <p className="text-on-surface-variant mb-6 font-sans">
          This module is part of the Advanced Modeling suite (Batch 2). It will provide Monte Carlo simulations and multi-factor stress testing capabilities.
        </p>
        <div className="inline-block px-3 py-1 bg-surface-container-high rounded-full border border-outline/30 text-xs font-mono uppercase tracking-widest text-outline">
          Coming Soon
        </div>
      </Card>
    </div>
  );
}
