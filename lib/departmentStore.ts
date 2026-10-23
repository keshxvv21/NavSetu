import {
  Department,
  Startup,
  Problem,
  Application,
  Milestone,
  Pilot,
  INITIAL_DEPARTMENTS,
  INITIAL_STARTUPS,
  INITIAL_PROBLEMS,
  INITIAL_APPLICATIONS,
  INITIAL_PILOTS,
} from './mockData';
import { ConversionCheckReport, RuleCheckResult } from '@/components/ConversionResult';
import { buildRecord, hashRecord } from '@/lib/services/recordHashService';

export type { Problem, Pilot, Milestone, Application, Department, Startup };

export interface Adoption {
  id: string;
  contract_id: string;
  department_id: string;
  department_name: string;
  adopted_at: string;
  pilot_title?: string;
  startup_name?: string;
  contract_value?: number;
  sector?: string;
  notes?: string;
}

const STORAGE_KEY = 'navsetu_state_v1';

export interface AppState {
  departments: Department[];
  startups: Startup[];
  problems: Problem[];
  applications: Application[];
  pilots: Pilot[];
  adoptions: Adoption[];
}

const INITIAL_ADOPTIONS: Adoption[] = [
  {
    id: 'adopt-301',
    contract_id: 'CNT-2026-JAL-0881',
    department_id: 'dept-2',
    department_name: 'Ministry of Housing and Urban Affairs (Smart Cities Mission)',
    adopted_at: '2026-10-18T14:30:00Z',
    pilot_title: 'Satellite Radar-Assisted Artificial Aquifer Recharge Site Identification',
    startup_name: 'AquaSense Analytics Pvt Ltd',
    contract_value: 1150000,
    sector: 'Water & Sanitation',
    notes: 'Direct adoption under GFR Rule 149(viii) for 8 smart city groundwater recharge zones.',
  },
];

// Ensure Pilot A's record hash is accurate at init
function ensurePilotAHash(pilots: Pilot[]): void {
  const pilotA = pilots.find((p) => p.id === 'pilot-a-finished');
  if (pilotA && pilotA.contract_id) {
    const canonical = buildRecord({
      contractId: pilotA.contract_id,
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
    pilotA.record_hash = hashRecord(canonical);
  }
}

function getInitialState(): AppState {
  const pilots = JSON.parse(JSON.stringify(INITIAL_PILOTS));
  ensurePilotAHash(pilots);
  return {
    departments: JSON.parse(JSON.stringify(INITIAL_DEPARTMENTS)),
    startups: JSON.parse(JSON.stringify(INITIAL_STARTUPS)),
    problems: JSON.parse(JSON.stringify(INITIAL_PROBLEMS)),
    applications: JSON.parse(JSON.stringify(INITIAL_APPLICATIONS)),
    pilots,
    adoptions: JSON.parse(JSON.stringify(INITIAL_ADOPTIONS)),
  };
}

let serverState: AppState | null = null;

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    if (!serverState) {
      serverState = getInitialState();
    }
    return serverState;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const state = getInitialState();
      saveState(state);
      return state;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.adoptions) {
      parsed.adoptions = INITIAL_ADOPTIONS;
    }
    return parsed;
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
    return getInitialState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') {
    serverState = state;
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state:', e);
  }
}

export function resetState(): AppState {
  const state = getInitialState();
  serverState = state;
  saveState(state);
  return state;
}

// ----------------------------------------------------
// Startups & Verification
// ----------------------------------------------------

export function getStartups(): Startup[] {
  const state = loadState();
  return state.startups;
}

export function getStartupById(id: string): Startup | undefined {
  const state = loadState();
  return state.startups.find((s) => s.id === id);
}

export function updateStartupVerification(id: string, verified: boolean): Startup {
  const state = loadState();
  const startup = state.startups.find((s) => s.id === id);
  if (!startup) {
    throw new Error('Startup not found');
  }
  startup.verified = verified;
  saveState(state);
  return startup;
}

// ----------------------------------------------------
// Problems
// ----------------------------------------------------

export function getProblems(departmentId?: string): Problem[] {
  const state = loadState();
  if (departmentId) {
    return state.problems.filter((p) => p.department_id === departmentId);
  }
  return state.problems;
}

export function getProblemById(id: string): Problem | undefined {
  const state = loadState();
  return state.problems.find((p) => p.id === id);
}

