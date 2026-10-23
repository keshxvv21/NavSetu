import { Pilot, Problem } from '@/lib/mockData';

export interface ConversionCheckResult {
  ok: boolean;
  reasons: string[];
  successRate: number;
  totalMilestones: number;
  metCount: number;
}

export function checkPilotConversion(
  pilot: Pilot,
  problem?: Problem,
  contractValue?: number
): ConversionCheckResult {
  const reasons: string[] = [];
  const value = contractValue !== undefined ? contractValue : (pilot.contract_value || pilot.budget);
  const budgetCap = problem ? problem.budget_cap : pilot.budget;

  // Rule 1: Pilot status is active
  if (pilot.status !== 'active') {
    reasons.push(`Pilot must be in "active" status to convert (current status: "${pilot.status}").`);
  }

  // Rule 2: Every milestone is reviewed (met or missed). None pending or submitted.
  const totalMilestones = pilot.milestones?.length || 0;
  const unreviewed = (pilot.milestones || []).filter(
    (m) => m.status === 'pending' || m.status === 'submitted'
  );
  if (totalMilestones === 0) {
    reasons.push('Pilot has no milestones defined.');
  } else if (unreviewed.length > 0) {
    reasons.push(
      `All milestones must be reviewed. ${unreviewed.length} milestone(s) are still pending or awaiting review.`
    );
  }

  // Rule 3: At least 70% of milestones are met
  const metCount = (pilot.milestones || []).filter((m) => m.status === 'met').length;
  const successRate = totalMilestones > 0 ? Math.round((metCount / totalMilestones) * 100) : 0;
  if (successRate < 70) {
    reasons.push(
      `At least 70% of milestones must be met to convert. Current rate is ${successRate}% (${metCount}/${totalMilestones} met).`
    );
  }

  // Rule 4: Contract value is within the problem's budget_cap
  if (value > budgetCap) {
    reasons.push(
      `Proposed contract value (₹${value.toLocaleString('en-IN')}) exceeds problem budget cap of ₹${budgetCap.toLocaleString('en-IN')}.`
    );
  }

  // Rule 5: Pilot end date has not been exceeded without an extension
  const now = new Date();
  const endDate = new Date(pilot.end_date);
  // Allow a 14-day statutory reconciliation grace window
  if (!isNaN(endDate.getTime())) {
    const expiryWithGrace = new Date(endDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    if (now > expiryWithGrace) {
      reasons.push(`Pilot timeline expired on ${pilot.end_date} without statutory extension.`);
    }
  }

  return {
    ok: reasons.length === 0,
    reasons,
    successRate,
    totalMilestones,
    metCount,
  };
}
