/**
 * pushService.js — Firebase Cloud Messaging push notifications via Admin SDK.
 *
 * Usage:
 *   import { sendPush, sendPushToUser } from './pushService.js'
 *
 *   // Send to specific FCM tokens
 *   await sendPush(['token1', 'token2'], { title: 'Hi', body: 'Your booking is confirmed' })
 *
 *   // Send to all devices of a user (looks up fcmTokens from DB)
 *   await sendPushToUser(userId, { title: 'Hi', body: '...' }, { bookingId: '...' })
 */

import initFirebase from '../config/firebase.js'
import User         from '../models/User.js'
import logger       from '../utils/logger.js'

/**
 * Send a push notification to an array of FCM tokens.
 *
 * @param {string[]} tokens  FCM registration tokens
 * @param {object}   notification  { title, body, imageUrl? }
 * @param {object}   data          key-value data payload (strings only)
 * @returns {Promise<object>}      Firebase sendEachForMulticast response
 */
export const sendPush = async (tokens, notification, data = {}) => {
  if (!tokens?.length) return null

  const admin = initFirebase()

  // Stringify all data values (FCM data must be string:string)
  const safeData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, String(v)])
  )

  const message = {
    tokens,
    notification: {
      title: notification.title || 'UrbanClone',
      body:  notification.body  || '',
      ...(notification.imageUrl ? { imageUrl: notification.imageUrl } : {}),
    },
    data: safeData,
    android: {
      notification: {
        sound:    'default',
        priority: 'high',
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
      },
    },
    apns: {
      payload: { aps: { sound: 'default', badge: 1 } },
    },
    webpush: {
      notification: {
        icon:  '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
      },
      fcmOptions: data.bookingId
        ? { link: `/booking/confirmation/${data.bookingId}` }
        : {},
    },
  }

  try {
    const response = await admin.messaging().sendEachForMulticast(message)
    logger.info(`[FCM] Sent to ${tokens.length} tokens. Success: ${response.successCount}, Fail: ${response.failureCount}`)

    // Clean up invalid tokens
    const invalidTokens = []
    response.responses.forEach((r, i) => {
      if (!r.success && (
        r.error?.code === 'messaging/invalid-registration-token' ||
        r.error?.code === 'messaging/registration-token-not-registered'
      )) {
        invalidTokens.push(tokens[i])
      }
    })
    if (invalidTokens.length) {
      await User.updateMany({ fcmTokens: { $in: invalidTokens } }, { $pull: { fcmTokens: { $in: invalidTokens } } })
      logger.info(`[FCM] Removed ${invalidTokens.length} stale tokens`)
    }

    return response
  } catch (err) {
    logger.error(`[FCM] sendEachForMulticast error: ${err.message}`)
    return null
  }
}

/**
 * Send push to all registered devices of a specific user (by MongoDB _id).
 */
export const sendPushToUser = async (userId, notification, data = {}) => {
  try {
    const user = await User.findById(userId).select('fcmTokens')
    if (!user?.fcmTokens?.length) return null
    return sendPush(user.fcmTokens, notification, data)
  } catch (err) {
    logger.error(`[FCM] sendPushToUser error: ${err.message}`)
    return null
  }
}

/**
 * Pre-built notification templates.
 */
export const PUSH_TEMPLATES = {
  bookingConfirmed: (bookingId) => ({
    notification: { title: 'Booking Confirmed! 🎉', body: 'Your booking has been confirmed. A professional will be assigned shortly.' },
    data: { bookingId, type: 'booking_confirmed' },
  }),
  professionalOnTheWay: (bookingId, proName) => ({
    notification: { title: 'Professional On The Way 🚗', body: `${proName || 'Your professional'} is heading to your location.` },
    data: { bookingId, type: 'on_the_way' },
  }),
  serviceStarted: (bookingId) => ({
    notification: { title: 'Service Started 🔧', body: 'Your service has begun. Sit back and relax!' },
    data: { bookingId, type: 'in_progress' },
  }),
  serviceCompleted: (bookingId) => ({
    notification: { title: 'Service Completed ✅', body: 'Your service is done! Tap to rate your experience.' },
    data: { bookingId, type: 'completed' },
  }),
  bookingCancelled: (bookingId) => ({
    notification: { title: 'Booking Cancelled', body: 'Your booking has been cancelled. A refund will be processed within 5–7 days.' },
    data: { bookingId, type: 'cancelled' },
  }),
  newBookingForPro: (bookingId, serviceName) => ({
    notification: { title: 'New Booking! 📋', body: `You have a new booking for ${serviceName || 'a service'}.` },
    data: { bookingId, type: 'new_booking' },
  }),
  proApproved: () => ({
    notification: { title: 'Application Approved! 🎊', body: 'Congratulations! Your professional application has been approved. You can now start accepting bookings.' },
    data: { type: 'pro_approved' },
  }),
}