export function createProblem(params: {
  department_id: string;
  department_name?: string;
  title: string;
  description: string;
  sector: string;
  budget_cap: number;
  deadline: string;
}): Problem {
  const state = loadState();
  const id = `prob-${Date.now().toString(36)}`;

  const newProblem: Problem = {
    id,
    department_id: params.department_id,
    department_name: params.department_name || 'Dept. of Drinking Water & Sanitation',
    title: params.title.trim(),
    description: params.description.trim(),
    sector: params.sector,
    budget_cap: Number(params.budget_cap),
    deadline: params.deadline,
    status: 'open',
    created_at: new Date().toISOString(),
    application_count: 0,
  };

  state.problems.unshift(newProblem);
  saveState(state);
  return newProblem;
}

// ----------------------------------------------------
// Applications
// ----------------------------------------------------

export function getApplicationsForProblem(problemId: string): Application[] {
  const state = loadState();
  return state.applications.filter((a) => a.problem_id === problemId);
}

export function getApplicationsForStartup(startupId: string): Application[] {
  const state = loadState();
  return state.applications.filter((a) => a.startup_id === startupId);
}

export function createApplication(params: {
  problem_id: string;
  startup_id: string;
  pitch: string;
  proposed_budget: number;
  pilot_timeline_weeks: number;
}): Application {
  const state = loadState();

  const problem = state.problems.find((p) => p.id === params.problem_id);
  if (!problem) {
    throw new Error('Problem challenge not found');
  }

  const startup = state.startups.find((s) => s.id === params.startup_id);
  if (!startup) {
    throw new Error('Startup profile not found');
  }

  if (!startup.verified) {
    throw new Error('Eligibility block: Startup must have verified DPIIT registration to submit applications.');
  }

  // Check unique key: applications(problem_id, startup_id)
  const existing = state.applications.find(
    (a) => a.problem_id === params.problem_id && a.startup_id === params.startup_id
  );
  if (existing) {
    throw new Error('An application from this startup has already been submitted for this challenge.');
  }

  const newApp: Application = {
    id: `app-${Date.now().toString(36)}`,
    problem_id: params.problem_id,
    startup_id: params.startup_id,
    startup,
    pitch: params.pitch.trim(),
    proposed_budget: Number(params.proposed_budget),
    pilot_timeline_weeks: Number(params.pilot_timeline_weeks),
    status: 'submitted',
    created_at: new Date().toISOString(),
  };

  state.applications.unshift(newApp);
  problem.application_count = (problem.application_count || 0) + 1;

  saveState(state);
  return newApp;
}

// ----------------------------------------------------
// Pilots & Milestones
// ----------------------------------------------------

export function selectApplicantAndStartPilot(params: {
  applicationId: string;
  startDate: string;
  endDate: string;
  pilotBudget: number;
  milestones: Array<{
    title: string;
    target: string;
    dueDate: string;
  }>;
}): { pilot: Pilot; updatedProblem: Problem } {
  const state = loadState();
  const appIndex = state.applications.findIndex((a) => a.id === params.applicationId);
  if (appIndex === -1) {
    throw new Error('Application not found');
  }

  const selectedApp = state.applications[appIndex];
  const problemIndex = state.problems.findIndex((p) => p.id === selectedApp.problem_id);
  if (problemIndex === -1) {
    throw new Error('Associated problem not found');
  }

  const problem = state.problems[problemIndex];
  const startup = state.startups.find((s) => s.id === selectedApp.startup_id);

  selectedApp.status = 'selected';

  // Reject all other applications for this problem
  state.applications.forEach((a) => {
    if (a.problem_id === problem.id && a.id !== selectedApp.id) {
      a.status = 'rejected';
    }
  });

  const pilotId = `pilot-${Date.now().toString(36)}`;
  const pilotMilestones: Milestone[] = params.milestones.map((m, idx) => ({
    id: `m-${pilotId}-${idx + 1}`,
    pilot_id: pilotId,
    title: m.title,
    target: m.target,
    due_date: m.dueDate,
    status: 'pending',
  }));

  const newPilot: Pilot = {
    id: pilotId,
    application_id: selectedApp.id,
    problem_id: problem.id,
    problem_title: problem.title,
    department_name: problem.department_name,
    startup_name: startup?.name || 'Partner Startup',
    startup_dpiit: startup?.dpiit_id || 'DIPP-PENDING',
    start_date: params.startDate,
    end_date: params.endDate,
    budget: params.pilotBudget,
    contract_value: params.pilotBudget,
    status: 'active',
    milestones: pilotMilestones,
    rule_reference: 'Rule 149(viii) GFR 2017 / GeM Direct Conversion',
  };

  state.pilots.unshift(newPilot);

  problem.status = 'in_pilot';
  problem.active_pilot_id = pilotId;

  saveState(state);
  return { pilot: newPilot, updatedProblem: problem };
}

