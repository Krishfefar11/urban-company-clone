// Firebase Cloud Messaging Service Worker
// Handles background push notifications when the app is not in focus.
// This file must live at /public/firebase-messaging-sw.js (served from root).

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// Firebase config — must match src/config/firebase.js
// These values are public and safe to commit; they identify your Firebase project only.
firebase.initializeApp({
  apiKey:            'AIzaSyDkb-MnrBcss3FgXyIcNmhSfu7WUJTwG8I',
  authDomain:        'urban-clone-7016.firebaseapp.com',
  projectId:         'urban-clone-7016',
  storageBucket:     'urban-clone-7016.firebasestorage.app',
  messagingSenderId: '185498787946',
  appId:             '1:185498787946:web:b57aa23976b260b68a2a13',
})

const messaging = firebase.messaging()

// Background message handler — shown when app tab is not active
messaging.onBackgroundMessage(payload => {
  const { title = 'UrbanClone', body = '', icon = '/icons/icon-192.png' } = payload.notification || {}
  const data = payload.data || {}

  self.registration.showNotification(title, {
    body,
    icon,
    badge:  '/icons/icon-72.png',
    tag:    data.bookingId || 'urbanclone',   // collapse duplicate notifications
    data,
    actions: data.bookingId
      ? [{ action: 'view', title: 'View Booking' }]
      : [],
  })
})

// Notification click handler — open/focus the relevant page
self.addEventListener('notificationclick', event => {
  event.notification.close()
  const data       = event.notification.data || {}
  const bookingId  = data.bookingId
  const targetUrl  = bookingId
    ? `${self.location.origin}/booking/confirmation/${bookingId}`
    : self.location.origin

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(targetUrl)
    })
  )
})
