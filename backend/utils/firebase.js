const admin = require('firebase-admin');

// Initialize firebase-admin from backend/.env service-account values.
// Returns null when not configured yet (endpoint returns a clear message).
// NOTE: firebase-admin v14 exposes getApps()/cert at the top level (no admin.apps / admin.credential).
const getFirebaseAdmin = () => {
    const { getApps, initializeApp, cert } = admin;
    if (getApps().length) {
        return admin;
    }
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
        return null;
    }
    // .env stores the private key with literal \n sequences (two chars: backslash + n)
    // Use regex /\\n/g (four backslashes in source = literal backslash-n in regex)
    const pk = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    try {
        initializeApp({
            credential: cert({
                projectId: FIREBASE_PROJECT_ID,
                clientEmail: FIREBASE_CLIENT_EMAIL,
                privateKey: pk,
            }),
        });
    } catch (e) {
        console.error('[firebase.js] init error:', e.message);
        return null;
    }
    return admin;
};

module.exports = getFirebaseAdmin;
