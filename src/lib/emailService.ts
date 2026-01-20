// Email Service
// Infrastructure for sending emails - currently stub, ready for Mailgun integration

// Email provider configuration
// Set VITE_EMAIL_PROVIDER=mailgun and configure credentials when ready
const EMAIL_PROVIDER = import.meta.env.VITE_EMAIL_PROVIDER || 'none';
const MAILGUN_API_KEY = import.meta.env.VITE_MAILGUN_API_KEY;
const MAILGUN_DOMAIN = import.meta.env.VITE_MAILGUN_DOMAIN;
const FROM_EMAIL = import.meta.env.VITE_FROM_EMAIL || 'noreply@paranet.app';
const FROM_NAME = import.meta.env.VITE_FROM_NAME || 'Paranet';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Check if email sending is configured
 */
export function isEmailConfigured(): boolean {
  return EMAIL_PROVIDER === 'mailgun' && !!MAILGUN_API_KEY && !!MAILGUN_DOMAIN;
}

/**
 * Send an email
 * Currently returns false if not configured - ready for Mailgun integration
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    console.log('[Email] Email not configured. Would send:', {
      to: options.to,
      subject: options.subject,
    });
    return { success: false, error: 'Email service not configured' };
  }

  // Mailgun integration - uncomment and configure when ready
  /*
  try {
    const formData = new FormData();
    formData.append('from', `${FROM_NAME} <${FROM_EMAIL}>`);
    formData.append('to', options.to);
    formData.append('subject', options.subject);
    if (options.text) formData.append('text', options.text);
    if (options.html) formData.append('html', options.html);

    const response = await fetch(
      `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[Email] Mailgun error:', error);
      return { success: false, error };
    }

    const result = await response.json();
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('[Email] Send error:', error);
    return { success: false, error: String(error) };
  }
  */

  return { success: false, error: 'Email provider not implemented' };
}

/**
 * Send an organization invite email
 */
export async function sendOrgInviteEmail(
  to: string,
  inviteLink: string,
  orgName: string,
  inviterName: string
): Promise<EmailResult> {
  const subject = `You've been invited to join ${orgName} on Paranet`;

  const text = `
Hi,

${inviterName} has invited you to join ${orgName} on Paranet - the professional network for first responders.

Click the link below to accept the invitation:
${inviteLink}

This invitation expires in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

- The Paranet Team
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1e3a5f; margin: 0;">Paranet</h1>
    <p style="color: #666; margin: 5px 0 0 0;">First Responder Network</p>
  </div>

  <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 16px 0; color: #1e3a5f;">You're Invited!</h2>
    <p style="margin: 0 0 16px 0;">
      <strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on Paranet.
    </p>
    <a href="${inviteLink}" style="display: inline-block; background: #f97316; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
      Accept Invitation
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    This invitation expires in 7 days. If you didn't expect this invitation, you can safely ignore this email.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    Paranet - Connecting First Responders
  </p>
</body>
</html>
`.trim();

  return sendEmail({ to, subject, text, html });
}

/**
 * Generate an invite link
 */
export function generateInviteLink(token: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/invite/${token}`;
}
