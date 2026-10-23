import { createHash } from 'crypto';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultClient } from '../supabase';

export interface CanonicalMilestone {
  due_date: string;
  evidence_url: string | null;
  id: string;
  status: string;
  target: string;
  title: string;
}

export interface CanonicalRecord {
  contract_id: string;
  contract_value: number;
  converted_at: string;
  department: {
    id: string;
    name: string;
  };
  milestones: CanonicalMilestone[];
  pilot: {
    budget: number;
    end_date: string;
    id: string;
    start_date: string;
    status: string;
  };
  problem: {
    id: string;
    title: string;
  };
  rule_reference: string | null;
  startup: {
    id: string;
    name: string;
  };
}

/**
 * Deterministically serializes any JavaScript value to canonical JSON.
 * - Object keys are sorted alphabetically at every nesting level.
 * - Whitespace is completely omitted.
 * - Arrays preserve element order.
 * - Nulls and primitives are consistently represented.
 */
export function canonicalize(v: unknown): string {
  if (v === null || v === undefined) {
    return 'null';
  }
  if (Array.isArray(v)) {
    return '[' + v.map(canonicalize).join(',') + ']';
  }
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    const sortedKeys = Object.keys(o).sort();
    return '{' + sortedKeys.map((k) => JSON.stringify(k) + ':' + canonicalize(o[k])).join(',') + '}';
  }
  return JSON.stringify(v);
}

/**
 * Computes the SHA-256 hexadecimal digest of the canonicalized record.
 */
export function hashRecord(record: object): string {
  const canonicalString = canonicalize(record);
  return createHash('sha256').update(canonicalString).digest('hex');
}

/**
 * Builds the canonical contract record by querying the live database.
 * Matches the exact structure produced by the PostgreSQL `build_contract_record` function.
 */
export async function buildRecord(
  contractId: string,
  client: SupabaseClient = defaultClient
): Promise<CanonicalRecord> {
  // If database RPC is available, we can use it directly
  const { data: rpcData, error: rpcError } = await client.rpc('build_contract_record', {
    p_contract_id: contractId,
  });

  if (!rpcError && rpcData) {
    return rpcData as CanonicalRecord;
  }

  // Fallback to table queries if RPC is not available in current connection context
  const { data: contract, error: contractErr } = await client
    .from('contracts')
    .select('*')
    .eq('id', contractId)
    .single();

  if (contractErr || !contract) {
    throw new Error(`Contract ${contractId} not found: ${contractErr?.message || 'Unknown'}`);
  }

  const { data: pilot, error: pilotErr } = await client
    .from('pilots')
    .select('*')
    .eq('id', contract.pilot_id)
    .single();

  if (pilotErr || !pilot) {
    throw new Error(`Pilot ${contract.pilot_id} not found: ${pilotErr?.message || 'Unknown'}`);
  }

  const { data: application, error: appErr } = await client
    .from('applications')
    .select('*')
    .eq('id', pilot.application_id)
    .single();

  if (appErr || !application) {
    throw new Error(`Application ${pilot.application_id} not found: ${appErr?.message || 'Unknown'}`);
  }

  const { data: problem, error: probErr } = await client
    .from('problems')
    .select('*')
    .eq('id', application.problem_id)
    .single();

  if (probErr || !problem) {
    throw new Error(`Problem ${application.problem_id} not found: ${probErr?.message || 'Unknown'}`);
  }

  const { data: department, error: deptErr } = await client
    .from('departments')
    .select('*')
    .eq('id', problem.department_id)
    .single();

  if (deptErr || !department) {
    throw new Error(`Department ${problem.department_id} not found: ${deptErr?.message || 'Unknown'}`);
  }

  const { data: startup, error: startErr } = await client
    .from('startups')
    .select('*')
    .eq('id', application.startup_id)
    .single();

  if (startErr || !startup) {
    throw new Error(`Startup ${application.startup_id} not found: ${startErr?.message || 'Unknown'}`);
  }

  const { data: milestones, error: msErr } = await client
    .from('milestones')
    .select('*')
    .eq('pilot_id', pilot.id)
    .order('id', { ascending: true });

  if (msErr) {
    throw new Error(`Milestones for pilot ${pilot.id} could not be fetched: ${msErr.message}`);
  }

  // Format timestamp to ISO 8601 second-precision UTC string (YYYY-MM-DDTHH:MI:SSZ)
  const convertedDate = new Date(contract.converted_at);
  const convertedAtIso = convertedDate.toISOString().replace(/\.\d{3}Z$/, 'Z');

  const formatDate = (d: string) => (d.includes('T') ? d.split('T')[0] : d);

  return {
    contract_id: contract.id,
    contract_value: Number(contract.contract_value),
    converted_at: convertedAtIso,
    department: {
      id: department.id,
      name: department.name,
    },
    milestones: (milestones || []).map((m) => ({
      due_date: formatDate(m.due_date),
      evidence_url: m.evidence_url ?? null,
      id: m.id,
      status: m.status,
      target: m.target,
      title: m.title,
    })),
    pilot: {
      budget: Number(pilot.budget),
      end_date: formatDate(pilot.end_date),
      id: pilot.id,
      start_date: formatDate(pilot.start_date),
      status: pilot.status,
    },
    problem: {
      id: problem.id,
      title: problem.title,
    },
    rule_reference: contract.rule_reference ?? null,
    startup: {
      id: startup.id,
      name: startup.name,
    },
  };
}

/**
 * Recomputes the canonical hash of a contract record and compares it to the stored hash.
 * Returns verified status, both hashes, and the canonical record.
 */
export async function verifyRecord(
  contractId: string,
  client: SupabaseClient = defaultClient
): Promise<{
  verified: boolean;
  storedHash: string;
  computedHash: string;
  record: CanonicalRecord;
}> {
  const { data: contract, error } = await client
    .from('contracts')
    .select('record_hash')
    .eq('id', contractId)
    .single();

  if (error || !contract) {
    throw new Error(`Contract ${contractId} not found`);
  }

  const record = await buildRecord(contractId, client);
  const computedHash = hashRecord(record);
  const storedHash = contract.record_hash;

  return {
    verified: storedHash === computedHash,
    storedHash,
    computedHash,
    record,
  };
}
