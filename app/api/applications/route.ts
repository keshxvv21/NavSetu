import { NextResponse, type NextRequest } from 'next/server';
import {
  createApplication,
  getApplicationsForProblem,
  getApplicationsForStartup,
  loadState,
} from '@/lib/departmentStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');
    const startupId = searchParams.get('startupId');

    if (problemId) {
      const apps = getApplicationsForProblem(problemId);
      return NextResponse.json({ ok: true, applications: apps });
    }

    if (startupId) {
      const apps = getApplicationsForStartup(startupId);
      return NextResponse.json({ ok: true, applications: apps });
    }

    const state = loadState();
    return NextResponse.json({ ok: true, applications: state.applications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problem_id, startup_id, pitch, proposed_budget, pilot_timeline_weeks } = body;

    if (!problem_id || !startup_id || !pitch) {
      return NextResponse.json(
        { error: 'Missing required fields: problem_id, startup_id, and pitch.' },
        { status: 400 }
      );
    }

    const application = createApplication({
      problem_id,
      startup_id,
      pitch,
      proposed_budget: Number(proposed_budget) || 1200000,
      pilot_timeline_weeks: Number(pilot_timeline_weeks) || 8,
    });

    return NextResponse.json({ ok: true, application }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Application submission failed' }, { status: 400 });
  }
}
