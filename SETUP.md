# Nolan's Goal Tracker — Setup Guide

This is the checklist to go from "code in a folder" to "installed on
Nolan's phone, syncing to Matt and Jen." Do these roughly in order —
later steps depend on values from earlier ones.

---

## Step 1 — Create the Firebase project

1. Go to https://console.firebase.google.com and click **Add project**.
2. Name it something like `nolan-goal-tracker`. Google Analytics is optional — skip it, you don't need it.
3. Once created, click the **web icon (`</>`)** on the project overview page to register a web app. Name it anything (e.g. "Nolan Tracker Web").
4. Firebase will show you a `firebaseConfig` object with `apiKey`, `authDomain`, `projectId`, etc. Copy those values into **`config.js`** in this project, replacing the `PASTE_...` placeholders in the `firebase: {...}` block.
5. Paste the same six values into **`firebase-messaging-sw.js`** as well (that file runs in a separate worker context and can't read `config.js`).

## Step 2 — Turn on Firestore

1. In the Firebase Console, go to **Build → Firestore Database → Create database**.
2. Choose **production mode** (we're supplying our own security rules — see Step 4) and pick a region close to you.
3. That's it for now — the app creates its own documents (`users/nolan`, `settings/security`, `parents/matt`, `parents/jen`) the first time it runs.

## Step 3 — Turn on Anonymous Authentication

1. **Build → Authentication → Get started**.
2. Under **Sign-in method**, enable **Anonymous**.
3. This is what lets the app read/write Firestore without building a real login screen. It's good enough for a private family app — see the comment at the top of `firestore.rules` for the tradeoff, and how to upgrade to real sign-in later if you want it.

## Step 4 — Deploy the Firestore security rules

You'll need the Firebase CLI for this one (Cloud Functions in Step 5 needs it too):

```bash
npm install -g firebase-tools
firebase login
cd nolan-goal-tracker    # this project folder
firebase use --add       # pick the project you just created
firebase deploy --only firestore:rules
```

This pushes `firestore.rules` live, so Firestore actually enforces "must be signed in (even anonymously) to read or write."

## Step 5 — Deploy the Cloud Function (push notifications)

This is the one part of the project that can't just live on GitHub Pages — sending a push notification to Matt's or Jen's phone from Nolan's action requires server-side code.

1. Firebase Console → **Build → Functions** → you'll be prompted to upgrade to the **Blaze (pay-as-you-go) plan**. This is normal — Cloud Functions require it, but at this app's scale (a handful of Firestore writes a day) you'll stay well within the free monthly quota, so realistically $0/month.
2. From the project folder:
   ```bash
   firebase deploy --only functions
   ```
3. That deploys `functions/index.js`, which watches `users/nolan` for the three trigger events (all habits done, level up, streak reset) and sends a push to whichever parent tokens are on file.

## Step 6 — Enable Cloud Messaging + get your VAPID key

1. Firebase Console → **Project settings (gear icon) → Cloud Messaging**.
2. Under **Web configuration**, click **Generate key pair**. Copy the key.
3. Paste it into `config.js` as `vapidKey`.
4. The first time Matt or Jen opens the app and taps into Parent View, the browser will prompt for notification permission — accepting registers that device's token in Firestore (`parents/matt` or `parents/jen`).

## Step 7 — Get a Gemini API key (for the AI goal suggestions)

1. Go to https://aistudio.google.com/apikey and click **Create API key**.
2. Pick the same Google Cloud project as your Firebase project if it's offered (keeps things in one place) — otherwise a new one is fine.
3. Paste the key into `config.js` as `geminiApiKey`.
4. **Restrict the key** before this goes live: Google Cloud Console → **APIs & Services → Credentials** → click the key → under **Application restrictions**, choose **HTTP referrers** and add your GitHub Pages URL (e.g. `https://yourusername.github.io/*`). This stops anyone who reads your page source from using your key elsewhere.
5. Free tier (Gemini 1.5 Flash) — no billing needs to be attached for this one.

## Step 8 — Our Manna verse API

Nothing to configure — it's a public, keyless endpoint (`https://beta.ourmanna.com/api/v1/get/`). The app calls it once a day and caches the result, with a hardcoded fallback verse if the call ever fails.

## Step 9 — Replace the placeholder icons (optional but recommended)

`icons/icon-192.png`, `icon-512.png`, and the two `-maskable-` versions are simple placeholders in the app's palette. Swap in the finished NP crest logo at the same file names and sizes whenever you have it ready — no code changes needed.

## Step 10 — Deploy to GitHub Pages

Same pattern as the Masters Pool project:

```bash
git init
git add .
git commit -m "Nolan's Goal Tracker — initial build"
git remote add origin https://github.com/yourusername/nolan-goal-tracker.git
git push -u origin main
```

Then: repo **Settings → Pages → Source → Deploy from branch → main → / (root)**. GitHub gives you a URL like `https://yourusername.github.io/nolan-goal-tracker/` — that's what goes on Nolan's home screen.

**Important:** do this step *after* Step 7's key restriction, or make sure you restrict the Gemini key right after the first push — an unrestricted key in a public repo is usable by anyone who finds it.

## Step 11 — Install on Nolan's phone

1. Open the GitHub Pages URL in Safari (iPhone) or Chrome (Android).
2. iPhone: tap the Share icon → **Add to Home Screen**. Android: Chrome will usually prompt automatically, or use the ⋮ menu → **Add to Home Screen**.
3. It'll launch full-screen, no browser chrome, exactly like a native app.

## Step 12 — Test the whole loop

- [ ] Open the app fresh — verse loads, defaults to PIN `1234` in Parent View
- [ ] Check off a habit — XP updates, syncs to a second device signed into the same Firestore project
- [ ] Change the PIN from Parent View → confirm the old PIN no longer works and the new one does
- [ ] Tap the logo/avatar → Profile overlay opens (Identity / Playbook / Settings)
- [ ] All habits done in one day → both parent devices get a push (may take a minute after Cloud Function deploy propagates)
- [ ] Close the app fully and reopen from the home screen icon — loads instantly (service worker cache)

---

### What's still a placeholder, not a real system yet

- **Stats screen** (heat map, badges, category breakdown, report card) reads live XP/streak, but the rest is season-sample data — real history needs a daily snapshot written to Firestore, which isn't built yet. Marked clearly in the code (`sStats()`) with what to swap in.
- **Onboarding flow** (the three commitment questions, sport/season picker) exists as static content in the Identity/Settings tabs — there's no interactive first-run wizard yet that feeds answers into the Gemini call. `fetchGeminiSuggestions()` is wired and ready to receive those answers whenever that flow gets built.
