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
    initializeApp({
        credential: cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            // .env stores the private key with escaped newlines
            privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
    return admin;
};

module.exports = getFirebaseAdmin;
