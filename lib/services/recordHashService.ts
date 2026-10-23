// TODO: buildRecord(contractId) must be the ONE shared function used at conversion, in the seed script and on the verify page.
import { createHash } from 'crypto';

export function canonicalize(v: unknown): string {
  if (Array.isArray(v)) return '[' + v.map(canonicalize).join(',') + ']';
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return '{' + Object.keys(o).sort()
      .map((k) => JSON.stringify(k) + ':' + canonicalize(o[k])).join(',') + '}';
  }
  return JSON.stringify(v);
}

export const hashRecord = (record: object) =>
  createHash('sha256').update(canonicalize(record)).digest('hex');
