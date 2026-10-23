import { NextResponse, type NextRequest } from 'next/server';
import { selectApplicantAndStartPilot } from '@/lib/departmentStore';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await context.params;
    const body = await request.json();

    const { startDate, endDate, pilotBudget, milestones } = body;

    const result = selectApplicantAndStartPilot({
      applicationId,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '2026-12-31',
      pilotBudget: Number(pilotBudget) || 1400000,
      milestones: milestones || [
        {
          title: 'Initial Deployment & Telemetry Baseline',
          target: 'Calibrate field sensors and establish reliable baseline telemetry.',
          dueDate: '2026-11-15',
        },
        {
          title: 'Benchmark Target Achievement',
          target: 'Demonstrate >= 30% reduction in turnaround time or operational metric.',
          dueDate: '2026-12-15',
        },
      ],
    });

    return NextResponse.json({ ok: true, pilot: result.pilot, problem: result.updatedProblem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to select application' }, { status: 500 });
  }
}
