import { resend } from '$lib/utils/email/resend';
import 'dotenv/config';
import { emailWrapper } from './emailWrapper';

const domain = process.env.RESEND_DOMAIN as string;

function markupOTP(otp: string, type: string): { subject: string; html: string } {
	let reason: string;
	let subject: string;
	// SET REASON AND SUBJECT
	if (type === 'sign-in') {
		subject = 'Sign-in OTP';
		reason = `sign in`;
	} else if (type === 'email-verification') {
		subject = 'Email verification OTP';
		reason = `verify your email`;
	} else if (type === 'forget-password') {
		subject = 'Forget password OTP';
		reason = `reset your password`;
	} else throw new Error('Invalid type');
	// SET HTML
	const otpMarkup = `<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem;">
    ${Array.from(otp)
			.map(
				(char) =>
					`<div style="display: flex; align-items: center; justify-content: center; width: 3rem; height: 3rem; border-radius: 0.5rem; background-color: #f5f5f5;">
                        <span style="display: block; font-size: 2rem; font-weight: bold; color: #333;">${char}</span>
                    </div>`
			)
			.join('')}
    </div>
    <br/>`;
	const body: string = `
  <p style="margin-bottom: 2rem;">Please use the OTP below to ${reason}.</p>
  
  ${otpMarkup}
  
  <p style="color: #6b7280; font-size: 0.875rem;">
    If you did not request an OTP, you can safely ignore this email.
  </p>

  `;
	return { subject, html: emailWrapper({ body }) };
}

export async function sendEmailOTP({
	email,
	otp,
	type
}: {
	email: string;
	otp: string;
	type: string;
}) {
	const subject = markupOTP(otp, type).subject;
	const html = markupOTP(otp, type).html;
	resend.emails.send({
		from: `Arcane Atlas <noreply@${domain}>`,
		to: email,
		subject,
		html
	});
}
