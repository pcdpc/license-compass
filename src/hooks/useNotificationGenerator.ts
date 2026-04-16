'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserLicenses, getUserDocuments, createNotification, getUserNotifications, toDate, daysUntil } from '@/lib/firestore';
import type { StateLicense, InAppNotification } from '@/types/schema';

export function useNotificationGenerator() {
  const { user, userProfile } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!user || !userProfile || !userProfile.settings.notificationsEnabled || hasRun.current) return;

    const generateAlerts = async () => {
      try {
        const [licenses, docs, existingNotifs] = await Promise.all([
          getUserLicenses(user.uid),
          getUserDocuments(user.uid),
          getUserNotifications(user.uid)
        ]);

        const alertSettings = userProfile.settings.alertSettings;
        const newNotifs: Omit<InAppNotification, 'id' | 'userId' | 'createdAt'>[] = [];

        for (const license of licenses) {
          // DEA Expiration
          if (alertSettings.deaExpiration && license.deaExpirationDate) {
            const days = daysUntil(toDate(license.deaExpirationDate));
            if (days !== null && days >= 0 && days <= 90) {
              const msg = `DEA Registration for ${license.stateName} expires in ${days} days.`;
              if (!existingNotifs.some(n => n.message === msg)) {
                newNotifs.push({ type: 'expiration', message: msg, read: false });
              }
            }
          }

          // License Expirations (RN/APRN)
          const checkExpiration = (date: any, label: string) => {
            const days = daysUntil(toDate(date));
            if (days === null) return;

            const milestones = [
              { d: 180, set: alertSettings.license180 },
              { d: 90, set: alertSettings.license90 },
              { d: 60, set: alertSettings.license60 },
              { d: 30, set: alertSettings.license30 },
              { d: 7, set: alertSettings.license7 }
            ];

            for (const m of milestones) {
              if (m.set && days === m.d) {
                const msg = `${label} for ${license.stateName} expires in ${days} days.`;
                if (!existingNotifs.some(n => n.message === msg)) {
                  newNotifs.push({ type: 'expiration', message: msg, read: false });
                }
              }
            }
          };

          checkExpiration(license.rnExpirationDate, 'RN License');
          checkExpiration(license.aprnExpirationDate, 'APRN License');

          // Missing Documents
          if (alertSettings.missingDocuments) {
            const missing = [];
            if (license.rnRequired && !license.rnDocumentId && !license.isRnCompact) missing.push('RN License');
            if (license.aprnRequired && !license.aprnDocumentId) missing.push('APRN License');
            if (license.deaRequired && !license.deaDocumentId) missing.push('DEA Registration');

            if (missing.length > 0) {
              const msg = `Missing documents for ${license.stateName}: ${missing.join(', ')}.`;
              // For missing docs, we only alert if there isn't one from the last 7 days
              const recentMissing = existingNotifs.find(n => n.message === msg);
              if (!recentMissing) {
                newNotifs.push({ type: 'document', message: msg, read: false });
              }
            }
          }
        }

        // Create new notifications in Firestore
        for (const n of newNotifs) {
          await createNotification(user.uid, n);
        }

        hasRun.current = true;
      } catch (error) {
        console.error("Error generating notifications:", error);
      }
    };

    generateAlerts();
  }, [user, userProfile]);
}
