import { Resend } from 'resend'
import logger from '../utils/logger.js'

const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    logger.warn('RESEND_API_KEY not set — emails disabled')
    return null
  }
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = process.env.RESEND_FROM || 'onboarding@resend.dev'
const APP_NAME = 'UrbanClone'

// ── Core send helper ─────────────────────────────────────────────────────────

const sendEmail = async ({ to, subject, html }) => {
  const resend = getResend()
  if (!resend) return

  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) logger.error(`[EMAIL] Failed to send "${subject}" to ${to}: ${JSON.stringify(error)}`)
    else       logger.info(`[EMAIL] Sent "${subject}" to ${to} (id: ${data?.id})`)
  } catch (err) {
    logger.error(`[EMAIL] Unexpected error sending to ${to}: ${err.message}`)
  }
}

const formatDate = (date) =>
  new Date(date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })

const baseStyle = `font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#fff;`

// ── 1. Booking Confirmation to Customer ─────────────────────────────────────

export const sendBookingConfirmation = async (user, booking, service) => {
  await sendEmail({
    to: user.email,
    subject: `Booking Confirmed — ${service?.title || 'Your Service'} | ${APP_NAME}`,
    html: `
      <div style="${baseStyle}">
        <div style="background:#111827;padding:28px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:#1AB64F;font-size:22px;margin:0;">${APP_NAME}</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#111827;margin-bottom:4px;">Booking Confirmed! ✅</h2>
          <p style="color:#6b7280;">Hi ${user.name}, your booking is confirmed.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
            <tr style="background:#f9fafb;">
              <td style="padding:10px 14px;color:#6b7280;font-weight:600;">Booking ID</td>
              <td style="padding:10px 14px;color:#111827;font-weight:700;">${booking._id}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;color:#6b7280;font-weight:600;">Service</td>
              <td style="padding:10px 14px;color:#111827;">${service?.title || 'Service'}</td>
            </tr>
            <tr style="background:#f9fafb;">
              <td style="padding:10px 14px;color:#6b7280;font-weight:600;">Scheduled</td>
              <td style="padding:10px 14px;color:#111827;">${formatDate(booking.scheduledAt)}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;color:#6b7280;font-weight:600;">Address</td>
              <td style="padding:10px 14px;color:#111827;">${booking.address?.line1}, ${booking.address?.city}</td>
            </tr>
            <tr style="background:#f9fafb;">
              <td style="padding:10px 14px;color:#6b7280;font-weight:600;">Amount</td>
              <td style="padding:10px 14px;color:#111827;font-weight:700;">&#8377;${booking.payment?.amount || booking.pricingTier?.price || '—'}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;color:#6b7280;font-weight:600;">Payment</td>
              <td style="padding:10px 14px;color:#111827;">${booking.payment?.method === 'cash' ? 'Pay on service' : 'Online'}</td>
            </tr>
          </table>
          <p style="color:#6b7280;font-size:13px;margin-top:24px;">We'll notify you once a professional is assigned.</p>
        </div>
        <div style="background:#f9fafb;padding:20px 32px;border-radius:0 0 12px 12px;text-align:center;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} ${APP_NAME}</p>
        </div>
      </div>
    `,
  })
}

// ── 2. Professional Assigned notification to Customer ───────────────────────

export const sendProfessionalAssigned = async (user, booking, professional) => {
  await sendEmail({
    to: user.email,
    subject: `Professional Assigned for Your Booking | ${APP_NAME}`,
    html: `
      <div style="${baseStyle}">
        <div style="background:#111827;padding:28px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:#1AB64F;font-size:22px;margin:0;">${APP_NAME}</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#111827;margin-bottom:4px;">Professional Assigned 👷</h2>
          <p style="color:#6b7280;">Hi ${user.name}, a verified professional has been assigned.</p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin:20px 0;">
            <p style="margin:0;font-weight:700;color:#111827;">${professional?.user?.name || 'Your Professional'}</p>
            <p style="margin:4px 0 0;color:#16a34a;font-size:13px;">&#9733; ${professional.rating || '4.8'} rating</p>
          </div>
          <p style="color:#6b7280;font-size:13px;">Scheduled: <strong style="color:#111827;">${formatDate(booking.scheduledAt)}</strong></p>
        </div>
      </div>
    `,
  })
}

// ── 3. Cancellation + optional refund ────────────────────────────────────────

