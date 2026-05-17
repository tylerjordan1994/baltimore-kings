import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'Baltimore Kings <noreply@baltimorekings.com>'

export async function sendApprovalEmail(toEmail: string, playerName: string) {
  if (!process.env.RESEND_API_KEY) return

  await resend.emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: 'Your Baltimore Kings account has been approved',
    html: `
      <h2>You're in, ${playerName}.</h2>
      <p>Your Baltimore Kings account has been approved. Sign in to access the member area — view your team, check the schedule, and handle any outstanding requirements.</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/sign-in">Sign in now</a></p>
      <p>— Baltimore Kings</p>
    `,
  })
}

export async function sendApplicationNotification(applicantName: string, applicantEmail: string) {
  if (!process.env.RESEND_API_KEY) return

  // Send to coaches — in production, query coach emails from profiles table
  // For now, send to the superadmin email
  const coachEmail = process.env.SUPERADMIN_EMAIL_1
  if (!coachEmail) return

  await resend.emails.send({
    from: FROM_EMAIL,
    to: coachEmail,
    subject: `New tryout application: ${applicantName}`,
    html: `
      <h2>New application received</h2>
      <p><strong>${applicantName}</strong> (${applicantEmail}) submitted a tryout application.</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/app/admin/applications">Review applications</a></p>
    `,
  })
}

export async function sendPaymentReceipt(toEmail: string, playerName: string, amount: string, description: string) {
  if (!process.env.RESEND_API_KEY) return

  await resend.emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: `Payment confirmed: ${description}`,
    html: `
      <h2>Payment received</h2>
      <p>Hey ${playerName}, your payment of ${amount} for "${description}" has been processed.</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/app/payments">View payment history</a></p>
      <p>— Baltimore Kings</p>
    `,
  })
}
