import { NextResponse, type NextRequest } from 'next/server';
import {
  verifyContractRecord,
  getContractById,
  tamperMilestoneForAuditDemo,
  loadState,
} from '@/lib/departmentStore';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    let targetId = rawId;

    if (rawId === 'demo') {
      // Default demo contract is Pilot A's contract
      targetId = 'CNT-2026-JAL-0881';
    }

    const verification = verifyContractRecord(targetId);
    return NextResponse.json({
      ok: true,
      ...verification,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        verified: false,
        error: error.message || 'Contract verification failed or record not found',
      },
      { status: 404 }
    );
  }
}

// POST endpoint for Live Demo Presentation:
// Allows presenter to deliberately tamper with a milestone or restore it to demonstrate
// the cryptographic audit verification flipping from Green to Red in under 30 seconds.
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { action, milestoneId, newStatus } = body;

    let targetId = rawId;
    if (rawId === 'demo') {
      targetId = 'CNT-2026-JAL-0881';
    }

    const pilot = getContractById(targetId);
    if (!pilot) {
      return NextResponse.json({ error: 'Pilot/contract record not found' }, { status: 404 });
    }

    if (action === 'tamper') {
      // Pick first milestone or specified milestone and flip its status
      const targetMilestone = milestoneId
        ? pilot.milestones.find((m) => m.id === milestoneId)
        : pilot.milestones[0];

      if (!targetMilestone) {
        return NextResponse.json({ error: 'No milestone found to tamper' }, { status: 400 });
      }

      const flippedStatus = newStatus || (targetMilestone.status === 'met' ? 'missed' : 'met');
      tamperMilestoneForAuditDemo(pilot.id, targetMilestone.id, flippedStatus);

      // Re-verify immediately to show mismatch
      const updatedCheck = verifyContractRecord(targetId);
      return NextResponse.json({
        ok: true,
        message: `Simulated unauthorized modification: Milestone "${targetMilestone.title}" flipped to "${flippedStatus}". Cryptographic record hash now mismatches stored anchor.`,
        tamperedMilestone: targetMilestone.id,
        ...updatedCheck,
      });
    }

    if (action === 'restore') {
      // Restore all milestones of this contract to their canonical state
      const state = loadState();
      const p = state.pilots.find((item) => item.id === pilot.id || item.contract_id === pilot.contract_id);
      if (p) {
        p.milestones.forEach((m) => {
          m.status = 'met';
        });
        tamperMilestoneForAuditDemo(p.id, p.milestones[0].id, 'met');
      }

      const updatedCheck = verifyContractRecord(targetId);
      return NextResponse.json({
        ok: true,
        message: 'Record restored to genuine canonical state. Cryptographic hash verified.',
        ...updatedCheck,
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Tamper action failed' }, { status: 500 });
  }
}
