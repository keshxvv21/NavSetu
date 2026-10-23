import { getSupabase } from '../lib/supabase';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_STARTUPS,
  INITIAL_PROBLEMS,
  INITIAL_APPLICATIONS,
  INITIAL_PILOTS,
} from '../lib/mockData';
import { buildRecord, hashRecord } from '../lib/services/recordHashService';
import { SEEDED_USERS } from '../lib/auth';

async function main() {
  console.log('--- NavSetu Seed Script Starting ---');

  // 1. Calculate Pilot A canonical SHA-256 hash
  const pilotA = INITIAL_PILOTS.find((p) => p.id === 'pilot-a-finished');
  if (!pilotA) throw new Error('Pilot A not found');

  const canonicalA = buildRecord({
    contractId: pilotA.contract_id || 'CNT-2026-JAL-0881',
    department: pilotA.department_name || 'Dept. of Drinking Water & Sanitation',
    startup: pilotA.startup_name || 'AquaSense Analytics Pvt Ltd',
    problem: pilotA.problem_title || 'Satellite Radar-Assisted Artificial Aquifer Recharge Site Identification',
    startDate: pilotA.start_date,
    endDate: pilotA.end_date,
    budget: pilotA.budget,
    contractValue: pilotA.contract_value || pilotA.budget,
    ruleReference: pilotA.rule_reference || 'Rule 149(viii) GFR 2017 / Startup Runway Mandate',
    milestones: pilotA.milestones,
  });

  const pilotAHash = hashRecord(canonicalA);
  console.log(`[Seed] Pilot A (finished) Canonical SHA-256 Hash: ${pilotAHash}`);

  const supabase = getSupabase();
  if (!supabase) {
    console.log(
      '[Seed] Supabase credentials not found in environment (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY).'
    );
    console.log('[Seed] NavSetu is operating in in-memory / browser-persistent high-fidelity demo mode.');
    console.log('[Seed] Data successfully initialized for local & presentation environments.');
    return;
  }

  console.log('[Seed] Connected to Supabase. Resetting database tables...');

  // Reset in reverse order of foreign keys
  await supabase.from('adoptions').delete().neq('id', '');
  await supabase.from('contracts').delete().neq('id', '');
  await supabase.from('milestones').delete().neq('id', '');
  await supabase.from('pilots').delete().neq('id', '');
  await supabase.from('applications').delete().neq('id', '');
  await supabase.from('problems').delete().neq('id', '');
  await supabase.from('users').delete().neq('id', '');
  await supabase.from('startups').delete().neq('id', '');
  await supabase.from('departments').delete().neq('id', '');

  console.log('[Seed] Inserting departments...');
  await supabase.from('departments').insert(INITIAL_DEPARTMENTS);

  console.log('[Seed] Inserting startups...');
  await supabase.from('startups').insert(INITIAL_STARTUPS);

  console.log('[Seed] Inserting users...');
  const usersToInsert = Object.values(SEEDED_USERS).map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    org_id: u.org_id,
  }));
  await supabase.from('users').insert(usersToInsert);

  console.log('[Seed] Inserting problems...');
  const problemsToInsert = INITIAL_PROBLEMS.map((p) => ({
    id: p.id,
    department_id: p.department_id,
    title: p.title,
    description: p.description,
    sector: p.sector,
    budget_cap: p.budget_cap,
    deadline: p.deadline,
    status: p.status,
  }));
  await supabase.from('problems').insert(problemsToInsert);

  console.log('[Seed] Inserting applications...');
  const appsToInsert = INITIAL_APPLICATIONS.map((a) => ({
    id: a.id,
    problem_id: a.problem_id,
    startup_id: a.startup_id,
    pitch: a.pitch,
    proposed_budget: a.proposed_budget,
    pilot_timeline_weeks: a.pilot_timeline_weeks,
    status: a.status,
  }));
  await supabase.from('applications').insert(appsToInsert);

  console.log('[Seed] Inserting pilots...');
  for (const pilot of INITIAL_PILOTS) {
    await supabase.from('pilots').insert({
      id: pilot.id,
      application_id: pilot.application_id,
      start_date: pilot.start_date,
      end_date: pilot.end_date,
      budget: pilot.budget,
      status: pilot.status,
    });

    for (const m of pilot.milestones) {
      await supabase.from('milestones').insert({
        id: m.id,
        pilot_id: m.pilot_id,
        title: m.title,
        target: m.target,
        due_date: m.due_date,
        evidence_url: m.evidence_url,
        notes: m.notes,
        status: m.status,
      });
    }

    if (pilot.status === 'converted' && pilot.contract_id) {
      await supabase.from('contracts').insert({
        id: pilot.contract_id,
        pilot_id: pilot.id,
        contract_value: pilot.contract_value || pilot.budget,
        rule_reference: pilot.rule_reference || 'Rule 149(viii) GFR 2017',
        record_hash: pilotAHash,
      });

      await supabase.from('adoptions').insert({
        id: 'adopt-301',
        contract_id: pilot.contract_id,
        department_id: 'dept-2',
        notes: 'Direct scale adoption approved under GFR 149(viii) across jurisdiction.',
      });
    }
  }

  console.log('[Seed] ✅ Database seeding finished successfully!');
}

main().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
