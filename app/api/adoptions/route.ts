import { NextResponse, type NextRequest } from 'next/server';
import { getAdoptions, createAdoption, getContracts } from '@/lib/departmentStore';

export async function GET() {
  try {
    const adoptions = getAdoptions();
    const provenContracts = getContracts();
    return NextResponse.json({
      ok: true,
      adoptions,
      provenContracts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch adoptions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contract_id, department_id, department_name, notes } = body;

    if (!contract_id || !department_id) {
      return NextResponse.json(
        { error: 'Missing required parameters: contract_id and department_id are mandatory.' },
        { status: 400 }
      );
    }

    const adoption = createAdoption({
      contract_id,
      department_id,
      department_name: department_name || 'Partner Ministry / Department',
      notes,
    });

    return NextResponse.json({ ok: true, adoption }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to register adoption' }, { status: 400 });
  }
}
