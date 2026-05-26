import { StateLicense } from '@/types/schema';
import { toDate } from './firestore';

export interface ExpirationInfo {
  date: Date;
  daysRemaining: number;
  label: string;
}

export function getLicenseExpiration(license: StateLicense): ExpirationInfo | null {
  const dates: { date: Date | null; label: string }[] = [
    { date: toDate(license.aprnExpirationDate), label: 'APRN' },
    { date: toDate(license.rnExpirationDate), label: 'RN' },
    { date: toDate(license.deaExpirationDate), label: 'DEA' },
    { date: toDate(license.stateControlledSubstanceExpirationDate), label: 'Controlled Substance' }
  ];

  let earliest: ExpirationInfo | null = null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (const item of dates) {
    if (item.date) {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      
      const diffTime = itemDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (!earliest || itemDate < earliest.date) {
        earliest = {
          date: itemDate,
          daysRemaining,
          label: item.label
        };
      }
    }
  }

  return earliest;
}
