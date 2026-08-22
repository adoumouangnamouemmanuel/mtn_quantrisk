/**
 * Shared risk taxonomy for the MTN QuantRisk platform.
 *
 * These six categories are the canonical risk lens used across the backend
 * NLP classifier, the KPI meta, and the frontend navigation. They replace the
 * ad-hoc mix of "Financial / Segment / Operational / External" KPI categories
 * and the scenario pillar letters (A–G) so every surface speaks one language.
 *
 * Backend source of truth: backend/app/core/risk_taxonomy.py (mirror).
 */

export type RiskCategory =
  | 'strategic'
  | 'financial'
  | 'operational'
  | 'technological'
  | 'governance'
  | 'external';

export interface RiskCategoryMeta {
  id: RiskCategory;
  label: string;
  short: string;
  icon: string; // lucide icon name
  color: string; // hex
  description: string;
}

export const RISK_CATEGORIES: Record<RiskCategory, RiskCategoryMeta> = {
  strategic: {
    id: 'strategic',
    label: 'Strategic',
    short: 'STR',
    icon: 'Target',
    color: '#FFD000',
    description:
      'Market position, competitive dynamics, subscriber growth, ARPU and product strategy.',
  },
  financial: {
    id: 'financial',
    label: 'Financial',
    short: 'FIN',
    icon: 'DollarSign',
    color: '#4ADE80',
    description:
      'Revenue, EBITDA, PAT, margins and FX exposures — the P&L impact layer.',
  },
  operational: {
    id: 'operational',
    label: 'Operational',
    short: 'OPS',
    icon: 'Activity',
    color: '#FB923C',
    description:
      'Network, infrastructure, service continuity, capacity and process execution.',
  },
  technological: {
    id: 'technological',
    label: 'Technological',
    short: 'TECH',
    icon: 'Cpu',
    color: '#82B1FF',
    description:
      'Cyber, IT systems, 4G/5G rollout, data platforms and digital resilience.',
  },
  governance: {
    id: 'governance',
    label: 'Governance',
    short: 'GOV',
    icon: 'Scale',
    color: '#C084FC',
    description:
      'Regulatory, compliance, licensing, policy and political/compliance risk.',
  },
  external: {
    id: 'external',
    label: 'External',
    short: 'EXT',
    icon: 'Globe',
    color: '#80DEEA',
    description:
      'Macro environment — inflation, policy rate, FX, GDP and global shocks.',
  },
};

export const RISK_CATEGORY_LIST = Object.values(RISK_CATEGORIES);

/** Map the legacy KPI "category" strings to the new risk taxonomy. */
export function kpiCategoryToRisk(
  legacy: string,
): RiskCategory {
  switch (legacy) {
    case 'Financial':
      return 'financial';
    case 'Segment':
      return 'strategic';
    case 'Operational':
      return 'operational';
    case 'External':
      return 'external';
    default:
      return 'operational';
  }
}

/** Map the legacy NLP category strings (fx_financial, reputational, …) to the
 *  new six-category taxonomy. */
export function nlpCategoryToRisk(
  legacy: string | null | undefined,
): RiskCategory | null {
  if (!legacy) return null;
  const map: Record<string, RiskCategory> = {
    fx_financial: 'financial',
    financial: 'financial',
    regulatory: 'governance',
    political: 'governance',
    competitive: 'strategic',
    operational: 'operational',
    reputational: 'governance',
    technological: 'technological',
    cyber: 'technological',
    external: 'external',
    macro: 'external',
  };
  return map[legacy] ?? null;
}

/** Map a scenario pillar letter (A–G) to a risk category. */
export function pillarToRisk(pillar: string): RiskCategory {
  const map: Record<string, RiskCategory> = {
    A: 'external', // Macro & FX
    B: 'governance', // Regulatory
    C: 'technological', // Tech & Cyber
    D: 'strategic', // Competitive
    E: 'operational', // Operational & Climate
    F: 'strategic', // Upside
    G: 'external', // Tail Risk
  };
  return map[pillar] ?? 'operational';
}
