import { resend } from '$lib/utils/email/resend';
import 'dotenv/config';

const domain = process.env.RESEND_DOMAIN as string;

// TODO: Replace h1 with .jpeg banner (from url, not local!!)
function verificationEmail({ username, url }: { username: string; url: string }) {
	return `
<div style="font-family: system-ui, sans-serif; color: #1f2937; line-height: 1.5; max-width: 600px; margin: 0 auto; padding: 2rem; background-color: #f9fafb; border-radius: 8px;">
  <h1 style="font-size: 2rem; font-family: 'courier new', monospace; font-weight: 700; margin-bottom: 1rem; background: linear-gradient(90deg, #9f332b, #683e86); color: white; padding: 0.5rem 1rem; border-radius: 4px; display: flex; align-items: center; justify-content: center;">Arcane Companion</h1>
  <h2 style="font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem;">Hello ${username},</h2>
  <p style="margin-bottom: 2rem;">Thank you for signing up! Please verify your email address by clicking the button below:</p>
  
  <a href="${url}" target="_blank" style="
      display: inline-block;
      background-color: #3b82f6;
      color: white;
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      text-align: center;
      margin-bottom: 2rem;
      ">
    Verify Email
  </a>

  <p style="color: #6b7280; font-size: 0.875rem;">
    If the button above does not work, you can try this link instead: <a href="${url}" target="_blank">${url}</a>.
  </p>
  
  <p style="color: #6b7280; font-size: 0.875rem;">
    If you did not create an account, you can safely ignore this email.
  </p>
</div>
`;
}

export async function sendVerificationEmail({
	username,
	email,
	url
}: {
	username: string;
	email: string;
	url: string;
}) {
	resend.emails.send({
		from: `Arcane Companion <noreply@${domain}>`,
		to: email,
		subject: 'Please verify your email',
		html: verificationEmail({ username, url })
	});
}
