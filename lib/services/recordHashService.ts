import { createHash } from 'crypto';

export interface CanonicalPilotRecord {
  contract_id: string;
  department: string;
  startup: string;
  problem: string;
  start_date: string;
  end_date: string;
  budget: number;
  contract_value: number;
  rule_reference: string;
  milestones: Array<{
    id: string;
    title: string;
    target: string;
    result: 'met' | 'missed';
    evidence_url: string;
  }>;
}

export function canonicalize(v: unknown): string {
  if (Array.isArray(v)) return '[' + v.map(canonicalize).join(',') + ']';
  if (v && typeof v === 'object' && v !== null) {
    const o = v as Record<string, unknown>;
    return (
      '{' +
      Object.keys(o)
        .sort()
        .map((k) => JSON.stringify(k) + ':' + canonicalize(o[k]))
        .join(',') +
      '}'
    );
  }
  return JSON.stringify(v);
}

export const hashRecord = (record: object): string =>
  createHash('sha256').update(canonicalize(record)).digest('hex');

export function buildRecord(params: {
  contractId: string;
  department: string;
  startup: string;
  problem: string;
  startDate: string;
  endDate: string;
  budget: number;
  contractValue: number;
  ruleReference: string;
  milestones: Array<{
    id: string;
    title: string;
    target: string;
    status: string;
    evidence_url?: string | null;
  }>;
}): CanonicalPilotRecord {
  return {
    contract_id: params.contractId,
    department: params.department,
    startup: params.startup,
    problem: params.problem,
    start_date: params.startDate,
    end_date: params.endDate,
    budget: params.budget,
    contract_value: params.contractValue,
    rule_reference: params.ruleReference,
    milestones: params.milestones
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((m) => ({
        id: m.id,
        title: m.title,
        target: m.target,
        result: m.status === 'met' ? 'met' : 'missed',
        evidence_url: m.evidence_url || '',
      })),
  };
}