export const sendCancellationConfirmation = async (user, booking, refundAmount = 0) => {
  await sendEmail({
    to: user.email,
    subject: `Booking Cancelled${refundAmount ? ' — Refund Initiated' : ''} | ${APP_NAME}`,
    html: `
      <div style="${baseStyle}">
        <div style="background:#111827;padding:28px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:#1AB64F;font-size:22px;margin:0;">${APP_NAME}</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#111827;margin-bottom:4px;">Booking Cancelled</h2>
          <p style="color:#6b7280;">Hi ${user.name}, booking <strong>#${booking._id}</strong> has been cancelled.</p>
          ${refundAmount ? `
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px 20px;margin:20px 0;">
              <p style="margin:0;font-weight:700;color:#1d4ed8;">Refund of &#8377;${refundAmount} initiated</p>
              <p style="margin:4px 0 0;color:#3b82f6;font-size:13px;">Will reflect in 5–7 business days.</p>
            </div>
          ` : ''}
          <p style="color:#6b7280;font-size:13px;">If you have questions, please contact support.</p>
        </div>
      </div>
    `,
  })
}

// ── 4. Professional approval / rejection ────────────────────────────────────

export const sendProApproval = async (user, approved = true) => {
  await sendEmail({
    to: user.email,
    subject: `Your ${APP_NAME} Professional Account ${approved ? 'Approved' : 'Status Update'}`,
    html: `
      <div style="${baseStyle}">
        <div style="background:#111827;padding:28px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:#1AB64F;font-size:22px;margin:0;">${APP_NAME}</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#111827;margin-bottom:4px;">${approved ? 'Account Approved! 🎉' : 'Application Update'}</h2>
          <p style="color:#6b7280;">Hi ${user.name},</p>
          <p style="color:#374151;">${
            approved
              ? 'Your professional account has been <strong style="color:#16a34a;">approved</strong>. You can now log in and start accepting bookings.'
              : 'We require additional information. Please log in and update your documents.'
          }</p>
        </div>
      </div>
    `,
  })
}

// ── 5. Reschedule confirmation ───────────────────────────────────────────────

export const sendRescheduleConfirmation = async (user, booking) => {
  await sendEmail({
    to: user.email,
    subject: `Booking Rescheduled | ${APP_NAME}`,
    html: `
      <div style="${baseStyle}">
        <div style="background:#111827;padding:28px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:#1AB64F;font-size:22px;margin:0;">${APP_NAME}</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#111827;margin-bottom:4px;">Booking Rescheduled &#128197;</h2>
          <p style="color:#6b7280;">Hi ${user.name}, your booking has been rescheduled.</p>
          <p style="color:#374151;font-size:14px;">New time: <strong>${formatDate(booking.scheduledAt)}</strong></p>
          <p style="color:#6b7280;font-size:13px;">Booking ID: ${booking._id}</p>
        </div>
      </div>
    `,
  })
}

// ── 6. New job assigned — notify the professional ────────────────────────────

export const sendBookingAssignedToPro = async (proUser, booking, service) => {
  await sendEmail({
    to: proUser.email,
    subject: `New Booking Assigned — ${service?.title || 'Service'} | ${APP_NAME}`,
    html: `
      <div style="${baseStyle}">
        <div style="background:#111827;padding:28px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:#1AB64F;font-size:22px;margin:0;">${APP_NAME}</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#111827;margin-bottom:4px;">New Job Assigned &#128276;</h2>
          <p style="color:#6b7280;">Hi ${proUser.name}, you have a new booking.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
            <tr style="background:#f9fafb;">
              <td style="padding:10px 14px;color:#6b7280;font-weight:600;">Service</td>
              <td style="padding:10px 14px;color:#111827;">${service?.title || 'Service'}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;color:#6b7280;font-weight:600;">Scheduled</td>
              <td style="padding:10px 14px;color:#111827;">${formatDate(booking.scheduledAt)}</td>
            </tr>
            <tr style="background:#f9fafb;">
              <td style="padding:10px 14px;color:#6b7280;font-weight:600;">Location</td>
              <td style="padding:10px 14px;color:#111827;">${booking.address?.city}</td>
            </tr>
          </table>
          <p style="color:#6b7280;font-size:13px;margin-top:20px;">Log in to your dashboard to view full details.</p>
        </div>
      </div>
    `,
  })
}
