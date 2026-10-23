import { NextResponse, type NextRequest } from 'next/server';
import { convertPilotToContract, getPilotById } from '@/lib/departmentStore';
import { buildRecord, hashRecord } from '@/lib/services/recordHashService';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pilotId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { contract_value, rule_reference } = body;

    const pilot = getPilotById(pilotId);
    if (!pilot) {
      return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
    }

    const valueNum = Number(contract_value) || pilot.budget;
    const ruleRef = rule_reference || 'Rule 149(viii) of GFR 2017 / GeM Startup Direct Mandate';

    // Build canonical record & hash
    const canonical = buildRecord({
      contractId: `CNT-2026-${pilot.id.slice(-4).toUpperCase()}`,
      department: pilot.department_name || 'Government Department',
      startup: pilot.startup_name || 'Startup',
      problem: pilot.problem_title || 'Operational Problem',
      startDate: pilot.start_date,
      endDate: pilot.end_date,
      budget: pilot.budget,
      contractValue: valueNum,
      ruleReference: ruleRef,
      milestones: pilot.milestones,
    });

    const computedHash = hashRecord(canonical);

    const result = convertPilotToContract({
      pilotId,
      contractValue: valueNum,
      ruleReference: ruleRef,
    });

    // Attach exact hash
    result.pilot.record_hash = computedHash;
    result.recordHash = computedHash;

    return NextResponse.json({
      ok: true,
      pilot: result.pilot,
      contractId: result.contractId,
      recordHash: computedHash,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert pilot' }, { status: 400 });
  }
}
