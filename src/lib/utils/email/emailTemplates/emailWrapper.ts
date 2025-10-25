export const emailWrapper = ({
	username,
	body
}: {
	username?: string;
	body: string;
}) => `<div style="font-family: system-ui, sans-serif; color: #1f2937; line-height: 1.5; max-width: 600px; margin: 0 auto; padding: 2rem; background-color: #f9fafb; border-radius: 8px;">
  <h1 style="font-size: 2rem; font-family: 'courier new', monospace; font-weight: 700; margin-bottom: 1rem; background: linear-gradient(90deg, #9f332b, #683e86); color: white; padding: 0.5rem 1rem; border-radius: 4px; display: flex; align-items: center; justify-content: center;">Arcane Companion</h1>
  ${username ? `<h2 style="font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem;">Hello ${username},</h2>` : ''}
  ${body}
  </div>`;
