"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Search, BookOpen, LayoutDashboard, LineChart, FlaskConical, GitCompare, ActivitySquare } from 'lucide-react';
import { GLOSSARY, GUIDES } from '@/lib/helpContent';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  LineChart,
  FlaskConical,
  GitCompare,
  ActivitySquare
};

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuides = GUIDES.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredGlossary = GLOSSARY.filter(g => 
    g.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-hero font-bold text-on-surface">Help & Support</h1>
        <p className="text-on-surface-variant mt-1">Platform guides and comprehensive glossary of terms</p>
      </div>

      <div className="relative max-w-2xl">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for guides, definitions, or how to use a feature..." 
          className="w-full bg-surface-container-low border border-outline/30 rounded-lg py-3 pl-12 pr-4 text-base text-on-surface focus:outline-none focus:border-mtn-yellow focus:ring-1 focus:ring-mtn-yellow font-sans shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Guides Column */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 border-b border-outline/20 pb-2">
            <BookOpen className="w-5 h-5 text-mtn-yellow" />
            <h2 className="text-xl font-hero font-bold text-white">Feature Guides</h2>
          </div>
          
          {filteredGuides.length > 0 ? (
            <div className="space-y-4">
              {filteredGuides.map(guide => {
                const Icon = ICON_MAP[guide.iconName] || BookOpen;
                return (
                  <Card key={guide.id} className="p-5 border border-outline/10 bg-surface-container-low hover:border-outline/30 transition-colors">
                    <div className="flex items-start mb-3">
                      <div className="p-2 bg-surface-container rounded-md mr-3 text-mtn-yellow">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white font-hero">{guide.title}</h3>
                        <p className="text-sm text-on-surface-variant mt-0.5">{guide.description}</p>
                      </div>
                    </div>
                    <ul className="space-y-2 mt-4 ml-2">
                      {guide.content.map((point, idx) => (
                        <li key={idx} className="flex text-sm text-outline">
                          <span className="mr-2 text-mtn-yellow opacity-50">•</span>
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-on-surface-variant font-mono text-sm">No guides matched your search.</div>
          )}
        </div>

        {/* Glossary Column */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 border-b border-outline/20 pb-2">
            <h2 className="text-xl font-hero font-bold text-white">Glossary</h2>
          </div>

          {filteredGlossary.length > 0 ? (
            <div className="space-y-3">
              {filteredGlossary.map((item, idx) => (
                <Card key={idx} padding="sm" className="bg-surface-container-low border border-outline/10 hover:border-mtn-yellow/30 transition-colors">
                  <h4 className="font-mono text-sm text-mtn-yellow uppercase tracking-widest mb-1.5">{item.term}</h4>
                  <p className="text-sm text-outline leading-relaxed">{item.definition}</p>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-on-surface-variant font-mono text-sm">No definitions matched your search.</div>
          )}
        </div>
      </div>
    </div>
  );
}
