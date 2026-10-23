import { NextResponse, type NextRequest } from 'next/server';
import { loadState, saveState, checkConversion } from '@/lib/departmentStore';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: milestoneId } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (status !== 'met' && status !== 'missed') {
      return NextResponse.json(
        { error: 'Status must be either "met" or "missed"' },
        { status: 400 }
      );
    }

    const state = loadState();
    let foundPilot = null;
    let foundMilestone = null;

    for (const p of state.pilots) {
      const m = p.milestones.find((item) => item.id === milestoneId);
      if (m) {
        m.status = status;
        foundPilot = p;
        foundMilestone = m;
        break;
      }
    }

    if (!foundMilestone || !foundPilot) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    saveState(state);
    const report = checkConversion(foundPilot);

    return NextResponse.json({
      ok: true,
      milestone: foundMilestone,
      pilot: foundPilot,
      conversionCheck: report,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to review milestone' }, { status: 500 });
  }
}
