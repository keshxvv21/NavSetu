import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import {
  CanonicalRecord,
  canonicalize,
  hashRecord,
  verifyRecord,
} from '../lib/services/recordHashService';

// Load environment variables from .env.local, fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ ERROR: Supabase credentials missing.');
  console.error('Please configure .env.local with:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co');
  console.error('  SUPABASE_SERVICE_KEY=<your-service-role-key>\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// ==============================================================================
// DETERMINISTIC CONSTANT IDENTIFIERS (UUID v4 format)
// ==============================================================================
const IDS = {
  // Departments
  deptHealth: 'd0000000-0000-0000-0000-000000000001',
  deptTransport: 'd0000000-0000-0000-0000-000000000002',
  deptWater: 'd0000000-0000-0000-0000-000000000003',

  // Startups
  startupArogya: 's0000000-0000-0000-0000-000000000001', // Verified
  startupGatiMarg: 's0000000-0000-0000-0000-000000000002', // Verified
  startupJalRakshak: 's0000000-0000-0000-0000-000000000003', // Verified
  startupKavach: 's0000000-0000-0000-0000-000000000004', // Verified
  startupQuickFix: 's0000000-0000-0000-0000-000000000005', // UNVERIFIED (mocked demo failure)

  // Users
  userDeptHealth: 'u0000000-0000-0000-0000-000000000001',
  userDeptTransport: 'u0000000-0000-0000-0000-000000000002',
  userStartupArogya: 'u0000000-0000-0000-0000-000000000003',
  userStartupGatiMarg: 'u0000000-0000-0000-0000-000000000004',

  // Open Problems
  problemOpen1: 'p0000000-0000-0000-0000-000000000001',
  problemOpen2: 'p0000000-0000-0000-0000-000000000002',
  problemOpen3: 'p0000000-0000-0000-0000-000000000003',
  problemOpen4: 'p0000000-0000-0000-0000-000000000004',

  // Pilot A (Fully Completed & Converted)
  problemA: 'p0000000-0000-0000-0000-00000000000a',
  appA1: 'a0000000-0000-0000-0000-000000000001', // Selected
  appA2: 'a0000000-0000-0000-0000-000000000002', // Rejected
  pilotA: 'b0000000-0000-0000-0000-000000000001',
  milestoneA1: 'm0000000-0000-0000-0000-0000000000a1',
  milestoneA2: 'm0000000-0000-0000-0000-0000000000a2',
  milestoneA3: 'm0000000-0000-0000-0000-0000000000a3',
  milestoneA4: 'm0000000-0000-0000-0000-0000000000a4',
  contractA: 'c0000000-0000-0000-0000-000000000001',
  adoptionA: 'ad000000-0000-0000-0000-000000000001',

  // Pilot B (Active / Live Demo Pilot)
  problemB: 'p0000000-0000-0000-0000-00000000000b',
  appB: 'a0000000-0000-0000-0000-00000000000b', // Selected
  pilotB: 'b0000000-0000-0000-0000-000000000002',
  milestoneB1: 'm0000000-0000-0000-0000-0000000000b1',
  milestoneB2: 'm0000000-0000-0000-0000-0000000000b2',
  milestoneB3: 'm0000000-0000-0000-0000-0000000000b3',
  milestoneB4: 'm0000000-0000-0000-0000-0000000000b4',
  milestoneB5: 'm0000000-0000-0000-0000-0000000000b5',
};

async function seed() {
  console.log('🚀 Starting NavSetu database seeding...\n');

  // ============================================================================
  // 1. RESET / CLEANUP EXISTING DATA IN SAFE DEPENDENCY ORDER
  // ============================================================================
  console.log('🧹 Step 1: Resetting existing demo data...');

  const { error: rpcError } = await supabase.rpc('reset_demo_data');
  if (rpcError) {
    console.log('   (Note: reset_demo_data RPC unavailable; executing table deletes in cascade order)');
    await supabase.from('adoptions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('contracts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('milestones').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('pilots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('applications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('problems').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('startups').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('departments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }
  console.log('   ✅ Tables cleanly reset.\n');

  // ============================================================================
  // 2. INSERT DEPARTMENTS
  // ============================================================================
  console.log('🏢 Step 2: Inserting 3 departments...');
  const departments = [
    {
      id: IDS.deptHealth,
      name: 'Ministry of Health & Family Welfare',
      sector: 'Healthcare',
    },
    {
      id: IDS.deptTransport,
      name: 'Ministry of Road Transport & Highways',
      sector: 'Logistics & Transport',
    },
    {
      id: IDS.deptWater,
      name: 'Department of Drinking Water & Sanitation',
      sector: 'Clean Water & Sanitation',
    },
  ];

  const { error: deptErr } = await supabase.from('departments').insert(departments);
  if (deptErr) throw new Error(`Failed to insert departments: ${deptErr.message}`);
  console.log(`   ✅ Inserted ${departments.length} departments.`);

  // ============================================================================
  // 3. INSERT STARTUPS (4 Verified, 1 Unverified)
  // ============================================================================
  console.log('🚀 Step 3: Inserting 5 startups (4 verified, 1 unverified)...');
  const startups = [
    {
      id: IDS.startupArogya,
      name: 'ArogyaSense Health Solutions Pvt Ltd',
      dpiit_id: 'DPIIT-HLTH-8821',
      sector: 'Healthcare',
      verified: true,
    },
    {
      id: IDS.startupGatiMarg,
      name: 'GatiMarg AI Systems LLP',
      dpiit_id: 'DPIIT-LOGI-4432',
      sector: 'Logistics & Transport',
      verified: true,
    },
    {
      id: IDS.startupJalRakshak,
      name: 'JalRakshak IoT Technologies',
      dpiit_id: 'DPIIT-WATR-1098',
      sector: 'Clean Water & Sanitation',
      verified: true,
    },
    {
      id: IDS.startupKavach,
      name: 'KavachCyber Defense Labs',
      dpiit_id: 'DPIIT-CYBR-9901',
      sector: 'Cybersecurity',
      verified: true,
    },
    {
      id: IDS.startupQuickFix,
      name: 'QuickFix Innovations Pvt Ltd',
      dpiit_id: 'DPIIT-PEND-0012',
      sector: 'Healthcare',
      verified: false, // Unverified - demonstrates eligibility block
    },
  ];

  const { error: suErr } = await supabase.from('startups').insert(startups);
  if (suErr) throw new Error(`Failed to insert startups: ${suErr.message}`);
  console.log(`   ✅ Inserted ${startups.length} startups.`);

  // ============================================================================
  // 4. INSERT LOGIN USERS (2 per role)
  // ============================================================================
  console.log('👤 Step 4: Inserting 2 seeded login users per role (4 users total)...');
  const users = [
    {
      id: IDS.userDeptHealth,
      email: 'health.officer@nic.in',
      role: 'department',
      org_id: IDS.deptHealth,
    },
    {
      id: IDS.userDeptTransport,
      email: 'transport.director@nic.in',
      role: 'department',
      org_id: IDS.deptTransport,
    },
    {
      id: IDS.userStartupArogya,
      email: 'founder@arogyasense.com',
      role: 'startup',
      org_id: IDS.startupArogya,
    },
    {
      id: IDS.userStartupGatiMarg,
      email: 'ceo@gatimarg.ai',
      role: 'startup',
      org_id: IDS.startupGatiMarg,
    },
  ];

  const { error: userErr } = await supabase.from('users').insert(users);
  if (userErr) throw new Error(`Failed to insert users: ${userErr.message}`);
  console.log(`   ✅ Inserted ${users.length} seeded users.`);

  // ============================================================================
  // 5. INSERT 4 OPEN PROBLEMS
  // ============================================================================
  console.log('📋 Step 5: Inserting 4 open problems for browsing...');
  const openProblems = [
    {
      id: IDS.problemOpen1,
      department_id: IDS.deptHealth,
      title: 'Real-time Tele-ICU Triage for Rural Primary Health Centres',
      description:
        'Sub-district health centres lack specialized intensivists. Seeking an AI-driven video and biometric triage hub capable of early sepsis detection and remote ICU specialist escalation.',
      sector: 'Healthcare',
      budget_cap: 800000,
      deadline: '2026-12-31T23:59:59Z',
      status: 'open',
    },
    {
      id: IDS.problemOpen2,
      department_id: IDS.deptTransport,
      title: 'AI-Powered Automated Pothole and Road Distress Detection System',
      description:
        'Deploy camera-equipped inspection vehicles to scan national highway stretches at 60 km/h, automatically classifying road distress with millimeter severity grading.',
      sector: 'Logistics & Transport',
      budget_cap: 1200000,
      deadline: '2026-11-30T23:59:59Z',
      status: 'open',
    },
    {
      id: IDS.problemOpen3,
      department_id: IDS.deptWater,
      title: 'IoT Continuous Chlorine & Contaminant Monitoring in Rural Water Tanks',
      description:
        'Automated solar-powered sensors in overhead service reservoirs to report residual chlorine, turbidity, and bacterial coliform counts to the state Jal Jeevan dashboard.',
      sector: 'Clean Water & Sanitation',
      budget_cap: 950000,
      deadline: '2026-12-15T23:59:59Z',
      status: 'open',
    },
    {
      id: IDS.problemOpen4,
      department_id: IDS.deptHealth,
      title: 'Predictive Inventory Forecasting for Essential Medicines in District Warehouses',
      description:
        'Prevent stockouts of critical anti-venoms and insulin by analyzing regional disease outbreak trends and seasonal consumption patterns across 45 primary health clinics.',
      sector: 'Healthcare',
      budget_cap: 600000,
      deadline: '2027-01-15T23:59:59Z',
      status: 'open',
    },
  ];

  const { error: probErr } = await supabase.from('problems').insert(openProblems);
  if (probErr) throw new Error(`Failed to insert open problems: ${probErr.message}`);
  console.log(`   ✅ Inserted ${openProblems.length} open problems.`);

  // ============================================================================
  // 6. INSERT PILOT A (Fully completed, all milestones met, converted with valid hash)
  // ============================================================================
  console.log('🏆 Step 6: Inserting Pilot A (fully completed & converted)...');

  // Problem A
  const problemA = {
    id: IDS.problemA,
    department_id: IDS.deptHealth,
    title: 'AI-Based Triage & Diagnostic Assistant for Rural Health Sub-Centres',
    description:
      'Validated telemedicine and edge diagnostic assistant for frontline ASHA and ANM workers in tribal health blocks.',
    sector: 'Healthcare',
    budget_cap: 750000,
    deadline: '2026-09-30T23:59:59Z',
    status: 'converted',
  };
  const { error: pAErr } = await supabase.from('problems').insert(problemA);
  if (pAErr) throw new Error(`Failed to insert Problem A: ${pAErr.message}`);

  // Application A1 (Selected) & Application A2 (Rejected competitor)
  const applicationsA = [
    {
      id: IDS.appA1,
      problem_id: IDS.problemA,
      startup_id: IDS.startupArogya,
      pitch:
        'Our ArogyaEdge system operates offline on low-cost tablets, achieving 92% diagnostic concordance with clinical radiologist benchmarks.',
      status: 'selected',
    },
    {
      id: IDS.appA2,
      problem_id: IDS.problemA,
      startup_id: IDS.startupKavach,
      pitch: 'Proprietary biometric screening hardware tailored for primary health centres.',
      status: 'rejected',
    },
  ];
  const { error: appAErr } = await supabase.from('applications').insert(applicationsA);
  if (appAErr) throw new Error(`Failed to insert Applications A: ${appAErr.message}`);

  // Pilot A
  const pilotA = {
    id: IDS.pilotA,
    application_id: IDS.appA1,
    start_date: '2026-07-01',
    end_date: '2026-09-30',
    budget: 650000,
    status: 'converted',
  };
  const { error: pilAErr } = await supabase.from('pilots').insert(pilotA);
  if (pilAErr) throw new Error(`Failed to insert Pilot A: ${pilAErr.message}`);

  // Milestones for Pilot A (All met)
  const milestonesA = [
    {
      id: IDS.milestoneA1,
      pilot_id: IDS.pilotA,
      title: 'Milestone 1: EMR Integration & HL7 FHIR Pipeline',
      due_date: '2026-07-20',
      target: 'Establish automated bidirectional sync with district hospital EMR system',
      evidence_url: 'https://evidence.navsetu.gov.in/pilot-a/m1-fhir-integration.pdf',
      status: 'met',
    },
    {
      id: IDS.milestoneA2,
      pilot_id: IDS.pilotA,
      title: 'Milestone 2: Offline Edge Model Deployment',
      due_date: '2026-08-15',
      target: 'Achieve sub-1.5s inference latency without cellular connectivity on tablet devices',
      evidence_url: 'https://evidence.navsetu.gov.in/pilot-a/m2-edge-benchmarks.pdf',
      status: 'met',
    },
    {
      id: IDS.milestoneA3,
      pilot_id: IDS.pilotA,
      title: 'Milestone 3: Field Clinical Pilot across 10 PHCs',
      due_date: '2026-09-10',
      target: 'Screen 1,500 rural patients with >90% diagnostic concordance against senior doctors',
      evidence_url: 'https://evidence.navsetu.gov.in/pilot-a/m3-clinical-trial-report.pdf',
      status: 'met',
    },
    {
      id: IDS.milestoneA4,
      pilot_id: IDS.pilotA,
      title: 'Milestone 4: Security Audit & Department Acceptance',
      due_date: '2026-09-30',
      target: 'Obtain CERT-In empaneled security audit clearance and clinical sign-off',
      evidence_url: 'https://evidence.navsetu.gov.in/pilot-a/m4-audit-signoff.pdf',
      status: 'met',
    },
  ];
  const { error: msAErr } = await supabase.from('milestones').insert(milestonesA);
  if (msAErr) throw new Error(`Failed to insert Milestones A: ${msAErr.message}`);

  // Canonical record computation for Pilot A contract
  const convertedAtA = '2026-10-01T10:00:00Z';
  const canonicalRecordA: CanonicalRecord = {
    contract_id: IDS.contractA,
    contract_value: 650000,
    converted_at: convertedAtA,
    department: {
      id: IDS.deptHealth,
      name: 'Ministry of Health & Family Welfare',
    },
    milestones: milestonesA.map((m) => ({
      due_date: m.due_date,
      evidence_url: m.evidence_url,
      id: m.id,
      status: m.status,
      target: m.target,
      title: m.title,
    })),
    pilot: {
      budget: pilotA.budget,
      end_date: pilotA.end_date,
      id: pilotA.id,
      start_date: pilotA.start_date,
      status: pilotA.status,
    },
    problem: {
      id: problemA.id,
      title: problemA.title,
    },
    rule_reference: 'GFR Rule 194 / GeM Direct Pilot Purchase',
    startup: {
      id: IDS.startupArogya,
      name: 'ArogyaSense Health Solutions Pvt Ltd',
    },
  };

  const recordHashA = hashRecord(canonicalRecordA);
  console.log(`   🔑 Pilot A SHA-256 Record Hash: ${recordHashA}`);

  // Insert Contract A
  const contractA = {
    id: IDS.contractA,
    pilot_id: IDS.pilotA,
    contract_value: 650000,
    converted_at: convertedAtA,
    rule_reference: 'GFR Rule 194 / GeM Direct Pilot Purchase',
    record_hash: recordHashA,
  };
  const { error: cAErr } = await supabase.from('contracts').insert(contractA);
  if (cAErr) throw new Error(`Failed to insert Contract A: ${cAErr.message}`);

  // Insert Adoption of Contract A by Department of Drinking Water & Sanitation
  const adoptionA = {
    id: IDS.adoptionA,
    contract_id: IDS.contractA,
    department_id: IDS.deptWater,
    adopted_at: '2026-10-10T12:00:00Z',
  };
  const { error: adAErr } = await supabase.from('adoptions').insert(adoptionA);
  if (adAErr) throw new Error(`Failed to insert Adoption A: ${adAErr.message}`);
  console.log('   ✅ Inserted Pilot A, Contract A, and Adoption A.');

  // ============================================================================
  // 7. INSERT PILOT B (Active / Live demo pilot with 5 milestones, 3 reviewed)
  // ============================================================================
  console.log('⚡ Step 7: Inserting Pilot B (active / live demo pilot)...');

  // Problem B
  const problemB = {
    id: IDS.problemB,
    department_id: IDS.deptTransport,
    title: 'Smart Optical Flow Traffic Congestion Controller for Urban Intersections',
    description:
      'Dynamic signal timing controller using edge computer vision cameras to clear bottleneck corridors during peak rush hours.',
    sector: 'Logistics & Transport',
    budget_cap: 1000000,
    deadline: '2026-12-31T23:59:59Z',
    status: 'in_pilot',
  };
  const { error: pBErr } = await supabase.from('problems').insert(problemB);
  if (pBErr) throw new Error(`Failed to insert Problem B: ${pBErr.message}`);

  // Application B (Selected)
  const appB = {
    id: IDS.appB,
    problem_id: IDS.problemB,
    startup_id: IDS.startupGatiMarg,
    pitch:
      'GatiMarg Edge vision boxes connect directly to legacy traffic controllers, reducing transit delays by 22% in simulated corridor runs.',
    status: 'selected',
  };
  const { error: appBErr } = await supabase.from('applications').insert(appB);
  if (appBErr) throw new Error(`Failed to insert Application B: ${appBErr.message}`);

  // Pilot B (Active)
  const pilotB = {
    id: IDS.pilotB,
    application_id: IDS.appB,
    start_date: '2026-10-01',
    end_date: '2026-12-15',
    budget: 900000,
    status: 'active',
  };
  const { error: pilBErr } = await supabase.from('pilots').insert(pilotB);
  if (pilBErr) throw new Error(`Failed to insert Pilot B: ${pilBErr.message}`);

  // Milestones for Pilot B:
  // 3 Reviewed (2 met, 1 missed), 1 submitted (pending review), 1 pending (ready for startup submission)
  const milestonesB = [
    {
      id: IDS.milestoneB1,
      pilot_id: IDS.pilotB,
      title: 'Milestone 1: Camera Calibration & Edge Video Ingestion',
      due_date: '2026-10-10',
      target: 'Deploy edge computer vision boxes at 4 high-density junctions with 30fps streaming',
      evidence_url: 'https://evidence.navsetu.gov.in/pilot-b/m1-calibration-logs.pdf',
      status: 'met',
    },
    {
      id: IDS.milestoneB2,
      pilot_id: IDS.pilotB,
      title: 'Milestone 2: Real-time Vehicle Queue Length Estimation',
      due_date: '2026-10-18',
      target: 'Maintain >92% vehicle count accuracy across morning and evening lighting conditions',
      evidence_url: 'https://evidence.navsetu.gov.in/pilot-b/m2-accuracy-metrics.pdf',
      status: 'met',
    },
    {
      id: IDS.milestoneB3,
      pilot_id: IDS.pilotB,
      title: 'Milestone 3: Adaptive Signal Timing Pilot Test (Phase 1)',
      due_date: '2026-10-22',
      target: 'Demonstrate minimum 15% reduction in average intersection queue delay during morning rush',
      evidence_url: 'https://evidence.navsetu.gov.in/pilot-b/m3-traffic-flow-analysis.pdf',
      status: 'missed', // Reviewed as missed: real feedback shown in demo
    },
    {
      id: IDS.milestoneB4,
      pilot_id: IDS.pilotB,
      title: 'Milestone 4: Dynamic Green Corridor for Emergency Ambulances',
      due_date: '2026-11-10',
      target: 'Pre-empt signal phases for emergency vehicles with under 5 second response time',
      evidence_url: 'https://evidence.navsetu.gov.in/pilot-b/m4-emergency-run-video.mp4',
      status: 'submitted', // Ready for Department live review in demo
    },
    {
      id: IDS.milestoneB5,
      pilot_id: IDS.pilotB,
      title: 'Milestone 5: Continuous 7-Day Corridor Reliability & Final SLA',
      due_date: '2026-12-05',
      target: 'Continuous unattended operation with zero controller faults and SLA sign-off',
      evidence_url: null,
      status: 'pending', // Ready for Startup live evidence submission in demo
    },
  ];

  const { error: msBErr } = await supabase.from('milestones').insert(milestonesB);
  if (msBErr) throw new Error(`Failed to insert Milestones B: ${msBErr.message}`);
  console.log('   ✅ Inserted Pilot B with 5 milestones (3 reviewed, 1 submitted, 1 pending).');

  // ============================================================================
  // 8. VERIFY PILOT A STORED HASH INTEGRITY
  // ============================================================================
  console.log('\n🔍 Step 8: Verifying Pilot A stored hash...');
  const verification = await verifyRecord(IDS.contractA, supabase);

  if (verification.verified) {
    console.log('   🟢 VERIFICATION SUCCESSFUL!');
    console.log(`   Stored Hash   : ${verification.storedHash}`);
    console.log(`   Computed Hash : ${verification.computedHash}`);
    console.log('   Status        : Record unchanged since conversion.\n');
  } else {
    console.error('   🔴 VERIFICATION FAILED: Stored hash does not match computed hash!');
    console.error(`   Stored   : ${verification.storedHash}`);
    console.error(`   Computed : ${verification.computedHash}`);
    throw new Error('Pilot A seed hash verification failed.');
  }

  // ============================================================================
  // SEED SUMMARY
  // ============================================================================
  console.log('==============================================================================');
  console.log('🎉 NAVSETU SEEDING COMPLETED SUCCESSFULLY!');
  console.log('==============================================================================');
  console.log('Demo Credentials:');
  console.log('  Department Users:');
  console.log('    • health.officer@nic.in      (Ministry of Health & Family Welfare)');
  console.log('    • transport.director@nic.in  (Ministry of Road Transport & Highways)');
  console.log('  Startup Users:');
  console.log('    • founder@arogyasense.com    (ArogyaSense Health Solutions - Verified)');
  console.log('    • ceo@gatimarg.ai            (GatiMarg AI Systems - Verified)');
  console.log('  Unverified Startup (Blocked):');
  console.log('    • QuickFix Innovations Pvt Ltd (verified: false)');
  console.log('------------------------------------------------------------------------------');
  console.log('Demo Pilots:');
  console.log(`  • Pilot A (Finished & Converted): ID ${IDS.pilotA}`);
  console.log(`    Contract ID : ${IDS.contractA}`);
  console.log(`    Record Hash : ${recordHashA}`);
  console.log(`  • Pilot B (Live Demo Pilot)     : ID ${IDS.pilotB}`);
  console.log('    Milestones: 2 Met, 1 Missed, 1 Submitted (Ready for review), 1 Pending');
  console.log('==============================================================================\n');
}

seed().catch((err) => {
  console.error('\n❌ Seed script failed:', err);
  process.exit(1);
});
