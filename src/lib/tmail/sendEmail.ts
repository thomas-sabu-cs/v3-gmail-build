import nodemailer from "nodemailer";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmailWithSMTP({ to, subject, text }: SendEmailInput) {
  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM;
  const fromName = process.env.SMTP_FROM_NAME;

  if (!host || !portRaw || !user || !pass || !fromEmail) {
    throw new Error(
      "Missing SMTP env vars. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM."
    );
  }

  const port = Number(portRaw);
  if (!Number.isFinite(port)) {
    throw new Error("Invalid SMTP_PORT. It must be a number.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  // Keep it simple: plaintext only. You can extend to HTML later.
  const from = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;
  await transporter.sendMail({
    from,
    to,
    subject,
    text
  });
}

