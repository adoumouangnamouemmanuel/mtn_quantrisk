"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { GitCompare } from 'lucide-react';

export default function ComparePlaceholder() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh] animate-in fade-in duration-500">
      <Card className="max-w-md text-center p-8 border-dashed border-2 border-outline/50 bg-surface-container/30">
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
          <GitCompare className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-2xl font-hero font-bold text-on-surface mb-2">Scenario Compare</h2>
        <p className="text-on-surface-variant mb-6 font-sans">
          This module is part of the Advanced Modeling suite (Batch 2). It will allow side-by-side comparison of baseline vs stress scenarios.
        </p>
        <div className="inline-block px-3 py-1 bg-surface-container-high rounded-full border border-outline/30 text-xs font-mono uppercase tracking-widest text-outline">
          Coming Soon
        </div>
      </Card>
    </div>
  );
}