export function getPilots(filter?: { status?: string; startupName?: string }): Pilot[] {
  const state = loadState();
  let list = state.pilots;
  if (filter?.status) {
    list = list.filter((p) => p.status === filter.status);
  }
  if (filter?.startupName) {
    list = list.filter((p) => p.startup_name?.toLowerCase().includes(filter.startupName!.toLowerCase()));
  }
  return list;
}

export function getPilotById(id: string): Pilot | undefined {
  const state = loadState();
  return state.pilots.find((p) => p.id === id);
}

export function submitMilestoneEvidence(
  pilotId: string,
  milestoneId: string,
  evidenceUrl: string,
  notes?: string
): Pilot {
  const state = loadState();
  const pilot = state.pilots.find((p) => p.id === pilotId);
  if (!pilot) {
    throw new Error('Pilot not found');
  }

  const milestone = pilot.milestones.find((m) => m.id === milestoneId);
  if (!milestone) {
    throw new Error('Milestone not found');
  }

  milestone.evidence_url = evidenceUrl.trim();
  milestone.status = 'submitted';
  if (notes) {
    milestone.notes = notes.trim();
  }

  saveState(state);
  return pilot;
}

export function reviewMilestone(
  pilotId: string,
  milestoneId: string,
  decision: 'met' | 'missed'
): Pilot {
  const state = loadState();
  const pilot = state.pilots.find((p) => p.id === pilotId);
  if (!pilot) {
    throw new Error('Pilot not found');
  }

  const milestone = pilot.milestones.find((m) => m.id === milestoneId);
  if (!milestone) {
    throw new Error('Milestone not found');
  }

  milestone.status = decision;
  saveState(state);
  return pilot;
}

// ----------------------------------------------------
// Conversion Engine
// ----------------------------------------------------

