import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Force dotenv config load here in case imports were hoisted above index.ts dotenv.config()
dotenv.config();

/**
 * Resolve the Firebase service account credential path.
 * Priority:
 *   1. GOOGLE_APPLICATION_CREDENTIALS env var (works on any platform, Cloud Run, Render, local)
 *   2. Render Secret File at /etc/secrets/service-account-key.json
 *   3. Local fallback: service-account-key.json next to process.cwd()
 */
function resolveServiceAccountPath(): string {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
  }
  const renderSecretPath = '/etc/secrets/service-account-key.json';
  if (fs.existsSync(renderSecretPath)) {
    return renderSecretPath;
  }
  return path.resolve(process.cwd(), 'service-account-key.json');
}

// Initialize Firebase Admin
if (getApps().length === 0) {
  const serviceAccountPath = resolveServiceAccountPath();
  initializeApp({
    credential: cert(serviceAccountPath),
    projectId: process.env.FIREBASE_PROJECT_ID || 'mindvault-ai-705c0'
  });
}

export const db = getFirestore();
export const auth = getAuth();

