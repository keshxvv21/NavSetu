export const allowed = {
  problem: { open: ['in_pilot'], in_pilot: ['converted', 'open'] },
  application: { submitted: ['selected', 'rejected'] },
  pilot: { active: ['converted', 'failed'] },
  milestone: { pending: ['submitted'], submitted: ['met', 'missed'] },
} as const;

export type EntityType = keyof typeof allowed;

export function isTransitionAllowed(
  entity: EntityType,
  from: string,
  to: string
): boolean {
  const entityMap = allowed[entity] as Record<string, readonly string[]>;
  if (!entityMap || !entityMap[from]) {
    return false;
  }
  return entityMap[from].includes(to);
}

export function assertTransition(
  entity: EntityType,
  from: string,
  to: string
): void {
  if (!isTransitionAllowed(entity, from, to)) {
    throw new Error(
      `Invalid state transition for ${entity}: cannot transition from "${from}" to "${to}". Allowed transitions from "${from}": [${
        (allowed[entity] as Record<string, readonly string[]>)[from]?.join(', ') || 'none'
      }].`
    );
  }
}
