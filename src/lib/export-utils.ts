import { getUserLicenses, getUserCeus, getUserCareers, toDate } from './firestore';
import type { UserProfile, StateLicense, CeuEntry, CareerOpportunity } from '@/types/schema';

/**
 * Escapes a string for CSV format
 */
function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates a full data export CSV
 */
export async function generateUserDataCSV(userId: string, profile: UserProfile): Promise<string> {
  const [licenses, ceus, careers] = await Promise.all([
    getUserLicenses(userId),
    getUserCeus(userId),
    getUserCareers(userId)
  ]);

  const rows: string[][] = [];

  // Header row
  rows.push(['Category', 'Field 1', 'Field 2', 'Field 3', 'Field 4', 'Field 5', 'Field 6']);

  // Profile Section
  rows.push(['PROFILE', 'Display Name', 'Email', 'Credentials', 'NPI', 'Specialty', 'Primary State']);
  rows.push([
    'PROFILE',
    profile.displayName || '',
    profile.email || '',
    profile.credentials || '',
    profile.npiNumber || '',
    profile.specialty || '',
    profile.primaryState || ''
  ]);
  rows.push([]); // Empty spacing row

  // Licenses Section
  rows.push(['LICENSE', 'State', 'RN Status', 'RN Expiration', 'APRN Status', 'APRN Expiration', 'Notes']);
  licenses.forEach(l => {
    rows.push([
      'LICENSE',
      l.stateName,
      l.rnStatus || 'N/A',
      toDate(l.rnExpirationDate)?.toLocaleDateString() || 'N/A',
      l.aprnStatus || 'N/A',
      toDate(l.aprnExpirationDate)?.toLocaleDateString() || 'N/A',
      l.notes || ''
    ]);
  });
  rows.push([]); // Empty spacing row

  // CEU Section
  rows.push(['CEU', 'Date', 'Title', 'Provider', 'Hours', 'Category', 'State']);
  ceus.forEach(c => {
    rows.push([
      'CEU',
      toDate(c.courseDate)?.toLocaleDateString() || '',
      c.title,
      c.provider,
      c.hours.toString(),
      c.category,
      (Array.isArray(c.appliesToStates) ? c.appliesToStates : Object.values(c.appliesToStates || {}) as string[]).join(', ')
    ]);
  });
  rows.push([]); // Empty spacing row

  // Career Hub Section
  rows.push(['CAREER', 'Type', 'Status', 'Title', 'Employer', 'Mode', 'Location']);
  careers.forEach(c => {
    rows.push([
      'CAREER',
      c.type,
      c.status,
      c.title,
      c.employer,
      c.workMode,
      c.state || 'N/A'
    ]);
  });

  return rows.map(r => r.map(escapeCSV).join(',')).join('\n');
}

/**
 * Triggers a download of a CSV file in the browser
 */
export function downloadCSV(csvString: string, filename: string) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
