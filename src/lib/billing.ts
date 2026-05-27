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

  const status = userProfile.subscriptionStatus;
  const now = new Date();

  if (status === 'active') {
    return true;
  }

  if (status === 'trialing') {
    if (!userProfile.trialEndDate) return true; // assuming valid trial if no date set yet, or false depending on strictness
    const trialEnd = toDate(userProfile.trialEndDate);
    return trialEnd ? trialEnd > now : false;
  }

  if (status === 'canceled' && userProfile.currentPeriodEnd) {
    const periodEnd = toDate(userProfile.currentPeriodEnd);
    return periodEnd ? periodEnd > now : false;
  }

  // Any other status ('expired', 'past_due', 'suspended', 'none') is blocked.
  return false;
}
