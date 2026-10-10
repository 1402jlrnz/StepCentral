import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';

// Firebase web config — set these in frontend/.env
// (Firebase console → Project settings → General → Your apps → Web app)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

// Only initialize when configured — keeps the app running before setup
export const firebaseAuth = isFirebaseConfigured
    ? getAuth(initializeApp(firebaseConfig))
    : null;

// Social auth providers
export const googleProvider = isFirebaseConfigured ? new GoogleAuthProvider() : null;
export const facebookProvider = isFirebaseConfigured ? new FacebookAuthProvider() : null;

// Social login helper
export const signInWithSocial = async (provider) => {
    if (!firebaseAuth || !provider) {
        throw new Error('Firebase not configured');
    }
    return await signInWithPopup(firebaseAuth, provider);
};
