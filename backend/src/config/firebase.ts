import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import path from 'path';

// Force dotenv config load here in case imports were hoisted above index.ts dotenv.config()
dotenv.config();

// Determine the path to the service account key
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS 
  ? path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : path.resolve(process.cwd(), 'service-account-key.json');

// Initialize Firebase Admin
if (getApps().length === 0) {
  if (process.env.NODE_ENV === 'production') {
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || "mindvault-ai-705c0"
    });
  } else {
    initializeApp({
      credential: cert(serviceAccountPath)
    });
  }
}

export const db = getFirestore();
export const auth = getAuth();
