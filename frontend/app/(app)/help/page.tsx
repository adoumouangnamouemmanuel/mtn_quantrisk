"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import {
  Search, BookOpen, LayoutDashboard, LineChart, FlaskConical,
  GitCompare, ActivitySquare, HelpCircle, Settings, List,
  ChevronDown, ChevronUp, Database, Dices, CheckCircle2,
  AlertTriangle, Info, Lightbulb, Tag
} from 'lucide-react';
import { GLOSSARY, GUIDES, QNA_CATEGORIES } from '@/lib/helpContent';

// ── Icon registry ─────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, LineChart, FlaskConical, GitCompare,
  ActivitySquare, Settings, List, HelpCircle, Database, Dices,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  financial: 'Financial',
  statistical: 'Statistical',
  platform: 'Platform',
  risk: 'Risk',
  ml: 'ML / AI',
};

const CATEGORY_COLORS: Record<string, string> = {
  financial: 'text-green-400 bg-green-400/10 border-green-400/30',
  statistical: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  platform: 'text-mtn-yellow bg-mtn-yellow/10 border-mtn-yellow/30',
  risk: 'text-error bg-error/10 border-error/30',
  ml: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative max-w-2xl">
      <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search guides, Q&A, or glossary terms…"
        className="w-full bg-surface-container-low border border-outline/30 rounded-xl py-3 pl-11 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-mtn-yellow font-sans"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors text-xs font-mono"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ── Guides Tab ────────────────────────────────────────────────────────────────

function GuidesTab({ query }: { query: string }) {
  const filtered = useMemo(() =>
    GUIDES.filter(g =>
      !query ||
      g.title.toLowerCase().includes(query.toLowerCase()) ||
      g.description.toLowerCase().includes(query.toLowerCase()) ||
      g.steps.some(s => s.heading.toLowerCase().includes(query.toLowerCase()) || s.detail.toLowerCase().includes(query.toLowerCase()))
    ), [query]);

  return (
    <div className="space-y-5">
      {filtered.length === 0 && (
        <p className="font-mono text-sm text-on-surface-variant">No guides matched &ldquo;{query}&rdquo;.</p>
      )}
      {filtered.map(guide => {
        const Icon = ICON_MAP[guide.iconName] || BookOpen;
        return (
          <Card key={guide.id} className="p-0 overflow-hidden border border-outline/15 hover:border-outline/30 transition-colors">
            {/* Guide header */}
            <div className="flex items-start gap-4 p-5 border-b border-outline/10 bg-surface-container/30">
              <div className="p-2.5 bg-mtn-yellow/10 rounded-xl shrink-0">
                <Icon className="w-5 h-5 text-mtn-yellow" />
              </div>
              <div>
                <h3 className="font-hero font-bold text-on-surface text-lg">{guide.title}</h3>
                <p className="text-sm text-on-surface-variant mt-0.5">{guide.description}</p>
              </div>
            </div>

            {/* Steps */}
            <div className="p-5 space-y-4">
              {guide.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-6 h-6 rounded-full bg-mtn-yellow/20 border border-mtn-yellow/40 flex items-center justify-center shrink-0">
                      <span className="font-mono text-[9px] font-bold text-mtn-yellow">{i + 1}</span>
                    </div>
                    {i < guide.steps.length - 1 && (
                      <div className="w-px flex-1 bg-outline/15 mt-1 mb-0" />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="font-sans font-semibold text-sm text-on-surface mb-0.5">{step.heading}</p>
                    <p className="font-sans text-sm text-on-surface-variant leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            {guide.tips && guide.tips.length > 0 && (
              <div className="mx-5 mb-4 rounded-xl bg-mtn-yellow/5 border border-mtn-yellow/20 p-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-mtn-yellow" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-mtn-yellow">Pro Tips</span>
                </div>
                {guide.tips.map((tip, i) => (
                  <div key={i} className="flex gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-mtn-yellow/60 shrink-0 mt-0.5" />
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Warnings */}
            {guide.warnings && guide.warnings.length > 0 && (
              <div className="mx-5 mb-5 rounded-xl bg-error/5 border border-error/20 p-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-error" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-error">Important</span>
                </div>
                {guide.warnings.map((w, i) => (
                  <p key={i} className="font-sans text-xs text-error/80 leading-relaxed">{w}</p>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ── Q&A Tab ───────────────────────────────────────────────────────────────────

function QnATab({ query }: { query: string }) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredCategories = useMemo(() =>
    QNA_CATEGORIES
      .filter(cat => !activeCategory || cat.id === activeCategory)
      .map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
          !query ||
          item.question.toLowerCase().includes(query.toLowerCase()) ||
          item.answer.toLowerCase().includes(query.toLowerCase())
        ),
      }))
      .filter(cat => cat.items.length > 0),
    [query, activeCategory]);

  const totalResults = filteredCategories.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="space-y-6">
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors ${
            activeCategory === null
              ? 'border-mtn-yellow text-mtn-yellow bg-mtn-yellow/10'
              : 'border-outline/20 text-on-surface-variant hover:border-outline/40'
          }`}
        >
          All ({QNA_CATEGORIES.reduce((n, c) => n + c.items.length, 0)})
        </button>
        {QNA_CATEGORIES.map(cat => {
          const Icon = ICON_MAP[cat.iconName] || HelpCircle;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors ${
                activeCategory === cat.id
                  ? 'border-mtn-yellow text-mtn-yellow bg-mtn-yellow/10'
                  : 'border-outline/20 text-on-surface-variant hover:border-outline/40'
              }`}
            >
              <Icon className="w-3 h-3" />
              {cat.label} ({cat.items.length})
            </button>
          );
        })}
      </div>

      {query && (
        <p className="font-mono text-[10px] text-on-surface-variant">
          {totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </p>
      )}

      {filteredCategories.length === 0 && (
        <p className="font-mono text-sm text-on-surface-variant">No questions matched &ldquo;{query}&rdquo;.</p>
      )}

      {filteredCategories.map(cat => {
        const Icon = ICON_MAP[cat.iconName] || HelpCircle;
        return (
          <div key={cat.id} className="space-y-2">
            {/* Category header */}
            <div className="flex items-center gap-2 pb-2 border-b border-outline/15">
              <Icon className="w-4 h-4 text-mtn-yellow" />
              <h3 className="font-hero font-bold text-base text-on-surface">{cat.label}</h3>
              <span className="font-mono text-[9px] text-on-surface-variant">({cat.items.length})</span>
            </div>

            {/* Questions */}
            <div className="space-y-2">
              {cat.items.map((item, idx) => {
                const key = `${cat.id}-${idx}`;
                const isOpen = openItems.has(key);
                return (
                  <div key={key} className={`rounded-xl border overflow-hidden transition-all ${
                    isOpen ? 'border-mtn-yellow/30 bg-surface-container/30' : 'border-outline/15 hover:border-outline/30'
                  }`}>
                    <button
                      onClick={() => toggle(key)}
                      aria-expanded={isOpen}
                      className="w-full flex items-start gap-3 px-4 py-3.5 text-left"
                    >
                      <HelpCircle className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${isOpen ? 'text-mtn-yellow' : 'text-on-surface-variant'}`} />
                      <span className={`font-sans text-sm font-medium flex-1 leading-snug transition-colors ${isOpen ? 'text-mtn-yellow' : 'text-on-surface'}`}>
                        {item.question}
                      </span>
                      {isOpen
                        ? <ChevronUp   className="w-4 h-4 text-mtn-yellow shrink-0 mt-0.5" />
                        : <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0 mt-0.5" />
                      }
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-4 space-y-3">
                        <div className="flex gap-2.5">
                          <Info className="w-3.5 h-3.5 text-on-surface-variant shrink-0 mt-0.5" />
                          <p className="font-sans text-sm text-on-surface-variant leading-relaxed">{item.answer}</p>
                        </div>
                        {item.example && (
                          <div className="rounded-lg bg-mtn-yellow/5 border border-mtn-yellow/20 p-3 flex gap-2">
                            <Lightbulb className="w-3.5 h-3.5 text-mtn-yellow shrink-0 mt-0.5" />
                            <div>
                              <p className="font-mono text-[8px] uppercase tracking-widest text-mtn-yellow mb-1">Example</p>
                              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">{item.example}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Glossary Tab ──────────────────────────────────────────────────────────────

function GlossaryTab({ query }: { query: string }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const all = ['financial', 'risk', 'statistical', 'ml', 'platform'];
    return all.filter(cat =>
      GLOSSARY.some(g => g.category === cat &&
        (!query ||
          g.term.toLowerCase().includes(query.toLowerCase()) ||
          g.definition.toLowerCase().includes(query.toLowerCase()))
      )
    );
  }, [query]);

  const filtered = useMemo(() =>
    GLOSSARY.filter(g =>
      (!activeCategory || g.category === activeCategory) &&
      (!query ||
        g.term.toLowerCase().includes(query.toLowerCase()) ||
        g.definition.toLowerCase().includes(query.toLowerCase()))
    ).sort((a, b) => a.term.localeCompare(b.term)),
    [query, activeCategory]);

  return (
    <div className="space-y-5">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors ${
            !activeCategory
              ? 'border-mtn-yellow text-mtn-yellow bg-mtn-yellow/10'
              : 'border-outline/20 text-on-surface-variant hover:border-outline/40'
          }`}
        >
          All ({GLOSSARY.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors ${
              activeCategory === cat
                ? 'border-mtn-yellow text-mtn-yellow bg-mtn-yellow/10'
                : 'border-outline/20 text-on-surface-variant hover:border-outline/40'
            }`}
          >
            {CATEGORY_LABELS[cat]} ({GLOSSARY.filter(g => g.category === cat).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="font-mono text-sm text-on-surface-variant">No terms matched &ldquo;{query}&rdquo;.</p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-outline/15 bg-surface-container-low p-4 hover:border-outline/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-mono text-sm font-bold text-mtn-yellow uppercase tracking-wide leading-snug">
                {item.term}
              </h4>
              <span className={`font-mono text-[7px] uppercase tracking-widest px-2 py-0.5 rounded border shrink-0 ${CATEGORY_COLORS[item.category]}`}>
                {CATEGORY_LABELS[item.category]}
              </span>
            </div>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">{item.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'guides', label: 'Feature Guides', icon: BookOpen, count: GUIDES.length },
  { id: 'qna',    label: 'Q & A',          icon: HelpCircle, count: QNA_CATEGORIES.reduce((n, c) => n + c.items.length, 0) },
  { id: 'glossary', label: 'Glossary',     icon: Tag, count: GLOSSARY.length },
] as const;

type TabId = typeof TABS[number]['id'];

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<TabId>('guides');
  const [query, setQuery]         = useState('');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-mtn-yellow/10 shrink-0">
          <HelpCircle className="w-6 h-6 text-mtn-yellow" />
        </div>
        <div>
          <h1 className="text-3xl font-hero font-bold text-on-surface">Help & Support</h1>
          <p className="text-on-surface-variant text-sm mt-1 max-w-2xl">
            Everything you need to understand, operate, and get the most out of the MTN QuantRisk Intelligence Platform —
            step-by-step guides, answers to common questions, and definitions for every term used in the system.
          </p>
        </div>
      </div>

      {/* Search */}
      <SearchBar value={query} onChange={v => { setQuery(v); }} />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-outline/20">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-sans text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? 'border-mtn-yellow text-mtn-yellow'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${
                activeTab === tab.id
                  ? 'bg-mtn-yellow/15 text-mtn-yellow'
                  : 'bg-surface-container text-on-surface-variant'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'guides'   && <GuidesTab   query={query} />}
        {activeTab === 'qna'      && <QnATab      query={query} />}
        {activeTab === 'glossary' && <GlossaryTab query={query} />}
      </div>
    </div>
  );
}
