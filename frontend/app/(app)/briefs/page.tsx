"use client";

import { useEffect, useState } from 'react';
import { fetchBriefs, fetchScenarios, generateBoardBrief } from '@/lib/api';
import { BoardBrief, Scenario } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { BoardBriefSlideOver } from '@/components/scenarios/BoardBriefSlideOver';
import { FileText, Download, Plus, Newspaper } from 'lucide-react';

export default function BriefsPage() {
  const [briefs, setBriefs] = useState<BoardBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedBrief, setSelectedBrief] = useState<BoardBrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [primaryScenario, setPrimaryScenario] = useState('');
  const [secondaryScenario, setSecondaryScenario] = useState('');

  useEffect(() => {
    Promise.all([fetchBriefs(), fetchScenarios()])
      .then(([briefData, scenarioData]) => {
        setBriefs(briefData);
        setScenarios(scenarioData);
        setPrimaryScenario(scenarioData[0]?.id ?? '');
        setError(null);
      })
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Unable to load board briefs and scenarios'))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateNew = async () => {
    if (!primaryScenario) {
      setError('Select a primary scenario before generating a brief.');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const scenarioIds = [primaryScenario, secondaryScenario].filter(Boolean);
      const brief = await generateBoardBrief(scenarioIds);
      setBriefs(prev => [brief, ...prev]);
      setSelectedBrief(brief);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to generate the board brief');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center shrink-0">
            <Newspaper className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-hero font-bold text-on-surface">Board Briefs</h1>
            <p className="text-on-surface-variant mt-0.5">Persisted narrative reports generated from Q1 2026 scenario outputs</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="flex min-w-64 flex-col gap-1 text-xs font-mono uppercase tracking-wider text-on-surface-variant">
            Primary scenario
            <select
              value={primaryScenario}
              onChange={event => {
                const value = event.target.value;
                setPrimaryScenario(value);
                if (secondaryScenario === value) setSecondaryScenario('');
              }}
              className="rounded-lg border border-outline/30 bg-surface-container px-3 py-2 text-sm normal-case tracking-normal text-on-surface"
            >
              {scenarios.map(scenario => (
                <option key={scenario.id} value={scenario.id}>{scenario.id} — {scenario.name}</option>
              ))}
            </select>
          </label>
          <label className="flex min-w-64 flex-col gap-1 text-xs font-mono uppercase tracking-wider text-on-surface-variant">
            Combine with (optional)
            <select
              value={secondaryScenario}
              onChange={event => setSecondaryScenario(event.target.value)}
              className="rounded-lg border border-outline/30 bg-surface-container px-3 py-2 text-sm normal-case tracking-normal text-on-surface"
            >
              <option value="">None</option>
              {scenarios.filter(scenario => scenario.id !== primaryScenario).map(scenario => (
                <option key={scenario.id} value={scenario.id}>{scenario.id} — {scenario.name}</option>
              ))}
            </select>
          </label>
          <Button variant="primary" onClick={handleGenerateNew} disabled={generating || !primaryScenario}>
            <Plus className="w-4 h-4 mr-2" />
            {generating ? 'Generating...' : 'Generate New Brief'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-40" />)
        ) : briefs.length > 0 ? (
          briefs.map(brief => (
            <Card
              key={brief.id}
              className="hover:bg-surface-container-high transition-colors overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-sans font-medium text-on-surface">{brief.title}</h3>
                      <Chip
                        variant={brief.status === 'Ready' ? 'success' : brief.status === 'Generating' ? 'warning' : 'error'}
                        size="sm"
                      >
                        {brief.status}
                      </Chip>
                      {brief.severityScore > 0 && (
                        <span className="font-mono text-xs text-on-surface-variant">
                          Severity: <span className="text-warning">{brief.severityScore.toFixed(1)}</span>
                        </span>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant font-mono mb-3">
                      <span>ID: {brief.id}</span>
                      <span>{new Date(brief.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>Impact: <span className="text-mtn-yellow font-bold">{brief.estimatedImpact.currency} {brief.estimatedImpact.magnitude.toLocaleString()}{brief.estimatedImpact.unit}</span></span>
                      {brief.scenarioIds.length > 0 && (
                        <span>Scenarios: {brief.scenarioIds.join(', ')}</span>
                      )}
                    </div>

                    {brief.status === 'Ready' && brief.executiveSummary && (
                      <p className="text-sm text-on-surface-variant line-clamp-2 max-w-2xl leading-relaxed">
                        {brief.executiveSummary}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={brief.status !== 'Ready'}
                      onClick={() => setSelectedBrief(brief)}
                    >
                      <FileText className="w-4 h-4 mr-2" /> View
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={brief.status !== 'Ready'}
                      onClick={() => {
                        setSelectedBrief(brief);
                        setTimeout(() => window.print(), 100);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" /> PDF
                    </Button>
                  </div>
                </div>

                {/* KPI impact chips */}
                {brief.status === 'Ready' && brief.keyKpiImpacts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-outline/10">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant mb-2">Key KPI Impacts</p>
                    <div className="flex flex-wrap gap-1.5">
                      {brief.keyKpiImpacts.map((impact, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-mono border border-outline/20 bg-surface-container text-on-surface-variant">
                          {impact.kpiId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended actions preview */}
                {brief.status === 'Ready' && brief.recommendedActions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-outline/10">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant mb-2">Recommended Actions</p>
                    <ul className="space-y-1">
                      {brief.recommendedActions.slice(0, 2).map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-on-surface-variant">
                          <span className="text-mtn-yellow mt-0.5">•</span>
                          <span className="line-clamp-1">{action}</span>
                        </li>
                      ))}
                      {brief.recommendedActions.length > 2 && (
                        <li className="text-[10px] font-mono text-on-surface-variant">
                          +{brief.recommendedActions.length - 2} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center text-sm text-on-surface-variant">
            No persisted briefs yet. Generate the first Q1 2026 scenario brief.
          </Card>
        )}
      </div>

      {selectedBrief && (
        <BoardBriefSlideOver
          brief={selectedBrief}
          onClose={() => setSelectedBrief(null)}
        />
      )}
    </div>
  );
}
