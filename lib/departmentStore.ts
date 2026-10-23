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

export type { Problem, Pilot, Milestone, Application, Department, Startup };

const STORAGE_KEY = 'navsetu_state_v1';

interface AppState {
  departments: Department[];
  startups: Startup[];
  problems: Problem[];
  applications: Application[];
  pilots: Pilot[];
}

function getInitialState(): AppState {
  return {
    departments: INITIAL_DEPARTMENTS,
    startups: INITIAL_STARTUPS,
    problems: INITIAL_PROBLEMS,
    applications: INITIAL_APPLICATIONS,
    pilots: INITIAL_PILOTS,
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
    return JSON.parse(raw);
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


// 1. Get problems (filterable by department)
export function getProblems(departmentId?: string): Problem[] {
  const state = loadState();
  if (departmentId) {
    return state.problems.filter((p) => p.department_id === departmentId);
  }
  return state.problems;
}

// 2. Get problem by ID
export function getProblemById(id: string): Problem | undefined {
  const state = loadState();
  return state.problems.find((p) => p.id === id);
}

// 3. Post a new problem (Department action)
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

// 4. Get applications for a problem
export function getApplicationsForProblem(problemId: string): Application[] {
  const state = loadState();
  return state.applications.filter((a) => a.problem_id === problemId);
}

// 5. Select applicant & start pilot (F6 in README)
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

  // Update application status
  selectedApp.status = 'selected';

  // Reject all other applications for this problem
  state.applications.forEach((a) => {
    if (a.problem_id === problem.id && a.id !== selectedApp.id) {
      a.status = 'rejected';
    }
  });

  // Create pilot
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

  // Update problem status
  problem.status = 'in_pilot';
  problem.active_pilot_id = pilotId;

  saveState(state);
  return { pilot: newPilot, updatedProblem: problem };
}

// 6. Get Pilot by ID
export function getPilotById(id: string): Pilot | undefined {
  const state = loadState();
  return state.pilots.find((p) => p.id === id);
}

// 7. Review milestone (Department action: mark met or missed)
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

// 8. Conversion check (Section 10 in README)
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
  // In demo we allow active dates or check today's date
  const now = new Date();
  const endDate = new Date(pilot.end_date);
  // Add 10-day buffer or check extension
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

// 9. Convert pilot to contract (Section 10)
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
  const recordHash = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852${Math.random().toString(16).substring(2, 10)}`;

  pilot.status = 'converted';
  pilot.converted_at = new Date().toISOString();
  pilot.contract_id = contractId;
  pilot.contract_value = params.contractValue;
  pilot.record_hash = recordHash;
  pilot.rule_reference = params.ruleReference || 'Rule 149(viii) of GFR 2017 / GeM Startup Direct Mandate';

  // Also update problem status to converted
  const problem = state.problems.find((p) => p.id === pilot.problem_id);
  if (problem) {
    problem.status = 'converted';
  }

  saveState(state);
  return { pilot, contractId, recordHash };
}
