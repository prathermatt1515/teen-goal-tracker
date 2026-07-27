// Nolan's Goal Tracker — Cloud Function
//
// Why this exists: a browser can only send a push notification to ITSELF.
// For Nolan's phone to trigger a notification on Matt's and Jen's phones,
// something with server-side access has to watch for the change and call
// FCM's send API. That's this function. It's the one piece of this project
// that isn't a static file — it has to be deployed to Firebase Cloud
// Functions (see SETUP.md, Step 5).
//
// Deploy with: firebase deploy --only functions

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();

exports.notifyOnProgress = onDocumentUpdated("users/nolan", async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  const messages = [];

  // All habits done today
  const beforeDone = (before.habits || []).filter((h) => h.done).length;
  const afterDone = (after.habits || []).filter((h) => h.done).length;
  const total = (after.habits || []).length;
  if (total > 0 && beforeDone < total && afterDone === total) {
    messages.push({ title: "All missions done! 🎉", body: "Nolan finished every habit today." });
  }

  // Level up (crossed a threshold)
  const thresholds = [3000, 12000, 28000, 52000, 75000];
  const names = ["Prospect", "Pro", "All-Star", "MVP", "Legend"];
  for (let i = 0; i < thresholds.length; i++) {
    if (before.xp < thresholds[i] && after.xp >= thresholds[i]) {
      messages.push({ title: `Level up: ${names[i]}! ⚡`, body: `Nolan just reached ${names[i]}.` });
    }
  }

  // Streak broken (went from >0 back to 0)
  if (before.streak > 0 && after.streak === 0) {
    messages.push({ title: "Streak reset", body: `Nolan's streak ended at ${before.streak} days.` });
  }

  if (messages.length === 0) return;

  // Fetch both parents' tokens
  const [mattSnap, jenSnap] = await Promise.all([
    db.doc("parents/matt").get(),
    db.doc("parents/jen").get(),
  ]);
  const tokens = [mattSnap.data()?.fcmToken, jenSnap.data()?.fcmToken].filter(Boolean);
  if (tokens.length === 0) return;

  for (const msg of messages) {
    await getMessaging().sendEachForMulticast({
      tokens,
      notification: { title: msg.title, body: msg.body },
    });
  }
});
