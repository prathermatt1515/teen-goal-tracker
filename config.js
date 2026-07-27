// ── Nolan's Goal Tracker — configuration ──
// Fill these in with your own project's values. See SETUP.md for exactly
// where to get each one. Nothing in this file is secret enough to worry
// about being visible in the page source (Firebase web config is meant to
// be public — access is controlled by Firestore security rules, not by
// hiding this object), but the Gemini key should be a *restricted* key
// (HTTP referrer restricted to your GitHub Pages domain) since Google
// AI Studio keys are usable by anyone who has them.

window.APP_CONFIG = {
  firebase: {
    apiKey: "AIzaSyBCym9EfZ8VgA1OdvCupqHRvixrk-ess5s",
    authDomain: "teen-goal-tracker.firebaseapp.com",
    projectId: "teen-goal-tracker",
    storageBucket: "teen-goal-tracker.firebasestorage.app",
    messagingSenderId: "704271448096",
    appId: "1:704271448096:web:f8c7820c209c3705efe445"
  },

  // Google AI Studio → Get API key. Restrict it to your GitHub Pages
  // domain before shipping. Free tier, Gemini 1.5 Flash.
  geminiApiKey: "AIzaSyCStuJoM8v5k78QzQdCVyKnSeikvIhlIM0",

  // Web Push certificate (VAPID key) — Firebase Console → Project
  // Settings → Cloud Messaging → Web configuration → Generate key pair.
  vapidKey: "PASTE_VAPID_KEY",

  // Firestore document IDs — change if you want different names.
  // One shared state doc for Nolan, one settings doc for the shared
  // parent PIN, one doc each for Matt's and Jen's push tokens.
  docIds: {
    nolanState: "users/nolan",
    security: "settings/security",
    parentMatt: "parents/matt",
    parentJen: "parents/jen"
  }
};
