import { NextResponse } from 'next/server';
import { adminAuth, adminDb, adminInitError } from '@/lib/firebase-admin';
import { getOnboardingEmailHtml, getOnboardingEmailText } from '@/lib/email-templates';

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
    
    if (!callerDoc.exists) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const userData = callerDoc.data();
    
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

    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      console.log(`[Onboarding Email] Sending welcome email to ${userEmail}...`);
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'NP Compass <welcome@npcompass.app>', // Typical welcome email address
            to: [userEmail],
            cc: ['support@npcompass.app'],
            subject: subject,
            html: htmlBody,
            text: textBody
          })
        });

        if (!resendResponse.ok) {
          const resendError = await resendResponse.text();
          console.error('[Onboarding Email] Resend API error:', resendError);
          // Don't throw, we just log it. We want to avoid blocking the client.
        } else {
          console.log(`[Onboarding Email] Successfully sent welcome email to ${userEmail}`);
          // Mark as sent in DB
          await callerDocRef.update({ onboardingEmailSent: true });
        }
      } catch (err: any) {
        console.error('[Onboarding Email] Error sending via Resend API:', err.message);
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
      await callerDocRef.update({ onboardingEmailSent: true });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error in onboarding email route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
