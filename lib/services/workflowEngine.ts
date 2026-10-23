// TODO: enforce allowed state transitions. Every API route calls this.
export const allowed = {
  problem: { open: ['in_pilot'], in_pilot: ['converted', 'open'] },
  application: { submitted: ['selected', 'rejected'] },
  pilot: { active: ['converted', 'failed'] },
  milestone: { pending: ['submitted'], submitted: ['met', 'missed'] },
} as const;

// TODO: export function assertTransition(entity, from, to) { ... }
