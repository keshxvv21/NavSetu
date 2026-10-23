import { Startup, Problem } from '@/lib/mockData';

export interface EligibilityResult {
  eligible: boolean;
  status: 'verified' | 'unverified' | 'sector_mismatch';
  badge: string;
  badgeColor: 'emerald' | 'amber' | 'rose';
  reasons: string[];
}

export function checkStartupEligibility(startup: Startup, problem?: Problem): EligibilityResult {
  const reasons: string[] = [];

  if (!startup.dpiit_id || !startup.dpiit_id.startsWith('DIPP-')) {
    reasons.push('Startup does not hold a recognized DPIIT recognition certificate number.');
  }

  if (!startup.verified) {
    reasons.push('Startup DPIIT verification is pending or unconfirmed in the DPIIT registry.');
  }

  const isSectorMatch = problem ? startup.sector.toLowerCase() === problem.sector.toLowerCase() : true;
  if (!isSectorMatch && problem) {
    reasons.push(
      `Sector divergence: Startup operates in "${startup.sector}" while challenge requires "${problem.sector}".`
    );
  }

  if (!startup.verified) {
    return {
      eligible: false,
      status: 'unverified',
      badge: 'DPIIT Unverified',
      badgeColor: 'amber',
      reasons,
    };
  }

  if (!isSectorMatch) {
    return {
      eligible: true, // still permitted to apply with cross-disciplinary caveat
      status: 'sector_mismatch',
      badge: 'Cross-Domain Applicant',
      badgeColor: 'amber',
      reasons,
    };
  }

  return {
    eligible: true,
    status: 'verified',
    badge: 'DPIIT Verified & Eligible',
    badgeColor: 'emerald',
    reasons: [],
  };
}
