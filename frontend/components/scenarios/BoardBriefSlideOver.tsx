"use client";

import React, { useEffect, useRef } from 'react';
import { BoardBrief } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { X, Download, Link as LinkIcon, AlertTriangle, TrendingDown } from 'lucide-react';
import { formatNumber } from '@/lib/format';

interface BoardBriefSlideOverProps {
  brief: BoardBrief;
  onClose: () => void;
}

export function BoardBriefSlideOver({ brief, onClose }: BoardBriefSlideOverProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle Chart.js Canvas to Image conversion before print
  useEffect(() => {
    const beforePrint = () => {
      if (!containerRef.current) return;
      const canvases = containerRef.current.querySelectorAll('canvas');
      canvases.forEach(canvas => {
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.className = canvas.className + ' print-canvas-img';
        img.style.width = canvas.style.width;
        img.style.height = canvas.style.height;
        canvas.style.display = 'none';
        canvas.parentNode?.insertBefore(img, canvas);
      });
    };
    const afterPrint = () => {
      if (!containerRef.current) return;
      const images = containerRef.current.querySelectorAll('.print-canvas-img');
      images.forEach(img => {
        const canvas = img.nextElementSibling as HTMLCanvasElement;
        if (canvas) canvas.style.display = '';
        img.remove();
      });
    };

    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-40 transition-opacity print:hidden" 
        onClick={onClose}
      />
      <div 
        ref={containerRef}
        className="fixed top-0 right-0 bottom-0 w-full md:w-[480px] bg-surface z-50 shadow-2xl border-l border-outline/20 flex flex-col transform transition-transform duration-300 print:relative print:w-full print:border-none print:shadow-none print:transform-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline/20 print:hidden">
          <h2 className="font-sans font-bold text-lg text-white">Board Brief</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => window.print()} title="Download PDF">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Copy Link">
              <LinkIcon className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} title="Close">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar print:overflow-visible print:p-0">
          <div>
            <div className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">
              Generated {new Date(brief.generatedAt).toLocaleDateString()} | ID: {brief.id}
            </div>
            <h1 className="font-hero text-3xl font-bold text-white leading-tight mb-6">
              {brief.title}
            </h1>
          </div>

          {/* Tiles */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-error/10 border border-error/20 flex flex-col">
              <div className="flex items-center space-x-2 mb-2 text-error">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-mono text-[10px] uppercase tracking-widest">Severity Score</span>
              </div>
              <div className="font-mono text-3xl font-bold text-white mt-auto">
                {brief.severityScore.toFixed(1)} <span className="text-sm text-on-surface-variant font-sans font-normal">/ 25</span>
              </div>
            </Card>

            <Card className="p-4 bg-warning/10 border border-warning/20 flex flex-col">
              <div className="flex items-center space-x-2 mb-2 text-warning">
                <TrendingDown className="w-4 h-4" />
                <span className="font-mono text-[10px] uppercase tracking-widest">Est. Impact</span>
              </div>
              <div className="font-mono text-3xl font-bold text-white mt-auto">
                {brief.estimatedImpact.currency} {formatNumber(brief.estimatedImpact.magnitude)}<span className="text-xl">{brief.estimatedImpact.unit}</span>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="font-sans font-bold text-white border-b border-outline/20 pb-2">Executive Summary</h3>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
              {brief.executiveSummary}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-sans font-bold text-white border-b border-outline/20 pb-2">Key KPI Impacts</h3>
            <div className="space-y-3">
              {brief.keyKpiImpacts.map((impact, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-mono text-xs text-white uppercase">{impact.kpiId}</span>
                  <span className="font-sans text-sm text-on-surface-variant">{impact.narrative}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-sans font-bold text-white border-b border-outline/20 pb-2">Calibration Notes</h3>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
              {brief.calibrationNotes}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-sans font-bold text-mtn-yellow border-b border-mtn-yellow/20 pb-2">Recommended Actions</h3>
            <ul className="list-disc pl-5 space-y-2 font-sans text-sm text-on-surface-variant">
              {brief.recommendedActions.map((action, i) => (
                <li key={i} className="pl-1 marker:text-mtn-yellow">{action}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-sans font-bold text-white border-b border-outline/20 pb-2">Key Entities</h3>
            <div className="flex flex-wrap gap-2">
              {brief.keyEntities.map((entity, i) => (
                <span key={i} className="bg-surface-container-high text-on-surface text-xs px-2 py-1 rounded font-mono">
                  {entity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
