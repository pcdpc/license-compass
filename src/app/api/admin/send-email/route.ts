import { NextResponse } from 'next/server';
import { adminAuth, adminDb, adminInitError } from '@/lib/firebase-admin';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    if (adminInitError) {
      return NextResponse.json({ error: `Firebase Admin SDK failed to initialize: ${adminInitError}` }, { status: 500 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const callerUid = decodedToken.uid;

    // Verify caller is an admin in Firestore
    const callerDoc = await adminDb.collection('users').doc(callerUid).get();
    const callerData = callerDoc.data();
    if (!callerData || callerData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    const { userEmails, subject, body } = await req.json();
    if (!userEmails || !Array.isArray(userEmails) || userEmails.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid userEmails parameter' }, { status: 400 });
    }
    if (!subject || typeof subject !== 'string' || subject.trim() === '') {
      return NextResponse.json({ error: 'Missing or empty subject parameter' }, { status: 400 });
    }
    if (!body || typeof body !== 'string' || body.trim() === '') {
      return NextResponse.json({ error: 'Missing or empty body parameter' }, { status: 400 });
    }

    const smtpUser = process.env.EMAIL_SERVER_USER;
    const smtpPassword = process.env.EMAIL_SERVER_PASSWORD;

    if (smtpUser && smtpPassword) {
      console.log(`[Admin Email] Sending real email to ${userEmails.length} recipients via Nodemailer...`);
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: smtpUser,
            pass: smtpPassword,
          },
        });

        // Ensure we send emails in a way that respects BCC or individual sending to avoid exposing emails
        // For simplicity, we'll send a single email with all users in BCC
        await transporter.sendMail({
          from: `"NP Compass Admin" <${smtpUser}>`,
          to: smtpUser, // Send to self
          bcc: userEmails, // BCC all users
          subject: subject,
          html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0c10; color: #c5c6c7; border-radius: 8px; border: 1px solid #1f2833;">
            <h2 style="color: #66fcf1; border-bottom: 2px solid #1f2833; padding-bottom: 10px;">NP Compass System Notification</h2>
            <div style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
              ${body.replace(/\n/g, '<br />')}
            </div>
            <div style="margin-top: 30px; font-size: 12px; color: #45a29e; border-top: 1px solid #1f2833; padding-top: 10px; text-align: center;">
              This is an official administrative email sent by your NP Compass platform administrators.
            </div>
          </div>`,
          text: body
        });

        console.log('[Admin Email] Successfully dispatched emails via Nodemailer.');
        return NextResponse.json({ success: true, simulated: false }, { status: 200 });
      } catch (err: any) {
        console.error('[Admin Email] Error sending via Nodemailer, falling back to simulation logs:', err.message);
      }
    }

    // Fallback simulation log when no provider is configured or fails
    console.log('\n=========================================');
    console.log('   --- ADMIN EMAIL LOG SIMULATION ---');
    console.log(`   DATE: ${new Date().toISOString()}`);
    console.log(`   SENDER: NP Compass Administrative Agent`);
    console.log(`   TO: ${userEmails.join(', ')}`);
    console.log(`   SUBJECT: ${subject}`);
    console.log(`   BODY:\n${body}`);
    console.log('=========================================\n');

    return NextResponse.json({ success: true, simulated: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error in send-email backend:', error);
    const errorMsg = JSON.stringify(error, Object.getOwnPropertyNames(error));
    return NextResponse.json({ error: errorMsg || 'Internal server error' }, { status: 500 });
  }
}
