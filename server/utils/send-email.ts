import nodemailer from "nodemailer";

import env from "~/lib/env";

import type { EmailTemplate } from "./email-templates";

export async function sendEmail(template: EmailTemplate): Promise<void> {
  // Create transporter using Gmail SMTP
  const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });

  // Send email
  const info = await transporter.sendMail({
    from: env.EMAIL_FROM || `"CatalogApp" <${process.env.EMAIL_USER}>`,
    to: template.to,
    subject: template.subject,
    html: template.html,
  });

  console.warn("✅ Email sent successfully:", info.messageId, "to:", template.to);
}
