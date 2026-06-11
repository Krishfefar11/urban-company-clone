import { useEffect, useRef } from 'react'
import { messaging, getToken, onMessage } from '../config/firebase.js'
import apiFetch from '../api/apiClient.js'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

/**
 * useFCM — Firebase Cloud Messaging hook.
 *
 * Call once from AuthContext or a top-level component after the user is authenticated.
 * It will:
 *   1. Request notification permission
 *   2. Get the FCM registration token
 *   3. Save the token to the backend (POST /api/users/fcm-token)
 *   4. Listen for foreground messages and show a browser notification
 *
 * @param {object} options
 *   onMessage {function} — called with payload when a foreground message arrives
 */
const useFCM = ({ onMessage: onMsg } = {}) => {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    if (!messaging) return          // FCM not supported (HTTP / Safari < 16.4)
    if (!VAPID_KEY) {
      console.warn('[FCM] VITE_FIREBASE_VAPID_KEY not set — push notifications disabled')
      return
    }

    initialized.current = true

    const init = async () => {
      try {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          console.info('[FCM] Notification permission denied')
          return
        }

        // Register service worker if not already done by vite-plugin-pwa
        let swReg
        try {
          swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
        } catch (e) {
          swReg = await navigator.serviceWorker.ready
        }

        const token = await getToken(messaging, {
          vapidKey:        VAPID_KEY,
          serviceWorkerRegistration: swReg,
        })

        if (token) {
          // Save to backend — deduplicated via $addToSet
          await apiFetch('/users/fcm-token', {
            method: 'POST',
            body:   JSON.stringify({ token }),
          }).catch(() => {})   // non-critical, don't throw
        }
      } catch (err) {
        console.warn('[FCM] Init error:', err.message)
      }
    }

    init()

    // Foreground message listener
    const unsub = onMessage(messaging, (payload) => {
      const { title = 'UrbanClone', body = '' } = payload.notification || {}

      // Show native notification even in foreground (browser may suppress in some cases)
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icons/icon-192.png' })
      }

      onMsg?.(payload)
    })

    return () => unsub?.()
  }, [onMsg])
}

export default useFCM
