// Required by Firebase Cloud Messaging to show push notifications when the
// app is closed or in the background. Must live at the site root (same
// level as index.html) with exactly this filename.
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// NOTE: this file can't read config.js (it's a separate worker context),
// so the Firebase config is duplicated here. Paste the same values you put
// in config.js's firebase{} object below.
firebase.initializeApp({
  apiKey: "AIzaSyBCym9EfZ8VgA1OdvCupqHRvixrk-ess5s",
  authDomain: "teen-goal-tracker.firebaseapp.com",
  projectId: "teen-goal-tracker",
  storageBucket: "teen-goal-tracker.firebasestorage.app",
  messagingSenderId: "704271448096",
  appId: "1:704271448096:web:f8c7820c209c3705efe445"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Nolan's Goal Tracker";
  const options = {
    body: payload.notification?.body || '',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png'
  };
  self.registration.showNotification(title, options);
});