export function checkConversion(
  pilot: Pilot,
  contractValue?: number
): ConversionCheckReport {
  const state = loadState();
  const problem = state.problems.find((p) => p.id === pilot.problem_id);
  const budgetCap = problem ? problem.budget_cap : pilot.budget;
  const valueToEvaluate = contractValue !== undefined ? contractValue : (pilot.contract_value || pilot.budget);

  const rules: RuleCheckResult[] = [];
  const reasons: string[] = [];

  // Rule 1: Pilot status is active
  const isPilotActive = pilot.status === 'active';
  rules.push({
    ruleNumber: 1,
    name: 'Active Pilot Status',
    passed: isPilotActive,
    message: isPilotActive
      ? 'Pilot is currently in active stage.'
      : `Pilot status is "${pilot.status}" (must be "active").`,
  });
  if (!isPilotActive) reasons.push(`Pilot must be in "active" status to convert.`);

  // Rule 2: Every milestone is reviewed (met or missed). None pending or submitted.
  const totalMilestones = pilot.milestones.length;
  const unreviewed = pilot.milestones.filter(
    (m) => m.status === 'pending' || m.status === 'submitted'
  );
  const allReviewed = totalMilestones > 0 && unreviewed.length === 0;
  rules.push({
    ruleNumber: 2,
    name: 'All Milestones Reviewed',
    passed: allReviewed,
    message: allReviewed
      ? `All ${totalMilestones} milestones have been evaluated (met or missed).`
      : `${unreviewed.length} milestone(s) are still pending or awaiting review.`,
  });
  if (!allReviewed) {
    reasons.push(
      `All milestones must be reviewed (found ${unreviewed.length} pending/submitted milestone).`
    );
  }

  // Rule 3: At least 70% of milestones are met
  const metCount = pilot.milestones.filter((m) => m.status === 'met').length;
  const successRate = totalMilestones > 0 ? Math.round((metCount / totalMilestones) * 100) : 0;
  const thresholdPassed = successRate >= 70;
  rules.push({
    ruleNumber: 3,
    name: '70% Success Threshold (Section 10)',
    passed: thresholdPassed,
    message: thresholdPassed
      ? `Success rate is ${successRate}% (${metCount} of ${totalMilestones} met, >= 70% requirement).`
      : `Success rate is ${successRate}% (${metCount} of ${totalMilestones} met). Minimum 70% required.`,
  });
  if (!thresholdPassed) {
    reasons.push(
      `At least 70% of milestones must be met. Currently at ${successRate}% (${metCount}/${totalMilestones}).`
    );
  }

  // Rule 4: Contract value is within the problem's budget_cap
  const withinBudget = valueToEvaluate <= budgetCap;
  rules.push({
    ruleNumber: 4,
    name: 'Budget Cap Compliance',
    passed: withinBudget,
    message: withinBudget
      ? `Proposed contract value (₹${valueToEvaluate.toLocaleString('en-IN')}) is within budget cap (₹${budgetCap.toLocaleString('en-IN')}).`
      : `Proposed contract value (₹${valueToEvaluate.toLocaleString('en-IN')}) exceeds problem budget cap (₹${budgetCap.toLocaleString('en-IN')}).`,
  });
  if (!withinBudget) {
    reasons.push(
      `Contract value (₹${valueToEvaluate.toLocaleString('en-IN')}) exceeds budget cap (₹${budgetCap.toLocaleString('en-IN')}).`
    );
  }

  // Rule 5: Pilot end date has not been exceeded without an extension
  const now = new Date();
  const endDate = new Date(pilot.end_date);
  const withinDate = isNaN(endDate.getTime()) ? true : now <= new Date(endDate.getTime() + 86400000 * 14);
  rules.push({
    ruleNumber: 5,
    name: 'Pilot Schedule Validity',
    passed: withinDate,
    message: withinDate
      ? `Pilot timeline is valid through scheduled completion (${pilot.end_date}).`
      : `Pilot timeline has elapsed without statutory extension.`,
  });
  if (!withinDate) {
    reasons.push(`Pilot end date (${pilot.end_date}) has expired without official extension.`);
  }

  const ok = rules.every((r) => r.passed);

  return {
    ok,
    reasons,
    rules,
    successRate,
    contractValue: valueToEvaluate,
    budgetCapped: budgetCap,
  };
}

