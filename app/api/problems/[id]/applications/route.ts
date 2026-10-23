import { NextResponse, type NextRequest } from 'next/server';
import { getApplicationsForProblem, getProblemById } from '@/lib/departmentStore';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: problemId } = await context.params;

    const problem = getProblemById(problemId);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const applications = getApplicationsForProblem(problemId);
    return NextResponse.json({ ok: true, problem, applications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch applications' }, { status: 500 });
  }
}
