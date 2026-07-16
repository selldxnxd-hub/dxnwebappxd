/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration loaded from Vite environment variables with sandbox fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBx7CRD5DKuydNQZuLYdtW3J3eaduZ4pbM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rich-window-499114-e2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rich-window-499114-e2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rich-window-499114-e2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "40655015827",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:40655015827:web:450942dae566746186a266"
};

// Check if we are running under the default AI Studio sandbox project
const isSandboxProject = firebaseConfig.projectId === "rich-window-499114-e2";

// Custom Database ID provided by the environment, or dynamic sandbox database name, defaulting to (default) on custom Firebase deployments
const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || 
  (isSandboxProject ? "ai-studio-e528ea87-6ff9-4c97-8059-3ca0c074dec1" : "(default)");

// Ensure environment variables warning if no customized keys on custom build
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.info("Using default platform sandbox credentials for Firebase. If you set up your own Firebase in Vercel, define VITE_FIREBASE_API_KEY etc.");
}

// Initialize Firebase once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get Firestore with explicit Database ID, or fall back to standard default database if (default) is specified
const db = firestoreDatabaseId && firestoreDatabaseId !== "(default)"
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);

// Get Firebase Auth
const auth = getAuth(app);

// Get Firebase Storage
const storage = getStorage(app);

export { app, db, auth, storage };