export function convertPilotToContract(params: {
  pilotId: string;
  contractValue: number;
  ruleReference?: string;
}): { pilot: Pilot; contractId: string; recordHash: string } {
  const state = loadState();
  const pilot = state.pilots.find((p) => p.id === params.pilotId);
  if (!pilot) {
    throw new Error('Pilot not found');
  }

  const report = checkConversion(pilot, params.contractValue);
  if (!report.ok) {
    throw new Error(`Conversion check failed: ${report.reasons.join('; ')}`);
  }

  const contractId = `CNT-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const ruleRef = params.ruleReference || 'Rule 149(viii) of GFR 2017 / GeM Startup Direct Mandate';

  // Build canonical record & SHA-256 hash
  const canonical = buildRecord({
    contractId,
    department: pilot.department_name || 'Government Department',
    startup: pilot.startup_name || 'Startup',
    problem: pilot.problem_title || 'Operational Problem',
    startDate: pilot.start_date,
    endDate: pilot.end_date,
    budget: pilot.budget,
    contractValue: params.contractValue,
    ruleReference: ruleRef,
    milestones: pilot.milestones,
  });

  const recordHash = hashRecord(canonical);

  pilot.status = 'converted';
  pilot.converted_at = new Date().toISOString();
  pilot.contract_id = contractId;
  pilot.contract_value = params.contractValue;
  pilot.record_hash = recordHash;
  pilot.rule_reference = ruleRef;

  const problem = state.problems.find((p) => p.id === pilot.problem_id);
  if (problem) {
    problem.status = 'converted';
  }

  saveState(state);
  return { pilot, contractId, recordHash };
}

// ----------------------------------------------------
// Contracts & Verification (Public)
// ----------------------------------------------------

export function getContracts(): Array<{
  contract_id: string;
  pilot: Pilot;
  record_hash: string;
  converted_at?: string;
}> {
  const state = loadState();
  return state.pilots
    .filter((p) => p.status === 'converted' && p.contract_id)
    .map((p) => ({
      contract_id: p.contract_id!,
      pilot: p,
      record_hash: p.record_hash || '',
      converted_at: p.converted_at,
    }));
}

export function getContractById(contractId: string): Pilot | undefined {
  const state = loadState();
  return state.pilots.find((p) => p.contract_id === contractId || p.id === contractId);
}

export function verifyContractRecord(contractId: string): {
  verified: boolean;
  storedHash: string;
  computedHash: string;
  pilot: Pilot;
  summary: {
    contractId: string;
    department: string;
    startup: string;
    problem: string;
    milestoneCount: number;
    metCount: number;
    successRate: number;
    contractValue: number;
  };
} {
  const pilot = getContractById(contractId);
  if (!pilot) {
    throw new Error(`Contract reference "${contractId}" not found in statutory registry.`);
  }

  const storedHash = pilot.record_hash || '';

  const canonical = buildRecord({
    contractId: pilot.contract_id || contractId,
    department: pilot.department_name || '',
    startup: pilot.startup_name || '',
    problem: pilot.problem_title || '',
    startDate: pilot.start_date,
    endDate: pilot.end_date,
    budget: pilot.budget,
    contractValue: pilot.contract_value || pilot.budget,
    ruleReference: pilot.rule_reference || 'Rule 149(viii) GFR 2017',
    milestones: pilot.milestones,
  });

  const computedHash = hashRecord(canonical);
  const verified = Boolean(storedHash && storedHash.toLowerCase() === computedHash.toLowerCase());

  const totalM = pilot.milestones.length;
  const metCount = pilot.milestones.filter((m) => m.status === 'met').length;
  const successRate = totalM > 0 ? Math.round((metCount / totalM) * 100) : 0;

  return {
    verified,
    storedHash,
    computedHash,
    pilot,
    summary: {
      contractId: pilot.contract_id || contractId,
      department: pilot.department_name || '',
      startup: pilot.startup_name || '',
      problem: pilot.problem_title || '',
      milestoneCount: totalM,
      metCount,
      successRate,
      contractValue: pilot.contract_value || pilot.budget,
    },
  };
}

// Tamper simulation for live demo presentation (Section 20 of README)
export function tamperMilestoneForAuditDemo(
  pilotId: string,
  milestoneId: string,
  newStatus: 'met' | 'missed'
): { pilot: Pilot; previousStatus: string; newStatus: string } {
  const state = loadState();
  const pilot = state.pilots.find((p) => p.id === pilotId || p.contract_id === pilotId);
  if (!pilot) {
    throw new Error('Pilot/contract not found');
  }

  const milestone = pilot.milestones.find((m) => m.id === milestoneId);
  if (!milestone) {
    throw new Error('Milestone not found');
  }

  const prev = milestone.status;
  milestone.status = newStatus;

  saveState(state);
  return { pilot, previousStatus: prev, newStatus };
}

// ----------------------------------------------------
// Adoptions (Scale phase)
// ----------------------------------------------------

export function getAdoptions(): Adoption[] {
  const state = loadState();
  return state.adoptions || [];
}

export function createAdoption(params: {
  contract_id: string;
  department_id: string;
  department_name: string;
  notes?: string;
}): Adoption {
  const state = loadState();
  const contract = getContractById(params.contract_id);
  if (!contract) {
    throw new Error('Contract not found for adoption');
  }

  // Unique constraint: adoptions(contract_id, department_id)
  const existing = state.adoptions.find(
    (a) => a.contract_id === params.contract_id && a.department_id === params.department_id
  );
  if (existing) {
    throw new Error('This department has already initiated procurement adoption for this contract.');
  }

  const newAdoption: Adoption = {
    id: `adopt-${Date.now().toString(36)}`,
    contract_id: params.contract_id,
    department_id: params.department_id,
    department_name: params.department_name,
    adopted_at: new Date().toISOString(),
    pilot_title: contract.problem_title,
    startup_name: contract.startup_name,
    contract_value: contract.contract_value || contract.budget,
    sector: contract.problem_title?.includes('Aquifer') ? 'Water & Sanitation' : 'Public Infrastructure',
    notes: params.notes || 'Direct scale adoption approved under GFR 149(viii) across jurisdiction.',
  };

  state.adoptions.unshift(newAdoption);
  saveState(state);
  return newAdoption;
}
