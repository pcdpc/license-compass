import { NextResponse } from 'next/server';
import { adminAuth, adminDb, adminInitError } from '@/lib/firebase-admin';
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

    const { userEmail } = await req.json();
    if (!userEmail || typeof userEmail !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid userEmail parameter' }, { status: 400 });
    }

    const subject = "Your NP License Compass Trial Was Extended 🎉";
    
    // Determine base URL for the CTA button
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://npcompass.app';

    const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trial Extended</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
        .header { background-color: #050505; padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .content { padding: 32px 24px; color: #374151; }
        .content p { font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
        .coupon-card { background-color: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px; }
        .coupon-card h3 { margin: 0 0 8px 0; color: #111827; font-size: 20px; font-weight: 800; }
        .coupon-code { display: inline-block; background-color: #eef2ff; color: #4f46e5; font-family: monospace; font-size: 28px; font-weight: 800; padding: 8px 16px; border-radius: 8px; margin: 12px 0; letter-spacing: 2px; }
        .coupon-card p { margin: 0; font-size: 15px; color: #4b5563; font-weight: 500; }
        .price-highlight { color: #111827; font-weight: 800; }
        .cta-container { text-align: center; margin-bottom: 32px; }
        .cta-button { display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 16px; font-weight: 700; border-radius: 8px; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <!-- Preheader Text -->
      <div style="display: none; max-height: 0px; overflow: hidden;">
        We added 7 more days to your trial — plus 65% off your first 6 months.
      </div>
      
      <div class="container">
        <div class="header">
          <h1>Your trial has been extended by 7 days 🎉</h1>
        </div>
        <div class="content">
          <p>Congratulations — we extended your NP License Compass trial by an additional 7 days so you have more time to explore everything the platform can do for your license tracking, CEU organization, credentialing prep, and career planning.</p>
          
          <div class="coupon-card">
            <h3>As a thank-you for trying NP License Compass, we’re also offering you 65% off your first 6 months.</h3>
            <div class="coupon-code">NP2026</div>
            <p>Use code at checkout. That brings your subscription to only <span class="price-highlight">$3.50/month</span> for your first 6 months.</p>
          </div>
          
          <div class="cta-container">
            <a href="${baseUrl}/login" class="cta-button">Continue My Trial</a>
          </div>
          
          <p style="font-size: 14px; color: #4b5563; text-align: center;">After your extended trial, you can continue with NP License Compass using the discount code above. Your 14-day trial was already included, and this extension gives you 7 more days to decide.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} NP Compass. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;

    if (process.env.RESEND_API_KEY) {
      console.log(\`[Admin Email] Sending promotional extension email to \${userEmail} via Resend...\`);
      try {
        const { data, error } = await resend.emails.send({
          from: 'NP Compass <hello@npcompass.app>',
          to: [userEmail],
          subject: subject,
          html: htmlBody,
        });

        if (error) {
          console.error('[Admin Email] Resend API Error:', error);
          throw new Error(error.message);
        }

        return NextResponse.json({ success: true, simulated: false }, { status: 200 });
      } catch (err: any) {
        console.error('[Admin Email] Error sending via Resend, falling back to simulation logs:', err.message);
      }
    }

    // Fallback simulation log
    console.log('\\n=========================================');
    console.log('   --- ADMIN EMAIL LOG SIMULATION ---');
    console.log(\`   SENDER: NP Compass <hello@npcompass.app>\`);
    console.log(\`   TO: \${userEmail}\`);
    console.log(\`   SUBJECT: \${subject}\`);
    console.log(\`   HTML PREVIEW LENGTH: \${htmlBody.length} characters\`);
    console.log('=========================================\\n');

    return NextResponse.json({ success: true, simulated: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error in send-offer-email backend:', error);
    const errorMsg = JSON.stringify(error, Object.getOwnPropertyNames(error));
    return NextResponse.json({ error: errorMsg || 'Internal server error' }, { status: 500 });
  }
}
