import { NextResponse } from 'next/server';
import { adminAuth, adminDb, adminInitError } from '@/lib/firebase-admin';
import { getOnboardingEmailHtml, getOnboardingEmailText } from '@/lib/email-templates';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    if (adminInitError) {
      console.error('Firebase Admin init error', adminInitError);
      return NextResponse.json({ error: 'Internal config error' }, { status: 500 });
    }

    // Verify token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const callerUid = decodedToken.uid;

    // Get caller's profile to get their name and email, and check if email was already sent
    const callerDocRef = adminDb.collection('users').doc(callerUid);
    const callerDoc = await callerDocRef.get();
    
    const userData = callerDoc.exists ? callerDoc.data() : null;
    
    if (userData?.onboardingEmailSent) {
      // Already sent, ignore silently
      console.log(`[Onboarding Email] Email already sent to ${callerUid}, skipping.`);
      return NextResponse.json({ success: true, message: 'Already sent' }, { status: 200 });
    }

    const userEmail = userData?.email || decodedToken.email;
    const userName = userData?.displayName || 'Nurse Practitioner';
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Determine dashboard URL based on environment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.npcompass.com';
    const dashboardUrl = `${baseUrl}/dashboard`;

    const subject = 'Welcome to NP Compass – Built by NPs, for NPs';
    const htmlBody = getOnboardingEmailHtml(userName, dashboardUrl);
    const textBody = getOnboardingEmailText(userName, dashboardUrl);

    if (process.env.RESEND_API_KEY) {
      console.log(`[Onboarding Email] Sending real email to ${userEmail} via Resend...`);
      try {
        const { data, error } = await resend.emails.send({
          from: 'NP Compass <support@npcompass.app>',
          to: userEmail,
          subject: subject,
          html: htmlBody,
          text: textBody
        });

        if (error) {
          console.error('[Onboarding Email] Resend API Error:', error);
          throw new Error(error.message);
        }

        console.log('[Onboarding Email] Successfully sent via Resend:', data);
        await callerDocRef.set({ onboardingEmailSent: true }, { merge: true });
        return NextResponse.json({ success: true, simulated: false }, { status: 200 });
      } catch (err: any) {
        console.error('[Onboarding Email] Error sending via Resend, falling back to simulation logs:', err.message);
      }
    } else {
      console.warn('[Onboarding Email] RESEND_API_KEY not set. Simulating email send.');
      console.log('=========================================');
      console.log('   --- ONBOARDING EMAIL LOG SIMULATION ---');
      console.log(`   TO: ${userEmail}`);
      console.log(`   CC: support@npcompass.app`);
      console.log(`   SUBJECT: ${subject}`);
      console.log('=========================================');
      // Mark as sent in DB even if simulated so we don't keep triggering
      await callerDocRef.set({ onboardingEmailSent: true }, { merge: true });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error in onboarding email route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
