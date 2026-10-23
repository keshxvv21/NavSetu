import { NextResponse } from 'next/server';
import { getProblems, createProblem } from '@/lib/departmentStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deptId = searchParams.get('deptId') || undefined;
    const problems = getProblems(deptId);
    return NextResponse.json({ ok: true, problems });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch problems' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, sector, budget_cap, deadline, department_id, department_name } = body;

    if (!title || !description || !sector || !budget_cap || !deadline) {
      return NextResponse.json(
        { error: 'Missing required problem fields: title, description, sector, budget_cap, deadline' },
        { status: 400 }
      );
    }

    const problem = createProblem({
      department_id: department_id || 'dept-1',
      department_name: department_name || 'Dept. of Drinking Water & Sanitation',
      title,
      description,
      sector,
      budget_cap: Number(budget_cap),
      deadline,
    });

    return NextResponse.json({ ok: true, problem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create problem' }, { status: 500 });
  }
}
