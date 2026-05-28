import { UserProfile, Timestamp } from '@/types/schema';
import { toDate } from '@/lib/firestore'; // assumes you have a helper that converts Timestamp to JS Date

/**
 * Checks if a user has premium access based on their subscription status and dates.
 * 
 * Access is granted if:
 * 1. subscriptionStatus is 'trialing' and trialEndDate is in the future.
 * 2. subscriptionStatus is 'active'.
 * 3. subscriptionStatus is 'canceled' but currentPeriodEnd is still in the future.
 */
export function hasPremiumAccess(userProfile: UserProfile | null | undefined): boolean {
  if (!userProfile) return false;
  
  // Super admin always has access
  if (userProfile.role === 'admin') return true;

  // Block if suspended
  if (userProfile.paymentSuspended === true || userProfile.accountStatus === 'suspended') {
    return false;
  }

  const status = userProfile.subscriptionStatus;
  const accStatus = userProfile.accountStatus;
  const now = new Date();

  // Active status yields access
  if (status === 'active' || accStatus === 'active') {
    return true;
  }

  // Trial access is valid if the trial is active and not expired
  if (status === 'trialing' || accStatus === 'trial' || accStatus === 'trialing') {
    if (!userProfile.trialEndDate) return true; // Default to active trial if no date set
    const trialEnd = toDate(userProfile.trialEndDate);
    return trialEnd ? trialEnd > now : false;
  }

  // Grace period access for canceled subscriptions
  if (status === 'canceled' && userProfile.currentPeriodEnd) {
    const periodEnd = toDate(userProfile.currentPeriodEnd);
    return periodEnd ? periodEnd > now : false;
  }

  // Any other status (e.g., none, expired, or past_due) is blocked
  return false;
}
