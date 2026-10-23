import { NextResponse, type NextRequest } from 'next/server';
import { loadState, submitMilestoneEvidence } from '@/lib/departmentStore';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: milestoneId } = await context.params;
    const body = await request.json();
    const { evidence_url, notes } = body;

    if (!evidence_url || evidence_url.trim().length === 0) {
      return NextResponse.json(
        { error: 'An auditable evidence URL is required (e.g. GitHub repo, cloud benchmark, or report link).' },
        { status: 400 }
      );
    }

    const state = loadState();
    let pilotId: string | null = null;
    let foundMilestone = null;

    for (const p of state.pilots) {
      const m = p.milestones.find((item) => item.id === milestoneId);
      if (m) {
        pilotId = p.id;
        foundMilestone = m;
        break;
      }
    }

    if (!pilotId || !foundMilestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const updatedPilot = submitMilestoneEvidence(pilotId, milestoneId, evidence_url, notes);
    const updatedMilestone = updatedPilot.milestones.find((m) => m.id === milestoneId);

    return NextResponse.json({
      ok: true,
      milestone: updatedMilestone,
      pilot: updatedPilot,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit milestone' }, { status: 500 });
  }
}
