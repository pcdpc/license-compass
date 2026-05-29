export function getOnboardingEmailHtml(userName: string, dashboardUrl: string): string {
  // Use #4C9EEB for primary branding
  const primaryColor = '#4C9EEB';
  const backgroundColor = '#f4f7f6'; // Clean healthcare SaaS aesthetic background
  const cardBackgroundColor = '#ffffff';
  const textColor = '#333333';
  const lightTextColor = '#666666';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to NP Compass</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: ${backgroundColor};
          color: ${textColor};
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: ${cardBackgroundColor};
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          margin-top: 40px;
          margin-bottom: 40px;
        }
        .header {
          text-align: center;
          padding: 40px 20px 30px;
          background-color: ${cardBackgroundColor};
          border-bottom: 1px solid #eaeaea;
        }
        .header img {
          max-width: 150px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          color: ${primaryColor};
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .header p {
          margin: 10px 0 0;
          font-size: 16px;
          color: ${lightTextColor};
          line-height: 1.5;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        .intro-text {
          font-size: 16px;
          line-height: 1.6;
          color: ${lightTextColor};
          margin-bottom: 30px;
        }
        .about-section {
          background-color: #f0f7fd;
          border-left: 4px solid ${primaryColor};
          padding: 20px;
          border-radius: 0 8px 8px 0;
          margin-bottom: 40px;
        }
        .about-section p {
          margin: 0;
          font-size: 15px;
          line-height: 1.6;
          color: #2b5c8f;
        }
        .features {
          margin-bottom: 40px;
        }
        .feature-card {
          background-color: #ffffff;
          border: 1px solid #eaeaea;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 15px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.02);
        }
        .feature-card h3 {
          margin: 0 0 8px;
          color: ${primaryColor};
          font-size: 16px;
        }
        .feature-card p {
          margin: 0;
          font-size: 14px;
          color: ${lightTextColor};
          line-height: 1.5;
        }
        .cta-container {
          text-align: center;
          margin: 40px 0;
        }
        .btn-primary {
          display: inline-block;
          background-color: ${primaryColor};
          color: #ffffff !important;
          text-decoration: none;
          padding: 14px 30px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(76, 158, 235, 0.25);
        }
        .feedback-section {
          background-color: #fafafa;
          border: 1px dashed #d9d9d9;
          border-radius: 8px;
          padding: 25px;
          text-align: center;
          margin-bottom: 40px;
        }
        .feedback-section h3 {
          margin: 0 0 10px;
          font-size: 18px;
          color: ${textColor};
        }
        .feedback-section p {
          margin: 0 0 20px;
          font-size: 14px;
          color: ${lightTextColor};
          line-height: 1.5;
        }
        .btn-secondary {
          display: inline-block;
          background-color: transparent;
          color: ${primaryColor} !important;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 6px;
          border: 1px solid ${primaryColor};
          font-weight: 600;
          font-size: 14px;
        }
        .whats-next {
          background-color: ${cardBackgroundColor};
          margin-bottom: 30px;
        }
        .whats-next h3 {
          font-size: 18px;
          margin: 0 0 15px;
          color: ${textColor};
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 10px;
        }
        .whats-next ol {
          margin: 0;
          padding-left: 20px;
          color: ${lightTextColor};
        }
        .whats-next li {
          margin-bottom: 10px;
          font-size: 15px;
          line-height: 1.5;
        }
        .closing {
          font-size: 16px;
          color: ${lightTextColor};
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .footer {
          background-color: #1a1a1a;
          color: #888888;
          text-align: center;
          padding: 30px 20px;
          font-size: 12px;
        }
        .footer a {
          color: #888888;
          text-decoration: underline;
        }
        .footer p {
          margin: 5px 0;
        }
        .tagline {
          color: ${primaryColor};
          font-weight: 600;
          margin-top: 15px !important;
        }

        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
          body {
            background-color: #121212;
            color: #e0e0e0;
          }
          .container {
            background-color: #1e1e1e;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          }
          .header {
            background-color: #1e1e1e;
            border-bottom: 1px solid #333;
          }
          .header p {
            color: #a0a0a0;
          }
          .intro-text, .closing {
            color: #b0b0b0;
          }
          .about-section {
            background-color: #1a2634;
            border-left: 4px solid ${primaryColor};
          }
          .about-section p {
            color: #90bce6;
          }
          .feature-card {
            background-color: #252525;
            border: 1px solid #333;
          }
          .feature-card p {
            color: #a0a0a0;
          }
          .feedback-section {
            background-color: #252525;
            border: 1px dashed #444;
          }
          .feedback-section h3, .whats-next h3 {
            color: #e0e0e0;
          }
          .feedback-section p {
            color: #a0a0a0;
          }
          .whats-next ol {
            color: #a0a0a0;
          }
          .whats-next h3 {
            border-bottom: 1px solid #333;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Hero Section -->
        <div class="header">
          <!-- Note: Use an absolute URL for the logo in a production environment -->
          <h1 style="margin-bottom: 15px; color: ${primaryColor}; font-size: 32px;">NP Compass</h1>
          <h1>Welcome to NP Compass</h1>
          <p>The professional platform designed specifically for Nurse Practitioners.</p>
        </div>

        <div class="content">
          <!-- Introduction -->
          <div class="greeting">Hi ${userName},</div>
          <div class="intro-text">
            Thank you for joining NP Compass! We are incredibly excited to have you as part of our growing community.
          </div>

          <!-- About NP Compass -->
          <div class="about-section">
            <p>
              NP Compass was created by practicing Nurse Practitioners who intimately understood the frustrations of managing multiple licenses, certifications, CEUs, renewal deadlines, and credentialing requirements. <br><br>
              <strong>NP Compass was designed by NPs, for NPs.</strong>
            </p>
          </div>

          <!-- Feature Cards Section -->
          <div class="features">
            <div class="feature-card">
              <h3>License Management</h3>
              <p>Track state licenses, expiration dates, and renewal requirements effortlessly.</p>
            </div>
            <div class="feature-card">
              <h3>CEU Tracking</h3>
              <p>Organize continuing education activities and easily store your supporting documentation.</p>
            </div>
            <div class="feature-card">
              <h3>Credential Organization</h3>
              <p>Keep your certifications, licenses, and professional records securely in one place.</p>
            </div>
            <div class="feature-card">
              <h3>Professional Compliance</h3>
              <p>Stay ahead of important deadlines and regulatory requirements with proactive alerts.</p>
            </div>
          </div>

          <!-- Dashboard Button -->
          <div class="cta-container">
            <a href="${dashboardUrl}" class="btn-primary">Go to My Dashboard</a>
          </div>

          <!-- What's Next? (Bonus) -->
          <div class="whats-next">
            <h3>What's Next?</h3>
            <ol>
              <li>Add your active licenses.</li>
              <li>Upload your professional certifications.</li>
              <li>Start tracking your professional requirements.</li>
            </ol>
          </div>

          <!-- Feedback Section -->
          <div class="feedback-section">
            <h3>Help Us Build the Best Experience Possible</h3>
            <p>
              NP Compass is constantly evolving and improving. If you discover any bugs, glitches, broken links, confusing workflows, or if you have feature requests and suggestions—we want to hear about them.<br><br>
              Every report is appreciated and directly helps improve the platform for all Nurse Practitioners.
            </p>
            <a href="mailto:support@npcompass.app" class="btn-secondary">Report an Issue</a>
          </div>

          <!-- Closing Section -->
          <div class="closing">
            Thank you for trusting NP Compass.<br><br>
            We are honored to be a small part of your professional journey and look forward to building the future of NP professional tools together.
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><a href="mailto:support@npcompass.app">support@npcompass.app</a></p>
          <p>NP Compass</p>
          <p class="tagline">"Designed by Nurse Practitioners. Built for Nurse Practitioners."</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getOnboardingEmailText(userName: string, dashboardUrl: string): string {
  return \`Welcome to NP Compass
The professional platform designed specifically for Nurse Practitioners.

Hi \${userName},

Thank you for joining NP Compass! We are incredibly excited to have you as part of our growing community.

NP Compass was created by practicing Nurse Practitioners who intimately understood the frustrations of managing multiple licenses, certifications, CEUs, renewal deadlines, and credentialing requirements. 
NP Compass was designed by NPs, for NPs.

Features to explore:
- License Management: Track state licenses, expiration dates, and renewal requirements.
- CEU Tracking: Organize continuing education activities and supporting documentation.
- Credential Organization: Keep certifications, licenses, and professional records in one place.
- Professional Compliance: Stay ahead of important deadlines and requirements.

Get started by visiting your dashboard: \${dashboardUrl}

What's Next?
1. Add your licenses.
2. Upload your certifications.
3. Start tracking your professional requirements.

Help Us Build the Best Experience Possible
NP Compass is constantly evolving and improving. If you discover bugs, glitches, broken links, confusing workflows, or have feature requests, we want to hear about them. Every report is appreciated and directly helps improve the platform. 
Report an issue at support@npcompass.app

Thank you for trusting NP Compass. We are honored to be a small part of your professional journey and look forward to building the future of NP professional tools together.

support@npcompass.app
NP Compass
"Designed by Nurse Practitioners. Built for Nurse Practitioners."
\`;
}
