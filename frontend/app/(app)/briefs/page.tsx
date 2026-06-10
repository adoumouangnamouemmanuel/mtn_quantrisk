"use client";

import React, { useEffect, useState } from 'react';
import { fetchBriefs } from '@/lib/api';
import { BoardBrief } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { FileText, Download } from 'lucide-react';

export default function BriefsPage() {
  const [briefs, setBriefs] = useState<BoardBrief[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBriefs().then(data => {
      setBriefs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-hero font-bold text-on-surface">Board Briefs</h1>
          <p className="text-on-surface-variant mt-1">AI-generated narrative reports for executives</p>
        </div>
        <Button variant="primary">Generate New Brief</Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-40" />)
        ) : (
          briefs.map((brief) => (
            <Card key={brief.id} className="flex flex-col md:flex-row md:items-center justify-between hover:bg-surface-container-high transition-colors">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-sans font-medium text-on-surface">{brief.title}</h3>
                  <Chip 
                    variant={brief.status === 'Ready' ? 'success' : brief.status === 'Generating' ? 'warning' : 'error'} 
                    size="sm"
                  >
                    {brief.status}
                  </Chip>
                </div>
                <div className="text-sm text-on-surface-variant font-mono">
                  ID: {brief.id} | Generated: {new Date(brief.generatedAt).toLocaleDateString()}
                </div>
                {brief.status === 'Ready' && (
                  <p className="text-sm mt-3 text-on-surface max-w-2xl">{brief.executiveSummary}</p>
                )}
              </div>
              
              <div className="flex space-x-2 shrink-0">
                <Button variant="outline" size="sm" disabled={brief.status !== 'Ready'}>
                  <FileText className="w-4 h-4 mr-2" /> View
                </Button>
                <Button variant="secondary" size="sm" disabled={brief.status !== 'Ready'}>
                  <Download className="w-4 h-4 mr-2" /> PDF
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
