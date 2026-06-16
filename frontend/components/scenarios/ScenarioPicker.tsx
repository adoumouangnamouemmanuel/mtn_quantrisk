"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Scenario } from '@/lib/types';
import { fetchScenarios } from '@/lib/api';
import { PillarBadge } from '@/components/ui/PillarBadge';
import { SeverityDots, PlausibilityDots } from '@/components/ui/SeverityDots';

interface ScenarioPickerProps {
  activeId?: string;
  onSelect: (scenario: Scenario) => void;
}

export function ScenarioPicker({ activeId, onSelect }: ScenarioPickerProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [search, setSearch] = useState("");
  const [expandedPillars, setExpandedPillars] = useState<Record<string, boolean>>({
    'A': true, 'B': true, 'C': false, 'D': false, 'E': false, 'F': false, 'G': false
  });

  useEffect(() => {
    fetchScenarios().then(setScenarios);
  }, []);

  const grouped = useMemo(() => {
    const filtered = scenarios.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.id.toLowerCase().includes(search.toLowerCase())
    );
    const groups: Record<string, Scenario[]> = {};
    filtered.forEach(s => {
      if (!groups[s.pillar]) groups[s.pillar] = [];
      groups[s.pillar]!.push(s);
    });
    return groups;
  }, [scenarios, search]);

  const togglePillar = (pillar: string) => {
    setExpandedPillars(prev => ({ ...prev, [pillar]: !prev[pillar] }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search Input */}
      <div className="relative mb-4 shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input 
          type="text" 
          placeholder="Find scenario..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-surface border border-outline/20 rounded pl-9 pr-3 py-2 text-sm text-on-surface font-sans placeholder:text-on-surface-variant focus:outline-none focus:border-mtn-yellow transition-colors"
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
                onClick={() => togglePillar(pillarId)}
                className="w-full flex items-center justify-between p-3 bg-surface-container hover:bg-surface transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <PillarBadge pillar={pillarId as import('@/lib/types').PillarId} />
                  <span className="font-mono text-xs uppercase tracking-widest text-on-surface">
                    {list[0]?.pillarName || pillarId}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-surface-container-high text-on-surface font-mono text-[10px] px-2 py-0.5 rounded">
                    {list.length}
                  </span>
                  <ChevronRight 
                    className={`w-4 h-4 text-on-surface-variant transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                  />
                </div>
              </button>

              {/* Scenario Rows */}
              <div 
                className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
              >
                <div className="flex flex-col divide-y divide-outline/10 bg-surface">
                  {list.map(scenario => {
                    const isActive = scenario.id === activeId;
                    return (
                      <button
                        key={scenario.id}
                        onClick={() => onSelect(scenario)}
                        title={scenario.description}
                        className={`
                          group flex flex-col p-3 text-left transition-colors relative
                          ${isActive ? 'bg-[#2C2C2C]' : 'hover:bg-surface-container'}
                        `}
                      >
                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-mtn-yellow" />}
                        <div className="flex items-start justify-between w-full mb-2">
                          <span className="font-mono text-[10px] bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant">
                            {scenario.id}
                          </span>
                          <div className="flex items-center space-x-3">
                            <SeverityDots severity={scenario.severity} colorClass="bg-error" />
                            <PlausibilityDots plausibility={scenario.plausibility} />
                          </div>
                        </div>
                        <span className="font-sans text-sm text-on-surface truncate w-full group-hover:text-mtn-yellow transition-colors">
                          {scenario.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-8 text-on-surface-variant font-mono text-xs">
            No scenarios found.
          </div>
        )}
      </div>
    </div>
  );
}
