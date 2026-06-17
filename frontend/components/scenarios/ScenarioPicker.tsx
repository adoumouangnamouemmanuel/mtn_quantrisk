'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import type { Scenario, PillarId } from '@/lib/types';
import { fetchScenarios } from '@/lib/api';
import { PillarBadge } from '@/components/ui/PillarBadge';
import { SeverityDots, PlausibilityDots } from '@/components/ui/SeverityDots';

interface ScenarioPickerProps {
  scenarios?: Scenario[];           // if omitted, the picker fetches its own
  activeId?: string;
  onSelect: (scenario: Scenario) => void;
  onEdit?: (scenario: Scenario) => void;
  onDelete?: (id: string) => void;
  onCreateNew?: () => void;
}

export function ScenarioPicker({ scenarios: externalScenarios, activeId, onSelect, onEdit, onDelete, onCreateNew }: ScenarioPickerProps) {
  const [internalScenarios, setInternalScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    if (!externalScenarios) {
      fetchScenarios().then(setInternalScenarios).catch(console.error);
    }
  }, [externalScenarios]);

  const scenarios = externalScenarios ?? internalScenarios;
  const [search, setSearch] = useState('');
  const [expandedPillars, setExpandedPillars] = useState<Record<string, boolean>>({
    A: true, B: true, C: false, D: false, E: false, F: false, G: false,
  });
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = scenarios.filter(s =>
      s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    );
    const groups: Record<string, Scenario[]> = {};
    filtered.forEach(s => {
      if (!groups[s.pillar]) groups[s.pillar] = [];
      groups[s.pillar]!.push(s);
    });
    return groups;
  }, [scenarios, search]);

  const togglePillar = (p: string) =>
    setExpandedPillars(prev => ({ ...prev, [p]: !prev[p] }));

  const handleDeleteConfirm = (id: string) => {
    if (onDelete) onDelete(id);
    setPendingDelete(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-mtn-yellow">Scenario Library</p>
          <p className="font-mono text-[9px] text-on-surface-variant mt-0.5">{scenarios.length} scenarios</p>
        </div>
        <button
          onClick={() => onCreateNew?.()}
          title="New scenario"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-mtn-yellow/10 border border-mtn-yellow/30 text-mtn-yellow hover:bg-mtn-yellow/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="font-mono text-[9px] uppercase tracking-widest">New</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3 shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Find scenario..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-surface border border-outline/20 rounded-lg pl-8 pr-3 py-2 text-xs text-on-surface font-sans placeholder:text-on-surface-variant/50 focus:outline-none focus:border-mtn-yellow transition-colors"
        />
      </div>

      {/* Accordion list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
        {Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([pillarId, list]) => {
            const isExpanded = expandedPillars[pillarId] || search.length > 0;
            return (
              <div key={pillarId} className="border border-outline/15 rounded-lg overflow-hidden">
                {/* Pillar header */}
                <button
                  onClick={() => togglePillar(pillarId)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-surface-container hover:bg-surface-container-high transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <PillarBadge pillar={pillarId as PillarId} />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant truncate max-w-[90px]">
                      {list[0]?.pillarName ?? pillarId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[9px] bg-surface px-1.5 py-0.5 rounded text-on-surface-variant">
                      {list.length}
                    </span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-on-surface-variant transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </div>
                </button>

                {/* Scenario rows */}
                <div className={`transition-all duration-200 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                  <div className="divide-y divide-outline/10 bg-surface">
                    {list.map(scenario => {
                      const isActive = scenario.id === activeId;
                      const isDeletingThis = pendingDelete === scenario.id;

                      if (isDeletingThis) {
                        return (
                          <div key={scenario.id} className="flex items-center gap-2 p-2.5 bg-error/10 border-l-2 border-error">
                            <span className="font-mono text-[9px] text-error flex-1 truncate">Delete {scenario.id}?</span>
                            <button
                              onClick={() => handleDeleteConfirm(scenario.id)}
                              className="px-2 py-1 rounded bg-error text-white font-mono text-[9px] hover:bg-error/80 transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setPendingDelete(null)}
                              className="px-2 py-1 rounded border border-outline/30 text-on-surface-variant font-mono text-[9px] hover:text-on-surface transition-colors"
                            >
                              No
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={scenario.id}
                          className={`group relative flex items-start gap-2 p-2.5 transition-colors cursor-pointer ${
                            isActive ? 'bg-[#242424]' : 'hover:bg-surface-container'
                          }`}
                          onClick={() => onSelect(scenario)}
                        >
                          {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-mtn-yellow rounded-l" />}

                          <div className={`flex-1 min-w-0 ${isActive ? 'ml-1' : ''}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="font-mono text-[9px] bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant shrink-0">
                                {scenario.id}
                              </span>
                              <SeverityDots severity={scenario.severity} colorClass="bg-error" />
                              <PlausibilityDots plausibility={scenario.plausibility} />
                            </div>
                            <span className={`font-sans text-xs leading-tight line-clamp-2 transition-colors ${
                              isActive ? 'text-mtn-yellow' : 'text-on-surface group-hover:text-mtn-yellow/80'
                            }`}>
                              {scenario.name}
                            </span>
                          </div>

                          {/* Hover actions */}
                          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={e => { e.stopPropagation(); if (onEdit) onEdit(scenario); }}
                              title="Edit scenario"
                              className="w-6 h-6 flex items-center justify-center rounded text-on-surface-variant hover:text-mtn-yellow hover:bg-mtn-yellow/10 transition-colors"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); setPendingDelete(scenario.id); }}
                              title="Delete scenario"
                              className="w-6 h-6 flex items-center justify-center rounded text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-10 text-on-surface-variant font-mono text-[10px] uppercase tracking-widest">
            No scenarios found
          </div>
        )}
      </div>
    </div>
  );
}
