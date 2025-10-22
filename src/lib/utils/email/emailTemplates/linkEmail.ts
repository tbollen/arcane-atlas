import { resend } from '$lib/utils/email/resend';
import 'dotenv/config';
import { emailWrapper } from './emailWrapper';

const domain = process.env.RESEND_DOMAIN as string;

// TODO: Replace h1 with .jpeg banner (from url, not local!!)
function linkEmail({
	username,
	url,
	welcomeMessage
}: {
	username: string;
	url: string;
	welcomeMessage: string;
}) {
	return emailWrapper({
		username,
		body: `
  <p style="margin-bottom: 2rem;">${welcomeMessage}</p>
  
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
`
	});
}

export async function sendLinkEmail({
	username,
	welcomeMessage,
	email,
	url,
	subject
}: {
	username: string;
	welcomeMessage: string;
	email: string;
	url: string;
	subject: string;
}) {
	resend.emails.send({
		from: `Arcane Companion <noreply@${domain}>`,
		to: email,
		subject,
		html: linkEmail({ welcomeMessage, username, url })
	});
}
