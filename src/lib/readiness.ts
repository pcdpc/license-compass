import type { StateLicense, CeuEntry } from '@/types/schema';
import { toDate, daysUntil } from './firestore';

export interface ReadinessResult {
  readyStatus: 'ready' | 'almost_ready' | 'blocked' | 'expired';
  readinessScore: number; // 0–100
  nextAction: string;
  issues: string[];
}

/**
 * Calculate the readiness status for a given state license.
 * Optionally accepts CEU entries to check compliance.
 */
export function calculateReadiness(
  license: StateLicense,
  ceus: CeuEntry[] = [],
  stateRequirements?: { totalHoursRequired: number; pharmacologyHoursRequired: number }
): ReadinessResult {
  const issues: string[] = [];
  let score = 0;
  const maxScore = 100;
  let weights = { rn: 20, aprn: 20, dea: 15, supervision: 15, ceu: 15, background: 15 };

  // ── RN License ──
  if (license.rnRequired) {
    if (license.rnStatus === 'active') {
      const daysLeft = daysUntil(toDate(license.rnExpirationDate));
      if (daysLeft !== null && daysLeft < 0) {
        issues.push('RN license is expired');
      } else if (daysLeft !== null && daysLeft < 90) {
        issues.push(`RN license expires in ${daysLeft} days`);
        score += weights.rn * 0.5;
      } else {
        score += weights.rn;
      }
    } else if (license.rnStatus === 'pending') {
      issues.push('RN license application pending');
      score += weights.rn * 0.3;
    } else {
      issues.push('RN license not active');
    }
  } else {
    score += weights.rn; // not required = full credit
  }

  // ── APRN License ──
  if (license.aprnRequired) {
    if (license.aprnStatus === 'active') {
      const daysLeft = daysUntil(toDate(license.aprnExpirationDate));
      if (daysLeft !== null && daysLeft < 0) {
        issues.push('APRN license is expired');
      } else if (daysLeft !== null && daysLeft < 90) {
        issues.push(`APRN license expires in ${daysLeft} days`);
        score += weights.aprn * 0.5;
      } else {
        score += weights.aprn;
      }
    } else if (license.aprnStatus === 'pending') {
      issues.push('APRN license application pending');
      score += weights.aprn * 0.3;
    } else {
      issues.push('APRN license not active');
    }
  } else {
    score += weights.aprn;
  }

  // ── DEA ──
  if (license.deaRequired) {
    if (license.deaStatus === 'active') {
      const daysLeft = daysUntil(toDate(license.deaExpirationDate));
      if (daysLeft !== null && daysLeft < 0) {
        issues.push('DEA registration is expired');
      } else if (daysLeft !== null && daysLeft < 90) {
        issues.push(`DEA registration expires in ${daysLeft} days`);
        score += weights.dea * 0.5;
      } else {
        score += weights.dea;
      }
    } else if (license.deaStatus === 'pending') {
      issues.push('DEA registration pending');
      score += weights.dea * 0.3;
    } else if (license.deaStatus === 'not_applied') {
      issues.push('DEA registration not applied');
    } else {
      score += weights.dea; // not required
    }
  } else {
    score += weights.dea;
  }

  // ── Supervision ──
  if (license.supervisionRequired) {
    if (license.supervisorName && license.supervisorName.trim() !== '') {
      score += weights.supervision;
    } else {
      issues.push('Supervisor information missing');
    }
  } else {
    score += weights.supervision;
  }

  // ── CEU Compliance ──
  if (stateRequirements) {
    const applicableCeus = ceus.filter((c) => c.appliesToStates.includes(license.stateCode));
    const totalHours = applicableCeus.reduce((sum, c) => sum + c.hours, 0);
    const pharmHours = applicableCeus
      .filter((c) => c.category === 'pharmacology')
      .reduce((sum, c) => sum + c.hours, 0);

    const totalPct = Math.min(totalHours / stateRequirements.totalHoursRequired, 1);
    const pharmPct = stateRequirements.pharmacologyHoursRequired > 0
      ? Math.min(pharmHours / stateRequirements.pharmacologyHoursRequired, 1)
      : 1;
    const ceuPct = (totalPct + pharmPct) / 2;
    score += weights.ceu * ceuPct;

    if (totalHours < stateRequirements.totalHoursRequired) {
      const deficit = stateRequirements.totalHoursRequired - totalHours;
      issues.push(`Need ${deficit} more total CEU hours`);
    }
    if (pharmHours < stateRequirements.pharmacologyHoursRequired) {
      const deficit = stateRequirements.pharmacologyHoursRequired - pharmHours;
      issues.push(`Need ${deficit} more pharmacology CEU hours`);
    }
  } else {
    score += weights.ceu; // no requirements = full credit
  }

  // ── Background / Fingerprint ──
  if (license.backgroundCheckRequired && !license.backgroundCheckCompleted) {
    issues.push('Background check not completed');
  } else if (license.fingerprintRequired && !license.fingerprintCompleted) {
    issues.push('Fingerprints not submitted');
  } else {
    score += weights.background;
  }

  // ── Compute final status ──
  const readinessScore = Math.round(score);

  let readyStatus: ReadinessResult['readyStatus'];
  if (issues.some((i) => i.includes('expired'))) {
    readyStatus = 'expired';
  } else if (readinessScore >= 90) {
    readyStatus = 'ready';
  } else if (readinessScore >= 60) {
    readyStatus = 'almost_ready';
  } else {
    readyStatus = 'blocked';
  }

  const nextAction = issues.length > 0 ? issues[0] : 'None';

  return { readyStatus, readinessScore, nextAction, issues };
}
