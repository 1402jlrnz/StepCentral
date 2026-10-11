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
    // Handle private key: .env stores literal \n sequences (two chars: backslash + n)
    // Must replace literal backslash-n with actual newlines
    let pk = FIREBASE_PRIVATE_KEY
        .replace(/\\n/g, '\n')           // literal \n -> actual newline
        .replace(/\\r/g, '')              // remove any carriage returns
        .trim();
    // Ensure proper PEM format with newlines around headers
    let normalizedPk = pk
        .replace(/-----BEGIN PRIVATE KEY-----\s*/, '-----BEGIN PRIVATE KEY-----\n')
        .replace(/\s*-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----\n');
    // Fix any remaining double newlines
    normalizedPk = normalizedPk.replace(/\n{3,}/g, '\n\n');
    console.log('[firebase.js] Private key normalized, length:', normalizedPk.length);
    try {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: normalizedPk,
            }),
        });
        console.log('[firebase.js] Firebase admin initialized successfully');
    } catch (e) {
        console.error('[firebase.js] init error:', e.message);
        return null;
    }
    return admin;
};

module.exports = getFirebaseAdmin;
