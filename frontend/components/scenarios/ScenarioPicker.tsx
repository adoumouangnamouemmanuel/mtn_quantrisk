'use client';

import React, { useState, useEffect, useMemo, KeyboardEvent, useRef } from 'react';
import { Search, Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { Scenario, PillarId } from '@/lib/types';
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

// Highlight helper
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <mark key={i} className="bg-mtn-yellow/40 text-on-surface rounded px-0.5">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

export function ScenarioPicker({ 
  scenarios: externalScenarios, 
  activeId, 
  onSelect, 
  onEdit, 
  onDelete, 
  onCreateNew 
}: ScenarioPickerProps) {
  const [internalScenarios, setInternalScenarios] = useState<Scenario[]>([]);
  const [search, setSearch] = useState("");
  const [expandedPillars, setExpandedPillars] = useState<Record<string, boolean>>({
    'A': true, 'B': true, 'C': false, 'D': false, 'E': false, 'F': false, 'G': false
  });
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  // For keyboard nav
  const itemRefs = useRef<(HTMLButtonElement | HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!externalScenarios) {
      fetchScenarios().then(setInternalScenarios).catch(console.error);
    }
  }, [externalScenarios]);

  const scenarios = externalScenarios ?? internalScenarios;

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

  const togglePillar = (pillar: string, shiftKey: boolean) => {
    setExpandedPillars(prev => {
      if (shiftKey) {
        // Multi-expand
        return { ...prev, [pillar]: !prev[pillar] };
      } else {
        // Solo-expand unless it's already the only one expanded
        const isOnlyExpanded = prev[pillar] && Object.values(prev).filter(Boolean).length === 1;
        if (isOnlyExpanded) {
          return { ...prev, [pillar]: false };
        }
        const newState = { 'A': false, 'B': false, 'C': false, 'D': false, 'E': false, 'F': false, 'G': false };
        newState[pillar as keyof typeof newState] = true;
        return newState;
      }
    });
  };

  const handleDeleteConfirm = (id: string) => {
    if (onDelete) onDelete(id);
    setPendingDelete(null);
  };

  const handleKeyDown = (e: KeyboardEvent, index: number, scenario: Scenario) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(scenario);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (index + 1 < itemRefs.current.length) {
        itemRefs.current[index + 1]?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index - 1 >= 0) {
        itemRefs.current[index - 1]?.focus();
      }
    }
  };

  // Build a flat list of visible scenarios for ref assignment
  const visibleScenarios = useMemo(() => {
    const list: Scenario[] = [];
    Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).forEach(([pillarId, scenariosInPillar]) => {
      const isExpanded = expandedPillars[pillarId] || search.length > 0;
      if (isExpanded) {
        list.push(...scenariosInPillar);
      }
    });
    return list;
  }, [grouped, expandedPillars, search]);

  // Reset refs array length
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, visibleScenarios.length);
  }, [visibleScenarios.length]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-mtn-yellow">Scenario Library</p>
          <p className="font-mono text-[9px] text-on-surface-variant mt-0.5">{scenarios.length} scenarios</p>
        </div>
        {onCreateNew && (
          <button
            onClick={() => onCreateNew()}
            title="New scenario"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-mtn-yellow/10 border border-mtn-yellow/30 text-mtn-yellow hover:bg-mtn-yellow/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="font-mono text-[9px] uppercase tracking-widest">New</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-4 shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input 
          type="text" 
          placeholder="Find scenario (Type ID or keyword)..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-surface border border-outline/20 rounded pl-9 pr-3 py-2 text-sm text-on-surface font-sans placeholder:text-on-surface-variant focus:outline-none focus:border-mtn-yellow focus:ring-1 focus:ring-mtn-yellow transition-all"
        />
      </div>

      {/* Accordion List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([pillarId, list]) => {
          const isExpanded = expandedPillars[pillarId] || search.length > 0;
          return (
            <div key={pillarId} className="border border-outline/20 rounded overflow-hidden">
              {/* Pillar Header */}
              <button 
                onClick={(e) => togglePillar(pillarId, e.shiftKey)}
                className="w-full flex items-center justify-between p-3 bg-surface-container hover:bg-surface transition-colors text-left focus:outline-none focus:ring-1 focus:ring-mtn-yellow"
                title="Click to expand. Shift+Click to multi-expand."
              >
                <div className="flex items-center space-x-3">
                  <PillarBadge pillar={pillarId as PillarId} />
                  <span className="font-mono text-xs uppercase tracking-widest text-on-surface">
                    {list[0]?.pillarName || pillarId}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-surface-container-high text-on-surface font-mono text-[10px] px-2 py-0.5 rounded">
                    {list.length}
                  </span>
                  <ChevronRight 
                    className={`w-4 h-4 text-on-surface-variant transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} 
                  />
                </div>
              </button>

              {/* Scenario Rows */}
              <div 
                className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'} grid`}
              >
                <div className="overflow-hidden flex flex-col divide-y divide-outline/10 bg-surface">
                  {list.map(scenario => {
                    const isActive = scenario.id === activeId;
                    const index = visibleScenarios.findIndex(s => s.id === scenario.id);
                    const isDeletingThis = pendingDelete === scenario.id;

                    if (isDeletingThis) {
                      return (
                        <div 
                          key={scenario.id} 
                          ref={el => { itemRefs.current[index] = el as HTMLDivElement; }}
                          className="flex items-center gap-2 p-3 bg-error/10 border-l-2 border-error"
                          tabIndex={0}
                        >
                          <span className="font-mono text-[9px] text-error flex-1 truncate">Delete {scenario.id}?</span>
                          <button
                            onClick={() => handleDeleteConfirm(scenario.id)}
                            className="px-2 py-1 rounded bg-error text-white font-mono text-[9px] hover:bg-error/80 transition-colors focus:outline-none focus:ring-1 focus:ring-error"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setPendingDelete(null)}
                            className="px-2 py-1 rounded border border-outline/30 text-on-surface-variant font-mono text-[9px] hover:text-on-surface transition-colors focus:outline-none"
                          >
                            No
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={scenario.id}
                        ref={el => { itemRefs.current[index] = el as HTMLDivElement; }}
                        onClick={() => onSelect(scenario)}
                        onKeyDown={e => handleKeyDown(e, index, scenario)}
                        title={scenario.description}
                        className={`
                          group flex items-start gap-2 p-3 text-left transition-colors relative cursor-pointer focus:outline-none focus:ring-1 focus:ring-mtn-yellow focus:ring-inset
                          ${isActive ? 'bg-[#2C2C2C]' : 'hover:bg-surface-container'}
                        `}
                        tabIndex={0}
                        role="button"
                      >
                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-mtn-yellow" />}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-[10px] bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant border border-outline/10">
                              <HighlightedText text={scenario.id} query={search} />
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant/70 border border-outline/10 rounded px-1">
                              {scenario.type}
                            </span>
                            <div className="ml-auto flex items-center space-x-2">
                              <SeverityDots severity={scenario.severity} colorClass="bg-error" />
                              <PlausibilityDots plausibility={scenario.plausibility} />
                            </div>
                          </div>
                          <span className={`font-sans text-sm w-full leading-snug transition-colors ${isActive ? 'text-mtn-yellow' : 'text-on-surface group-hover:text-mtn-yellow/80'}`}>
                            <HighlightedText text={scenario.name} query={search} />
                          </span>
                        </div>

                        {/* Hover actions */}
                        {(onEdit || onDelete) && (
                          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                            {onEdit && (
                              <button
                                onClick={e => { e.stopPropagation(); onEdit(scenario); }}
                                title="Edit scenario"
                                className="w-6 h-6 flex items-center justify-center rounded text-on-surface-variant hover:text-mtn-yellow hover:bg-mtn-yellow/10 transition-colors focus:outline-none"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={e => { e.stopPropagation(); setPendingDelete(scenario.id); }}
                                title="Delete scenario"
                                className="w-6 h-6 flex items-center justify-center rounded text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors focus:outline-none"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {Object.keys(grouped).length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
            <Search className="w-8 h-8 mb-3 opacity-20" />
            <span className="font-mono text-sm">No scenarios match your search.</span>
            <span className="font-mono text-xs opacity-60 mt-1">Try a different keyword or ID.</span>
          </div>
        )}
      </div>
    </div>
  );
}
